# Simple page application
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
        answer = "Yes"  # Default fallback
        for key, val in self.data["personal_info"].items():
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

    def handle_easy_apply(self, page):
        """Navigates the multi-step LinkedIn Easy Apply modal."""
        while True:
            resume_input = page.get_by_label("Upload resume")
            if resume_input.is_visible():
                resume_input.set_input_files(self.data["resume_path"])

            all_labels = page.query_selector_all("label")
            for label in all_labels:
                self.fill_form_field(page, label)

            btn_next = page.get_by_role(
                "button", name=re.compile(r"Next|Continue|Review", re.I)
            )
            btn_submit = page.get_by_role(
                "button", name=re.compile(r"Submit application", re.I)
            )

            if btn_submit.is_visible():
                print("Application ready for manual review/submission.")
                break
            elif btn_next.is_visible():
                btn_next.click()
                time.sleep(random.uniform(1, 2))
            else:
                break

    def run(self, job_urls):
        with sync_playwright() as p:
            # Uses persistent context to stay logged in
            browser = p.chromium.launch_persistent_context(
                self.user_data_dir, headless=False
            )
            page = browser.new_page()

            for url in job_urls:
                print(f"Processing: {url}")
                page.goto(url)
                time.sleep(random.uniform(2, 4))

                # Check for Easy Apply button
                easy_apply_btn = page.get_by_label(re.compile(r"Easy Apply to", re.I))
                if easy_apply_btn.is_visible():
                    easy_apply_btn.click()
                    self.handle_easy_apply(page)

                print(f"Finished processing {url}")
                time.sleep(2)

            browser.close()
if __name__ == "__main__":
    automator = JobAutomator()
    # Add LinkedIn job URLs here
    urls = [] 
    automator.run(urls)