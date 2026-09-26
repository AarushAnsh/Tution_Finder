import { useState } from "react";
import { submitParentRequest } from "../lib/api";
import { supabase } from "../lib/supabase";

function ParentForm({ user, onCreated }) {
  const [formData, setFormData] = useState({
    parentName: "",
    phone: "",
    childClass: "",
    subject: "",
    location: "",
    teachingMode: "",
    budget: "",
    preferredTime: "",
    concern: "",
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
      const created = await submitParentRequest(
        formData,
        { userId: user?.id, email: user?.email },
        supabase
      );
      setOk(true);
      setMessage("Requirement submitted. An admin will assign a teacher.");
      setFormData({
        parentName: "",
        phone: "",
        childClass: "",
        subject: "",
        location: "",
        teachingMode: "",
        budget: "",
        preferredTime: "",
        concern: "",
      });
      if (onCreated) onCreated(created);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="card" style={{ padding: 22 }}>
      <h2>Post a requirement</h2>
      <p className="muted">Tell us the class, subject, city, and budget.</p>
      <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: 16 }}>
        <label className="field">
          Parent name
          <input name="parentName" value={formData.parentName} onChange={handleChange} required />
        </label>
        <label className="field">
          Phone
          <input name="phone" value={formData.phone} onChange={handleChange} required />
        </label>
        <label className="field">
          Child's class
          <input name="childClass" value={formData.childClass} onChange={handleChange} required />
        </label>
        <label className="field">
          Subject
          <input name="subject" value={formData.subject} onChange={handleChange} required />
        </label>
        <label className="field">
          Location (Motihari area)
          <input name="location" placeholder="e.g. Bankat, Motihari" value={formData.location} onChange={handleChange} required />
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
          Budget / month
          <input name="budget" value={formData.budget} onChange={handleChange} />
        </label>
        <label className="field">
          Preferred time
          <input name="preferredTime" value={formData.preferredTime} onChange={handleChange} />
        </label>
        <label className="field full">
          Requirement
          <textarea name="concern" value={formData.concern} onChange={handleChange} required />
        </label>
        <div className="full">
          <button type="submit" className="btn btn-primary">
            Submit requirement
          </button>
          {message ? <p className={`flash ${ok ? "ok" : "err"}`}>{message}</p> : null}
        </div>
      </form>
    </div>
  );
}

export default ParentForm;
