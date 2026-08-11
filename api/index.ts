import app from '../server';

export default function handler(req: any, res: any) {
  try {
    const rawUrl = req.url || '/';

    // Handle fallback if query parameter 0 is passed
    if (req.query && typeof req.query['0'] === 'string' && req.query['0'].length > 0) {
      const routePath = req.query['0'].replace(/^\//, '');
      const search = rawUrl.includes('?') ? '?' + rawUrl.split('?')[1] : '';
      req.url = '/api/' + routePath + search;
    } else if (!rawUrl.startsWith('/api')) {
      req.url = '/api' + (rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl);
    }

    return app(req, res);
  } catch (err: any) {
    console.error('Vercel Handler Exception:', err);
    return res.status(500).json({
      success: false,
      message: 'Error interno en la función de API en Vercel: ' + (err?.message || String(err)),
    });
  }
}

