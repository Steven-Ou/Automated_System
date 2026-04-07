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
}

// 2. Main fill logic
chrome.storage.local.get(["profile"], (result) => {
  const data = result.profile;
  if (!data) return;

  const inputs = document.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    const label =
      document
        .querySelector(`label[for="${input.id}"]`)
        ?.innerText.toLowerCase() || "";
    const parentText = input.closest("div")?.innerText.toLowerCase() || "";
    const name = (input.name || "").toLowerCase();
    const placeholder = (input.getAttribute("placeholder") || "").toLowerCase();
    const combinedText =
      `${label} ${name} ${placeholder} ${parentText}`.toLowerCase();

    // A. Handle Radio Buttons (Sponsorship question)
    if (input.type === "radio") {
      if (
        combinedText.includes("visa") ||
        combinedText.includes("sponsorship")
      ) {
        const optionLabel = input.parentElement.innerText.toLowerCase();
        if (optionLabel.includes("no")) {
          input.click(); // Physically click the button
        }
      }
    }

    // B. Handle Text Inputs with Native Setter
    if (
      input.type === "text" ||
      input.type === "email" ||
      input.tagName === "TEXTAREA"
    ) {
      if (
        combinedText.includes("first name") ||
        combinedText.includes("given name")
      ) {
        setNativeValue(input, data.first_name);
      } else if (
        combinedText.includes("last name") ||
        combinedText.includes("surname")
      ) {
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
    }
  });
});
