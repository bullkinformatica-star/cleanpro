import app from '../server';

export default function handler(req: any, res: any) {
  try {
    if (req.url) {
      if (req.query && typeof req.query['0'] === 'string' && req.query['0'].length > 0) {
        const routePath = req.query['0'];
        const urlObj = new URL(req.url, 'http://localhost');
        urlObj.searchParams.delete('0');
        const search = urlObj.search;
        req.url = '/api/' + routePath.replace(/^\//, '') + search;
      } else if (!req.url.startsWith('/api')) {
        req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
      }
    }
  } catch (err) {
    console.error('Vercel handler URL rewrite error:', err);
  }

  return app(req, res);
}
