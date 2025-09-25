const splitTextByTokens = (text, maxTokens = 6000) => {
  const approxChars = maxTokens * 4;
  const chunks = [];

  for (let i = 0; i < text.length; i += approxChars) {
    chunks.push(text.slice(i, i + approxChars));
  }

  return chunks;
};

// Full video summarization prompt
const buildPrompt = (transcript) => {
  return `You are an expert professional video summarizer.

Your job is to create a **clear, structured, and professional summary** of the entire YouTube transcript I provide.  

Follow this exact structure:

# Summary  
- Start with 1–2 paragraphs that describe the overall theme of the video, its purpose, and the key message.  
- This must read like an introduction for someone who never saw the video.  

# Highlights  
- Provide 5–8 short, punchy bullet points with relevant emojis.  
- Each point should capture a distinct idea, example, or event.  
- Be concise but informative.  

# Key Insights  
- Provide 5–7 in-depth insights in paragraph form (2–4 sentences each).  
- Explain the *meaning, lessons, or implications* behind what happened in the video.  
- These should go deeper than the Highlights, giving context and clarity.  

## Rules:
- Cover **all important points, arguments, events, and examples** from the transcript.  
- Preserve the **chronological flow** where it makes sense, but prioritize clarity and theme.  
- Use **Markdown formatting** properly:
  - Headings (#, ##) exactly as shown.
  - Bullet points (-) for Highlights.  
  - Emojis in Highlights only.  
- Do NOT add filler phrases (“this part says…”, “in this section…”).  
- Do NOT escape characters (no \\n, no extra *).  
- Do NOT output anything outside the required structure.  

Transcript:
${transcript}

Now provide the structured summary in English using the format above.
`;
};

// Chunk summarization prompt
const buildChunkPrompt = (chunk, index, totalChunks) => {
  return `You are an expert professional video summarizer.

This is part ${index + 1} of ${totalChunks} of a long YouTube transcript.  
Summarize only this part.

Follow this structure:

# Summary  
- 1 short paragraph describing what happens in this part.  

# Highlights  
- 3–5 short, concise bullet points with emojis.  

# Key Insights  
- 2–3 deeper insights explained in 2–3 sentences each.  

## Rules:
- Cover every important detail from this part.  
- Do not mention other parts or reference "Part ${index + 1}".  
- Do not add conclusions unless present in this chunk.  
- Use proper Markdown formatting.  
- Do not escape characters.  

Transcript (Part ${index + 1} of ${totalChunks}):
${chunk}

Now provide the clean, structured summary for this part in English.
`;
};

// Refinement prompt for combining chunks
const buildRefinePrompt = (transcripts) => {
  return `You are an expert video summarizer.  
The following text contains multiple structured part-summaries of a long YouTube video.  
Your task is to **combine them into one seamless, professional summary**.  

Follow this structure exactly:

# Summary  
- Merge the key introductory themes into 1–2 clear paragraphs.  

# Highlights  
- Combine all major bullet points from the parts into 6–10 concise, non-redundant bullet points with emojis.  

# Key Insights  
- Synthesize the deeper insights from across all parts into 6–8 strong insights.  
- Remove duplicates or overlaps, but keep all unique depth and lessons.  
- Write them as small paragraphs (2–4 sentences each).  

## Rules:
- Do not say "Part 1", "Part 2", etc.  
- Eliminate repetition.  
- Keep it clear, engaging, and professional.  
- Use Markdown formatting exactly as specified.  

Part Summaries:
${transcripts}

Now provide the refined final summary in the format above.
`;
};


const buildSmallPrompt = (transcript) => {
  return `You are an expert professional video summarizer.

Your job: Summarize the entire YouTube transcript I provide. 
The summary must:
- Be **short and concise** (around 200–300 words maximum).
- Focus only on the **main message and the top 3–5 key points**.
- Use **Markdown formatting only**:
  - A short introductory paragraph explaining what the video is about.
  - A bulleted list for the key highlights.
- No extra fluff, no unnecessary detail. Just the essence.

Transcript:
${transcript}

Now provide the concise summary in English.
`;
};

const buildSmallChunkPrompt = (chunk, index, totalChunks) => {
  return `You are an expert professional video summarizer.

This is part ${index + 1} of ${totalChunks} of a long YouTube transcript. 
Summarize only this part.

Rules:
- Keep it **very concise** (100–150 words for this part).
- Focus only on the **main points** of this chunk.
- Use Markdown formatting:
  - A short paragraph
  - A few bullet points if needed
- No references to other parts. 
- No filler phrases.

Transcript (Part ${index + 1}):
${chunk}

Now provide the short summary for this part in English.
`;
};

const buildSmallRefinePrompt = (transcript) => {
  return `
You are an expert video summarizer. The following text contains multiple part-summaries of a long YouTube video. 
Your task is to combine them into a single, short, clean summary in English.

Instructions:
- Keep it **concise** (around 200–300 words total).
- Remove repetition or overlapping points.
- Focus only on the main message and the most important insights.
- Use Markdown formatting:
  - One short introductory paragraph about what the video is.
  - A bulleted list of the main 3–6 key highlights.
- Do not label parts like "Part 1" or "Part 2".
- No filler or unnecessary details.

Part Summaries:
${transcript}

Now provide the final concise summary:
`;
};


module.exports = {
  splitTextByTokens,
  buildPrompt,
  buildChunkPrompt,
  buildRefinePrompt,
  buildSmallPrompt,
  buildSmallChunkPrompt,
  buildSmallRefinePrompt,
};
