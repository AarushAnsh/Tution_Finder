import { supabase } from "../lib/supabase";
import { SITE_NAME } from "../lib/config";

function AppShell({ email, roleLabel, children }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = "/";
  };

  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="#/">
          <div className="mark">P</div>
          <div>
            <div>{SITE_NAME}</div>
            <small className="muted">Tuition Finder</small>
          </div>
        </a>
        <div className="topbar-meta">
          <span className="badge badge-approved">{roleLabel}</span>
          <span className="muted">{email}</span>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}

export default AppShell;
