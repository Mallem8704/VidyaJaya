import os
import json
import time
import requests
import fitz  # PyMuPDF
from PIL import Image
from dotenv import load_dotenv
import google.generativeai as genai
from tqdm import tqdm

# Load environment variables from server directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'server', '.env')
load_dotenv(dotenv_path=env_path)

# Initialize Supabase REST credentials
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Need service role for bypassing RLS
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env")

# Initialize Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in .env")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

def get_images_from_pdf(pdf_path, max_pages=None, start_page=0):
    """Renders PDF pages as PIL Images to handle scanned/protected PDFs."""
    print(f"Extracting images from: {pdf_path}")
    images = []
    try:
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        end_page = min(total_pages, start_page + max_pages) if max_pages else total_pages
        
        for page_num in range(start_page, end_page):
            if page_num < total_pages:
                page = doc.load_page(page_num)
                # Render page to an image (matrix zoom for better OCR quality)
                zoom = 2.0 
                mat = fitz.Matrix(zoom, zoom)
                pix = page.get_pixmap(matrix=mat)
                
                # Convert to PIL Image
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                images.append(img)
        return images
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
        return []

def parse_mcqs_with_gemini_multimodal(images):
    """Sends images to Gemini and asks it to return structured JSON MCQs."""
    prompt = """
    You are an expert exam parser. I have provided you with images of pages from a competitive exam question paper.
    Your task is to visually scan the pages and extract all Multiple Choice Questions (MCQs).
    
    For each question you find, extract:
    1. The question text.
    2. The 4 options (A, B, C, D). If there are fewer or more, include them appropriately.
    3. Determine the correct answer based on standard knowledge if the paper doesn't provide it, or extract the answer key if it's there.
    4. Provide a short, factual explanation of WHY that answer is correct.
    
    IMPORTANT: You MUST return ONLY valid JSON in the exact following schema. Do not include any markdown formatting like ```json.
    
    [
      {
        "question": "Question text here",
        "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
        "correct_index": 0,
        "explanation": "Explanation of the correct answer.",
        "difficulty": "medium",
        "sub_topic": "General"
      }
    ]
    """
    
    try:
        # Pass the prompt and the list of PIL images
        payload = [prompt] + images
        response = model.generate_content(payload, generation_config={"response_mime_type": "application/json"})
        response_text = response.text.strip()
        
        # Strip markdown if Gemini accidentally included it
        if response_text.startswith("```json"):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"):
            response_text = response_text[3:-3].strip()
            
        questions = json.loads(response_text)
        return questions
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error. Gemini returned invalid JSON: {e}")
        print("Raw response excerpt:", response.text[:200])
        return []
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return []

def save_to_supabase(test_title, category, questions_data):
    """Saves the extracted questions to the Supabase database."""
    if not questions_data:
        print("No questions to save.")
        return False
        
    print(f"Saving {len(questions_data)} questions to Supabase under test: '{test_title}'")
    
    try:
        # 1. Create the Test entry
        test_payload = {
            "title": test_title,
            "category": category,
            "description": "Auto-ingested official PYQ.",
            "total_questions": len(questions_data),
            "total_marks": len(questions_data) * 2.0,
            "negative_marking": 0.5,
            "duration": len(questions_data) * 60,
            "is_premium": False
        }
        
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        test_res = requests.post(
            f"{SUPABASE_URL}/rest/v1/tests", 
            headers=headers, 
            json=test_payload
        )
        test_res.raise_for_status()
        
        test_data = test_res.json()
        if not test_data:
            print("Failed to create test record.")
            return False
            
        test_id = test_data[0]['id']
        
        # 2. Prepare Questions payload
        db_questions = []
        for q in questions_data:
            options = q.get('options', [])
            correct_idx = q.get('correct_index', 0)
            if correct_idx >= len(options) or correct_idx < 0:
                correct_idx = 0
                
            db_questions.append({
                "test_id": test_id,
                "text": q.get('question', 'Missing Question Text'),
                "options": options,
                "correct_index": correct_idx,
                "explanation": q.get('explanation', ''),
                "category": category,
                "sub_topic": q.get('sub_topic', 'General'),
                "difficulty": q.get('difficulty', 'medium')
            })
            
        # 3. Insert Questions in batches of 50
        batch_size = 50
        for i in range(0, len(db_questions), batch_size):
            batch = db_questions[i:i+batch_size]
            q_res = requests.post(
                f"{SUPABASE_URL}/rest/v1/questions", 
                headers=headers, 
                json=batch
            )
            q_res.raise_for_status()
            print(f"  -> Inserted batch of {len(batch)} questions.")
            
        print(f"Successfully saved test {test_title} with ID: {test_id}")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"Supabase API Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(e.response.text)
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def ingest_pdf(file_path, category_override=None, test_run=False):
    """Main pipeline to ingest a single PDF."""
    filename = os.path.basename(file_path)
    
    category = "UPSC"
    if "NDA" in filename.upper() or "CDS" in filename.upper():
        category = "UPSC"
    elif "JEE" in filename.upper() or "NEET" in filename.upper():
        category = "NTA"
        
    if category_override:
        category = category_override
        
    test_title = filename.replace(".pdf", "").replace("-", " ").replace("_", " ")
    if test_run:
        test_title = "[TEST RUN] " + test_title
        
    print(f"\n{'='*50}")
    print(f"Starting Multimodal Ingestion for: {test_title}")
    
    # 1. Extract Images (2 pages per chunk to avoid token limits)
    batch_size = 2
    if test_run:
        images = get_images_from_pdf(file_path, max_pages=2, start_page=3) # Pages 4 and 5
        image_batches = [images] if images else []
        print(f"TEST RUN: Only processing 2 pages as 1 batch.")
    else:
        # Get total pages first
        try:
            doc = fitz.open(file_path)
            total_pages = len(doc)
            # Skip first 2 pages (usually rules)
            image_batches = []
            for i in range(2, total_pages, batch_size):
                batch_imgs = get_images_from_pdf(file_path, max_pages=batch_size, start_page=i)
                if batch_imgs:
                    image_batches.append(batch_imgs)
            print(f"Split PDF into {len(image_batches)} image batches.")
        except Exception as e:
            print(f"Failed to open PDF: {e}")
            return

    # 3. Parse with Gemini
    all_questions = []
    for i, img_batch in enumerate(tqdm(image_batches, desc="Parsing with Gemini Vision")):
        questions = parse_mcqs_with_gemini_multimodal(img_batch)
        if questions:
            all_questions.extend(questions)
            
        # Respect rate limits (15 RPM for free tier)
        time.sleep(4) 
        
    print(f"\nExtraction complete. Found {len(all_questions)} total questions.")
    
    # 4. Save to Database
    if all_questions:
        save_to_supabase(test_title, category, all_questions)
    else:
        print("Skipping database insertion because no questions were found.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Ingest PDFs into VidyaJaya database via Gemini.")
    parser.add_argument("--file", type=str, help="Path to a specific PDF file to ingest.")
    parser.add_argument("--dir", type=str, help="Path to a directory containing PDFs to ingest.")
    parser.add_argument("--test-run", action="store_true", help="Run in test mode (only processes 3 pages and 1 chunk).")
    
    args = parser.parse_args()
    
    if args.file:
        if os.path.exists(args.file):
            ingest_pdf(args.file, test_run=args.test_run)
        else:
            print(f"File not found: {args.file}")
    elif args.dir:
        if os.path.exists(args.dir):
            for filename in os.listdir(args.dir):
                if filename.lower().endswith('.pdf'):
                    file_path = os.path.join(args.dir, filename)
                    ingest_pdf(file_path, test_run=args.test_run)
        else:
            print(f"Directory not found: {args.dir}")
    else:
        print("Please provide a --file or --dir argument. Example:")
        print("python db_service.py --file data/raw_pyqs/upsc/sample.pdf --test-run")
