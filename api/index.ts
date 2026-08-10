import app from '../server';

export default function handler(req: any, res: any) {
  // Fix URL path when running on Vercel Serverless Functions with rewrites
  if (req.url) {
    if (!req.url.startsWith('/api') && !req.url.startsWith('/')) {
      req.url = '/api/' + req.url;
    } else if (req.query && req.query['0'] && typeof req.query['0'] === 'string') {
      const subpath = req.query['0'];
      if (!req.url.includes(subpath)) {
        req.url = '/api/' + subpath.replace(/^\//, '');
      }
    }
  }
  return app(req, res);
}
