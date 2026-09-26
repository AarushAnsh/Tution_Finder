import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ADMIN_EMAILS, GOOGLE_REDIRECT_URL } from "../lib/config";
import SiteNav from "./SiteNav";

function Login({ onBack, initialRole = "parent" }) {
  const [role, setRole] = useState(initialRole);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const handleGoogleLogin = async () => {
    setMessage("");
    localStorage.setItem("pending_role", role);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: GOOGLE_REDIRECT_URL || window.location.origin,
      },
    });

    if (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="shell">
      <SiteNav onLogin={() => window.scrollTo({ top: 0, behavior: "smooth" })} />

      <section className="hero-login">
        <div>
          <button type="button" className="btn btn-ghost btn-auto" onClick={onBack}>
            Back to home
          </button>
          <span className="kicker" style={{ marginTop: 18 }}>
            Sign in with Google
          </span>
          <h1>Continue as a parent, teacher, or admin.</h1>
          <p className="lead">
            Choose your role and sign in with Google. Parents submit a requirement, teachers apply to be
            listed, and the Motihari admin assigns a tutor. Admin access is reserved for{" "}
            {ADMIN_EMAILS || "aarushkumar2178@gmail.com"}.
          </p>
        </div>

        <div className="auth-card">
          <h2>Sign in with Google</h2>
          <p className="muted">Select your role, then continue.</p>

          <div className="role-grid">
            <button
              type="button"
              className={`role-btn ${role === "parent" ? "active" : ""}`}
              onClick={() => setRole("parent")}
            >
              Parent
              <small>Submit a requirement and receive an assigned tutor</small>
            </button>
            <button
              type="button"
              className={`role-btn ${role === "teacher" ? "active" : ""}`}
              onClick={() => setRole("teacher")}
            >
              Teacher
              <small>Apply to teach at home or online in Motihari</small>
            </button>
            <button
              type="button"
              className={`role-btn ${role === "admin" ? "active" : ""}`}
              onClick={() => setRole("admin")}
            >
              Admin
              <small>Review listings and assign tutors</small>
            </button>
          </div>

          {role === "admin" ? (
            <div className="admin-note">
              <p>
                Sign in with Google using <strong>{ADMIN_EMAILS || "aarushkumar2178@gmail.com"}</strong>.
              </p>
              <ol className="plain-list">
                <li>Choose Admin above.</li>
                <li>Continue with Google.</li>
                <li>Pick that Gmail account — not another Google account.</li>
                <li>The admin desk opens after Google confirms the email.</li>
              </ol>
              <p className="muted">
                Any other Google account will open as a parent, not as admin.
              </p>
            </div>
          ) : null}

          <button type="button" className="btn btn-primary" onClick={handleGoogleLogin}>
            Continue with Google
          </button>
          {message ? <p className="flash err">{message}</p> : null}
        </div>
      </section>
    </div>
  );
}

export default Login;
