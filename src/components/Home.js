import { useEffect, useState } from "react";
import SiteNav from "./SiteNav";
import Photo from "./Photo";
import { getApprovedTeachers, submitContactMessage } from "../lib/api";
import { supabase } from "../lib/supabase";
import { SITE_NAME, SITE_TAGLINE, SUPPORT_EMAIL, SUPPORT_PHONE } from "../lib/config";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Physics",
  "Chemistry",
  "Biology",
  "Social Studies",
  "Accountancy",
  "Economics",
  "Computer Science",
  "Spoken English",
];

const AREAS = [
  "Motihari Town",
  "Bankat",
  "Chhatauni",
  "Bairiya",
  "Pipra",
  "Semra",
  "Baswariya",
  "Ramgarhwa Road",
];

const FAQS = [
  {
    q: "How do parents request a tutor?",
    a: "Sign in with Google as a parent and submit the child's class, subject, Motihari locality, preferred mode, and schedule. Our admin reviews approved teachers and assigns a suitable match. Families do not search tutor profiles on this site.",
  },
  {
    q: "How do teachers join Pathshala?",
    a: "Sign in with Google as a teacher and complete your listing. The profile remains pending until admin approval.",
  },
  {
    q: "Who selects the tutor?",
    a: "Only the Pathshala admin in Motihari. Assignment considers subject, class, teaching mode, and locality.",
  },
  {
    q: "Do you offer home and online tuition?",
    a: "Yes. Teachers may offer Offline, Online, or Both. Home tuition is available within Motihari. Online sessions are arranged when both sides agree.",
  },
  {
    q: "When are contact details shared?",
    a: "After assignment, the parent dashboard shows the tutor's name, subject, email, and phone. The teacher sees the assigned family on their dashboard.",
  },
  {
    q: "How do I contact Pathshala?",
    a: "Call +91 8804535616 or email aarushkumar2178@gmail.com. The contact form on this page also sends a message to that inbox.",
  },
  {
    q: "How does the admin sign in?",
    a: "Open Admin desk, then sign in with Google using aarushkumar2178@gmail.com. Only that Google account can open the admin desk.",
  },
];

const STEPS = [
  {
    title: "Parent desk",
    copy: "Parents sign in and share class, subject, Motihari locality, and preferred hours. The request reaches admin only — not every teacher on the platform.",
    img: "https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=900",
    fallback: "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    title: "Teacher desk",
    copy: "Teachers sign in and list subjects, classes, and availability in Motihari. Admin reviews each profile before any family is introduced.",
    img: "https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=900",
    fallback: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    title: "Admin desk",
    copy: "Admin reads both sides and assigns one teacher to one request. That is the match: a considered decision, not an open directory.",
    img: "https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=900",
    fallback: "https://images.pexels.com/photos/4778611/pexels-photo-4778611.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
];

function Home({ onLogin }) {
  const [teachers, setTeachers] = useState([]);
  const [contact, setContact] = useState({
    name: "",
    email: "",
    topic: "General",
    message: "",
  });
  const [contactNote, setContactNote] = useState("");

  useEffect(() => {
    getApprovedTeachers(supabase).then(setTeachers);
  }, []);

  const handleContact = async (event) => {
    event.preventDefault();
    setContactNote("Sending...");
    try {
      await submitContactMessage(contact, supabase);
      setContactNote(
        "Thank you. Your message has been sent to aarushkumar2178@gmail.com. If your mail app opened, tap Send."
      );
      setContact({ name: "", email: "", topic: "General", message: "" });
    } catch {
      setContactNote("Please write to us directly if this form does not send.");
    }
  };

  return (
    <div className="shell">
      <SiteNav onLogin={onLogin} />

      <section className="hero-home">
        <div>
          <span className="kicker">{SITE_TAGLINE}</span>
          <h1>Home tutors in Motihari, matched with care.</h1>
          <p className="lead">
            {SITE_NAME} connects families with reviewed teachers across Motihari. Parents submit a
            requirement. Teachers list their profile. Admin assigns a suitable tutor by subject, class,
            locality, and schedule.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary btn-auto" onClick={() => onLogin("parent")}>
              I am a Parent
            </button>
            <button type="button" className="btn btn-gold btn-auto" onClick={() => onLogin("teacher")}>
              I am a Teacher
            </button>
            <button type="button" className="btn btn-ghost btn-auto" onClick={() => onLogin("admin")}>
              Admin desk
            </button>
          </div>
          <div className="stats">
            <div className="stat">
              <b>01</b>
              <span className="muted">Parent submits a requirement</span>
            </div>
            <div className="stat">
              <b>02</b>
              <span className="muted">Teacher is listed and reviewed</span>
            </div>
            <div className="stat">
              <b>03</b>
              <span className="muted">Admin assigns the tutor</span>
            </div>
          </div>
        </div>
        <div className="photo-frame">
          <Photo
            src="https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=1200"
            fallback="https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Tutor working with a student"
          />
        </div>
      </section>

      <section className="band" id="how">
        <div className="page-inner">
          <p className="kicker">How {SITE_NAME} works</p>
          <h2>Three desks. One careful match.</h2>
          <p className="lead">
            Pathshala is organised as three roles in Motihari, not as a public tutor search. The parent
            desk records the child's need. The teacher desk holds reviewed profiles. The admin desk
            studies both and assigns one teacher to one request. Families do not browse or filter tutors
            on their own. Admin considers class, subject, locality, and timing, then makes the introduction.
          </p>
          <div className="step-grid">
            {STEPS.map((step) => (
              <article className="card step-card" key={step.title}>
                <Photo src={step.img} fallback={step.fallback} alt="" />
                <h3>{step.title}</h3>
                <p className="muted">{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-inner" id="teachers">
        <div className="page-head">
          <div>
            <p className="kicker">Teachers in Motihari</p>
            <h2>Profiles are listed after login and admin review</h2>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => onLogin("teacher")}>
            Apply as a teacher
          </button>
        </div>
        <p className="muted">
          This is not a search directory. Sign in as a parent to submit a requirement, or as a teacher to
          apply. Admin assigns the tutor.
        </p>
        <div className="teacher-grid">
          {teachers.length === 0 ? (
            <div className="empty card">
              Approved teachers will appear here after review. Sign in to apply or to request a tutor.
            </div>
          ) : (
            teachers.slice(0, 8).map((teacher) => (
              <article className="card teacher-card" key={teacher.teacherId}>
                <div className="avatar">{String(teacher.name || "T").slice(0, 1)}</div>
                <h3>{teacher.name}</h3>
                <p className="muted">
                  {teacher.subject} · Class {teacher.classes}
                </p>
                <p>
                  {teacher.location} · {teacher.teachingMode || "Flexible"}
                </p>
                <span className="badge badge-approved">Approved</span>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="band" id="subjects">
        <div className="page-inner split-media">
          <div>
            <p className="kicker">Subjects we cover</p>
            <h2>School subjects, board preparation, and spoken English.</h2>
            <p className="lead">
              We support Classes 1–12, including foundation work and board years. Describe the subject and
              class on your request; admin assigns against that brief.
            </p>
            <div className="pill-wrap">
              {SUBJECTS.map((item) => (
                <span className="pill" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="photo-frame">
            <Photo
              src="/images/subjects.svg"
              fallback="/images/subjects.svg"
              alt="Books representing school subjects"
            />
          </div>
        </div>
      </section>

      <section className="page-inner" id="why">
        <p className="kicker">Why Pathshala</p>
        <h2>Personal matching in Motihari.</h2>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card pad">
            <h3>Reviewed teachers</h3>
            <p className="muted">Every listing is checked. Pending profiles are not shown as available tutors.</p>
          </div>
          <div className="card pad">
            <h3>Clear requirements</h3>
            <p className="muted">Class, subject, locality, and timing travel with the request so the match is specific.</p>
          </div>
          <div className="card pad">
            <h3>One assigned tutor</h3>
            <p className="muted">Contact details are shared only after admin completes the assignment.</p>
          </div>
        </div>
      </section>

      <section className="page-inner">
        <p className="kicker">Service area</p>
        <h2>Home tuition in Motihari. Online by mutual agreement.</h2>
        <p className="lead">
          We currently serve Motihari, East Champaran. Please mention your locality on the parent form so
          we can assign a nearby teacher.
        </p>
        <div className="pill-wrap" style={{ marginTop: 16 }}>
          {AREAS.map((area) => (
            <span className="pill" key={area}>
              {area}
            </span>
          ))}
        </div>
      </section>

      <section className="page-inner" id="pricing">
        <p className="kicker">Fees</p>
        <h2>Fees are agreed with the teacher. We do not publish rates.</h2>
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card pad">
            <h3>For families</h3>
            <p className="muted">
              After assignment, the parent and teacher discuss fee, days, and mode directly. Pathshala does
              not display a public fee chart.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => onLogin("parent")}>
              Submit a requirement
            </button>
          </div>
          <div className="card pad">
            <h3>For teachers</h3>
            <p className="muted">
              Submit your listing for review. Commercial terms are discussed with the family after
              assignment, not on this website.
            </p>
            <button type="button" className="btn btn-gold" onClick={() => onLogin("teacher")}>
              Apply as a teacher
            </button>
          </div>
        </div>
      </section>

      <section className="page-inner split-media" id="about">
        <div className="photo-frame">
          <Photo
            src="https://images.pexels.com/photos/4145355/pexels-photo-4145355.jpeg?auto=compress&cs=tinysrgb&w=1200"
            fallback="https://images.pexels.com/photos/4144222/pexels-photo-4144222.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Students studying together"
          />
        </div>
        <div>
          <p className="kicker">About {SITE_NAME}</p>
          <h2>A local tuition service for Motihari families.</h2>
          <p className="lead">
            Pathshala is not a classifieds board and not a tutor marketplace. Teachers apply, parents
            describe the child’s need, and a local admin makes the introduction.
          </p>
          <ul className="plain-list">
            <li>Google sign-in only. We do not issue extra passwords.</li>
            <li>Admin access is limited to the registered operations email.</li>
            <li>Phone and email of tutors are shared only after assignment.</li>
          </ul>
        </div>
      </section>

      <section className="page-inner" id="faq">
        <p className="kicker">FAQ</p>
        <h2>Common questions</h2>
        <div className="faq">
          {FAQS.map((item) => (
            <details className="card" key={item.q}>
              <summary>{item.q}</summary>
              <p className="muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="band" id="contact">
        <div className="page-inner split-media">
          <div>
            <p className="kicker">Contact</p>
            <h2>Reach the Motihari desk.</h2>
            <p className="lead">
              Call or email the admin directly. Messages from this form are delivered to{" "}
              {SUPPORT_EMAIL}.
            </p>
            <p>
              <strong>Email</strong>
              <br />
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
            <p>
              <strong>Phone</strong>
              <br />
              <a href="tel:+918804535616">+91 8804535616</a>
            </p>
          </div>
          <form className="card pad" onSubmit={handleContact}>
            <label className="field">
              Name
              <input
                required
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
              />
            </label>
            <label className="field" style={{ marginTop: 10 }}>
              Email
              <input
                type="email"
                required
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
              />
            </label>
            <label className="field" style={{ marginTop: 10 }}>
              Topic
              <select
                value={contact.topic}
                onChange={(e) => setContact({ ...contact, topic: e.target.value })}
              >
                <option>General</option>
                <option>Parent support</option>
                <option>Teacher listing</option>
                <option>Assignment help</option>
              </select>
            </label>
            <label className="field" style={{ marginTop: 10 }}>
              Message
              <textarea
                required
                value={contact.message}
                onChange={(e) => setContact({ ...contact, message: e.target.value })}
              />
            </label>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 14 }}>
              Send message
            </button>
            {contactNote ? <p className="flash ok">{contactNote}</p> : null}
          </form>
        </div>
      </section>

      <footer className="site-footer">
        <div className="page-inner footer-grid">
          <div>
            <div className="brand">
              <div className="mark">P</div>
              <strong>{SITE_NAME}</strong>
            </div>
            <p className="muted">Parents request. Teachers list. Admin assigns. Motihari.</p>
          </div>
          <div>
            <strong>Contact</strong>
            <p>
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
            <p>
              <a href="tel:+918804535616">+91 8804535616</a>
            </p>
          </div>
          <div>
            <button type="button" className="btn btn-primary btn-auto" onClick={() => onLogin("parent")}>
              Continue with Google
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
