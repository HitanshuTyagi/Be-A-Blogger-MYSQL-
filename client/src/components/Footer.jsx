import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="logo-icon">✍️</span>
          <span>Be A Blogger</span>
        </div>
        <nav className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <p className="footer-copy">&copy; {new Date().getFullYear()} Be A Blogger. All rights reserved.</p>
      </div>
    </footer>
  );
}
