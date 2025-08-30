const { getTranscript } = require('youtube-transcript');
const Summary = require('../models/Summary');
const axios = require("axios");


const fetchingTester = async (req, res) => {
  const { videoUrl } = req.body;
  const baseURL = process.env.TRANSCRIPT_SERVICE_URL;
  
  try {
    const response = await axios.post(
      `${baseURL}/transcript` || 
      'http://127.0.0.1:5000/transcript',{ video_url: videoUrl } , { headers: { 'Content-Type': 'application/json' }
    });

    const { data } = await response;

    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Transcript Error:', error.message);
    res.status(500).json({
      message: 'Failed to fetch transcript',
      error: error.message
    });
  }
}

const fetchTranscript = async (videoUrl) => {
  const baseURL = process.env.TRANSCRIPT_SERVICE_URL;

  try {
    const response = await axios.post(
       `${baseURL}/transcript` || 
      'http://127.0.0.1:5000/transcript',
      { video_url: videoUrl },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data;
  } catch (error) {
    console.error("Transcript Error:", error.message);
    throw new Error("Failed to fetch transcript");
  }
};

module.exports = {
  fetchingTester,
  fetchTranscript
};