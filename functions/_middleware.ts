// One canonical host: the production pages.dev alias and www both 301 to the
// apex. Preview deployments (<hash>.diagnoseovergang.pages.dev) are left alone.
const CANONICAL_HOST = "diagnoseovergang.no";
const REDIRECT_HOSTS = new Set(["diagnoseovergang.pages.dev", "www.diagnoseovergang.no"]);

interface Context {
  request: Request;
  next: () => Promise<Response>;
}

export const onRequest = async ({ request, next }: Context): Promise<Response> => {
  const url = new URL(request.url);
  if (!REDIRECT_HOSTS.has(url.hostname)) return next();
  url.hostname = CANONICAL_HOST;
  url.protocol = "https:";
  url.port = "";
  return Response.redirect(url.toString(), 301);
};
