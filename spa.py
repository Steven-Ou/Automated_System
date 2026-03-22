#Simple page application
import json
import time
import random
from playwright.sync_api import sync_playwright

class JobAutomator:
    def __init__(self, profile_path="profile.json", user_data_dir="./user_data"):
        with open(profile_path) as f:
            self.data = json.load(f)
        self.user_data_dir = user_data_dir
        
    def fill_form_field(self, page, label_element):
        label_text = label_element.inner_text().lower()
        input_id = label_element.get_attribute("for")
        
        if not input_id:
            return

        target = page.locator(f"#{input_id}")
        if not target.is_visible():
            return

        tag_name = target.evaluate("el => el.tagName").lower()

        # Simple logic to match profile data to form labels
        answer = "Yes" # Default fallback
        for key, val in self.data['personal_info'].items():
            if key.replace("_", " ") in label_text:
                answer = val

        if tag_name == "input":
            input_type = target.get_attribute("type")
            if input_type in ["radio", "checkbox"]:
                if answer.lower() in label_text:
                    target.check()
            else:
                target.fill(answer)
        elif tag_name == "select":
            target.select_option(label=answer)
        elif tag_name == "textarea":
            target.fill(answer)
        
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
            
            print(f"Finished processing {url}")
            time.sleep(5)
            
        browser.close()