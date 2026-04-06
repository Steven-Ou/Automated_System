// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GENERATE_ANSWER") {
    handleGeminiRequest(request.payload).then(sendResponse);
    return true; // Keep channel open for async response
  }
});

async function handleGeminiRequest(payload) {
  const { gemini_api_key } = await chrome.storage.local.get("gemini_api_key");
  if (!gemini_api_key)
    return { answer: "Please set your API key in the popup first!" };

  const prompt = `Based on my background as a ${payload.userSchool} student and projects like ${payload.userProjects.join(", ")}, 
                  write a 2-sentence professional answer for: "Why are you interested in the ${payload.jobTitle} role?"
                  Context: ${payload.jobDesc}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gemini_api_key}`,
      {
        method: "POST",
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    const data = await response.json();
    return { answer: data.candidates[0].content.parts[0].text.trim() };
  } catch (e) {
    return { answer: "Error generating response. Check your API key." };
  }
}
