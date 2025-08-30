const axios = require("axios");
const {
  splitTextByTokens,
  buildPrompt,
  buildChunkPrompt,
} = require("./chunkController");
const { fetchTranscript } = require("./transcriptController");

const callModel = async (prompt) => {
  const apiKey = process.env.GEMINIAPI;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
      }
    );

    return (
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from model."
    );
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw new Error("Failed to get summary from Gemini API");
  }
};

const cleanMarkdown = (text) => {
    return (
      text
        .replace(/\\n/g, "\n")
        .replace(/\*{3,}/g, "**")
        .replace(/^\*+\s{2,}/gm, "* ")
        .trim()
    );
  };


const summarizeTranscript = async (req, res) => {
  
  try {
    const { videoUrl } = req.body;

    if (!videoUrl || videoUrl.trim().length === 0) {
      return res.status(400).json({ message: "videoUrl is required." });
    }

    const transcriptData = await fetchTranscript(videoUrl);
    const transcript = transcriptData.transcript;

    if (!transcript || transcript.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Transcript could not be retrieved." });
    }

    const tokenEstimate = Math.ceil(transcript.length / 4);

    if (tokenEstimate <= 8000) {
      const prompt = buildPrompt(transcript);
      const summary = await callModel(prompt);
      const cleanedSummary = cleanMarkdown(summary);
      return res.status(200).json({ cleanedSummary });
    } else {
      const chunks = splitTextByTokens(transcript);

      const summaries = await Promise.all(
        chunks.map((chunk, i) => {
          const chunkPrompt = buildChunkPrompt(chunk, i, chunks.length);
          return callModel(chunkPrompt);
        })
      );

      const fullSummary = summaries.join("\n");

      const refinePrompt = `
        You are an expert video summarizer. The following text contains multiple part-summaries of a long YouTube video. 
        Your task is to combine them into a single, clean, well-structured summary in English.

        Instructions:
        - Remove repetitive or overlapping information.
        - Keep all important details from each part.
        - Use markdown formatting (paragraphs, bullet points if natural).
        - Do not say "Part 1", "Part 2", etc. — merge into one seamless summary.
        - Make it clear and easy to understand.

        Part Summaries:
        ${fullSummary}

        Now provide the refined final summary:
      `;

      const refinedSummary = await callModel(refinePrompt);
      const finalSummary = cleanMarkdown(refinedSummary);
      return res.status(200).json({ summary: finalSummary });
    }
  } catch (err) {
    console.error("Error in summarizeTranscript:", err.message);
    res.status(500).json({
      message: "Failed to summarize transcript.",
      error: err.message,
    });
  }
};

module.exports = {
  summarizeTranscript,
};
