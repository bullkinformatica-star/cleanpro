import app from '../server';

export default function handler(req: any, res: any) {
  try {
    const rawUrl = req.url || '/';

    // 1. If Vercel rewrote query param '0' (e.g. /api/index.ts?0=requests)
    if (req.query && typeof req.query['0'] === 'string' && req.query['0'].length > 0) {
      const routePath = req.query['0'].replace(/^\//, '');
      const search = rawUrl.includes('?') ? '?' + rawUrl.split('?')[1] : '';
      req.url = '/api/' + routePath + search;
    } else if (rawUrl.startsWith('/api/') && rawUrl !== '/api/' && !rawUrl.includes('/api/index')) {
      // Direct clean /api/xxx path - keep as is
    } else if (rawUrl.includes('/api/index')) {
      // Stripped /api/index fallback
      const cleanPath = rawUrl.replace(/\/api\/index(\.ts)?(\?.*)?/, '') || '/';
      req.url = cleanPath.startsWith('/api') ? cleanPath : '/api' + (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath);
    } else if (!rawUrl.startsWith('/api')) {
      req.url = '/api' + (rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl);
    }
  } catch (err) {
    console.error('Vercel handler URL rewrite error:', err);
  }

  return app(req, res);
}
