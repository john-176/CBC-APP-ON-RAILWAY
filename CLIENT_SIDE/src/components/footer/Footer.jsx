import { Link, useLocation } from 'react-router-dom';
import './Footer.css';
//import '@fortawesome/fontawesome-free/css/all.min.css';
import { useEffect } from 'react';

const Footer = () => {

  const location = useLocation();

  return (
    <footer className="footer">
      <div className="footer-content">
        <nav className="footer-nav" aria-label="Footer Navigation">
          <ul className="footer-links">
            <li><a href="/contact">☎️Contact: Mobile +254 70123567</a></li>
            <li><a href="mailto:info@example.com">📩Email Us</a></li>
            <li><a href="/about-us">ℹ️About Us</a></li>
            {/*<li><a href="/terms-and-conditions">⚠️Terms & Conditions</a></li>}*/}
          </ul> 
          <div className="social-icons">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
          <div>
            <p className="footer-copy">Copyright
              &copy; {new Date().getFullYear()}. <a href="mailto:johnthedeveloper7@gmail.com">johnthedeveloper7@gmail.com</a>. All Rights Reserved.
            </p>
          </div>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;