import { useState } from "react";
import { submitTeacher } from "../lib/api";
import { supabase } from "../lib/supabase";

function TeacherForm({ user, onSubmitted }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: user?.email || "",
    subject: "",
    classes: "",
    experience: "",
    location: "",
    teachingMode: "",
    availableTime: "",
    expectedFee: "",
    qualification: "",
    about: "",
  });
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOk(false);
    setMessage("Submitting...");

    try {
      const result = await submitTeacher(formData, { userId: user?.id }, supabase);
      if (result.success) {
        setOk(true);
        setMessage("Listing submitted. Admin will review and approve.");
        if (onSubmitted) onSubmitted();
      } else {
        setMessage("Could not submit listing.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2>List yourself as a teacher</h2>
      <p className="muted">Your profile is visible to parents only after admin approval.</p>
      <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: 16 }}>
        <label className="field">
          Full name
          <input name="name" value={formData.name} onChange={handleChange} required />
        </label>
        <label className="field">
          Phone
          <input name="phone" value={formData.phone} onChange={handleChange} required />
        </label>
        <label className="field">
          Email
          <input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </label>
        <label className="field">
          Subject
          <input name="subject" value={formData.subject} onChange={handleChange} required />
        </label>
        <label className="field">
          Classes
          <input name="classes" placeholder="e.g. 6-10" value={formData.classes} onChange={handleChange} required />
        </label>
        <label className="field">
          Experience
          <input name="experience" value={formData.experience} onChange={handleChange} />
        </label>
        <label className="field">
          Location (Motihari area)
          <input name="location" placeholder="e.g. Motihari Town" value={formData.location} onChange={handleChange} required />
        </label>
        <label className="field">
          Mode
          <select name="teachingMode" value={formData.teachingMode} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Offline">Offline</option>
            <option value="Online">Online</option>
            <option value="Both">Both</option>
          </select>
        </label>
        <label className="field">
          Available time
          <input name="availableTime" value={formData.availableTime} onChange={handleChange} />
        </label>
        <label className="field">
          Expected fee
          <input name="expectedFee" value={formData.expectedFee} onChange={handleChange} />
        </label>
        <label className="field full">
          Qualification
          <input name="qualification" value={formData.qualification} onChange={handleChange} />
        </label>
        <label className="field full">
          About
          <textarea name="about" value={formData.about} onChange={handleChange} />
        </label>
        <div className="full">
          <button type="submit" className="btn btn-primary">
            Submit listing
          </button>
          {message ? <p className={`flash ${ok ? "ok" : "err"}`}>{message}</p> : null}
        </div>
      </form>
    </div>
  );
}

export default TeacherForm;
