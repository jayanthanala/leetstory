require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json());

app.post('/rephrase', async (req, res) => {
  try {
    const { text: originalProblem, title, company } = req.body;
    console.log(title)
    const companyName = company || 'MAANG';
    const prompt = `
      You are an expert interview question designer at ${companyName}.
      Your task is to rephrase a LeetCode problem into a narrative scenario, formatted in clean HTML.
      Follow these formatting rules with extreme precision:
      1.  Wrap all story paragraphs in <p> tags.
      2.  Use <strong> tags for all headings like "Example 1:", "Constraints:", etc.
      3.  Wrap all variable names, function names, and values (e.g., 'x', 'true', '[1,2,3]') in <code> tags.
      4.  IMPORTANT FOR EXAMPLES: For each example, you must first output the heading (e.g., <strong>Example 1:</strong>). Then, on a NEW LINE, you must wrap the entire Input/Output/Explanation block in a single <pre> tag. The text inside the <pre> tag must be plain text and preserve the exact original indentation and line breaks.
      5.  Do NOT include \`\`\`html or any other markdown. Your entire output must be only the raw HTML content.
      6.  Also make sure the generated description should also the match the font size of the examples. It should be uniform and split the long paragraphs when required. 
      7.  If the original problem text contains an <img> tag, you MUST include that <img> tag, completely unchanged, in your final HTML output at the appropriate place in the story.

      Here is the original problem title to rephrase:
      ---
      ${title}
      ${originalProblem}
      ---
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rephrasedText = response.text();
    res.json({ rephrasedText: rephrasedText });

  } catch (error) {
    console.error("Error calling API:", error);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
});

app.listen(3000, () => {
  console.log(`server is running at 3000`);
});