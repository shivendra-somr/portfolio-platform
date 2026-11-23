import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'

export function NotFound() {
  return (
    <div className="container page narrow">
      <Seo title="Not found" />
      <h1>404</h1>
      <p>That page doesn't exist. <Link to="/">Go home</Link>.</p>
    </div>
  )
}
