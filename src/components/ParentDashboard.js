import { useCallback,useEffect, useState } from "react";
import ParentForm from "./ParentForm";
import AppShell from "./AppShell";
import { getParentRequests, getTeachers } from "../lib/api";
import { supabase } from "../lib/supabase";

function ParentDashboard({ user }) {
  const [requests, setRequests] = useState([]);
  const [teachers, setTeachers] = useState([]);

 const load = useCallback(async () => {
  const [allRequests, allTeachers] = await Promise.all([
    getParentRequests(supabase),
    getTeachers(supabase),
  ]);

  setRequests(
    allRequests.filter(
      (item) =>
        item.email === user.email || item.userId === user.id
    )
  );

  setTeachers(
    allTeachers.filter((item) => item.status === "Approved")
  );
}, [user.email, user.id]);

 useEffect(() => {
  load();
}, [load]);

  const assigned = requests.find((item) => item.status === "Assigned");

  return (
    <AppShell email={user.email} roleLabel="Parent">
      <div className="page-head">
        <div>
          <p className="kicker">Parent desk</p>
          <h1>Find a tutor for your child</h1>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat">
          <b>{requests.length}</b>
          <span className="muted">Your requests</span>
        </div>
        <div className="stat">
          <b>{requests.filter((item) => item.status === "Assigned").length}</b>
          <span className="muted">Assigned</span>
        </div>
        <div className="stat">
          <b>{teachers.length}</b>
          <span className="muted">Approved teachers</span>
        </div>
      </div>

      {assigned ? (
        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <span className="badge badge-assigned">Assigned</span>
          <h2>{assigned.assignedTeacherName}</h2>
          <p className="muted">
            {assigned.assignedTeacherSubject} · {assigned.assignedTeacherEmail} ·{" "}
            {assigned.assignedTeacherPhone}
          </p>
          <p>
            Your request: {assigned.subject}, class {assigned.childClass}
          </p>
        </div>
      ) : null}

      <div className="grid-2">
        <ParentForm user={user} onCreated={load} />
        <div>
          <div className="card" style={{ padding: 22, marginBottom: 16 }}>
            <h2>Your requests</h2>
            <div className="list" style={{ marginTop: 12 }}>
              {requests.length === 0 ? (
                <div className="empty">No requests yet. Submit the form to get started.</div>
              ) : (
                requests.map((item) => (
                  <div className="list-item" key={item.id}>
                    <strong>
                      {item.subject} · Class {item.childClass}
                    </strong>
                    <p className="muted">
                      {item.location} · {item.teachingMode}
                    </p>
                    <span className={`badge ${item.status === "Assigned" ? "badge-assigned" : "badge-open"}`}>
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <h2>Approved teachers</h2>
            <p className="muted">Admin will assign from this reviewed list.</p>
            <div className="list" style={{ marginTop: 12 }}>
              {teachers.slice(0, 8).map((teacher) => (
                <div className="list-item" key={teacher.teacherId}>
                  <strong>{teacher.name}</strong>
                  <p className="muted">
                    {teacher.subject} · {teacher.location} · {teacher.teachingMode}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default ParentDashboard;
