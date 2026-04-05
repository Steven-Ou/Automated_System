// popup.js
document.getElementById('fillButton').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});

document.getElementById('optionsButton').addEventListener('click', () => {
  // Logic to open a full-page options editor could go here
  alert("Settings feature coming soon!");
});