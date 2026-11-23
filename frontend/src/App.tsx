import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Projects } from './pages/Projects'
import { Blog } from './pages/Blog'
import { Resume } from './pages/Resume'
import { Contact } from './pages/Contact'
import { BuiltWith } from './pages/BuiltWith'
import { NotFound } from './pages/NotFound'
import { Login } from './pages/admin/Login'
import { RequireAdmin } from './pages/admin/RequireAdmin'
import { Dashboard } from './pages/admin/Dashboard'
import { CommentsAdmin } from './pages/admin/CommentsAdmin'

// Markdown + syntax highlighting is heavy, so pages that render it load on demand.
const BlogPost = lazy(() => import('./pages/BlogPost').then((m) => ({ default: m.BlogPost })))
const PostEditor = lazy(() => import('./pages/admin/PostEditor').then((m) => ({ default: m.PostEditor })))

const fallback = <div className="container page"><p className="muted">Loading…</p></div>

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<Suspense fallback={fallback}><BlogPost /></Suspense>} />
            <Route path="resume" element={<Resume />} />
            <Route path="contact" element={<Contact />} />
            <Route path="built-with" element={<BuiltWith />} />
            <Route path="admin/login" element={<Login />} />
            <Route path="admin" element={<RequireAdmin />}>
              <Route index element={<Dashboard />} />
              <Route path="posts/new" element={<Suspense fallback={fallback}><PostEditor /></Suspense>} />
              <Route path="posts/:id" element={<Suspense fallback={fallback}><PostEditor key="edit" /></Suspense>} />
              <Route path="comments" element={<CommentsAdmin />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
