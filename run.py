"""
run.py - Full-Stack Application Server & REST API Backend for NIST University Smart Campus

Features:
1. Python REST API Backend:
   - Authentication Endpoints: /api/auth/login, /api/auth/register-authority
   - Maintenance Complaint Endpoints: /api/complaints (GET, POST), /api/complaints/update-status (POST)
   - Student Provisioning Endpoints: /api/students (GET, POST), /api/students/toggle (POST), /api/students/update (POST)
   - Electricity Telemetry: /api/electricity (GET)
   - System Diagnostics: /api/status (GET)
   - Real disk-backed persistence in database.json
2. High-Performance Static Web Server:
   - Serves Three.js 3D models, ES modules, CSS, textures, and UI views with correct MIME types
   - CORS enabled for cross-origin testing
3. Automatic Browser Launcher:
   - Automatically boots in default web browser

Zero external dependencies! Uses Python 3 standard library exclusively.
"""

import os
import sys
import json
import time
import socket
import hashlib
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

# UTF-8 Windows Console compatibility
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

PORT = 5173
HOST = "127.0.0.1"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "database.json")

AUTHORITY_INVITE_CODE = "NIST-ADMIN-2026"

def hash_pass(pwd: str) -> str:
    return hashlib.sha256(pwd.encode("utf-8")).hexdigest()

# Default Seed Database
INITIAL_DB = {
    "authorities": [
        {
            "id": "AUTH_001",
            "fullName": "Prof. B. K. Verma",
            "email": "admin@nist.edu",
            "empId": "EMP-ADMIN-01",
            "role": "AUTHORITY",
            "title": "Chief Facilities Officer & Administrator",
            "passwordHash": hash_pass("password"),
            "createdAt": "2026-01-10"
        },
        {
            "id": "AUTH_002",
            "fullName": "Dr. S. K. Nayak",
            "email": "facilities@nist.edu",
            "empId": "EMP-ENG-04",
            "role": "AUTHORITY",
            "title": "Campus Electrical & Civil Supervisor",
            "passwordHash": hash_pass("password"),
            "createdAt": "2026-02-15"
        }
    ],
    "students": [
        {
            "regNo": "2024NIST1001",
            "fullName": "Rahul Sharma",
            "email": "rahul.s@nist.edu",
            "department": "Computer Science & Engineering",
            "batch": "3rd Year (B.Tech)",
            "role": "STUDENT",
            "status": "ACTIVE",
            "passwordHash": hash_pass("password"),
            "createdAt": "2026-08-01"
        },
        {
            "regNo": "2024NIST1042",
            "fullName": "Priya Patel",
            "email": "priya.p@nist.edu",
            "department": "Electronics & Communication",
            "batch": "2nd Year (B.Tech)",
            "role": "STUDENT",
            "status": "ACTIVE",
            "passwordHash": hash_pass("password"),
            "createdAt": "2026-08-01"
        },
        {
            "regNo": "2024NIST1088",
            "fullName": "Amitav Rout",
            "email": "amitav.r@nist.edu",
            "department": "Mechanical Engineering",
            "batch": "4th Year (B.Tech)",
            "role": "STUDENT",
            "status": "ACTIVE",
            "passwordHash": hash_pass("password"),
            "createdAt": "2026-08-01"
        }
    ],
    "complaints": [
        {
            "id": "CMP-2026-001",
            "type": "BUILDING",
            "studentId": "2024NIST1001",
            "studentName": "Rahul Sharma",
            "studentDept": "Computer Science & Engineering",
            "building": "LHC",
            "buildingCode": "LHC",
            "buildingName": "Lecture Hall Complex",
            "floor": 2,
            "floorNumber": 2,
            "floorLabel": "Floor 2",
            "room": "201",
            "roomNumber": "201",
            "roomId": "201",
            "category": "Electrical",
            "title": "Ceiling Fan Regulator Malfunction",
            "description": "Ceiling fan FAN_02 speed regulator switch is sparking and completely unresponsive.",
            "priority": "High",
            "equipment": "FAN_02",
            "locationDetail": "Room 201, Floor 2, Lecture Hall Complex",
            "photoUrl": None,
            "submittedAt": "2026-11-04 10:15 AM",
            "timestamp": int(time.time() * 1000) - 86400000,
            "status": "Under Review",
            "statusHistory": [
                { "status": "Submitted", "at": "2026-11-04 10:15 AM", "by": "Rahul Sharma" },
                { "status": "Under Review", "at": "2026-11-04 02:30 PM", "by": "Prof. B. K. Verma", "notes": "Electrician team dispatched to Room 201." }
            ]
        },
        {
            "id": "CMP-2026-002",
            "type": "BUILDING",
            "studentId": "2024NIST1042",
            "studentName": "Priya Patel",
            "studentDept": "Electronics & Communication",
            "building": "ATR",
            "buildingCode": "ATR",
            "buildingName": "Atrium Building",
            "floor": 1,
            "floorNumber": 1,
            "floorLabel": "Ground Floor",
            "room": "ATR-GF-WASH",
            "roomNumber": "ATR-GF-WASH",
            "roomId": "ATR_WASHROOM_GF",
            "category": "Plumbing",
            "title": "Washbasin Chrome Tap Leak",
            "description": "Continuous water leakage under ceramic washbasin unit 2 in Ground Floor East Restroom.",
            "priority": "Medium",
            "equipment": "TAP_02",
            "locationDetail": "Ground Floor Washroom, Atrium Building",
            "photoUrl": None,
            "submittedAt": "2026-11-05 09:00 AM",
            "timestamp": int(time.time() * 1000) - 43200000,
            "status": "Submitted",
            "statusHistory": [
                { "status": "Submitted", "at": "2026-11-05 09:00 AM", "by": "Priya Patel" }
            ]
        },
        {
            "id": "CMP-2026-003",
            "type": "GENERAL",
            "studentId": "2024NIST1088",
            "studentName": "Amitav Rout",
            "studentDept": "Mechanical Engineering",
            "building": None,
            "buildingCode": None,
            "buildingName": "Campus General Area",
            "floor": None,
            "floorNumber": None,
            "floorLabel": None,
            "room": None,
            "roomNumber": None,
            "roomId": None,
            "area": "Atrium East Wing Pathway",
            "category": "Cleaning",
            "title": "Overflowing Waste Bin on Pathway",
            "description": "Overflowing recycling bin and scattered paper cartons along the Atrium East pathway after club exhibition.",
            "priority": "Low",
            "locationDetail": "Atrium East Wing Pathway Promenade",
            "photoUrl": None,
            "submittedAt": "2026-11-05 11:30 AM",
            "timestamp": int(time.time() * 1000) - 7200000,
            "status": "Submitted",
            "statusHistory": [
                { "status": "Submitted", "at": "2026-11-05 11:30 AM", "by": "Amitav Rout" }
            ]
        }
    ],
    "electricity": {
        "totalCampusKwh": 485200,
        "todayKwh": 14850,
        "monthMwh": 396.4,
        "peakLoadKw": 840,
        "powerFactor": 0.94,
        "buildingBreakdown": {
            "LHC": { "name": "Lecture Hall Complex", "percentage": 34, "kwh": 5049, "color": "#10b981" },
            "ATR": { "name": "Atrium Building", "percentage": 44, "kwh": 6534, "color": "#38bdf8" },
            "GAL": { "name": "Galleria Building", "percentage": 22, "kwh": 3267, "color": "#fb923c" }
        },
        "hourlyTrend": [
            { "hour": "00:00", "kwh": 210 }, { "hour": "02:00", "kwh": 180 }, { "hour": "04:00", "kwh": 175 },
            { "hour": "06:00", "kwh": 240 }, { "hour": "08:00", "kwh": 620 }, { "hour": "10:00", "kwh": 1150 },
            { "hour": "12:00", "kwh": 1320 }, { "hour": "14:00", "kwh": 1280 }, { "hour": "16:00", "kwh": 1100 },
            { "hour": "18:00", "kwh": 860 }, { "hour": "20:00", "kwh": 590 }, { "hour": "22:00", "kwh": 340 }
        ],
        "monthlyTrend": [
            { "month": "Jan", "mwh": 310 }, { "month": "Feb", "mwh": 325 }, { "month": "Mar", "mwh": 380 },
            { "month": "Apr", "mwh": 440 }, { "month": "May", "mwh": 490 }, { "month": "Jun", "mwh": 430 },
            { "month": "Jul", "mwh": 390 }, { "month": "Aug", "mwh": 370 }, { "month": "Sep", "mwh": 385 },
            { "month": "Oct", "mwh": 396 }, { "month": "Nov", "mwh": 375 }, { "month": "Dec", "mwh": 330 }
        ]
    }
}

class DatabaseManager:
    def __init__(self, filepath):
        self.filepath = filepath
        self.lock = threading.Lock()
        self.load()

    def load(self):
        with self.lock:
            if not os.path.exists(self.filepath):
                self.data = INITIAL_DB
                self.save_unlocked()
            else:
                try:
                    with open(self.filepath, "r", encoding="utf-8") as f:
                        self.data = json.load(f)
                except Exception as e:
                    print(f"[DB] Error loading DB: {e}, using initial seed.")
                    self.data = INITIAL_DB
                    self.save_unlocked()

    def save_unlocked(self):
        with open(self.filepath, "w", encoding="utf-8") as f:
            json.dump(self.data, f, indent=2)

    def save(self):
        with self.lock:
            self.save_unlocked()

    def get_students(self):
        with self.lock:
            return self.data.get("students", [])

    def get_authorities(self):
        with self.lock:
            return self.data.get("authorities", [])

    def get_complaints(self):
        with self.lock:
            return self.data.get("complaints", [])

    def get_electricity(self):
        with self.lock:
            return self.data.get("electricity", {})

    def add_student(self, student):
        with self.lock:
            self.data.setdefault("students", []).append(student)
            self.save_unlocked()

    def update_student(self, reg_no, update_fields):
        with self.lock:
            students = self.data.setdefault("students", [])
            for i, s in enumerate(students):
                if s["regNo"].upper() == reg_no.upper():
                    students[i].update(update_fields)
                    self.save_unlocked()
                    return students[i]
            return None

    def toggle_student(self, reg_no):
        with self.lock:
            students = self.data.setdefault("students", [])
            for i, s in enumerate(students):
                if s["regNo"].upper() == reg_no.upper():
                    curr = students[i].get("status", "ACTIVE")
                    students[i]["status"] = "INACTIVE" if curr == "ACTIVE" else "ACTIVE"
                    self.save_unlocked()
                    return students[i]
            return None

    def add_authority(self, auth):
        with self.lock:
            self.data.setdefault("authorities", []).append(auth)
            self.save_unlocked()

    def add_complaint(self, cmp):
        with self.lock:
            self.data.setdefault("complaints", []).insert(0, cmp)
            self.save_unlocked()

    def update_complaint_status(self, cmp_id, new_status, remarks, author_name):
        with self.lock:
            cmps = self.data.setdefault("complaints", [])
            for i, c in enumerate(cmps):
                if c["id"] == cmp_id:
                    cmps[i]["status"] = new_status
                    cmps[i]["resolutionRemarks"] = remarks
                    if new_status == "Resolved":
                        cmps[i]["resolvedAt"] = int(time.time() * 1000)
                        cmps[i]["resolvedBy"] = author_name
                    history = cmps[i].setdefault("statusHistory", [])
                    now_str = time.strftime("%Y-%m-%d %I:%M %p")
                    history.append({
                        "status": new_status,
                        "at": now_str,
                        "by": author_name,
                        "notes": remarks or None
                    })
                    self.save_unlocked()
                    return cmps[i]
            return None

db = DatabaseManager(DB_FILE)

class CampusBackendHandler(SimpleHTTPRequestHandler):
    """
    Combined HTTP Server:
    - Answers /api/* requests with a full JSON REST backend
    - Serves static assets, Three.js modules, and HTML/CSS for everything else
    """

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, status_code, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                raw = self.rfile.read(content_length).decode("utf-8")
                return json.loads(raw)
            return {}
        except Exception as e:
            return None

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # --- REST API ENDPOINTS ---
        if path == "/api/status":
            return self.send_json(200, {
                "server": "NIST Smart Campus Backend (Python 3)",
                "status": "ONLINE",
                "database": os.path.basename(DB_FILE),
                "totalComplaints": len(db.get_complaints()),
                "totalStudents": len(db.get_students()),
                "totalAuthorities": len(db.get_authorities()),
                "time": time.strftime("%Y-%m-%d %H:%M:%S")
            })

        if path == "/api/complaints":
            return self.send_json(200, db.get_complaints())

        if path == "/api/students":
            # Strip passwords for security
            students = [
                {k: v for k, v in s.items() if k != "passwordHash"}
                for s in db.get_students()
            ]
            return self.send_json(200, students)

        if path == "/api/authorities":
            authorities = [
                {k: v for k, v in a.items() if k != "passwordHash"}
                for a in db.get_authorities()
            ]
            return self.send_json(200, authorities)

        if path == "/api/electricity":
            return self.send_json(200, db.get_electricity())

        # Static file fallback
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.read_json_body()

        if body is None:
            return self.send_json(400, {"error": "Invalid JSON payload"})

        # 1. Login Endpoint
        if path == "/api/auth/login":
            identifier = body.get("identifier", "").strip()
            password = body.get("password", "")
            role = body.get("role", "STUDENT").upper()
            pwd_hash = hash_pass(password)

            if role == "STUDENT":
                students = db.get_students()
                matched = next((s for s in students if s["regNo"].upper() == identifier.upper()), None)
                if not matched:
                    return self.send_json(401, {"error": f"No student account found with Registration Number '{identifier}'."})
                if matched.get("status") == "INACTIVE":
                    return self.send_json(403, {"error": "Your student account is currently deactivated. Contact campus administration."})
                if matched["passwordHash"] != pwd_hash:
                    return self.send_json(401, {"error": "Incorrect password for this student account."})
                user = {k: v for k, v in matched.items() if k != "passwordHash"}
                return self.send_json(200, {"success": True, "user": user, "role": "STUDENT"})

            else:
                authorities = db.get_authorities()
                matched = next((a for a in authorities if a["email"].lower() == identifier.lower() or a["empId"].upper() == identifier.upper()), None)
                if not matched:
                    return self.send_json(401, {"error": f"No authority account found with identifier '{identifier}'."})
                if matched["passwordHash"] != pwd_hash:
                    return self.send_json(401, {"error": "Incorrect password for this authority account."})
                user = {k: v for k, v in matched.items() if k != "passwordHash"}
                return self.send_json(200, {"success": True, "user": user, "role": "AUTHORITY"})

        # 2. Authority Registration Endpoint
        if path == "/api/auth/register-authority":
            invite = body.get("inviteCode", "").strip()
            if invite != AUTHORITY_INVITE_CODE:
                return self.send_json(403, {"error": "Invalid Administrator Invitation Code. Authority access denied."})

            email = body.get("email", "").strip().lower()
            emp_id = body.get("empId", "").strip().upper()
            authorities = db.get_authorities()

            if any(a["email"].lower() == email or a["empId"].upper() == emp_id for a in authorities):
                return self.send_json(400, {"error": "An authority account with this Email or Employee ID already exists."})

            new_auth = {
                "id": f"AUTH_{int(time.time())}",
                "fullName": body.get("fullName", "").strip(),
                "email": email,
                "empId": emp_id,
                "role": "AUTHORITY",
                "title": "Faculty & Administrative Authority",
                "passwordHash": hash_pass(body.get("password", "")),
                "createdAt": time.strftime("%Y-%m-%d")
            }
            db.add_authority(new_auth)
            safe_auth = {k: v for k, v in new_auth.items() if k != "passwordHash"}
            return self.send_json(201, {"success": True, "user": safe_auth, "role": "AUTHORITY"})

        # 3. Add Complaint Endpoint
        if path == "/api/complaints":
            cmps = db.get_complaints()
            new_id = f"CMP-{time.strftime('%Y')}-{str(len(cmps) + 1).zfill(3)}"
            now_str = time.strftime("%Y-%m-%d %I:%M %p")

            bld = body.get("building") or body.get("buildingCode")
            floor = body.get("floor") or body.get("floorNumber")
            room = body.get("room") or body.get("roomNumber")

            complaint = {
                "id": new_id,
                "type": body.get("type", "BUILDING").upper(),
                "studentId": body.get("studentId"),
                "studentName": body.get("studentName"),
                "studentDept": body.get("studentDept", "Student"),
                "building": bld,
                "buildingCode": bld,
                "buildingName": body.get("buildingName") or ("Lecture Hall Complex" if bld == "LHC" else ("Atrium Building" if bld == "ATR" else "Galleria Building")),
                "floor": floor,
                "floorNumber": floor,
                "floorLabel": body.get("floorLabel") or (f"Floor {floor}" if floor else None),
                "room": room,
                "roomNumber": room,
                "roomId": body.get("roomId") or room,
                "category": body.get("category", "General"),
                "title": body.get("title") or f"{body.get('category', 'Issue')} in {room or 'Campus'}",
                "description": body.get("description", ""),
                "priority": body.get("priority", "Medium"),
                "locationDetail": body.get("locationDetail") or (f"Room {room}, {bld}" if room else "Campus Area"),
                "area": body.get("area"),
                "photoUrl": body.get("photoUrl"),
                "submittedAt": now_str,
                "timestamp": int(time.time() * 1000),
                "status": "Submitted",
                "statusHistory": [
                    { "status": "Submitted", "at": now_str, "by": body.get("studentName", "Student") }
                ]
            }
            db.add_complaint(complaint)
            return self.send_json(201, complaint)

        # 4. Update Complaint Status Endpoint
        if path == "/api/complaints/update-status":
            cmp_id = body.get("id")
            new_status = body.get("status")
            remarks = body.get("remarks", "")
            author_name = body.get("authorName", "Authority Facilities Officer")
            updated = db.update_complaint_status(cmp_id, new_status, remarks, author_name)
            if updated:
                return self.send_json(200, updated)
            return self.send_json(404, {"error": f"Complaint '{cmp_id}' not found."})

        # 5. Add Student Endpoint
        if path == "/api/students":
            reg_no = body.get("regNo", "").strip().upper()
            students = db.get_students()
            if any(s["regNo"].upper() == reg_no for s in students):
                return self.send_json(400, {"error": f"Student with Registration Number '{reg_no}' already exists."})

            new_student = {
                "regNo": reg_no,
                "fullName": body.get("fullName", "").strip(),
                "email": body.get("email", "").strip().lower(),
                "department": body.get("department", "").strip(),
                "batch": body.get("batch", "2024-2028"),
                "role": "STUDENT",
                "status": "ACTIVE",
                "passwordHash": hash_pass(body.get("password", "")),
                "createdAt": time.strftime("%Y-%m-%d")
            }
            db.add_student(new_student)
            safe_s = {k: v for k, v in new_student.items() if k != "passwordHash"}
            return self.send_json(201, safe_s)

        # 6. Toggle Student Status Endpoint
        if path == "/api/students/toggle":
            reg_no = body.get("regNo", "").strip()
            updated = db.toggle_student(reg_no)
            if updated:
                safe_s = {k: v for k, v in updated.items() if k != "passwordHash"}
                return self.send_json(200, safe_s)
            return self.send_json(404, {"error": f"Student '{reg_no}' not found."})

        # 7. Update Student Info Endpoint
        if path == "/api/students/update":
            reg_no = body.get("regNo", "").strip()
            update_fields = {}
            for field in ["fullName", "email", "department", "batch"]:
                if field in body:
                    update_fields[field] = body[field]
            if body.get("password"):
                update_fields["passwordHash"] = hash_pass(body["password"])
            updated = db.update_student(reg_no, update_fields)
            if updated:
                safe_s = {k: v for k, v in updated.items() if k != "passwordHash"}
                return self.send_json(200, safe_s)
            return self.send_json(404, {"error": f"Student '{reg_no}' not found."})

        return self.send_json(404, {"error": f"Endpoint '{path}' not found."})

    def guess_type(self, path):
        if path.endswith(".js") or path.endswith(".mjs"):
            return "application/javascript"
        if path.endswith(".css"):
            return "text/css"
        if path.endswith(".json"):
            return "application/json"
        if path.endswith(".jpg") or path.endswith(".jpeg"):
            return "image/jpeg"
        if path.endswith(".png"):
            return "image/png"
        return super().guess_type(path)

    def log_message(self, format, *args):
        # Clean terminal logging showing API calls
        msg = format % args
        if "/api/" in msg:
            print(f"[BACKEND API] {msg}")


def wait_and_open_browser(url: str, port: int):
    for _ in range(30):
        time.sleep(0.2)
        try:
            with socket.create_connection((HOST, port), timeout=0.5):
                break
        except (OSError, ConnectionRefusedError):
            pass
    print(f"[LAUNCH] Opening browser at {url}...")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"[LAUNCH] Could not auto-launch browser ({e}). Open manually: {url}")


def main():
    os.chdir(BASE_DIR)
    url = f"http://{HOST}:{PORT}/"

    # Start browser opener in background thread
    if "--no-browser" not in sys.argv:
        t = threading.Thread(target=wait_and_open_browser, args=(url, PORT), daemon=True)
        t.start()

    print("=" * 76)
    print(" 🏛️  NIST UNIVERSITY • SMART CAMPUS 3D & FULL-STACK BACKEND SERVER")
    print("=" * 76)
    print(f" • Server Address : {url}")
    print(f" • Database File  : {DB_FILE}")
    print(f" • REST API Base  : {url}api/")
    print(" • Backend APIs   : /api/status, /api/auth/*, /api/complaints, /api/students")
    print(" • 3D Digital Twin: Lecture Hall Complex, Atrium Building & Galleria Complex")
    print("-" * 76)
    print(" Press Ctrl+C in this terminal to stop the server.\n")

    httpd = ThreadingHTTPServer((HOST, PORT), CampusBackendHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[SERVER] Shutting down cleanly. Goodbye!")
        httpd.server_close()


if __name__ == "__main__":
    main()
