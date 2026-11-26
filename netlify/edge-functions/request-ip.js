export const config = { path: "/*", onError: "bypass" };

export default function logRequestIp(_request, context) {
  if (context.deploy.context !== "production" || !context.deploy.published) return;
  if (Netlify.env.get("REQUEST_IP_LOGGING") !== "true" || !context.ip) return;

  console.info(JSON.stringify({
    event: "request_ip",
    requestId: context.requestId,
    ip: context.ip,
  }));
}
