import { useState, type FormEvent } from 'react'
import { profile } from '../data'
import { api } from '../lib/api'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { SectionHeading } from '../components/Sections'

export function Contact() {
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const d = new FormData(form)
    setBusy(true)
    setStatus(null)
    try {
      const res = await api.contact({
        name: String(d.get('name')),
        email: String(d.get('email')),
        subject: String(d.get('subject') ?? ''),
        message: String(d.get('message')),
        website: String(d.get('website') ?? ''),
      })
      setStatus({ ok: true, msg: res.message })
      form.reset()
    } catch (err) {
      setStatus({ ok: false, msg: (err as Error).message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container page narrow">
      <Seo title="Contact" />
      <SectionHeading eyebrow="Say hello" title="Contact" />
      <p>
        Have a role, project or question? Send a message below or email{' '}
        <a href={`mailto:${profile.email}`}>{profile.email}</a>.
      </p>
      <div className="socials big">
        {profile.socials.filter((s) => s.url).map((s) => (
          <a key={s.label} href={s.url} target="_blank" rel="noreferrer"><Icon name={s.icon} /> {s.label}</a>
        ))}
      </div>
      <form className="form" onSubmit={submit}>
        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
        <div className="form-row">
          <label>Name<input name="name" required maxLength={100} autoComplete="name" /></label>
          <label>Email<input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
        </div>
        <label>Subject<input name="subject" maxLength={200} /></label>
        <label>Message<textarea name="message" required minLength={10} maxLength={5000} rows={6} /></label>
        <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
        {status && <p className={status.ok ? 'success' : 'error'} role="status">{status.msg}</p>}
      </form>
    </div>
  )
}
