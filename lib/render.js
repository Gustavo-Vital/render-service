import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Escape basic HTML characters
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Load and process HTML template with placeholders
 */
function loadTemplate(templateName, data) {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Replace placeholders with escaped values
  html = html.replace('{{TITLE}}', escapeHtml(data.title));
  html = html.replace('{{SUBTITLE}}', escapeHtml(data.subtitle));
  html = html.replace('{{CTA}}', escapeHtml(data.cta));
  html = html.replace('{{IMAGE_URL}}', escapeHtml(data.image_url));

  return html;
}

/**
 * Upload PNG to Supabase Storage
 */
async function uploadToSupabase(pngBuffer, jobId) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_BUCKET || 'creative-assets';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  }

  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/jobs/${jobId}/final.png`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
    },
    body: pngBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase upload failed: ${response.status} - ${errorText}`);
  }

  const renderUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/jobs/${jobId}/final.png`;

  return {
    render_key: `jobs/${jobId}/final.png`,
    render_url: renderUrl,
  };
}

/**
 * Main render function
 */
export async function render(payload) {
  const { job_id, template, title, subtitle, cta, image_url } = payload;
  let browser = null;
  let page = null;

  try {
    // Load template with data
    const html = loadTemplate(template, {
      title,
      subtitle,
      cta,
      image_url,
    });

    // Launch browser with timeout
    browser = await chromium.launch();
    page = await browser.newPage();

    // Set viewport to 1080x1080
    await page.setViewportSize({ width: 1080, height: 1080 });

    // Set content and wait for network to be idle
    await page.setContent(html);
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // Take screenshot
    const pngBuffer = await page.screenshot({ fullPage: false });

    // Upload to Supabase
    const uploadResult = await uploadToSupabase(pngBuffer, job_id);

    return uploadResult;
  } catch (error) {
    throw error;
  } finally {
    // Always cleanup
    if (page) {
      await page.close().catch(() => {});
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
