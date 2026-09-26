import { useEffect, useState } from "react";
import AppShell from "./AppShell";
import {
  approveTeacher,
  assignTeacherToRequest,
  getContactMessages,
  getParentRequests,
  getTeachers,
  rejectTeacher,
} from "../lib/api";
import { supabase } from "../lib/supabase";

function Admin({ user }) {
  const [teachers, setTeachers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState("assign");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const [teacherRows, requestRows, inbox] = await Promise.all([
      getTeachers(supabase),
      getParentRequests(supabase),
      getContactMessages(supabase),
    ]);
    setTeachers(Array.isArray(teacherRows) ? teacherRows : []);
    setRequests(requestRows);
    setMessages(Array.isArray(inbox) ? inbox : []);
  };

  useEffect(() => {
    load();
  }, []);

  const pendingTeachers = teachers.filter((item) => item.status === "Pending");
  const approvedTeachers = teachers.filter((item) => item.status === "Approved");
  const openRequests = requests.filter((item) => item.status !== "Assigned");

  const handleApprove = async (teacherId) => {
    await approveTeacher(teacherId, supabase);
    await load();
  };

  const handleReject = async (teacherId) => {
    await rejectTeacher(teacherId, supabase);
    await load();
  };

  const handleAssign = async () => {
    const request = requests.find((item) => item.id === selectedRequestId);
    const teacher = approvedTeachers.find((item) => item.teacherId === selectedTeacherId);
    if (!request || !teacher) {
      setMessage("Select a parent request and an approved teacher.");
      return;
    }

    await assignTeacherToRequest(request, teacher, supabase);
    setMessage(`${teacher.name} assigned to ${request.parentName}.`);
    setSelectedRequestId("");
    setSelectedTeacherId("");
    await load();
  };

  const visibleTeachers =
    tab === "review" ? pendingTeachers : tab === "approved" ? approvedTeachers : teachers;

  return (
    <AppShell email={user.email} roleLabel="Admin">
      <div className="page-head">
        <div>
          <p className="kicker">Admin desk</p>
          <h1>Review, approve, assign.</h1>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat">
          <b>{pendingTeachers.length}</b>
          <span className="muted">Teachers to review</span>
        </div>
        <div className="stat">
          <b>{openRequests.length}</b>
          <span className="muted">Open parent requests</span>
        </div>
        <div className="stat">
          <b>{requests.filter((item) => item.status === "Assigned").length}</b>
          <span className="muted">Matches made</span>
        </div>
      </div>

      <div className="tabs">
        <button type="button" className={tab === "assign" ? "active" : ""} onClick={() => setTab("assign")}>
          Assign
        </button>
        <button type="button" className={tab === "review" ? "active" : ""} onClick={() => setTab("review")}>
          Review teachers ({pendingTeachers.length})
        </button>
        <button type="button" className={tab === "approved" ? "active" : ""} onClick={() => setTab("approved")}>
          Approved ({approvedTeachers.length})
        </button>
        <button type="button" className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>
          All teachers ({teachers.length})
        </button>
        <button type="button" className={tab === "inbox" ? "active" : ""} onClick={() => setTab("inbox")}>
          Messages ({messages.length})
        </button>
      </div>

      {tab === "inbox" ? (
        <div className="list">
          {messages.length === 0 ? (
            <div className="empty card">
              No website messages yet. New contact-form notes also go to aarushkumar2178@gmail.com.
            </div>
          ) : (
            messages.map((item, index) => (
              <div className="list-item" key={item.id || item.created_at || index}>
                <strong>
                  {item.name} · {item.topic}
                </strong>
                <p className="muted">
                  {item.email} · {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                </p>
                <p>{item.message}</p>
              </div>
            ))
          )}
        </div>
      ) : tab === "assign" ? (
        <div className="assign-box">
          <div className="card" style={{ padding: 22 }}>
            <h2>Parent requests</h2>
            <div className="list" style={{ marginTop: 12 }}>
              {requests.length === 0 ? (
                <div className="empty">
                  No requests yet. Run supabase/app_tables.sql, then have a parent submit the form.
                </div>
              ) : (
                requests.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`list-item ${selectedRequestId === item.id ? "active" : ""}`}
                    onClick={() => setSelectedRequestId(item.id)}
                    style={{
                      textAlign: "left",
                      borderColor: selectedRequestId === item.id ? "var(--navy)" : undefined,
                    }}
                  >
                    <strong>
                      {item.parentName} · {item.subject}
                    </strong>
                    <p className="muted">
                      Class {item.childClass} · {item.location} · {item.budget || "budget n/a"}
                    </p>
                    <span className={`badge ${item.status === "Assigned" ? "badge-assigned" : "badge-open"}`}>
                      {item.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h2>Approved teachers</h2>
            <div className="list" style={{ marginTop: 12 }}>
              {approvedTeachers.length === 0 ? (
                <div className="empty">No approved teachers yet. Review pending listings first.</div>
              ) : (
                approvedTeachers.map((teacher) => (
                  <button
                    type="button"
                    key={teacher.teacherId}
                    className="list-item"
                    onClick={() => setSelectedTeacherId(teacher.teacherId)}
                    style={{
                      textAlign: "left",
                      borderColor: selectedTeacherId === teacher.teacherId ? "var(--navy)" : undefined,
                    }}
                  >
                    <strong>
                      {teacher.name} · {teacher.subject}
                    </strong>
                    <p className="muted">
                      {teacher.classes} · {teacher.location} · fee {teacher.expectedFee}
                    </p>
                  </button>
                ))
              )}
            </div>
            <div className="row-actions">
              <button type="button" className="btn btn-gold" onClick={handleAssign}>
                Assign selected pair
              </button>
            </div>
            {message ? <p className="flash ok">{message}</p> : null}
          </div>
        </div>
      ) : (
        <div className="list">
          {visibleTeachers.length === 0 ? (
            <div className="empty card">No teachers in this tab.</div>
          ) : (
            visibleTeachers.map((teacher) => (
              <div className="list-item" key={teacher.teacherId}>
                <strong>{teacher.name}</strong>
                <p>
                  {teacher.subject} · classes {teacher.classes} · {teacher.experience} yrs · {teacher.location}
                </p>
                <p className="muted">{teacher.about}</p>
                <span
                  className={`badge ${
                    teacher.status === "Approved"
                      ? "badge-approved"
                      : teacher.status === "Rejected"
                      ? "badge-rejected"
                      : "badge-pending"
                  }`}
                >
                  {teacher.status}
                </span>
                {teacher.status === "Pending" ? (
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleApprove(teacher.teacherId)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleReject(teacher.teacherId)}
                    >
                      Reject
                    </button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      )}
    </AppShell>
  );
}

export default Admin;
