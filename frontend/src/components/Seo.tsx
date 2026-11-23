import { site } from '../data'

/** React 19 hoists <title>/<meta> rendered anywhere into <head>. */
export function Seo({ title, description }: { title?: string; description?: string }) {
  const fullTitle = title ? `${title} · ${site.title.split(' · ')[0]}` : site.title
  const desc = description ?? site.description
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
    </>
  )
}
