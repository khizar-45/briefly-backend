const { getTranscript } = require('youtube-transcript');
const responseCodes = require('../utils/responseCodes');
const Summary = require('../models/Summary');


const fetchTranscript = async (req, res) => {
  const { videoUrl } = req.body;

  try {
    if (!videoUrl || (!videoUrl.includes("youtube.com/watch") && !videoUrl.includes("youtu.be/"))) {
      return res.status(responseCodes.BAD_REQUEST).json({
        message: 'Invalid YouTube URL'
      });
    }

    // Extract video ID
    let videoId;
    if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    } else if (videoUrl.includes('v=')) {
      videoId = videoUrl.split('v=')[1].split('&')[0];
    }

    if (!videoId) {
      return res.status(responseCodes.BAD_REQUEST).json({
        message: 'Unable to extract video ID from URL'
      });
    }

    const transcript = await getTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return res.status(responseCodes.NOT_FOUND).json({
        message: 'Transcript not available for this video'
      });
    }

    // Convert transcript to plain text
    const plainText = transcript.map(item => item.text).join(' ');

    res.status(responseCodes.SUCCESS).json({
      message: 'Transcript fetched successfully',
      transcript: plainText
    });

  } catch (error) {
    console.error('Transcript Error:', error.message);
    res.status(responseCodes.SERVER_ERROR).json({
      message: 'Failed to fetch transcript',
      error: error.message
    });
  }
};

const getSummaryHistory = async (req, res) => {
  try {
    const userId = req.user._id; // comes from authMiddleware
    const page = parseInt(req.query.page) || 1; // default to page 1
    const limit = 10;
    const skip = (page - 1) * limit;

    const summaries = await Summary.find({ userId })
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);

    const totalSummaries = await Summary.countDocuments({ userId });

    res.status(responseCodes.SUCCESS).json({
      message: 'Summary history fetched successfully',
      currentPage: page,
      totalPages: Math.ceil(totalSummaries / limit),
      totalSummaries,
      summaries,
    });

  } catch (error) {
    console.error('History Fetch Error:', error.message);
    res.status(responseCodes.SERVER_ERROR).json({
      message: 'Failed to fetch summary history',
      error: error.message,
    });
  }
};

module.exports = {
  fetchTranscript,
  getSummaryHistory
};
