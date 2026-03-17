#Simple page application
import json
import time
import random
from playwright.sync_api import sync_playwright


def run_automation(job_urls):
    with sync_playwright() as p:
        user_data_dir = "./user_data"
        browser = p.chromium.launch_persistent_context(user_data_dir, headless=False)
        page = browser.new_page()

        with open("profile.json") as f:
            data = json.load(f)

        for url in job_urls:
            print(f"Applying to: {url}")
            page.goto(url)
            time.sleep(random.uniform(2, 4))

            try:
                page.set_input_files("input[type='file']", data['resume_path'])
                print("Resume uploaded.")
            except:
                print("No auto-upload found, proceeding to fields.")
                
            page.get_by_label("First Name").fill(data['personal_info']['first_name'])
            page.get_by_label("Last Name").fill(data['personal_info']['last_name'])
            page.get_by_label("Email").fill(data['personal_info']['email'])