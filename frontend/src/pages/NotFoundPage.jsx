import { Link } from 'react-router-dom';
import logo from '../assets/worknest-logo.png';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-6">
    <div className="w-full max-w-md text-center">
      <img src={logo} alt="WorkNest" className="h-14 mx-auto mb-8 mix-blend-multiply" />
      <p className="text-6xl font-semibold text-primary mb-2">404</p>
      <h1 className="text-xl font-semibold text-dark mb-2">This page doesn't exist</h1>
      <p className="text-muted mb-8">The address may be mistyped, or the page may have moved.</p>
      <Link
        to="/"
        className="inline-block rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 transition-colors"
      >
        Go to the dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;