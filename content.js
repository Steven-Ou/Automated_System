// content.js
chrome.storage.local.get(["profile"], (result) => {
  const data = result.profile;
  if (!data) return;

  const inputs = document.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    const label =
      document
        .querySelector(`label[for="${input.id}"]`)
        ?.innerText.toLowerCase() || "";
    const name = (input.name || "").toLowerCase();
    const placeholder = (input.getAttribute("placeholder") || "").toLowerCase();
    const combinedText = `${label} ${name} ${placeholder}`;

    // 1. Handle Text & Textarea (Bio/Excitement questions)
    if (
      input.type === "text" ||
      input.type === "email" ||
      input.tagName === "TEXTAREA"
    ) {
      if (combinedText.includes("linkedin")) {
        input.value = data.linkedin || ""; // No more "undefined"
      } else if (
        combinedText.includes("phone") ||
        combinedText.includes("mobile")
      ) {
        input.value = data.phone;
      } else if (
        combinedText.includes("excite") ||
        combinedText.includes("why this role")
      ) {
        input.value =
          "I am excited to apply my background in Software Engineering and my experience with React and Python to help Hue scale its platform."; // Generic fallback
      }
    }

    // 2. Handle Radio Buttons (Sponsorship question)
    if (input.type === "radio") {
      // Logic for: "Will you require sponsorship?"
      if (
        combinedText.includes("sponsorship") ||
        combinedText.includes("visa")
      ) {
        // Find the "No" choice. Usually, the label text for the radio button contains "No"
        const radioLabel = input.parentElement.innerText.toLowerCase();
        if (radioLabel.includes("no")) {
          input.checked = true;
        }
      }
    }

    // 3. Trigger events so the site's state updates
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
});
