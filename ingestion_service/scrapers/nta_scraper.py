import os
import time
import urllib.parse
from playwright.sync_api import sync_playwright
import requests

# Disable SSL warnings just in case
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuration
NTA_URL = "https://www.nta.ac.in/Downloads"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw_pyqs", "nta")
TARGET_EXAMS = ["JEE-Main", "NEET", "CUET"]  # Exams we want to scrape
DELAY_BETWEEN_DOWNLOADS = 2 # Seconds

def setup_directory():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

def download_file(url, filename, folder_path):
    file_path = os.path.join(folder_path, filename)
    if os.path.exists(file_path):
        print(f"    [SKIP] Already exists: {filename}")
        return False
        
    print(f"    [DOWNLOADING] {filename}...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, verify=False, stream=True)
        response.raise_for_status()
        
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"    [ERROR] Failed to download {url}: {e}")
        return False

def scrape_nta():
    setup_directory()
    print(f"Starting NTA Scraper using Playwright...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Navigate to NTA Downloads
        print(f"Navigating to {NTA_URL}...")
        page.goto(NTA_URL)
        
        # Wait for the Year dropdown to be available
        page.wait_for_selector("#drpYear")
        
        # Get all year options (excluding the placeholder "--Select--")
        year_options = page.locator("#drpYear option").all_text_contents()
        years = [y.strip() for y in year_options if y.strip() and "--" not in y and "All" not in y]
        print(f"Found years: {years}")
        
        total_downloads = 0
        
        # Iterate over years
        for year in years:
            print(f"\n--- Processing Year: {year} ---")
            
            # Select the year
            page.select_option("#drpYear", label=year)
            time.sleep(1) # Small wait for Exam dropdown to populate
            
            # Get available exams for this year
            exam_options = page.locator("#drpExamType option").all_text_contents()
            exams = [e.strip() for e in exam_options if e.strip() and "--" not in e and "All" not in e]
            
            for exam in exams:
                # Only scrape targeted exams to save time
                if not any(target in exam for target in TARGET_EXAMS):
                    continue
                    
                print(f"  Selecting Exam: {exam}")
                
                # Make a subdirectory for this exam to keep things organized
                exam_dir = os.path.join(OUTPUT_DIR, exam.replace(" ", "_"), year)
                if not os.path.exists(exam_dir):
                    os.makedirs(exam_dir)
                
                # Select the exam
                page.select_option("#drpExamType", label=exam)
                
                # Click Search
                page.click("#btnSearch")
                time.sleep(2) # Wait for table to load
                
                # Check if table has rows
                rows = page.locator("#tblResults tbody tr")
                count = rows.count()
                
                if count == 0 or (count == 1 and "No Record" in rows.nth(0).inner_text()):
                    print(f"    No records found for {exam} in {year}")
                    continue
                
                print(f"    Found {count} papers. Extracting...")
                
                for i in range(count):
                    row = rows.nth(i)
                    cols = row.locator("td")
                    if cols.count() < 8:
                        continue
                        
                    paper_name = cols.nth(2).inner_text().strip()
                    shift = cols.nth(5).inner_text().strip()
                    
                    # Construct a safe filename
                    base_name = f"{exam}_{year}_{paper_name}_{shift}"
                    safe_name = "".join([c if c.isalnum() or c in [' ', '-', '_'] else '_' for c in base_name]) + ".pdf"
                    
                    # The 7th column (index 6) is the QP (Question Paper) link
                    qp_links = cols.nth(6).locator("a")
                    if qp_links.count() > 0:
                        href = qp_links.first.get_attribute("href")
                        if href:
                            full_url = urllib.parse.urljoin(NTA_URL, href)
                            success = download_file(full_url, safe_name, exam_dir)
                            if success:
                                total_downloads += 1
                                time.sleep(DELAY_BETWEEN_DOWNLOADS)
        
        print(f"\nCompleted! Successfully downloaded {total_downloads} NTA papers.")
        browser.close()

if __name__ == "__main__":
    scrape_nta()
