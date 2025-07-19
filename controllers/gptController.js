const axios = require("axios");
const { responseCodes } = require("../utils/responseCodes");

// Replace this with user-specific API key logic later
const OPENAI_API_KEY = "sk-your-hardcoded-api-key";

// const OPENAI_API_KEY = req.user?.apiKey; // <-- use this before deploying

const callChatGPT = async (prompt) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API Error:", error.response?.data || error.message);
    throw new Error("Failed to get summary from ChatGPT.");
  }
};

const splitTextByTokens = (text, maxTokens = 6000) => {
  const approxChars = maxTokens * 4;
  const chunks = [];

  for (let i = 0; i < text.length; i += approxChars) {
    chunks.push(text.slice(i, i + approxChars));
  }

  return chunks;
};

const buildPrompt = (transcript) => {
  return `You are a professional video summarizer. I will give you the full transcript of a YouTube video. Your task is to generate a short, structured, and easy-to-understand summary.

Instructions:
- Do not include unnecessary fluff.
- Focus only on the actual content being spoken in the video.
- Use bullet points only if the video content is naturally listed or instructional.
- Maintain paragraph flow wherever it makes sense.
- The summary should be understandable by a layman.

Transcript:
${transcript}

Now provide the summary below in English:`;
};

const buildChunkPrompt = (chunk, index, totalChunks) => {
  return `This is part ${index + 1} of a YouTube video's transcript, which has been split into ${totalChunks} parts due to size limitations.

You are a professional video summarizer. I want you to summarize this part **accurately**, assuming it is part of a longer video. Use natural language, structure it cleanly, and if needed, use bullet points sparingly.

Instructions:
- Do not repeat context from previous parts (you are unaware of them).
- Do not write an intro or conclusion.
- Just summarize this specific part clearly and concisely.

Transcript Part ${index + 1}:
${chunk}

Now provide the summary for this part in English:`;
};

const summarizeTranscript = async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ message: "Transcript is required." });
    }

    const tokenEstimate = Math.ceil(transcript.length / 4);

    if (tokenEstimate <= 8000) {
      const prompt = buildPrompt(transcript);
      const summary = await callChatGPT(prompt);
      return res.status(200).json({ summary });
    } else {
      const chunks = splitTextByTokens(transcript);
      const summaries = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunkPrompt = buildChunkPrompt(chunks[i], i, chunks.length);
        const chunkSummary = await callChatGPT(chunkPrompt);
        summaries.push(`Part ${i + 1} Summary:\n${chunkSummary}\n`);
      }

      const fullSummary = summaries.join("\n");
      return res.status(200).json({ summary: fullSummary });
    }
  } catch (err) {
    console.error("Error in summarizeTranscript:", err.message);
    res.status(500).json({ message: responseCodes[500] });
  }
};

module.exports = {
  summarizeTranscript,
};
