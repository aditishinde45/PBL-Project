import { analyzeScreenshot } from '../services/visionService.js';

export const analyzeScreenshotController = async (req, res, next) => {
  try {
    const { userPrompt, currentStepContext, sampleType } = req.body;
    let imageBuffer = req.file ? req.file.buffer : null;
    let mimeType = req.file ? req.file.mimetype : 'image/jpeg';

    // If sample preset screen was selected or no file was attached, simulate with sample type
    const contextPrompt = sampleType || userPrompt || currentStepContext || 'WhatsApp send photo';

    const result = await analyzeScreenshot({
      imageBuffer: imageBuffer || Buffer.from('demo'),
      mimeType,
      userPrompt: contextPrompt,
      currentStepContext
    });

    res.json({
      success: true,
      analysis: result
    });
  } catch (error) {
    next(error);
  }
};
