// 1. Function to bypass React/Next.js state blocks
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
  // Dispatch events to tell the website the value has changed
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}

// 2. Scrape Job Context for Gemini
function getJobContext() {
  const selectors = [
    ".job-details",
    ".description",
    '[class*="jobDescription"]',
    ".jobs-description-content",
  ];
  let description = "";
  selectors.forEach((s) => {
    const el = document.querySelector(s);
    if (el && el.innerText.length > description.length)
      description = el.innerText;
  });
  return {
    title: document.querySelector("h1")?.innerText || "this role",
    description: description.substring(0, 1000),
  };
}

// 3. Main Fill Logic
chrome.storage.local.get(["profile"], (result) => {
  const data = result.profile;
  if (!data) return;

  const inputs = document.querySelectorAll("input, select, textarea");
  const context = getJobContext();

  inputs.forEach((input) => {
    const label =
      document
        .querySelector(`label[for="${input.id}"]`)
        ?.innerText.toLowerCase() || "";
    const parent = input.closest("div")?.innerText.toLowerCase() || "";
    const name = (input.name || "").toLowerCase();
    const combined =
      `${label} ${name} ${input.placeholder} ${parent}`.toLowerCase();

    // --- A. Visa / Sponsorship (Always No) ---
    if (
      input.type === "radio" &&
      (combined.includes("visa") || combined.includes("sponsorship"))
    ) {
      if (input.parentElement.innerText.toLowerCase().includes("no")) {
        input.click();
      }
    }

    // --- B. AI-Powered Questions ---
    if (
      combined.includes("excite") ||
      combined.includes("why") ||
      combined.includes("interest")
    ) {
      chrome.runtime.sendMessage(
        {
          type: "GENERATE_ANSWER",
          payload: {
            jobTitle: context.title,
            jobDesc: context.description,
            userProjects: data.projects,
            userSchool: data.school,
          },
        },
        (response) => {
          if (response?.answer) setNativeValue(input, response.answer);
        },
      );
    }

    // --- C. Standard Fields (Using Native Setter) ---
    if (
      input.type === "text" ||
      input.type === "email" ||
      input.tagName === "TEXTAREA"
    ) {
      if (combined.includes("first name"))
        setNativeValue(input, data.first_name);
      else if (combined.includes("last name"))
        setNativeValue(input, data.last_name);
      else if (combined.includes("email")) setNativeValue(input, data.email);
      else if (combined.includes("phone"))
        setNativeValue(input, data.phone); // 347-255-2896
      else if (combined.includes("linkedin"))
        setNativeValue(input, data.linkedin);
    }
  });
});
