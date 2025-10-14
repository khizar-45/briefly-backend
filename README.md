# Briefly - Backend

This is the **Node.js + Express backend** for the Briefly web application.  
It handles transcript fetching, processing, AI-based summarization, and returns structured summaries to the frontend.

---


## Live Demo / Access Link

Frontend: [Briefly Website](https://brieflyyt.vercel.app)  
Frontend Repository: [https://github.com/khizar-45/briefly-frontend](https://github.com/khizar-45/briefly-frontend)

---

## Features

- Receives YouTube video links from the frontend  
- Fetches transcript via **Transcript Microservice** API  
- Splits transcript into chunks if length > 8000 tokens  
- Sends transcript (full or chunks) to **Gemini Flash 2.5** for summarization  
- Merges chunk responses and requests a final structured summary with highlights  
- Returns final summary to frontend  

---

## Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | Node.js + Express |
| Language | JavaScript |
| Libraries | Axios, dotenv, other utilities |
| AI Model | Gemini Flash 2.5 |
| Deployment | Render |

---

## Process Flow

1. Frontend sends a YouTube video link to the main backend endpoint.  
2. Backend forwards the link to the **Transcript Microservice** and receives the transcript.  
3. Transcript length is checked:
   - If > 8000 tokens → split into 6000-token chunks and send multiple requests to **Gemini Flash 2.5**  
   - If ≤ 8000 tokens → send the full transcript with prompt to **Gemini Flash 2.5**  
4. Multiple chunk responses are combined and a final request is sent to Gemini for a **structured summary with highlights**.  
5. Backend sends the final summarized and structured response back to the frontend.  

---

## Contact / Queries

This project is primarily for demonstration purposes and is not intended for public cloning or modification.  
For any questions or collaboration inquiries, please reach out via email: [skkhizarali45@gmail.com](mailto:skkhizarali45@gmail.com)
