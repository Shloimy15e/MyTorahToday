export const config = {
  path: ["/api/auth/callback/credentials", "/api/auth/token/login", "/api/auth/users"],
  method: "POST",
  onError: "bypass",
};

export default function logRequestIp(_request, context) {
  if (context.deploy.context !== "production" || !context.deploy.published) return;
  if (Netlify.env.get("REQUEST_IP_LOGGING") === "false" || !context.ip) return;

  console.info(JSON.stringify({
    event: "account_request",
    requestId: context.requestId,
    ip: context.ip,
  }));
}
