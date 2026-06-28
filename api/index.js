export default async function handler(req, res) {
  try {
    const appModule = await import('../backend/server.js');
    const app = appModule.default || appModule;
    return app(req, res);
  } catch (error) {
    console.error("Vercel Serverless Crash:", error);
    res.status(500).json({
      success: false,
      message: "Vercel Serverless Crash",
      error: error.message,
      stack: error.stack
    });
  }
}
