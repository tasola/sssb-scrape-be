// Middleware for async route
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = {
  asyncMiddleware: asyncMiddleware
}
