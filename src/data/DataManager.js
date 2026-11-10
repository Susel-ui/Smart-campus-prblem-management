/**
 * DataManager.js - Central Data Store for NIST University Smart Campus
 * 
 * Manages:
 * - Student Accounts (provisioned exclusively by authorities)
 * - Authority Accounts (with administrative invitation authorization)
 * - Complaints (Building-Related and General Campus Issues)
 * - Electricity Consumption Telemetry (hourly, monthly, building-wise)
 * - Real-time cross-tab synchronization via BroadcastChannel & LocalStorage
 */

const STORAGE_KEYS = {
  STUDENTS: 'NIST_CAMPUS_STUDENTS',
  AUTHORITIES: 'NIST_CAMPUS_AUTHORITIES',
  COMPLAINTS: 'NIST_CAMPUS_COMPLAINTS',
  ELECTRICITY: 'NIST_CAMPUS_ELECTRICITY'
};

// Admin invitation code required for Authority Registration
export const AUTHORITY_INVITE_CODE = "NIST-ADMIN-2026";

// Initial Seed Data
const DEFAULT_AUTHORITIES = [
  {
    id: "AUTH_001",
    fullName: "Prof. B. K. Verma",
    email: "admin@nist.edu",
    empId: "EMP-ADMIN-01",
    role: "authority",
    title: "Chief Facilities Officer & Administrator",
    passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // "password"
    createdAt: "2026-01-10"
  },
  {
    id: "AUTH_002",
    fullName: "Dr. S. K. Nayak",
    email: "facilities@nist.edu",
    empId: "EMP-ENG-04",
    role: "authority",
    title: "Campus Electrical & Civil Supervisor",
    passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // "password"
    createdAt: "2026-02-15"
  }
];

const DEFAULT_STUDENTS = [
  {
    regNo: "2024NIST1001",
    fullName: "Rahul Sharma",
    email: "rahul.s@nist.edu",
    department: "Computer Science & Engineering",
    batch: "3rd Year (B.Tech)",
    role: "student",
    status: "active",
    passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // "password"
    createdAt: "2026-08-01"
  },
  {
    regNo: "2024NIST1042",
    fullName: "Priya Patel",
    email: "priya.p@nist.edu",
    department: "Electronics & Communication",
    batch: "2nd Year (B.Tech)",
    role: "student",
    status: "active",
    passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // "password"
    createdAt: "2026-08-01"
  },
  {
    regNo: "2024NIST1088",
    fullName: "Amit Tripathy",
    email: "amit.t@nist.edu",
    department: "Electrical Engineering",
    batch: "4th Year (B.Tech)",
    role: "student",
    status: "active",
    passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // "password"
    createdAt: "2026-08-01"
  },
  {
    regNo: "2024NIST1120",
    fullName: "Sneha Das",
    email: "sneha.d@nist.edu",
    department: "NIST Business School",
    batch: "1st Year (MBA)",
    role: "student",
    status: "active",
    passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // "password"
    createdAt: "2026-08-05"
  }
];

const DEFAULT_COMPLAINTS = [
  {
    id: "CMP-2026-001",
    type: "building",
    studentId: "2024NIST1001",
    studentName: "Rahul Sharma",
    studentDept: "Computer Science & Engineering",
    buildingCode: "LHC",
    buildingName: "Lecture Hall Complex",
    floorNumber: 2,
    floorLabel: "Floor 2",
    roomNumber: "203",
    roomId: "203",
    category: "Electrical",
    description: "Ceiling fan FAN_03 making squeaking noise and wobbling violently at speed 3 during lectures.",
    locationDetail: "Room 203, Second Row Desk",
    photoUrl: null,
    submittedAt: "2026-11-03 10:15 AM",
    timestamp: Date.now() - 172800000,
    status: "Under Review",
    statusHistory: [
      { status: "Submitted", at: "2026-11-03 10:15 AM", by: "Rahul Sharma" },
      { status: "Under Review", at: "2026-11-03 02:30 PM", by: "Prof. B. K. Verma", notes: "Technician assigned for capacitor inspection." }
    ]
  },
  {
    id: "CMP-2026-002",
    type: "building",
    studentId: "2024NIST1042",
    studentName: "Priya Patel",
    studentDept: "Electronics & Communication",
    buildingCode: "ATR",
    buildingName: "Atrium Building",
    floorNumber: 5,
    floorLabel: "Fourth Floor (ATR-FOF)",
    roomNumber: "ATR-FOF-CINEPLEX",
    roomId: "ATR-FOF-CINEPLEX",
    category: "Classroom Equipment",
    description: "Precision AC Unit 2 in Stephen Hawking Cineplex tripping circuit breaker during full-house screenings.",
    locationDetail: "Cineplex Rear Projection Bay",
    photoUrl: null,
    submittedAt: "2026-11-04 02:45 PM",
    timestamp: Date.now() - 86400000,
    status: "Submitted",
    statusHistory: [
      { status: "Submitted", at: "2026-11-04 02:45 PM", by: "Priya Patel" }
    ]
  },
  {
    id: "CMP-2026-003",
    type: "building",
    studentId: "2024NIST1088",
    studentName: "Amit Tripathy",
    studentDept: "Electrical Engineering",
    buildingCode: "GAL",
    buildingName: "Galleria Building",
    floorNumber: 1,
    floorLabel: "Ground Floor (GAL-GF)",
    roomNumber: "GAL-AUD-250",
    roomId: "GAL-AUD-250",
    category: "Electrical",
    description: "Proscenium stage front-left spotlight DMX controller not responding before the upcoming tech symposium.",
    locationDetail: "Auditorium Main Stage Left",
    photoUrl: null,
    submittedAt: "2026-11-04 05:20 PM",
    timestamp: Date.now() - 43200000,
    status: "Under Review",
    statusHistory: [
      { status: "Submitted", at: "2026-11-04 05:20 PM", by: "Amit Tripathy" },
      { status: "Under Review", at: "2026-11-05 09:00 AM", by: "Dr. S. K. Nayak", notes: "DMX cable and dimmer rack scheduled for testing." }
    ]
  },
  {
    id: "CMP-2026-004",
    type: "general",
    studentId: "2024NIST1120",
    studentName: "Sneha Das",
    studentDept: "NIST Business School",
    buildingCode: null,
    buildingName: null,
    floorNumber: null,
    floorLabel: null,
    roomNumber: null,
    roomId: null,
    category: "Plumbing",
    description: "Underground water pipe leakage creating a puddle near the Central Quad fountain and landscaped walkway.",
    locationDetail: "Central Campus Quad (Near Promenade Benches)",
    photoUrl: null,
    submittedAt: "2026-11-02 08:30 AM",
    timestamp: Date.now() - 259200000,
    status: "Resolved",
    statusHistory: [
      { status: "Submitted", at: "2026-11-02 08:30 AM", by: "Sneha Das" },
      { status: "Under Review", at: "2026-11-02 11:00 AM", by: "Prof. B. K. Verma" },
      { status: "Resolved", at: "2026-11-03 04:00 PM", by: "Dr. S. K. Nayak", notes: "Valve coupling replaced and lawn repaved." }
    ]
  },
  {
    id: "CMP-2026-005",
    type: "general",
    studentId: "2024NIST1001",
    studentName: "Rahul Sharma",
    studentDept: "Computer Science & Engineering",
    buildingCode: null,
    buildingName: null,
    floorNumber: null,
    floorLabel: null,
    roomNumber: null,
    roomId: null,
    category: "Cleaning",
    description: "Overflowing recycling bin and scattered paper after outdoor club exhibition.",
    locationDetail: "Atrium East Wing Pathway",
    photoUrl: null,
    submittedAt: "2026-11-05 11:30 AM",
    timestamp: Date.now() - 7200000,
    status: "Submitted",
    statusHistory: [
      { status: "Submitted", at: "2026-11-05 11:30 AM", by: "Rahul Sharma" }
    ]
  }
];

const DEFAULT_ELECTRICITY_DATA = {
  totalCampusKwh: 485200,
  todayKwh: 14850,
  monthMwh: 396.4,
  peakLoadKw: 840,
  powerFactor: 0.94,
  buildingBreakdown: {
    LHC: { name: "Lecture Hall Complex", percentage: 34, kwh: 5049, color: "#115e59" },
    ATR: { name: "Atrium Building", percentage: 44, kwh: 6534, color: "#1d4ed8" },
    GAL: { name: "Galleria Building", percentage: 22, kwh: 3267, color: "#991b1b" }
  },
  hourlyTrend: [
    { hour: "00:00", kwh: 210 }, { hour: "02:00", kwh: 180 }, { hour: "04:00", kwh: 175 },
    { hour: "06:00", kwh: 240 }, { hour: "08:00", kwh: 620 }, { hour: "10:00", kwh: 1150 },
    { hour: "12:00", kwh: 1320 }, { hour: "14:00", kwh: 1280 }, { hour: "16:00", kwh: 1100 },
    { hour: "18:00", kwh: 860 }, { hour: "20:00", kwh: 590 }, { hour: "22:00", kwh: 340 }
  ],
  monthlyTrend: [
    { month: "Jan", mwh: 310 }, { month: "Feb", mwh: 325 }, { month: "Mar", mwh: 380 },
    { month: "Apr", mwh: 440 }, { month: "May", mwh: 490 }, { month: "Jun", mwh: 430 },
    { month: "Jul", mwh: 390 }, { month: "Aug", mwh: 370 }, { month: "Sep", mwh: 385 },
    { month: "Oct", mwh: 396 }, { month: "Nov", mwh: 375 }, { month: "Dec", mwh: 330 }
  ]
};

// Simple In-Browser Hash (SHA-256)
export async function hashPassword(plainText) {
  const enc = new TextEncoder().encode(plainText);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

class DataManager {
  constructor() {
    this.broadcast = null;
    this.subscribers = [];
    try {
      this.broadcast = new BroadcastChannel('nist_smart_campus_sync');
      this.broadcast.onmessage = (msg) => {
        if (this.onSyncCallback) this.onSyncCallback(msg.data);
        this.subscribers.forEach(cb => {
          try { cb(msg.data.type, msg.data.payload); } catch {}
        });
      };
    } catch {
      // Fallback if BroadcastChannel not available
    }

    window.addEventListener('storage', (e) => {
      if (this.onSyncCallback) {
        this.onSyncCallback({ key: e.key, newValue: e.newValue });
      }
      this.subscribers.forEach(cb => {
        try { cb('STORAGE_SYNC', { key: e.key }); } catch {}
      });
    });

    this.initDatabase();

    // Initial server fetch & periodic background refresh
    this.fetchFromServer();
    setInterval(() => {
      this.fetchFromServer();
    }, 5000);
  }

  async fetchFromServer() {
    try {
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const serverCmps = await res.json();
        if (Array.isArray(serverCmps) && serverCmps.length > 0) {
          const localStr = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
          const localCmps = localStr ? JSON.parse(localStr) : [];
          // Only update if changed
          if (JSON.stringify(serverCmps) !== JSON.stringify(localCmps)) {
            localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(serverCmps));
            this.notifySync('COMPLAINTS_SYNCED', serverCmps);
          }
        }
      }
    } catch {
      // Standalone mode without backend
    }
  }

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.subscribers.push(callback);
      return () => {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
      };
    }
    return () => {};
  }

  setSyncCallback(callback) {
    this.onSyncCallback = callback;
  }

  notifySync(type, payload) {
    if (this.broadcast) {
      try {
        this.broadcast.postMessage({ type, payload, timestamp: Date.now() });
      } catch {}
    }
    this.subscribers.forEach(cb => {
      try { cb(type, payload); } catch {}
    });
  }

  initDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.AUTHORITIES)) {
      localStorage.setItem(STORAGE_KEYS.AUTHORITIES, JSON.stringify(DEFAULT_AUTHORITIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(DEFAULT_COMPLAINTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ELECTRICITY)) {
      localStorage.setItem(STORAGE_KEYS.ELECTRICITY, JSON.stringify(DEFAULT_ELECTRICITY_DATA));
    }
  }

  // --- STUDENT OPERATIONS ---
  getStudents() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS)) || [];
    } catch {
      return [];
    }
  }

  getStudentByRegNo(regNo) {
    const list = this.getStudents();
    return list.find(s => s.regNo.trim().toUpperCase() === regNo.trim().toUpperCase());
  }

  async addStudent({ fullName, regNo, email, department, batch, password }) {
    const list = this.getStudents();
    const cleanReg = regNo.trim().toUpperCase();

    if (list.some(s => s.regNo.toUpperCase() === cleanReg)) {
      throw new Error(`Student with Registration Number ${cleanReg} already exists.`);
    }

    const passwordHash = await hashPassword(password);
    const newStudent = {
      regNo: cleanReg,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      batch: batch ? batch.trim() : "B.Tech",
      role: "student",
      status: "active",
      passwordHash,
      createdAt: new Date().toISOString().split("T")[0]
    };

    list.push(newStudent);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    this.notifySync('STUDENT_ADDED', newStudent);
    return newStudent;
  }

  async updateStudent(regNo, updateFields) {
    const list = this.getStudents();
    const idx = list.findIndex(s => s.regNo.toUpperCase() === regNo.toUpperCase());
    if (idx === -1) throw new Error("Student not found");

    if (updateFields.password) {
      updateFields.passwordHash = await hashPassword(updateFields.password);
      delete updateFields.password;
    }

    list[idx] = { ...list[idx], ...updateFields };
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    this.notifySync('STUDENT_UPDATED', list[idx]);
    return list[idx];
  }

  toggleStudentStatus(regNo) {
    const list = this.getStudents();
    const idx = list.findIndex(s => s.regNo.toUpperCase() === regNo.toUpperCase());
    if (idx === -1) throw new Error("Student not found");

    list[idx].status = list[idx].status === "active" ? "inactive" : "active";
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    this.notifySync('STUDENT_STATUS_TOGGLED', list[idx]);
    return list[idx];
  }

  // --- AUTHORITY OPERATIONS ---
  getAuthorities() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTHORITIES)) || [];
    } catch {
      return [];
    }
  }

  getAuthorityByEmailOrEmpId(identifier) {
    const list = this.getAuthorities();
    const idClean = identifier.trim().toLowerCase();
    return list.find(a => 
      a.email.toLowerCase() === idClean || a.empId.toLowerCase() === idClean
    );
  }

  async registerAuthority({ fullName, email, empId, password, inviteCode }) {
    if (inviteCode !== AUTHORITY_INVITE_CODE) {
      throw new Error("Invalid Administrator Invitation Code. Authority registration requires campus administrative clearance.");
    }

    const list = this.getAuthorities();
    const emailClean = email.trim().toLowerCase();
    const empIdClean = empId.trim().toUpperCase();

    if (list.some(a => a.email.toLowerCase() === emailClean || a.empId.toUpperCase() === empIdClean)) {
      throw new Error("An authority account with this Email or Employee ID already exists.");
    }

    const passwordHash = await hashPassword(password);
    const newAuth = {
      id: `AUTH_${Date.now()}`,
      fullName: fullName.trim(),
      email: emailClean,
      empId: empIdClean,
      role: "authority",
      title: "Faculty & Administrative Authority",
      passwordHash,
      createdAt: new Date().toISOString().split("T")[0]
    };

    list.push(newAuth);
    localStorage.setItem(STORAGE_KEYS.AUTHORITIES, JSON.stringify(list));
    this.notifySync('AUTHORITY_REGISTERED', newAuth);
    return newAuth;
  }

  // --- COMPLAINT OPERATIONS ---
  getComplaints(filter = {}) {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) || [];
    } catch {
      list = [];
    }

    // Normalize field aliases for high resilience
    list = list.map(c => ({
      ...c,
      building: c.building || c.buildingCode || (c.type === 'BUILDING' ? 'LHC' : null),
      buildingCode: c.buildingCode || c.building,
      floor: c.floor || c.floorNumber,
      floorNumber: c.floorNumber || c.floor,
      room: c.room || c.roomNumber,
      roomNumber: c.roomNumber || c.room,
      studentId: c.studentId || c.regNo,
      priority: c.priority || 'Medium',
      type: (c.type || 'BUILDING').toUpperCase()
    }));

    // Sort newest first
    list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    if (filter.studentId) {
      list = list.filter(c => c.studentId === filter.studentId);
    }
    if (filter.type && filter.type !== 'ALL') {
      list = list.filter(c => c.type === filter.type.toUpperCase());
    }
    if (filter.status && filter.status !== 'ALL') {
      list = list.filter(c => c.status === filter.status);
    }
    if (filter.buildingCode && filter.buildingCode !== 'ALL') {
      list = list.filter(c => c.buildingCode === filter.buildingCode || c.building === filter.buildingCode);
    }

    return list;
  }

  getComplaintById(id) {
    const list = this.getComplaints();
    return list.find(c => c.id === id);
  }

  addComplaint(data) {
    const list = this.getComplaints();
    const id = `CMP-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const bld = data.building || data.buildingCode || null;
    const floor = data.floor || data.floorNumber || null;
    const room = data.room || data.roomNumber || null;

    const complaint = {
      id,
      type: (data.type || "BUILDING").toUpperCase(),
      studentId: data.studentId || data.regNo,
      studentName: data.studentName,
      studentDept: data.studentDept || "Student",
      building: bld,
      buildingCode: bld,
      buildingName: data.buildingName || (bld === 'ATR' ? 'Atrium Building' : (bld === 'GAL' ? 'Galleria Building' : 'Lecture Hall Complex')),
      floor: floor,
      floorNumber: floor,
      floorLabel: data.floorLabel || (floor ? `Floor ${floor}` : null),
      room: room,
      roomNumber: room,
      roomId: data.roomId || room,
      category: data.category || "General",
      title: data.title || `${data.category || 'Maintenance'} in ${room ? `Room ${room}` : (data.area || 'Campus Area')}`,
      description: data.description || "",
      priority: data.priority || "Medium",
      locationDetail: data.locationDetail || (room ? `Room ${room}, ${data.buildingName || bld}` : (data.area || "Campus Quad")),
      area: data.area || null,
      photoUrl: data.photoUrl || null,
      submittedAt: formattedDate,
      timestamp: Date.now(),
      status: "Submitted",
      statusHistory: [
        { status: "Submitted", at: formattedDate, by: data.studentName }
      ]
    };

    list.unshift(complaint);
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(list));
    this.notifySync('COMPLAINT_ADDED', complaint);

    // Asynchronously synchronize with backend database
    try {
      fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaint)
      }).catch(() => {});
    } catch {}

    return complaint;
  }

  updateComplaintStatus(id, newStatus, param3 = "", param4 = "") {
    const list = this.getComplaints();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Complaint not found");

    // Handle flexible signature: (id, newStatus, remarks, author) or (id, newStatus, author, remarks)
    let authorName = "Authority Facilities Officer";
    let remarks = "";
    if (param3 && typeof param3 === 'string') {
      if (param3.startsWith("Prof.") || param3.startsWith("Dr.") || param3.includes("Officer") || param3.includes("Admin")) {
        authorName = param3;
        remarks = param4 || "";
      } else {
        remarks = param3;
        authorName = param4 || authorName;
      }
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    list[idx].status = newStatus;
    list[idx].resolutionRemarks = remarks;
    if (newStatus === 'Resolved') {
      list[idx].resolvedAt = Date.now();
      list[idx].resolvedBy = authorName;
    }

    if (!list[idx].statusHistory) list[idx].statusHistory = [];
    list[idx].statusHistory.push({
      status: newStatus,
      at: formattedDate,
      by: authorName,
      notes: remarks || undefined
    });

    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(list));
    this.notifySync('COMPLAINT_STATUS_UPDATED', list[idx]);

    // Asynchronously synchronize with backend database
    try {
      fetch('/api/complaints/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          remarks,
          authorName
        })
      }).catch(() => {});
    } catch {}

    return list[idx];
  }

  // --- ELECTRICITY TELEMETRY ---
  getElectricityData() {
    let raw;
    try {
      raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.ELECTRICITY)) || DEFAULT_ELECTRICITY_DATA;
    } catch {
      raw = DEFAULT_ELECTRICITY_DATA;
    }

    return {
      ...raw,
      hourlyLoadCurve: raw.hourlyTrend ? raw.hourlyTrend.map(h => ({ hour: h.hour, kw: h.kwh })) : [],
      buildingDistribution: [
        { building: 'Atrium Building', percentage: 44, mwh: 213.5 },
        { building: 'Lecture Hall Complex', percentage: 34, mwh: 165.0 },
        { building: 'Galleria Building', percentage: 22, mwh: 106.7 }
      ],
      monthlyTrends: raw.monthlyTrend ? raw.monthlyTrend.map(m => ({ month: m.month, mwh: m.mwh })) : []
    };
  }

  getElectricitySummary() {
    const raw = this.getElectricityData();
    return {
      totalConsumptionKWh: raw.totalCampusKwh || 485200,
      todayConsumptionKWh: raw.todayKwh || 14850,
      monthConsumptionMWh: raw.monthMwh || 396.4,
      peakLoadKW: raw.peakLoadKw || 840,
      powerFactor: raw.powerFactor || 0.94
    };
  }
}

export const campusData = new DataManager();
