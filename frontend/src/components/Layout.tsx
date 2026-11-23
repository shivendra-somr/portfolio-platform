import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { profile, site } from '../data'
import { useTheme } from '../lib/theme'
import { Icon } from './Icon'

const YEAR = new Date().getFullYear()

export function Layout() {
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark">{profile.name.split(' ').map((n) => n[0]).join('')}</span>
            <span className="brand-name">{profile.name}</span>
          </Link>
          <nav className={`nav ${open ? 'nav-open' : ''}`} aria-label="Main">
            {site.nav.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <button className="icon-btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>
            <button className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
              <span className="burger" />
            </button>
          </div>
        </div>
      </header>

      <main id="main" key={pathname}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>© {YEAR} {profile.name}. Built with React, TypeScript & Spring Boot.</p>
          <div className="socials">
            {profile.socials.filter((s) => s.url).map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}>
                <Icon name={s.icon} />
              </a>
            ))}
            <a href={`mailto:${profile.email}`} aria-label="Email"><Icon name="mail" /></a>
            <a href="/api/feed.xml" aria-label="RSS feed"><Icon name="rss" /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}
