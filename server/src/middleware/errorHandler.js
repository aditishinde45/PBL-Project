export const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err.message);

  // Multer size limit error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'The image is too large. Please choose a smaller screenshot (under 10MB).'
    });
  }

  // Friendly senior-focused message
  const status = err.statusCode || 500;
  const userMessage = err.isOperational
    ? err.message
    : 'Something went wrong. Please don’t worry, you can try again.';

  res.status(status).json({
    success: false,
    message: userMessage,
    // only show detailed error in non-production development console
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
