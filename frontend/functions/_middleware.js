// Cloudflare Pages Function: forwards API/docs requests to the Spring Boot backend.
// Set BACKEND_URL (e.g. https://your-backend.onrender.com) in the Pages project's
// environment variables. Only paths listed in public/_routes.json reach this code.
export async function onRequest({ request, env, next }) {
  const backend = env.BACKEND_URL
  if (!backend) return next()

  const url = new URL(request.url)
  const target = new URL(url.pathname + url.search, backend)
  const headers = new Headers(request.headers)
  headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') ?? '')
  headers.set('X-Forwarded-Host', url.host)
  headers.set('X-Forwarded-Proto', 'https')

  return fetch(target, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  })
}
