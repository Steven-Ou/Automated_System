// content.js
chrome.storage.local.get(['profile'], (result) => {
  const data = result.profile;
  
  // Find all inputs on the page
  const inputs = document.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    const label = document.querySelector(`label[for="${input.id}"]`)?.innerText.toLowerCase() || "";
    const name = input.name.toLowerCase();

    // Matching logic similar to your spa.py
    if (label.includes("first name") || name.includes("firstname")) {
      input.value = data.first_name;
    } else if (label.includes("email")) {
      input.value = data.email;
    } else if (label.includes("school") || label.includes("university")) {
      input.value = "Queens College / CUNY"; //
    }
    
    // Trigger input events so the website's React/Vue state updates
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
});