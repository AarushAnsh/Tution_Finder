import { ADMIN_EMAILS, SHEETS_API_URL, SUPPORT_EMAIL } from "./config";

const LS_REQUESTS = "tuition_finder_requests";
const LS_TEACHERS = "tuition_finder_teachers";
const LS_MESSAGES = "tuition_finder_messages";

function readLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function mapRequest(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id || row.userId || "",
    parentName: row.parent_name || row.parentName || "",
    email: row.email || "",
    phone: row.phone || "",
    childClass: row.child_class || row.childClass || "",
    subject: row.subject || "",
    location: row.location || "",
    teachingMode: row.teaching_mode || row.teachingMode || "",
    budget: row.budget || "",
    preferredTime: row.preferred_time || row.preferredTime || "",
    concern: row.concern || "",
    status: row.status || "Open",
    assignedTeacherId: row.assigned_teacher_id || row.assignedTeacherId || "",
    assignedTeacherName: row.assigned_teacher_name || row.assignedTeacherName || "",
    assignedTeacherEmail: row.assigned_teacher_email || row.assignedTeacherEmail || "",
    assignedTeacherPhone: row.assigned_teacher_phone || row.assignedTeacherPhone || "",
    assignedTeacherSubject: row.assigned_teacher_subject || row.assignedTeacherSubject || "",
    createdAt: row.created_at || row.createdAt || "",
  };
}

export function mapTeacher(row, index = 0) {
  if (!row) return null;
  return {
    teacherId: String(row.teacherId || row.id || `local-${index}`),
    userId: row.user_id || row.userId || "",
    name: row.name || "",
    phone: String(row.phone || ""),
    email: row.email || "",
    subject: row.subject || "",
    classes: row.classes || "",
    experience: row.experience || "",
    location: row.location || "",
    teachingMode: row.teaching_mode || row.teachingMode || "",
    availableTime: row.available_time || row.availableTime || "",
    expectedFee: row.expected_fee || row.expectedFee || "",
    qualification: row.qualification || "",
    about: row.about || "",
    status: row.status || "Pending",
  };
}

function mergeTeachers(...lists) {
  const map = new Map();
  lists.flat().forEach((item, index) => {
    const teacher = mapTeacher(item, index);
    if (!teacher) return;
    const key = (teacher.email || teacher.teacherId).toLowerCase();
    if (!map.has(key)) map.set(key, teacher);
  });
  return Array.from(map.values());
}

export async function sheetPost(body) {
  if (!SHEETS_API_URL) return { success: false, skipped: true };

  const response = await fetch(SHEETS_API_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.json();
}

async function fetchSheetTeachers() {
  if (!SHEETS_API_URL) return [];
  try {
    const response = await fetch(`${SHEETS_API_URL}?action=allTeachers`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchSupabaseTeachers(supabase) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("teacher_listings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !Array.isArray(data)) return [];
  return data;
}

export async function getTeachers(supabase) {
  const [sheetRows, supabaseRows] = await Promise.all([
    fetchSheetTeachers(),
    fetchSupabaseTeachers(supabase),
  ]);
  return mergeTeachers(supabaseRows, sheetRows, readLocal(LS_TEACHERS));
}

export async function getApprovedTeachers(supabase) {
  const teachers = await getTeachers(supabase);
  return teachers.filter((item) => item.status === "Approved");
}

export async function approveTeacher(teacherId, supabase) {
  await updateTeacherStatus(teacherId, "Approved", supabase);
  return sheetPost({ type: "approveTeacher", teacherId });
}

export async function rejectTeacher(teacherId, supabase) {
  await updateTeacherStatus(teacherId, "Rejected", supabase);
  return sheetPost({ type: "rejectTeacher", teacherId });
}

async function updateTeacherStatus(teacherId, status, supabase) {
  const local = readLocal(LS_TEACHERS).map((row) =>
    String(row.teacherId || row.id) === String(teacherId) ? { ...row, status } : row
  );
  writeLocal(LS_TEACHERS, local);

  if (supabase) {
    await supabase.from("teacher_listings").update({ status }).eq("id", teacherId);
  }
}

export async function submitTeacher(formData, { userId } = {}, supabase) {
  const record = {
    user_id: userId || null,
    name: formData.name,
    phone: formData.phone,
    email: formData.email,
    subject: formData.subject,
    classes: formData.classes,
    experience: formData.experience,
    location: formData.location,
    teaching_mode: formData.teachingMode,
    available_time: formData.availableTime,
    expected_fee: formData.expectedFee,
    qualification: formData.qualification,
    about: formData.about,
    status: "Pending",
  };

  let saved = null;
  if (supabase) {
    const { data, error } = await supabase
      .from("teacher_listings")
      .insert(record)
      .select()
      .maybeSingle();
    if (!error && data) saved = data;
  }

  const localRow = saved || {
    ...record,
    id: `local-${Date.now()}`,
    teacherId: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  writeLocal(LS_TEACHERS, [localRow, ...readLocal(LS_TEACHERS)]);

  const sheet = await sheetPost({ type: "teacher", ...formData });
  return { success: true, teacher: mapTeacher(localRow), sheet };
}

export async function submitParentRequest(formData, { userId, email }, supabase) {
  if (SHEETS_API_URL) {
    await sheetPost({ type: "parent", ...formData });
  }

  const record = {
    user_id: userId || null,
    parent_name: formData.parentName,
    email: email || "",
    phone: formData.phone,
    child_class: formData.childClass,
    subject: formData.subject,
    location: formData.location,
    teaching_mode: formData.teachingMode,
    budget: formData.budget,
    preferred_time: formData.preferredTime,
    concern: formData.concern,
    status: "Open",
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("parent_requests")
      .insert(record)
      .select()
      .maybeSingle();

    if (!error && data) {
      return mapRequest(data);
    }
  }

  const local = {
    id: `local-${Date.now()}`,
    ...record,
    created_at: new Date().toISOString(),
  };
  writeLocal(LS_REQUESTS, [local, ...readLocal(LS_REQUESTS)]);
  return mapRequest(local);
}

export async function getParentRequests(supabase) {
  if (supabase) {
    const { data, error } = await supabase
      .from("parent_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map(mapRequest);
    }
  }

  return readLocal(LS_REQUESTS).map(mapRequest);
}

export async function assignTeacherToRequest(request, teacher, supabase) {
  const patch = {
    status: "Assigned",
    assigned_teacher_id: teacher.teacherId,
    assigned_teacher_name: teacher.name,
    assigned_teacher_email: teacher.email,
    assigned_teacher_phone: String(teacher.phone || ""),
    assigned_teacher_subject: teacher.subject,
  };

  if (supabase && request.id && !String(request.id).startsWith("local-")) {
    const { error } = await supabase
      .from("parent_requests")
      .update(patch)
      .eq("id", request.id);

    if (!error) {
      await supabase.from("assignments").insert({
        request_id: request.id,
        teacher_id: teacher.teacherId,
        teacher_name: teacher.name,
        teacher_email: teacher.email,
        parent_email: request.email,
        subject: request.subject,
      });
      return mapRequest({ ...request, ...patch });
    }
  }

  const all = readLocal(LS_REQUESTS).map((row) =>
    row.id === request.id ? { ...row, ...patch } : row
  );
  writeLocal(LS_REQUESTS, all);
  return mapRequest({ ...request, ...patch });
}

export async function submitContactMessage(form, supabase) {
  const row = {
    name: form.name,
    email: form.email,
    topic: form.topic,
    message: form.message,
    created_at: new Date().toISOString(),
  };

  writeLocal(LS_MESSAGES, [row, ...readLocal(LS_MESSAGES)]);

  if (supabase) {
    try {
      await Promise.race([
        supabase.from("contact_messages").insert({
          name: row.name,
          email: row.email,
          topic: row.topic,
          message: row.message,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 2500)
        ),
      ]);
    } catch {
      // Local copy is already saved.
    }
  }

  let emailed = false;
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${SUPPORT_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: `Pathshala enquiry: ${form.topic}`,
        name: form.name,
        email: form.email,
        topic: form.topic,
        message: form.message,
      }),
    });
    emailed = response.ok;
  } catch {
    emailed = false;
  }

  if (!emailed && typeof window !== "undefined") {
    const body = encodeURIComponent(
      `Name: ${form.name}\nFrom: ${form.email}\nTopic: ${form.topic}\n\n${form.message}`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      `Pathshala enquiry: ${form.topic}`
    )}&body=${body}`;
  }

  return { success: true, emailed };
}

export async function getContactMessages(supabase) {
  if (supabase) {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && Array.isArray(data) && data.length) {
      return data;
    }
  }
  return readLocal(LS_MESSAGES);
}

export function isAdminEmail(email) {
  const list = (ADMIN_EMAILS || "aarushkumar2178@gmail.com")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!email) return false;
  return list.includes(email.toLowerCase());
}
