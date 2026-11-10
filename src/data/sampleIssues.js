/**
 * sampleIssues.js - Demonstration Maintenance Issues for NIST University Campus
 * 
 * Pre-configured maintenance dataset across:
 * - Lecture Hall Complex (LHC)
 * - Atrium Building (ATR)
 * - Galleria Building (GAL)
 * 
 * Priority color codes:
 * - high:    #ef4444 (Red)
 * - medium:  #f97316 (Orange)
 * - low:     #eab308 (Yellow)
 * - resolved:#22c55e (Green)
 */

export const ISSUE_PRIORITY_COLORS = {
  high: 0xef4444,
  medium: 0xf97316,
  low: 0xeab308,
  resolved: 0x22c55e
};

export const SAMPLE_ISSUES = [
  // --- LHC ISSUES ---
  {
    issueId: "ISSUE_LHC_001",
    buildingId: "LHC",
    buildingName: "Lecture Hall Complex",
    floorId: 2,
    roomId: "203",
    equipmentId: "FAN_03",
    category: "electrical",
    title: "Fan Bearing Wobble & Vibration",
    description: "Ceiling fan making squeaking noise and wobbling violently at speed 3.",
    priority: "medium",
    status: "reported",
    reportedAt: "2026-10-31 09:30",
    reporter: "Student Council / Prof. Verma"
  },
  {
    issueId: "ISSUE_LHC_002",
    buildingId: "LHC",
    buildingName: "Lecture Hall Complex",
    floorId: 3,
    roomId: "305",
    equipmentId: "FAN_01",
    category: "electrical",
    title: "Capacitor / Regulator Dead",
    description: "Ceiling fan not powering on. Suspected regulator or capacitor failure.",
    priority: "high",
    status: "in_progress",
    reportedAt: "2026-10-30 14:15",
    reporter: "Class Representative (CS-3)"
  },
  {
    issueId: "ISSUE_LHC_003",
    buildingId: "LHC",
    buildingName: "Lecture Hall Complex",
    floorId: 1,
    roomId: "GIRLS_WASHROOM_F1",
    equipmentId: "TAP_F1_01",
    category: "plumbing",
    title: "Continuous Washbasin Leak",
    description: "Continuous water leakage / dripping tap valve in washbasin 1.",
    priority: "medium",
    status: "reported",
    reportedAt: "2026-10-31 11:20",
    reporter: "Housekeeping Staff"
  },
  {
    issueId: "ISSUE_LHC_004",
    buildingId: "LHC",
    buildingName: "Lecture Hall Complex",
    floorId: 1,
    roomId: "101",
    equipmentId: "LIGHT_04",
    category: "lighting",
    title: "Flickering Whiteboard Luminaire",
    description: "Flickering tube light fixture near lecturer chalkboard.",
    priority: "low",
    status: "reported",
    reportedAt: "2026-10-29 16:45",
    reporter: "Physics Department"
  },
  {
    issueId: "ISSUE_LHC_005",
    buildingId: "LHC",
    buildingName: "Lecture Hall Complex",
    floorId: 4,
    roomId: "402",
    equipmentId: "FAN_05",
    category: "electrical",
    title: "Loose Fan Blade Screws",
    description: "Loose fan blade vibration causing acoustic disturbance during exams.",
    priority: "low",
    status: "reported",
    reportedAt: "2026-10-28 10:00",
    reporter: "Exam Invigilator"
  },
  {
    issueId: "ISSUE_LHC_006",
    buildingId: "LHC",
    buildingName: "Lecture Hall Complex",
    floorId: 3,
    roomId: "308",
    equipmentId: "PROJECTOR_SCREEN",
    category: "multimedia",
    title: "Motorized Screen Jam",
    description: "Projector pull-down screen jammed in half-open position.",
    priority: "medium",
    status: "reported",
    reportedAt: "2026-10-31 08:50",
    reporter: "Visiting Faculty"
  },
  {
    issueId: "ISSUE_LHC_007",
    buildingId: "LHC",
    buildingName: "Lecture Hall Complex",
    floorId: 1,
    roomId: "LIFT_01",
    equipmentId: "LIFT_01",
    category: "mechanical",
    title: "Quarterly Elevator Servicing",
    description: "Routine scheduled elevator brake inspection and lubrication completed.",
    priority: "resolved",
    status: "resolved",
    reportedAt: "2026-10-25 10:00",
    reporter: "Campus Facilities Engineer"
  },
  {
    issueId: "ISSUE_LHC_008",
    buildingId: "LHC",
    buildingName: "Lecture Hall Complex",
    floorId: 5,
    roomId: "504",
    equipmentId: "FAN_02",
    category: "electrical",
    title: "Motor Coil Overheat",
    description: "Burnt smell from motor winding. Switched off at distribution board.",
    priority: "high",
    status: "in_progress",
    reportedAt: "2026-10-31 15:10",
    reporter: "Mechanical Dept Faculty"
  },

  // --- ATRIUM BUILDING ISSUES ---
  {
    issueId: "ISSUE_ATR_001",
    buildingId: "ATR",
    buildingName: "Atrium Building",
    floorId: 5,
    roomId: "ATR-FOF-CINEPLEX",
    equipmentId: "AC_UNIT_02",
    category: "hvac",
    title: "Cineplex AC Compressor Tripping",
    description: "Precision AC Unit 2 in Stephen Hawking Cineplex tripping circuit breaker during full-house screenings.",
    priority: "high",
    status: "in_progress",
    reportedAt: "2026-10-31 18:20",
    reporter: "Film & Media Society President"
  },
  {
    issueId: "ISSUE_ATR_002",
    buildingId: "ATR",
    buildingName: "Atrium Building",
    floorId: 4,
    roomId: "ATR-TF-LIB",
    equipmentId: "LIGHT_ROW_3",
    category: "lighting",
    title: "Dim LED Drivers in Reading Stacks",
    description: "Reading bay 3 luminaires flickering and producing insufficient lux for students.",
    priority: "medium",
    status: "reported",
    reportedAt: "2026-10-30 11:00",
    reporter: "Head Librarian"
  },
  {
    issueId: "ISSUE_ATR_003",
    buildingId: "ATR",
    buildingName: "Atrium Building",
    floorId: 2,
    roomId: "ATR-FF-LAB2",
    equipmentId: "GPU_NODE_04",
    category: "computing",
    title: "GPU Thermal Throttling",
    description: "Deep learning training node 4 running at 92°C. Case fan inlet needs cleaning.",
    priority: "medium",
    status: "reported",
    reportedAt: "2026-10-31 13:40",
    reporter: "AI Lab Research Assistant"
  },
  {
    issueId: "ISSUE_ATR_004",
    buildingId: "ATR",
    buildingName: "Atrium Building",
    floorId: 1,
    roomId: "ATR_WASHROOM_GF",
    equipmentId: "ATR_TAP_GF_01",
    category: "plumbing",
    title: "Sensor Tap Battery Depleted",
    description: "Automatic infrared water sensor tap not activating on hand approach.",
    priority: "low",
    status: "reported",
    reportedAt: "2026-10-29 08:30",
    reporter: "Maintenance Supervisor"
  },
  {
    issueId: "ISSUE_ATR_005",
    buildingId: "ATR",
    buildingName: "Atrium Building",
    floorId: 3,
    roomId: "ATR-SF-BIZ",
    equipmentId: "CONF_MIC_SYS",
    category: "multimedia",
    title: "Boardroom Audio Feedback",
    description: "Microphone boundary array producing high-pitched feedback during hybrid meetings.",
    priority: "medium",
    status: "reported",
    reportedAt: "2026-10-30 16:00",
    reporter: "Dean MBA Office"
  },

  // --- GALLERIA BUILDING ISSUES ---
  {
    issueId: "ISSUE_GAL_001",
    buildingId: "GAL",
    buildingName: "Galleria Building",
    floorId: 1,
    roomId: "GAL-AUD-250",
    equipmentId: "STAGE_LIGHT_01",
    category: "electrical",
    title: "Proscenium Stage Spotlight DMX Failure",
    description: "Left front spotlight not responding to DMX console controller prior to Annual Tech Fest.",
    priority: "high",
    status: "in_progress",
    reportedAt: "2026-10-31 17:00",
    reporter: "Cultural Affairs Secretary"
  },
  {
    issueId: "ISSUE_GAL_002",
    buildingId: "GAL",
    buildingName: "Galleria Building",
    floorId: 2,
    roomId: "GAL-HPC-LAB",
    equipmentId: "RACK_COOLER_A",
    category: "hvac",
    title: "HPC Liquid Chiller Pressure Warning",
    description: "Coolant pressure indicator on rack row A showing 1.2 bar (nominal 2.0 bar). Needs top-up.",
    priority: "high",
    status: "reported",
    reportedAt: "2026-10-31 14:00",
    reporter: "Supercomputer Administrator"
  },
  {
    issueId: "ISSUE_GAL_003",
    buildingId: "GAL",
    buildingName: "Galleria Building",
    floorId: 3,
    roomId: "GAL-IBM-COE",
    equipmentId: "SMART_PROJECTOR",
    category: "multimedia",
    title: "Projector Lamp Hours Exceeded",
    description: "Laser phosphor unit warning prompt displayed: replace filter and optical block.",
    priority: "low",
    status: "reported",
    reportedAt: "2026-10-27 12:10",
    reporter: "IBM Training Coordinator"
  },
  {
    issueId: "ISSUE_GAL_004",
    buildingId: "GAL",
    buildingName: "Galleria Building",
    floorId: 4,
    roomId: "GAL-NTCS",
    equipmentId: "FIBER_ROUTER_01",
    category: "network",
    title: "SFP+ Optical Port Flapping",
    description: "Consultancy server room uplink port intermittent during peak cloud backup hours.",
    priority: "medium",
    status: "reported",
    reportedAt: "2026-10-31 09:15",
    reporter: "NTCS Operations Lead"
  }
];
