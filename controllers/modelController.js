const axios = require("axios");
const {
  splitTextByTokens,
  buildPrompt,
  buildChunkPrompt,
  buildRefinePrompt,
  buildSmallPrompt,
  buildSmallRefinePrompt,
  buildSmallChunkPrompt
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
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey
        },
        timeout: 120000
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
  return text
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\*{3,}/g, "**")
    .replace(/^\*+\s{2,}/gm, "* ")
    .trim();
};


const summarizeTranscript = async (req, res) => {
  try {
    const { videoUrl, summaryLength } = req.body;

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

    console.log("Fetched transcript successfully.");

    const tokenEstimate = Math.ceil(transcript.length / 4);

    if (tokenEstimate <= 8000) {
      let prompt;

      if (summaryLength === "small") {
        prompt = buildSmallPrompt(transcript);
      } else {
        prompt = buildPrompt(transcript);
      }

      const summary = await callModel(prompt);

      console.log("Generated summary successfully.");

      const cleanedSummary = cleanMarkdown(summary);
      return res.status(200).json({ cleanedSummary });
    } else {
      const chunks = splitTextByTokens(transcript);
      console.log(`Transcript split into ${chunks.length} chunks.`);

      const summaries = await Promise.all(
        chunks.map((chunk, i) => {
          const chunkPrompt =
            summaryLength === "small"
              ? buildSmallChunkPrompt(chunk)
              : buildChunkPrompt(chunk, i, chunks.length);
          return callModel(chunkPrompt);
        })
      );

      console.log("Generated chunk summaries successfully.");

      const fullSummary = summaries.join("\n");
      console.log(fullSummary);

      const refinePrompt =
        summaryLength === "small"
          ? buildSmallRefinePrompt(fullSummary)
          : buildRefinePrompt(fullSummary);

      const refinedSummary = await callModel(refinePrompt);

      console.log("Generated refined summary successfully.");

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
