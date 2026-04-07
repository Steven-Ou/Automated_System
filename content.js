function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(
    prototype,
    "value",
  )?.set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else {
    valueSetter.call(element, value);
  }
  // Dispatch events to tell React the data actually changed
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}
//Helper function to scrape job title and description for Gemini context
function getJobContext() {
  const selectors = [
    ".job-details",
    ".description",
    '[class*="jobDescription"]',
    "#job-details",
    ".jobs-description-content",
    ".job-view-layout",
  ];

  let description = "";
  selectors.forEach((s) => {
    const el = document.querySelector(s);
    if (el && el.innerText.length > description.length)
      description = el.innerText;
  });

  const title = document.querySelector("h1")?.innerText || "this role";
  // Return a truncated version to stay within prompt limits
  return { title, description: description.substring(0, 1200) };
}

// 2. Main fill logic
chrome.storage.local.get(["profile"], (result) => {
  const data = result.profile;
  if (!data) {
    console.error(
      "No profile data found. Please open the extension popup first.",
    );
    return;
  }

  const inputs = document.querySelectorAll("input, select, textarea");
  const jobContext = getJobContext();

  inputs.forEach((input) => {
    const label =
      document
        .querySelector(`label[for="${input.id}"]`)
        ?.innerText.toLowerCase() || "";
    // Capture the parent div text to find "Sponsorship" keywords near the radio buttons
    const parentContainer = input.closest("div");
    const parentText = parentContainer?.innerText.toLowerCase() || "";
    const name = (input.name || "").toLowerCase();
    const placeholder = (input.getAttribute("placeholder") || "").toLowerCase();
    const combinedText =
      `${label} ${name} ${placeholder} ${parentText}`.toLowerCase();

    // --- A. Handle Visas/Sponsorship (Radio Buttons) ---
    if (input.type === "radio") {
      if (
        combinedText.includes("visa") ||
        combinedText.includes("sponsorship")
      ) {
        // Find the specific label for THIS radio option (e.g., the "No" text next to the circle)
        const optionLabel = input.parentElement.innerText.toLowerCase();
        if (optionLabel.includes("no")) {
          input.click(); // Physically click it to trigger React state
        }
      }
    }

    // --- B. Handle Text Inputs & Textareas ---
    if (
      input.type === "text" ||
      input.type === "email" ||
      input.tagName === "TEXTAREA"
    ) {
      // 1. Basic Identity Fields (Using Native Setter)
      if (combinedText.includes("first name") || name === "firstname") {
        setNativeValue(input, data.first_name);
      } else if (combinedText.includes("last name") || name === "lastname") {
        setNativeValue(input, data.last_name);
      } else if (combinedText.includes("email")) {
        setNativeValue(input, data.email);
      } else if (
        combinedText.includes("phone") ||
        combinedText.includes("mobile")
      ) {
        setNativeValue(input, data.phone);
      } else if (combinedText.includes("linkedin")) {
        setNativeValue(input, data.linkedin);
      }

      // 2. AI-Generated "Why this role?" Logic
      if (
        combinedText.includes("excite") ||
        combinedText.includes("why") ||
        combinedText.includes("interest")
      ) {
        chrome.runtime.sendMessage(
          {
            type: "GENERATE_ANSWER",
            payload: {
              jobTitle: jobContext.title,
              jobDesc: jobContext.description,
              userProjects: data.projects || ["YT-Link", "Instagram Checker"],
              userSchool: data.school || "Queens College / CUNY",
            },
          },
          (response) => {
            if (response && response.answer) {
              // FIX: Use setNativeValue here too so the AI answer isn't ignored by React
              setNativeValue(input, response.answer);
            }
          },
        );
      }
    }
  });
});
