import 'dotenv/config';
import express from 'express';
import { render } from './lib/render.js';

const app = express();
const port = process.env.PORT || 3000;
const renderToken = process.env.RENDER_TOKEN;

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Render endpoint with Bearer token authentication
app.post('/render', async (req, res) => {
  // Validate Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const token = authHeader.substring(7);
  if (token !== renderToken) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  // Validate request body
  const { job_id, template, title, subtitle, cta, image_url } = req.body;

  if (!job_id || !template || !title || !subtitle || !cta || !image_url) {
    return res.status(400).json({ error: 'missing required fields' });
  }

  try {
    console.log(`[RENDER] Starting render for job_id: ${job_id}`);
    const result = await render({
      job_id,
      template,
      title,
      subtitle,
      cta,
      image_url,
    });

    console.log(`[RENDER] Successfully completed job_id: ${job_id}`);
    res.status(200).json(result);
  } catch (error) {
    console.error(`[RENDER] Error processing job_id: ${job_id} - ${error.message}`);
    res.status(500).json({ error: 'render failed', message: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ error: 'internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`[SERVER] render-service listening on port ${port}`);
});
