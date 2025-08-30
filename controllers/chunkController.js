const { callModel } = require("./modelController");

const splitTextByTokens = (text, maxTokens = 6000) => {
  const approxChars = maxTokens * 4;
  const chunks = [];

  for (let i = 0; i < text.length; i += approxChars) {
    chunks.push(text.slice(i, i + approxChars));
  }

  return chunks;
};

const buildPrompt = (transcript) => {
  return `You are an expert professional video summarizer.

Your job: Summarize the entire YouTube transcript I provide. 
The summary must:
- Cover **all important points, arguments, events, and examples** from the transcript.
- Preserve the **chronological flow** (order of the video).
- Be **detailed** and well-structured. Long is fine if it captures all key content.
- Use **Markdown formatting only**:
  - Headings (#, ##) if the content naturally divides into sections.
  - Bullet points (-) for lists, steps, or instructions.
  - Blank lines for paragraphs.
  - Bold/italic text only when it emphasizes key terms.
- Do not include filler phrases like “this part says” or “in this section”.
- Do not escape characters (no \\n, no unnecessary *). Use natural Markdown formatting.
- Do not add extra explanations, just return the summary itself.

Transcript:
${transcript}

Now provide the complete, structured summary in English using proper Markdown.
`;
};


const buildChunkPrompt = (chunk, index, totalChunks) => {
  return `You are an expert professional video summarizer.

This is part ${index + 1} of ${totalChunks} of a long YouTube transcript. 
Summarize only this part.

Rules:
- Cover every important detail from this part.
- Use **Markdown formatting only**:
  - Paragraphs for explanations
  - Bullet points for lists
- No intros like “this part of the video tells…”
- No references to other parts
- No conclusions unless present in the chunk
- Do not escape characters (no \\n, no stray *).

Transcript (Part ${index + 1}):
${chunk}

Now provide the clean, structured Markdown summary for this part in English.
`;
};

module.exports = {
  splitTextByTokens,
  buildPrompt,
  buildChunkPrompt,
};
