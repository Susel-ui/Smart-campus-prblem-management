# 🏛️ NIST University — Interactive 3D Smart Campus Reconstruction

A realistic, high-fidelity, interactive 3D digital representation of **NIST University** (Berhampur, Odisha, India) reconstructed using **Three.js** and **modular ES modules** based on the real photographic architectural references.

The application reconstructs all three major academic complexes together in a unified campus environment:
1. **Lecture Hall Complex (LHC)** — 5-Storey tiered academic lecture building.
2. **Atrium Building (ATR)** — 5-Storey landmark with curved blue curtain-wall glass facade, grand portico, 25 classrooms, 11 labs, Business School, BS Library, and the Stephen Hawking Cineplex.
3. **Galleria Building (GAL)** — 4-Storey terracotta curvilinear complex housing the 250-Seat Grand Auditorium, HPC Supercomputing Lab, IBM Centre for Excellence, NTCS, and 12 lecture halls.

---

## 📸 Architectural Comparison: Photographs vs 3D Reconstruction

The application provides a built-in **Photo Reference Comparison Modal** with tabs for all 4 reference photographs:

### 1. Lecture Hall Complex (LHC) — 5 Storeys
* **White concrete finish** with prominent left anchor block and long connected academic wing.
* **Open external staircase (Staircase 1)** on the left with signature sawtooth stepped soffit and dark brown railings.
* **Independent passenger lift tower (`LIFT_01`)** with glazed cabin and live floor telemetry.
* **Continuous front balcony corridors** with white structural columns, dark brown railings, and blue-green/teal slab fascia trims.
* **10–11 Classrooms per floor** (`101–109`, `201–209`, `301–309`, `401–409`, `501–509`) with ~60 capacity tiered desks, chalkboards, smart podiums, 6 rotating ceiling fans, and luminaires.
* **Washrooms on all floors** with internal software IDs (`GIRLS_WASHROOM_F1`, `WASHROOM_F2`, `GIRLS_WASHROOM_F3`, `FACULTY_WASHROOM_F3`, etc.).

### 2. Atrium Building (ATR) — 5 Storeys (GF, FF, SF, TF, FOF)
* **Curved Blue Curtain-Wall Glass Atrium**: Sweeping outward arc of reflective blue/cyan glass panels spanning upper floors with horizontal and vertical mullion lattices.
* **Grand Entrance Portico**: Ground floor open colonnade supported by monumental cylindrical white columns and a wide flight of black/dark stone entrance stairs.
* **Official "ATRIUM" Signage**: Crisp lettering on the white entrance fascia band.
* **Flanking Cream-White Wings**: Featuring distinctive vertical arrays of **triple-slit rectangular windows** stacked across all floors with dark bronze frames.
* **Cylindrical Rooftop Penthouse Drum**: Characteristic curved stairhead drum structure rising above the central roofline.
* **Two Front Royal Palms with Indian Tricolor Wraps**: Faithful recreation of the saffron, white, and green trunk wraps visible in the college photo.
* **25 Classrooms & 11 Specialized Laboratories**:
  - `ATR-GF`: Basic Electronics Lab, Physics Research Lab, Student Activities Centre (SAC).
  - `ATR-FF`: Data Structures & Algorithms Lab, AI & Machine Learning Studio, Faculty Cabins.
  - `ATR-SF`: IoT & Embedded Systems Lab, VLSI Design Lab, NIST Business School Executive Wing.
  - `ATR-TF`: Cloud Computing & Cyber Security Lab, Robotics Lab, Business School Library & Research Hall.
  - `ATR-FOF`: Bioinformatics Lab, Software Engineering Studio, Maker Space, **Stephen Hawking Cineplex (140-seat digital theater)**.
* **Washrooms on all 5 floors** (`ATR_WASHROOM_GF` to `ATR_WASHROOM_FOF`).

### 3. Galleria Building (GAL) — 4 Storeys (GF, FF, SF, TF)
* **Curvilinear Multi-Wing Massing**: Curved wings wrapping around a landscaped red-brick courtyard.
* **Terracotta / Brick-Red Exterior**: Vibrant terracotta walls accented by bold white horizontal concrete floor bands and white window surrounds.
* **Central Curved Glass Facade**: Dark navy curtain-wall glass bay connecting the wings.
* **Distinctive Cylindrical Spiral Staircase Towers**: White concrete towers with bold sky-blue accent rings at every floor located at the wing extremities.
* **White Castellated / Crenellated Parapet**: Crenel/merlon pattern along the rooftop edges with rooftop HVAC equipment.
* **Special Facilities**:
  - **Grand Auditorium (250 Capacity)**: Multi-tiered hall with velvet seating rows, elevated teak keynote stage, projection screen, and acoustic baffle walls.
  - **High Performance Computing (HPC) Lab**: Supercomputer server rack clusters, precision cooling, and terminal workstations.
  - **IBM Centre for Excellence**: Cloud enterprise workstations and collaborative pods.
  - **NIST Technology Consultancy Services (NTCS)**: R&D incubation and client negotiation suite.
  - **12 Large Lecture Halls** (`GAL-GF-LH1..3`, `GAL-FF-LH4..6`, `GAL-SF-LH7..9`, `GAL-TF-LH10..12`).
  - **Washrooms on all 4 floors** (`GAL_WASHROOM_GF` to `GAL_WASHROOM_TF`).

---

## 🚀 How to Run Locally

### Option 1: One-Click Launch (Windows)
Double-click `start.bat` in the project directory:
```bat
start.bat
```
This automatically starts the local HTTP server and opens `http://localhost:5173` in your default browser.

---

### Option 2: Python (Standard Library — Zero External Dependencies)
Python 3 is all that is required:
```powershell
cd "G:\My Drive\Website\lhc-3d-model"
python run.py
```
> Starts the server and opens `http://localhost:5173`.

---

## 🎮 Interactive Controls & Campus Features

| Feature / Action | Controls |
|---|---|
| **Rotate View (360° Free)** | Left-click + drag mouse |
| **Pan Campus** | Right-click + drag mouse |
| **Zoom Smoothly** | Mouse scroll wheel or trackpad pinch |
| **Building Switcher** | Click **Campus Overview**, **LHC**, **Atrium**, or **Galleria** in the bottom dock |
| **Floor Level Navigation** | Click floor buttons (LHC: F1–F5; Atrium: GF–FOF; Galleria: GF–TF) to isolate floors |
| **Inspect Any Room / Facility** | Left-click any classroom, lab, auditorium, cineplex, washroom, fan, or light |
| **Inspect Restrooms** | Click **🚾 Washrooms** in header to browse and teleport to any washroom across campus |
| **Photo References** | Click **📷 Photo References** to inspect and compare all 4 real reference photographs |
| **Exploded View** | Click **⚡ Explode View** to expand floor levels vertically |
| **Roof Toggle** | Click **🏛️ Hide Roof** to reveal interior layouts |
| **Day / Night Mode** | Click **☀️ Day Mode / Night Mode** to toggle evening sky, illuminated windows, and streetlights |
| **Camera Elevation Presets** | Click **Default**, **Front Elevation**, **Left Wing**, **Right Wing**, **Rear**, or **Plan View** |

---

## 🏛️ Smart Campus Maintenance & Intelligence System

In addition to the 3D Digital Twin, the application includes a full-featured web portal with role-based access control (RBAC):

### 1. 🎓 Student Portal
* **Institutional Account Policy**: Students cannot self-register. Accounts are provisioned and activated exclusively by college authorities.
* **Interactive 3D Digital Twin**: Select any building (LHC, Atrium, Galleria), floor, or room/facility.
* **Auto-Filled Classroom Problem Reporting**: Clicking "+ Report Issue" on any room/facility in 3D automatically pre-fills and locks Student Name, Registration Number, Building, Floor, and Room number.
* **General Campus Issue Reporting**: Report issues across walkways, sports grounds, libraries, or outdoor facilities with photo upload and instant thumbnail preview.
* **"My Complaints" Live Resolution Tracker**: Live timeline showing ticket lifecycle status: `Submitted` ➔ `Under Review` ➔ `Resolved` with authority notes.

### 2. 🏛️ Authority Portal
* **Role-Based Authentication**: Requires administrative invitation authorization (`NIST-ADMIN-2026`). Passwords hashed via SHA-256.
* **Complaints Management**:
  - Live metric cards: Total Tickets, New/Submitted, Under Active Review, Resolved, Building vs General breakdown.
  - Multi-criteria filtering by Status (`Submitted`, `Under Review`, `Resolved`), Category, Building (`LHC`, `ATR`, `GAL`), and live text search.
  - Interactive Ticket Review Drawer: Inspect complaint details, student info, attached photographic proof, update ticket lifecycle status, and write resolution remarks.
  - **"🎯 3D Locate" Action**: Seamlessly transitions to the 3D Campus Digital Twin, isolates the reported building and floor, points the camera, and highlights the exact room/washroom.
* **Student Accounts Management**:
  - Provision new student accounts (Full Name, Registration Number / Student ID, College Email, Department, Batch, Initial Password).
  - Search and filter students across departments.
  - Activate / Deactivate accounts with immediate login restriction enforcement.
  - Edit student details and reset credentials.
* **⚡ Electricity Consumption Monitoring**:
  - Summary telemetry KPI cards: Total Campus Energy (485,200 kWh), Today (14,850 kWh), Current Month (396.4 MWh), Peak Demand (840 kW at 14:30), Power Factor (0.94 PF).
  - High-DPI HTML5 Canvas Charts:
    1. **24-Hour Campus Hourly Load Curve (kW)**: Diurnal curve showing baseline nighttime load, morning lecture surge, and afternoon laboratory peak.
    2. **Building Consumption Share**: Distribution breakdown comparing Atrium (44%), LHC (34%), and Galleria (22%).
    3. **12-Month Historical Energy Profile (MWh)**: Highlights examination semester peaks and vacation dips.
  - Built-in demonstration badge: Ready for Modbus/MQTT Smart Meter ingestion and AI anomaly detection.

---

## 🔑 Demonstration Credentials Quick-Reference

| Portal | Role | Username / Identifier | Password | Access Rights |
|---|---|---|---|---|
| **Student Portal** | Student | `2024NIST1001` | `password` | 3D explorer, auto-filled room complaints, general issues, ticket tracking |
| **Student Portal** | Student | `2024NIST1042` | `password` | Priya Patel (Electronics & Comm, 2nd Year) |
| **Authority Portal** | Chief Administrator | `admin@nist.edu` | `password` | Full facilities management, student provisioning, 3D ticket locating, electricity monitoring |
| **Authority Portal** | Supervisor | `facilities@nist.edu` | `password` | Dr. S. K. Nayak (Campus Electrical & Civil Supervisor) |
| **Authority Sign-up** | Admin Invitation Key | Code: `NIST-ADMIN-2026` | — | Required to authorize new administrative accounts |

---

## 📁 Project Architecture

```
lhc-3d-model/
├── index.html                   # Master campus single-page application entry
├── run.py                       # Local HTTP server with correct ES module MIME types
├── start.bat                    # One-click Windows launch script
├── package.json                 # Project configuration
├── README.md                    # Project documentation
│
├── public/reference/            # Real photographic architectural references
│   ├── lhc-reference.jpg        # Lecture Hall Complex reference photo
│   ├── atrium-reference-1.png   # Atrium Building side 3/4 perspective
│   ├── atrium-reference-2.png   # Atrium Building front elevation
│   └── galleria-reference.jpg   # Galleria Building aerial perspective
│
├── vendor/                      # 100% local Three.js and OrbitControls bundles
│   ├── three.module.js
│   └── OrbitControls.js
│
└── src/
    ├── main.js                  # Master application orchestrator
    ├── style.css                # Polished modern dark/glassmorphic interface
    │
    ├── auth/
    │   └── AuthManager.js       # Role-based access control (RBAC), session store & SHA-256
    │
    ├── views/
    │   ├── WelcomeView.js       # Institutional landing page with dual portals
    │   ├── AuthView.js          # Student login & Authority login/sign-up forms
    │   ├── StudentDashboard.js  # Student campus explorer, room issue form & ticket tracker
    │   └── AuthorityDashboard.js# Complaints review, 3D locate, student accounts & electricity
    │
    ├── data/
    │   ├── DataManager.js       # Central data store with localStorage & BroadcastChannel
    │   ├── campusConfig.js      # Master config for LHC, Atrium, Galleria, washrooms & facilities
    │   ├── buildingConfig.js    # Detailed dimensional specifications for LHC
    │   └── sampleIssues.js      # Campus maintenance dataset across all 3 buildings
    │
    ├── building/
    │   ├── Campus.js            # Campus grounds, quad, roadways, landscaping & wayfinding
    │   ├── Building.js          # Lecture Hall Complex (LHC) 3D model
    │   ├── AtriumBuilding.js    # Atrium Building 3D model (curved glass, portico, cineplex)
    │   ├── GalleriaBuilding.js  # Galleria Building 3D model (terracotta, spiral towers, aud)
    │   ├── MainBlock.js         # LHC West anchor block
    │   ├── AcademicWing.js      # LHC connected academic wing
    │   ├── Floor.js             # LHC floor level assembler
    │   ├── Room.js              # Modular classroom constructor
    │   ├── Corridor.js          # Balcony corridor & column grid
    │   ├── Staircase.js         # Sawtooth external staircase
    │   └── Washroom.js          # Sanitary restroom constructor & maintainable fixtures
    │
    ├── structures/
    │   └── Lift.js              # Exterior 5-storey passenger elevator with animated cabin
    │
    ├── objects/
    │   ├── Fan.js               # Spinning ceiling fans (FAN_01..06)
    │   ├── Light.js             # Ceiling luminaires (LIGHT_01..06)
    │   └── Furniture.js         # Desks, podiums, stages & chalkboards
    │
    ├── interaction/
    │   ├── SelectionManager.js  # Raycaster selection with hover tooltips
    │   └── CameraControls.js    # OrbitControls with smooth campus & building transitions
    │
    └── ui/
        ├── FloorSelector.js     # Building switcher tabs & dynamic floor buttons
        ├── InformationPanel.js  # Side drawer for room telemetry & maintenance tickets
        └── IssueMarkers.js      # 3D pulsing beacons across all 3 buildings
```

---

## 🔧 Verified vs Estimated Information

| Feature | Accuracy Status | Notes |
|---|---|---|
| **LHC Structure** | Verified from photo | 5 storeys, white concrete, left anchor block, external staircase, lift tower, front balcony corridors |
| **Atrium Exterior** | Verified from photos | 5 storeys, curved blue glass curtain wall, "ATRIUM" signage, portico with cylindrical columns, triple-slit windows, rooftop drum, tricolor-wrapped palms |
| **Galleria Exterior** | Verified from photo | 4 storeys, terracotta brick walls, white horizontal bands, blue spiral staircase towers, white castellated roof parapet, curved dark-blue glass center |
| **Special Facilities** | Institutional Specs | Stephen Hawking Cineplex, 250-Seat Auditorium, HPC Supercomputing Lab, IBM CoE, NTCS, SAC, Business School Library |
| **Room Numbering** | Verified Scheme | LHC: `101–509`; Atrium: `ATR-GF..ATR-FOF`; Galleria: `GAL-GF..GAL-TF` |
| **Internal Partition Coordinates** | Estimated | Dimensionally scaled to meet institutional square footage and capacity guidelines |
