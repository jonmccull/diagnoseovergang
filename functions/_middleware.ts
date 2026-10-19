import { PAGES_HOST, SITE_HOST } from "../schema/site";

// One canonical host: the production pages.dev alias and www both 301 to the
// apex. Preview deployments (<hash>.diagnoseovergang.pages.dev) are left alone.
const REDIRECT_HOSTS = new Set([PAGES_HOST, `www.${SITE_HOST}`]);

interface Context {
  request: Request;
  next: () => Promise<Response>;
}

export const onRequest = async ({ request, next }: Context): Promise<Response> => {
  const url = new URL(request.url);
  if (!REDIRECT_HOSTS.has(url.hostname)) return next();
  url.hostname = SITE_HOST;
  url.protocol = "https:";
  url.port = "";
  return Response.redirect(url.toString(), 301);
};
