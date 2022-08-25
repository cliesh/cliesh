const host = "192.168.100.156";
const port = 9090;
const proxyTarget = `http://${host}:${port}`;
console.log("proxy target to ", proxyTarget);

const PROXY_CONFIG = [
  {
    context: ["/ping", "/version", "/traffic", "/logs", "/connections", "/proxies", "/rules", "/providers"],
    target: proxyTarget,
    secure: false,
    pathRewrite: {
      "^/ping": ""
    }
  }
];

module.exports = PROXY_CONFIG;
