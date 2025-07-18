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
    console.log(originalProblem)
    const companyName = company || 'MAANG';
    const prompt = `
     ${process.env.G_PROMPT}
      PROBLEM TITLE: ${title}

      PROBLEM DESCRIPTION:
      ---
      ${originalProblem}
      ---
    `;
    console.log(prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rephrasedText = response.text();
    // console.log(response)
    // console.log(rephrasedText)
    res.json({ rephrasedText: rephrasedText });

  } catch (error) {
    console.error("Error calling API:", error);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
});

app.listen(3000, () => {
  console.log(`server is running at 3000`);
});