import { useCallback,useEffect, useState } from "react";
import TeacherForm from "./TeacherForm";
import AppShell from "./AppShell";
import { getParentRequests, getTeachers } from "../lib/api";
import { supabase } from "../lib/supabase";

function TeacherDashboard({ user }) {
  const [listings, setListings] = useState([]);
  const [assignments, setAssignments] = useState([]);

 const load = useCallback(async () => {
  const [teachers, requests] = await Promise.all([
    getTeachers(supabase),
    getParentRequests(supabase),
  ]);

  const mine = teachers.filter(
    (item) => String(item.email).toLowerCase() === user.email.toLowerCase()
  );

  setListings(mine);

  setAssignments(
    requests.filter(
      (item) =>
        item.status === "Assigned" &&
        String(item.assignedTeacherEmail).toLowerCase() ===
          user.email.toLowerCase()
    )
  );
}, [user.email]);

  useEffect(() => {
    load();
  }, [load]);

  const latest = listings[0];

  return (
    <AppShell email={user.email} roleLabel="Teacher">
      <div className="page-head">
        <div>
          <p className="kicker">Teacher desk</p>
          <h1>Get listed. Get assigned.</h1>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat">
          <b>{listings.length}</b>
          <span className="muted">Your listings</span>
        </div>
        <div className="stat">
          <b>{latest?.status || "—"}</b>
          <span className="muted">Latest status</span>
        </div>
        <div className="stat">
          <b>{assignments.length}</b>
          <span className="muted">Assigned families</span>
        </div>
      </div>

      <div className="grid-2">
        <TeacherForm user={user} onSubmitted={load} />
        <div>
          <div className="card" style={{ padding: 22, marginBottom: 16 }}>
            <h2>Listing status</h2>
            <div className="list" style={{ marginTop: 12 }}>
              {listings.length === 0 ? (
                <div className="empty">Submit a listing. Admin will approve it before parents can see it.</div>
              ) : (
                listings.map((item) => (
                  <div className="list-item" key={item.teacherId}>
                    <strong>
                      {item.name} · {item.subject}
                    </strong>
                    <p className="muted">
                      {item.classes} · {item.location}
                    </p>
                    <span
                      className={`badge ${
                        item.status === "Approved"
                          ? "badge-approved"
                          : item.status === "Rejected"
                          ? "badge-rejected"
                          : "badge-pending"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <h2>Assigned parents</h2>
            <div className="list" style={{ marginTop: 12 }}>
              {assignments.length === 0 ? (
                <div className="empty">No assignments yet. Approved listings receive matches here.</div>
              ) : (
                assignments.map((item) => (
                  <div className="list-item" key={item.id}>
                    <strong>
                      {item.parentName} · {item.subject}
                    </strong>
                    <p className="muted">
                      Class {item.childClass} · {item.location} · {item.phone}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default TeacherDashboard;
