import { useEffect, useState } from "react";
import "./App.css";
import Home from "./components/Home";
import Login from "./components/Login";
import ParentDashboard from "./components/ParentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import Admin from "./components/Admin";
import { supabase, ensureProfile, getProfile } from "./lib/supabase";
import { isAdminEmail } from "./lib/api";
import { SITE_NAME } from "./lib/config";

function readPublicPage() {
  return window.location.hash.includes("login") ? "login" : "home";
}

function readLoginRole() {
  const query = window.location.hash.split("?")[1] || "";
  const role = new URLSearchParams(query).get("role");
  if (["parent", "teacher", "admin"].includes(role)) return role;
  return localStorage.getItem("pending_role") || "parent";
}

function resolveRole(email, pendingRole, profileRole, savedRole) {
  if (isAdminEmail(email)) return "admin";
  const chosen = pendingRole || profileRole || savedRole || "parent";
  if (chosen === "admin") return "parent";
  return chosen;
}

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publicPage, setPublicPage] = useState(readPublicPage);

  useEffect(() => {
    const onHash = () => setPublicPage(readPublicPage());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const loadUser = async (currentSession) => {
      setSession(currentSession);

      if (!currentSession?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const email = currentSession.user.email;
      const pendingRole = localStorage.getItem("pending_role");
      if (pendingRole === "admin" && !isAdminEmail(email)) {
        localStorage.setItem("pending_role", "parent");
      }

      const { role: savedRole } = await ensureProfile(
        currentSession.user,
        "parent"
      );
      const profile = await getProfile(currentSession.user.id);
      setRole(
        resolveRole(
          email,
          localStorage.getItem("pending_role"),
          profile?.role,
          savedRole
        )
      );
      localStorage.removeItem("pending_role");
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      loadUser(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        loadUser(currentSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const goLogin = (role) => {
    if (role) localStorage.setItem("pending_role", role);
    window.location.hash = role ? `/login?role=${role}` : "/login";
  };

  const goHome = () => {
    window.location.hash = "/";
  };

  if (loading) {
    return (
      <div className="shell" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div className="brand">
          <div className="mark">P</div>
          <h2>{SITE_NAME}</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    if (publicPage === "login") {
      return <Login onBack={goHome} initialRole={readLoginRole()} />;
    }
    return <Home onLogin={goLogin} />;
  }

  if (role === "admin") {
    return <Admin user={session.user} />;
  }

  if (role === "teacher") {
    return <TeacherDashboard user={session.user} />;
  }

  return <ParentDashboard user={session.user} />;
}

export default App;
