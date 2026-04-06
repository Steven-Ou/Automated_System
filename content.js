// content.js
chrome.storage.local.get(["profile"], (result) => {
  const data = result.profile;
  if (!data) return;

  const inputs = document.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    // Get identifying text from label, name, or placeholder
    const label =
      document
        .querySelector(`label[for="${input.id}"]`)
        ?.innerText.toLowerCase() || "";
    const name = (input.name || "").toLowerCase();
    const placeholder = (input.getAttribute("placeholder") || "").toLowerCase();
    const combinedText = `${label} ${name} ${placeholder}`;

    // 1. Handle Text Inputs
    if (
      input.type === "text" ||
      input.type === "email" ||
      input.tagName === "TEXTAREA"
    ) {
      if (combinedText.includes("first name") || name === "firstname") {
        input.value = data.first_name;
      } else if (combinedText.includes("last name") || name === "lastname") {
        input.value = data.last_name;
      } else if (combinedText.includes("email")) {
        input.value = data.email;
      } else if (
        combinedText.includes("phone") ||
        combinedText.includes("mobile")
      ) {
        input.value = data.phone; // 347-255-2896
      } else if (combinedText.includes("linkedin")) {
        input.value = data.linkedin; // https://linkedin.com/in/steven-ou-
      } else if (combinedText.includes("github")) {
        input.value = data.github;
      }
    }

    // 2. Handle Radio Buttons (Like the Sponsorship question in your screenshot)
    if (input.type === "radio") {
      // Logic for: "Will you require sponsorship?"
      if (
        combinedText.includes("sponsorship") ||
        combinedText.includes("visa")
      ) {
        // Based on your profile, we assume "No"
        if (label.includes("no")) {
          input.checked = true;
        }
      }
    }

    // 3. Trigger events so the site's React/Vue state updates
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
});
