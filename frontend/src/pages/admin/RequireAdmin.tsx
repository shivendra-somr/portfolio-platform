import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

export function RequireAdmin() {
  const { isAdmin, auth, logout } = useAuth()
  const location = useLocation()
  if (!isAdmin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return (
    <div className="container page admin">
      <title>Admin</title>
      <meta name="robots" content="noindex" />
      <div className="admin-bar">
        <nav>
          <NavLink to="/admin" end>Posts</NavLink>
          <NavLink to="/admin/posts/new">New post</NavLink>
          <NavLink to="/admin/comments">Comments</NavLink>
        </nav>
        <span className="muted small">Signed in as {auth?.username} · <button className="link-btn" onClick={logout}>Log out</button></span>
      </div>
      <Outlet />
    </div>
  )
}
