export const config = {
  path: "/*",
  excludedPath: ["/_next/*", "/images/*", "/fonts/*"],
  onError: "bypass",
};

export default function logRequestIp(_request, context) {
  if (context.deploy.context !== "production" || !context.deploy.published) return;
  if (Netlify.env.get("REQUEST_IP_LOGGING") === "false" || !context.ip) return;

  console.info(JSON.stringify({
    event: "site_request",
    requestId: context.requestId,
    ip: context.ip,
  }));
}
