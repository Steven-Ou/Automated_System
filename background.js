// background.js
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GENERATE_ANSWER") {
    generateWithGemini(request.payload).then(answer => {
      sendResponse({ answer });
    });
    return true; // Keeps the message channel open for async response
  }
});

async function generateWithGemini(payload) {
  const prompt = `
    You are an expert career assistant. Based on the following user details and job context, 
    write a short, 2-3 sentence answer for the question: "What excites you about this role?"
    
    User background: Student at ${payload.userSchool} graduating in May 2027.
    Top Projects: ${payload.userProjects.join(", ")}.
    Job Title: ${payload.jobTitle}
    Job Description Snippet: ${payload.jobDesc}
    
    Write it in the first person. Keep it professional but enthusiastic.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I am excited to apply my background in Software Engineering and my experience with React and Python to help your team scale its platform.";
  }
}