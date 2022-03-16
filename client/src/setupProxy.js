const { createProxyMiddleware } = require('http-proxy-middleware');

// 使用 json-server 时用代理进行跨域
// 在轻服务中，调用云函数时默认开启了对 CORS 的支持，确保所有跨域请求能够正常进行。
module.exports = function(app) {
  app.use(
    '/ajax',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );

};
