const { OpenAI } = require("openai");
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testOpenAI() {
  console.log("Testing OpenAI connection...");
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: "Hello, respond with 'OpenAI is working!'" }],
      model: "gpt-4o-mini",
    });
    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI Error:", error.message);
  }
}

testOpenAI();
