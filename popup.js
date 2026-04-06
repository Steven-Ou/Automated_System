// popup.js
document.getElementById('fillButton').addEventListener('click', async () => {
  const btn = document.getElementById('fillButton');
  const status = document.getElementById('statusMsg');
  
  // Ensure data exists before running
  chrome.storage.local.get(['profile'], async (result) => {
    if (!result.profile) {
      // Emergency Seed if data is missing
      await chrome.storage.local.set({
        profile: {
          first_name: "Steven",
          last_name: "Ou",
          email: "osteve425@gmail.com",
          phone: "347-255-2896"
        }
      });
    }

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, () => {
      // Visual feedback
      btn.classList.replace('bg-blue-600', 'bg-green-600');
      status.innerText = "Applied logic to page!";
      setTimeout(() => {
        btn.classList.replace('bg-green-600', 'bg-blue-600');
        status.innerText = "";
      }, 2000);
    });
  });
});