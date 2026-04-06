// content.js
chrome.storage.local.get(['profile'], (result) => {
  const data = result.profile;
  
  if (!data) {
    console.error("No profile data found in storage!");
    return;
  }

  const inputs = document.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    const label = document.querySelector(`label[for="${input.id}"]`)?.innerText.toLowerCase() || "";
    const placeholder = (input.getAttribute("placeholder") || "").toLowerCase();
    const name = (input.name || "").toLowerCase();

    // Combined logic from your spa.py and content.js
    if (label.includes("first name") || name.includes("first") || placeholder.includes("first")) {
      input.value = data.first_name;
    } else if (label.includes("last name") || name.includes("last") || placeholder.includes("last")) {
      input.value = data.last_name;
    } else if (label.includes("email") || name.includes("email")) {
      input.value = data.email;
    } else if (label.includes("school") || label.includes("university")) {
      input.value = "Queens College / CUNY"; 
    }
    
    // Crucial for React/Next.js sites (like LinkedIn) to "see" the new text
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
});