// popup.js
document.getElementById("fillButton").addEventListener("click", async () => {
  const btn = document.getElementById("fillButton");
  const status = document.getElementById("statusMsg");

  // Ensure all necessary data exists before running
  chrome.storage.local.get(["profile"], async (result) => {
    // If profile is missing OR missing the new linkedin key, re-seed it
    if (!result.profile || !result.profile.linkedin) {
      await chrome.storage.local.set({
        profile: {
          first_name: "Steven",
          last_name: "Ou",
          email: "osteve425@gmail.com",
          phone: "347-255-2896",
          linkedin: "https://www.linkedin.com/in/steven-ou-", // Added from your resume
          github: "https://github.com/Steven-Ou",
          school: "Queens College / CUNY",
        },
      });
      console.log("Profile data seeded with LinkedIn URL.");
    }

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["content.js"],
      },
      () => {
        // Visual feedback
        btn.classList.replace("bg-blue-600", "bg-green-600");
        status.innerText = "Applied logic to page!";
        setTimeout(() => {
          btn.classList.replace("bg-green-600", "bg-blue-600");
          status.innerText = "";
        }, 2000);
      },
    );
  });
});
