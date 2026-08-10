import crypto from 'crypto';

export function trace(req, res, next) {
  const id = req.headers['x-request-id'] || `gw-${crypto.randomUUID()}`;
  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
}
