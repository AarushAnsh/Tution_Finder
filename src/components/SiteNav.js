import { SITE_NAME, SUPPORT_EMAIL, SUPPORT_PHONE } from "../lib/config";

function SiteNav({ onLogin }) {
  return (
    <header className="topbar">
      <a className="brand" href="#/">
        <div className="mark">P</div>
        <div>
          <div>{SITE_NAME}</div>
          <small className="muted">Tuition Finder · Motihari</small>
        </div>
      </a>
      <nav className="nav-links">
        <a href="#how">How it works</a>
        <a href="#teachers">Teachers</a>
        <a href="#subjects">Subjects</a>
        <a href="#pricing">Fees</a>
        <a href="#faq">FAQ</a>
        <a href="#contact">Contact</a>
        <a className="nav-contact" href="tel:+918804535616">
          {SUPPORT_PHONE}
        </a>
        <a className="nav-contact" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        <button type="button" className="btn btn-gold" onClick={() => onLogin("parent")}>
          Sign in with Google
        </button>
      </nav>
    </header>
  );
}

export default SiteNav;
