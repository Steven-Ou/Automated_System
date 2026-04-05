// Seed your data if it doesn't exist
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    profile: {
      first_name: "Steven",
      last_name: "Ou",
      email: "osteve425@gmail.com",
      phone: "347-255-2896"
    }
  });
});

document.getElementById('fillButton').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});