import os
import time
import requests
from bs4 import BeautifulSoup
import urllib.parse
import urllib3

# Disable SSL warnings since UPSC site sometimes has certificate issues
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuration
BASE_URL = "https://upsc.gov.in"
PYQ_URL = f"{BASE_URL}/examinations/previous-question-papers"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw_pyqs", "upsc")
MAX_DOWNLOADS = -1  # Set to -1 to download all available papers
DELAY_BETWEEN_DOWNLOADS = 2 # Seconds

def setup_directory():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

def scrape_upsc_pyqs(limit=MAX_DOWNLOADS):
    setup_directory()
    print(f"Fetching PYQ index from: {PYQ_URL}")
    
    try:
        # Use a standard User-Agent
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        response = requests.get(PYQ_URL, headers=headers, verify=False)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all PDF links
        pdf_links = []
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            if href.lower().endswith('.pdf'):
                # Handle relative URLs
                full_url = urllib.parse.urljoin(BASE_URL, href)
                
                # Try to get a meaningful name from the link text or URL
                name = a_tag.text.strip()
                if not name or "MB)" in name or "KB)" in name:
                    # Fallback to filename from URL if text is just size like "(14.5 MB)"
                    name = os.path.basename(urllib.parse.urlparse(full_url).path)
                
                # Make safe filename
                safe_name = "".join([c if c.isalnum() or c in [' ', '-', '_', '.'] else '_' for c in name])
                if not safe_name.lower().endswith('.pdf'):
                    safe_name += '.pdf'
                    
                pdf_links.append({
                    "url": full_url,
                    "filename": safe_name
                })
        
        # Remove duplicates while preserving order
        unique_links = []
        seen = set()
        for link in pdf_links:
            if link['url'] not in seen:
                seen.add(link['url'])
                unique_links.append(link)
                
        print(f"Found {len(unique_links)} unique PDF links.")
        
        downloads = min(limit, len(unique_links)) if limit > 0 else len(unique_links)
        print(f"Starting download of {downloads} files...")
        
        success_count = 0
        for i in range(downloads):
            item = unique_links[i]
            file_url = item['url']
            
            # The URL might just be the filename. The text might be the exam name.
            # Let's just use the URL's basename as it's the safest and most descriptive usually (e.g. QP-CDS-I-26-ENGLISH-130426.pdf)
            filename = os.path.basename(urllib.parse.urlparse(file_url).path)
            file_path = os.path.join(OUTPUT_DIR, filename)
            
            if os.path.exists(file_path):
                print(f"[{i+1}/{downloads}] Already exists, skipping: {filename}")
                continue
                
            print(f"[{i+1}/{downloads}] Downloading: {filename}")
            try:
                pdf_response = requests.get(file_url, headers=headers, verify=False, stream=True)
                pdf_response.raise_for_status()
                
                with open(file_path, 'wb') as f:
                    for chunk in pdf_response.iter_content(chunk_size=8192):
                        f.write(chunk)
                success_count += 1
                
                # Rate limiting
                if i < downloads - 1:
                    time.sleep(DELAY_BETWEEN_DOWNLOADS)
                    
            except Exception as e:
                print(f"  -> Error downloading {filename}: {e}")
                
        print(f"\nCompleted! Successfully downloaded {success_count} new PDF files.")
        print(f"Files saved in: {OUTPUT_DIR}")
        
    except Exception as e:
        print(f"Failed to scrape UPSC website: {e}")

if __name__ == "__main__":
    scrape_upsc_pyqs()
