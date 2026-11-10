/**
 * campusConfig.js - Master Architectural & Facility Configuration for NIST University Campus
 * 
 * Configures the three primary academic complexes:
 * 1. Lecture Hall Complex (LHC) - 5 Floors (1 to 5)
 * 2. Atrium Building (ATR) - 5 Floors (GF, FF, SF, TF, FOF)
 * 3. Galleria Building (GAL) - 4 Floors (GF, FF, SF, TF)
 * 
 * Reconstructed from photographic references and institutional specifications.
 */

export const CAMPUS_CONFIG = {
  institution: "NIST University",
  location: "Berhampur, Odisha, India",
  campusBounds: { width: 260, depth: 220 },

  buildings: {
    LHC: {
      id: "LHC",
      code: "LHC",
      name: "Lecture Hall Complex",
      shortName: "LHC",
      floorsCount: 5,
      floors: [
        { id: 1, label: "Floor 1", code: "LHC-1", rooms: "101–109" },
        { id: 2, label: "Floor 2", code: "LHC-2", rooms: "201–209" },
        { id: 3, label: "Floor 3", code: "LHC-3", rooms: "301–309" },
        { id: 4, label: "Floor 4", code: "LHC-4", rooms: "401–409" },
        { id: 5, label: "Floor 5", code: "LHC-5", rooms: "501–509" }
      ],
      position: { x: -70.0, y: 0, z: 5.0 },
      floorHeight: 3.8,
      referencePhotos: [
        {
          src: "./public/reference/lhc-reference.jpg",
          title: "Lecture Hall Complex (Exterior View)",
          description: "5-Storey white concrete building with prominent left block, external sawtooth staircase, independent lift tower, and continuous front balcony corridors."
        }
      ],
      description: "Premier 5-storey lecture complex housing large tiered lecture classrooms, open-air balcony corridors, and external staircase architecture."
    },

    ATR: {
      id: "ATR",
      code: "ATR",
      name: "Atrium Building",
      shortName: "Atrium",
      floorsCount: 5,
      floors: [
        { id: 1, label: "Ground Floor", code: "ATR-GF", rooms: "ATR-GF-01..05, Labs 1-2, SAC" },
        { id: 2, label: "First Floor", code: "ATR-FF", rooms: "ATR-FF-01..05, Labs 3-4, Faculty" },
        { id: 3, label: "Second Floor", code: "ATR-SF", rooms: "ATR-SF-01..05, Labs 5-6, Business School" },
        { id: 4, label: "Third Floor", code: "ATR-TF", rooms: "ATR-TF-01..05, Labs 7-8, BS Library" },
        { id: 5, label: "Fourth Floor", code: "ATR-FOF", rooms: "ATR-FOF-01..05, Labs 9-11, Cineplex" }
      ],
      position: { x: 35.0, y: 0, z: -45.0 },
      floorHeight: 4.0,
      referencePhotos: [
        {
          src: "./public/reference/atrium-reference-1.png",
          title: "Atrium Building (Side Perspective)",
          description: "5-Storey building with curved blue curtain glass facade, cream-white wings, triple-slot vertical windows, and grand entrance portico."
        },
        {
          src: "./public/reference/atrium-reference-2.png",
          title: "Atrium Building (Front Elevation)",
          description: "Curved blue glazed atrium center with 'ATRIUM' signage, cylindrical entrance columns, grand staircase, and decorative palm trees."
        }
      ],
      description: "Landmark 5-storey academic facility featuring a monumental curved blue curtain glass facade, grand portico, 25 classrooms, 11 labs, Business School, BS Library, and the Stephen Hawking Cineplex."
    },

    GAL: {
      id: "GAL",
      code: "GAL",
      name: "Galleria Building",
      shortName: "Galleria",
      floorsCount: 4,
      floors: [
        { id: 1, label: "Ground Floor", code: "GAL-GF", rooms: "GAL-GF-LH1..3, 250-Seat Auditorium" },
        { id: 2, label: "First Floor", code: "GAL-FF", rooms: "GAL-FF-LH4..6, HPC Supercomputing Lab" },
        { id: 3, label: "Second Floor", code: "GAL-SF", rooms: "GAL-SF-LH7..9, IBM Centre of Excellence" },
        { id: 4, label: "Third Floor", code: "GAL-TF", rooms: "GAL-TF-LH10..12, NTCS Consultancy" }
      ],
      position: { x: 45.0, y: 0, z: 50.0 },
      floorHeight: 4.2,
      referencePhotos: [
        {
          src: "./public/reference/galleria-reference.jpg",
          title: "Galleria Building (Aerial Architectural View)",
          description: "4-Storey curvilinear academic complex with terracotta/brick-red facade, white horizontal banding, central curved dark-blue glass atrium, cylindrical spiral staircase towers with blue rings, and castellated roof parapet."
        }
      ],
      description: "Iconic 4-storey curvilinear building finished in terracotta brick with white accents, housing the 250-Seat Grand Auditorium, High Performance Computing Lab, IBM Centre of Excellence, and NTCS."
    }
  }
};

/**
 * Atrium Building Facilities & Room Data
 * 25 Classrooms, 11 Labs, 13 Faculty Rooms, SAC, Business School, BS Library, Stephen Hawking Cineplex
 */
export function generateAtriumRooms() {
  const rooms = [];

  // Ground Floor (ATR-GF)
  rooms.push(
    {
      id: "ATR-GF-SAC",
      number: "ATR-GF-SAC",
      name: "Student Activities Centre (SAC)",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 1,
      floorLabel: "Ground Floor (ATR-GF)",
      category: "Recreational & Activities Hub",
      capacity: 150,
      wing: "Central Galleria / South Bay",
      isSpecial: true,
      icon: "🎭",
      features: ["Multipurpose Hall", "Student Club Desks", "Indoor Games", "Sound System"],
      fansCount: 8,
      lightsCount: 12,
      acUnits: 4,
      position: { x: 0, z: 4.0 },
      size: { w: 18.0, d: 8.5 }
    },
    {
      id: "ATR-GF-LAB1",
      number: "ATR-GF-LAB1",
      name: "Basic Electronics & Circuit Lab",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 1,
      floorLabel: "Ground Floor (ATR-GF)",
      category: "Specialized Laboratory",
      capacity: 45,
      wing: "West Wing",
      icon: "⚡",
      features: ["CRO Oscilloscopes", "Function Generators", "Breadboard Stations", "Safety Breakers"],
      fansCount: 6,
      lightsCount: 8,
      position: { x: -18.0, z: -4.0 },
      size: { w: 10.5, d: 8.5 }
    },
    {
      id: "ATR-GF-LAB2",
      number: "ATR-GF-LAB2",
      name: "Applied Physics Research Lab",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 1,
      floorLabel: "Ground Floor (ATR-GF)",
      category: "Specialized Laboratory",
      capacity: 45,
      wing: "West Wing",
      icon: "🔬",
      features: ["Laser Optics Bench", "Spectrometer Stations", "Dark Room Chamber"],
      fansCount: 6,
      lightsCount: 8,
      position: { x: -18.0, z: 5.5 },
      size: { w: 10.5, d: 8.5 }
    }
  );

  // Classrooms for Ground Floor: ATR-GF-01 .. ATR-GF-05
  for (let c = 1; c <= 5; c++) {
    rooms.push({
      id: `ATR-GF-0${c}`,
      number: `ATR-GF-0${c}`,
      name: `Atrium Lecture Room GF-0${c}`,
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 1,
      floorLabel: "Ground Floor (ATR-GF)",
      category: "Smart Academic Classroom",
      capacity: 60,
      wing: "East Wing",
      icon: "📚",
      features: ["Interactive Smartboard", "6 Ceiling Fans", "6 LED Luminaires", "Podium"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 12.0 + (c - 1) * 3.5 - 7.0, z: (c % 2 === 0 ? 5.5 : -4.0) },
      size: { w: 7.2, d: 8.2 }
    });
  }

  // First Floor (ATR-FF): ATR-FF-01..05, Labs 3-4, Faculty Cabins
  rooms.push(
    {
      id: "ATR-FF-LAB1",
      number: "ATR-FF-LAB1",
      name: "Data Structures & Algorithms Lab",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 2,
      floorLabel: "First Floor (ATR-FF)",
      category: "Computer Laboratory",
      capacity: 50,
      wing: "West Wing",
      icon: "💻",
      features: ["50 High-End Workstations", "Gigabit LAN", "Central Projection", "Dual AC"],
      fansCount: 6,
      lightsCount: 10,
      acUnits: 3,
      position: { x: -18.0, z: -4.0 },
      size: { w: 10.5, d: 8.5 }
    },
    {
      id: "ATR-FF-LAB2",
      number: "ATR-FF-LAB2",
      name: "AI & Machine Learning Studio",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 2,
      floorLabel: "First Floor (ATR-FF)",
      category: "Advanced Research Lab",
      capacity: 45,
      wing: "West Wing",
      icon: "🤖",
      features: ["GPU Workstations (RTX 4090)", "Tensorflow/PyTorch Cluster", "Smart Display"],
      fansCount: 6,
      lightsCount: 8,
      acUnits: 2,
      position: { x: -18.0, z: 5.5 },
      size: { w: 10.5, d: 8.5 }
    }
  );

  for (let c = 1; c <= 5; c++) {
    rooms.push({
      id: `ATR-FF-0${c}`,
      number: `ATR-FF-0${c}`,
      name: `Atrium Lecture Room FF-0${c}`,
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 2,
      floorLabel: "First Floor (ATR-FF)",
      category: "Smart Academic Classroom",
      capacity: 60,
      wing: "East Wing",
      icon: "📚",
      features: ["Projector", "Acoustic Wall Panels", "6 Fans", "6 LED Fixtures"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 12.0 + (c - 1) * 3.5 - 7.0, z: (c % 2 === 0 ? 5.5 : -4.0) },
      size: { w: 7.2, d: 8.2 }
    });
  }

  // Second Floor (ATR-SF): ATR-SF-01..05, Labs 5-6, NIST Business School
  rooms.push(
    {
      id: "ATR-SF-BIZ",
      number: "ATR-SF-BIZ",
      name: "NIST Business School Executive Wing",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 3,
      floorLabel: "Second Floor (ATR-SF)",
      category: "Management & Executive Studies",
      capacity: 80,
      wing: "Central Atrium Gallery",
      isSpecial: true,
      icon: "💼",
      features: ["Executive Case-Study Hall", "Corporate Boardroom", "Faculty Consultation"],
      fansCount: 6,
      lightsCount: 10,
      acUnits: 4,
      position: { x: 0, z: 7.5 },
      size: { w: 17.0, d: 9.0 }
    },
    {
      id: "ATR-SF-LAB1",
      number: "ATR-SF-LAB1",
      name: "IoT & Embedded Systems Lab",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 3,
      floorLabel: "Second Floor (ATR-SF)",
      category: "Specialized Laboratory",
      capacity: 45,
      wing: "West Wing",
      icon: "📡",
      features: ["ARM/ESP32 Development Kits", "Sensor Arrays", "Soldering & Prototyping"],
      fansCount: 6,
      lightsCount: 8,
      position: { x: -18.0, z: -4.0 },
      size: { w: 10.5, d: 8.5 }
    },
    {
      id: "ATR-SF-LAB2",
      number: "ATR-SF-LAB2",
      name: "VLSI Design & Microelectronics Lab",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 3,
      floorLabel: "Second Floor (ATR-SF)",
      category: "Specialized Laboratory",
      capacity: 40,
      wing: "West Wing",
      icon: "🎛️",
      features: ["Cadence/Synopsys EDA Tools", "FPGA Boards", "Logic Analyzers"],
      fansCount: 6,
      lightsCount: 8,
      position: { x: -18.0, z: 5.5 },
      size: { w: 10.5, d: 8.5 }
    }
  );

  for (let c = 1; c <= 5; c++) {
    rooms.push({
      id: `ATR-SF-0${c}`,
      number: `ATR-SF-0${c}`,
      name: `Atrium Lecture Room SF-0${c}`,
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 3,
      floorLabel: "Second Floor (ATR-SF)",
      category: "Smart Academic Classroom",
      capacity: 60,
      wing: "East Wing",
      icon: "📚",
      features: ["Projector", "Tiered Desks", "6 Fans", "6 Lights"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 12.0 + (c - 1) * 3.5 - 7.0, z: (c % 2 === 0 ? 5.5 : -4.0) },
      size: { w: 7.2, d: 8.2 }
    });
  }

  // Third Floor (ATR-TF): ATR-TF-01..05, Labs 7-8, Business School Library
  rooms.push(
    {
      id: "ATR-TF-LIB",
      number: "ATR-TF-LIB",
      name: "Business School Library & Research Hall",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 4,
      floorLabel: "Third Floor (ATR-TF)",
      category: "Academic Library & Archives",
      capacity: 120,
      wing: "North Central Atrium",
      isSpecial: true,
      icon: "📖",
      features: ["Journal & Thesis Repository", "Silent Study Carrels", "E-Library OPAC Terminals", "Librarian Desk"],
      fansCount: 8,
      lightsCount: 14,
      acUnits: 4,
      position: { x: 0, z: 7.5 },
      size: { w: 17.5, d: 9.0 }
    },
    {
      id: "ATR-TF-LAB1",
      number: "ATR-TF-LAB1",
      name: "Cloud Computing & Cyber Security Lab",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 4,
      floorLabel: "Third Floor (ATR-TF)",
      category: "Computer Laboratory",
      capacity: 45,
      wing: "West Wing",
      icon: "☁️",
      features: ["Virtual Machine Clusters", "Pen-Testing Sandbox", "Isolated Network"],
      fansCount: 6,
      lightsCount: 8,
      position: { x: -18.0, z: -4.0 },
      size: { w: 10.5, d: 8.5 }
    },
    {
      id: "ATR-TF-LAB2",
      number: "ATR-TF-LAB2",
      name: "Robotics & Mechatronics Lab",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 4,
      floorLabel: "Third Floor (ATR-TF)",
      category: "Robotics Engineering",
      capacity: 40,
      wing: "West Wing",
      icon: "🦾",
      features: ["6-DOF Robotic Arms", "Pneumatic Test Benches", "3D Printers"],
      fansCount: 6,
      lightsCount: 8,
      position: { x: -18.0, z: 5.5 },
      size: { w: 10.5, d: 8.5 }
    }
  );

  for (let c = 1; c <= 5; c++) {
    rooms.push({
      id: `ATR-TF-0${c}`,
      number: `ATR-TF-0${c}`,
      name: `Atrium Lecture Room TF-0${c}`,
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 4,
      floorLabel: "Third Floor (ATR-TF)",
      category: "Smart Academic Classroom",
      capacity: 60,
      wing: "East Wing",
      icon: "📚",
      features: ["Interactive Display", "Tiered Desks", "6 Fans", "6 Lights"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 12.0 + (c - 1) * 3.5 - 7.0, z: (c % 2 === 0 ? 5.5 : -4.0) },
      size: { w: 7.2, d: 8.2 }
    });
  }

  // Fourth Floor (ATR-FOF): Stephen Hawking Cineplex, Labs 9-11, ATR-FOF-01..05
  rooms.push(
    {
      id: "ATR-FOF-CINEPLEX",
      number: "ATR-FOF-CINEPLEX",
      name: "Stephen Hawking Cineplex",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 5,
      floorLabel: "Fourth Floor (ATR-FOF)",
      category: "Digital Cinema & Seminar Theater",
      capacity: 140,
      wing: "Central Atrium Penthouse Bay",
      isSpecial: true,
      icon: "🎬",
      features: ["4K High-Lumen Projector", "7.1 Dolby Surround Audio", "Tiered Cinema Recliners", "Stage & Green Room"],
      fansCount: 4,
      lightsCount: 16,
      acUnits: 6,
      position: { x: 0, z: 7.0 },
      size: { w: 18.0, d: 9.5 }
    },
    {
      id: "ATR-FOF-LAB1",
      number: "ATR-FOF-LAB1",
      name: "Bioinformatics & Genomics Lab",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 5,
      floorLabel: "Fourth Floor (ATR-FOF)",
      category: "Specialized Laboratory",
      capacity: 40,
      wing: "West Wing",
      icon: "🧬",
      features: ["Sequence Alignment Workstations", "Blast Cluster Nodes", "Cold Storage"],
      fansCount: 6,
      lightsCount: 8,
      position: { x: -18.0, z: -4.0 },
      size: { w: 10.5, d: 8.5 }
    },
    {
      id: "ATR-FOF-LAB2",
      number: "ATR-FOF-LAB2",
      name: "Software Engineering Studio",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 5,
      floorLabel: "Fourth Floor (ATR-FOF)",
      category: "Software Development Studio",
      capacity: 45,
      wing: "West Wing",
      icon: "💻",
      features: ["Scrum Sprint Boards", "Dual-Monitor Desks", "CI/CD Test Benches"],
      fansCount: 6,
      lightsCount: 8,
      position: { x: -18.0, z: 5.5 },
      size: { w: 10.5, d: 8.5 }
    },
    {
      id: "ATR-FOF-LAB3",
      number: "ATR-FOF-LAB3",
      name: "Advanced Innovation & Maker Space",
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 5,
      floorLabel: "Fourth Floor (ATR-FOF)",
      category: "Innovation Lab",
      capacity: 35,
      wing: "East Wing North",
      icon: "🚀",
      features: ["Laser Cutters", "PCB Prototyping", "Drone Testing Net"],
      fansCount: 6,
      lightsCount: 8,
      position: { x: 18.0, z: -4.0 },
      size: { w: 9.5, d: 8.5 }
    }
  );

  for (let c = 1; c <= 5; c++) {
    rooms.push({
      id: `ATR-FOF-0${c}`,
      number: `ATR-FOF-0${c}`,
      name: `Atrium Lecture Room FOF-0${c}`,
      building: "ATR",
      buildingName: "Atrium Building",
      floor: 5,
      floorLabel: "Fourth Floor (ATR-FOF)",
      category: "Smart Academic Classroom",
      capacity: 60,
      wing: "East Wing",
      icon: "📚",
      features: ["Interactive Display", "Tiered Desks", "6 Fans", "6 Lights"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 12.0 + (c - 1) * 3.5 - 7.0, z: (c % 2 === 0 ? 5.5 : 1.0) },
      size: { w: 7.2, d: 8.2 }
    });
  }

  // 13 Faculty Cabins distributed across floors
  const facultyList = [
    { floor: 1, id: "ATR-GF-FAC1", name: "HOD Office • Basic Sciences", x: -8.0, z: -5.0 },
    { floor: 1, id: "ATR-GF-FAC2", name: "Faculty Cabin • Mathematics", x: -4.0, z: -5.0 },
    { floor: 2, id: "ATR-FF-FAC1", name: "HOD Office • Computer Science & Engg", x: -8.0, z: -5.0 },
    { floor: 2, id: "ATR-FF-FAC2", name: "Professor Cabin • AI & Machine Learning", x: -4.0, z: -5.0 },
    { floor: 2, id: "ATR-FF-FAC3", name: "Senior Faculty • Systems & Networks", x: 4.0, z: -5.0 },
    { floor: 3, id: "ATR-SF-FAC1", name: "Dean Office • NIST Business School", x: -8.0, z: -5.0 },
    { floor: 3, id: "ATR-SF-FAC2", name: "Faculty Cabin • Financial Management", x: -4.0, z: -5.0 },
    { floor: 3, id: "ATR-SF-FAC3", name: "Faculty Cabin • Marketing & Analytics", x: 4.0, z: -5.0 },
    { floor: 4, id: "ATR-TF-FAC1", name: "HOD Office • Electronics & Comm Engg", x: -8.0, z: -5.0 },
    { floor: 4, id: "ATR-TF-FAC2", name: "Professor Cabin • VLSI & Embedded", x: -4.0, z: -5.0 },
    { floor: 4, id: "ATR-TF-FAC3", name: "Research Scholar Consultation Room", x: 4.0, z: -5.0 },
    { floor: 5, id: "ATR-FOF-FAC1", name: "Dean Office • Research & Consultancy", x: -8.0, z: -5.0 },
    { floor: 5, id: "ATR-FOF-FAC2", name: "Faculty Cabin • Bio-Engineering", x: -4.0, z: -5.0 }
  ];

  facultyList.forEach(fac => {
    rooms.push({
      id: fac.id,
      number: fac.id,
      name: fac.name,
      building: "ATR",
      buildingName: "Atrium Building",
      floor: fac.floor,
      floorLabel: `Floor ${fac.floor} (ATR)`,
      category: "Faculty Office & Consultation",
      capacity: 6,
      wing: "Central Wing Corridor",
      icon: "👨‍🏫",
      features: ["Executive Desk", "Visitor Chairs", "Bookshelf", "Air Conditioning"],
      fansCount: 2,
      lightsCount: 4,
      acUnits: 1,
      position: { x: fac.x, z: fac.z },
      size: { w: 3.6, d: 4.2 }
    });
  });

  return rooms;
}

/**
 * Galleria Building Facilities & Room Data
 * 12 Lecture Halls, 250-Seat Auditorium, HPC Lab, IBM Centre for Excellence, NTCS
 */
export function generateGalleriaRooms() {
  const rooms = [];

  // Ground Floor: 250-Seat Grand Auditorium + 3 Lecture Halls
  rooms.push(
    {
      id: "GAL-AUD-250",
      number: "GAL-AUD-250",
      name: "Grand Auditorium (250 Capacity)",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 1,
      floorLabel: "Ground Floor (GAL-GF)",
      category: "Institutional Grand Auditorium",
      capacity: 250,
      wing: "West Curved Wing",
      isSpecial: true,
      icon: "🏛️",
      features: [
        "250 Tiered Velvet Auditorium Seats",
        "Elevated Keynote Stage with Teak Proscenium",
        "Twin High-Definition Laser Projectors",
        "Acoustic Baffle Wall Panelling",
        "Green Room & VIP Green Lounge",
        "Central HVAC Air Conditioning"
      ],
      fansCount: 8,
      lightsCount: 24,
      acUnits: 8,
      position: { x: -16.0, z: 0.0 },
      size: { w: 18.0, d: 15.0 }
    },
    {
      id: "GAL-GF-LH1",
      number: "GAL-GF-LH1",
      name: "Galleria Lecture Hall 01",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 1,
      floorLabel: "Ground Floor (GAL-GF)",
      category: "Large Lecture Theatre",
      capacity: 80,
      wing: "East Wing",
      icon: "📚",
      features: ["Tiered Stadium Seating", "Projector", "8 Fans", "8 Lights"],
      fansCount: 8,
      lightsCount: 8,
      position: { x: 10.0, z: -6.0 },
      size: { w: 9.0, d: 9.0 }
    },
    {
      id: "GAL-GF-LH2",
      number: "GAL-GF-LH2",
      name: "Galleria Lecture Hall 02",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 1,
      floorLabel: "Ground Floor (GAL-GF)",
      category: "Large Lecture Theatre",
      capacity: 80,
      wing: "East Wing",
      icon: "📚",
      features: ["Tiered Stadium Seating", "Projector", "8 Fans", "8 Lights"],
      fansCount: 8,
      lightsCount: 8,
      position: { x: 20.0, z: -6.0 },
      size: { w: 9.0, d: 9.0 }
    },
    {
      id: "GAL-GF-LH3",
      number: "GAL-GF-LH3",
      name: "Galleria Lecture Hall 03",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 1,
      floorLabel: "Ground Floor (GAL-GF)",
      category: "Large Lecture Theatre",
      capacity: 80,
      wing: "East Wing",
      icon: "📚",
      features: ["Tiered Stadium Seating", "Projector", "8 Fans", "8 Lights"],
      fansCount: 8,
      lightsCount: 8,
      position: { x: 15.0, z: 6.0 },
      size: { w: 9.0, d: 9.0 }
    }
  );

  // First Floor: High Performance Computing Lab + 3 Lecture Halls
  rooms.push(
    {
      id: "GAL-HPC-LAB",
      number: "GAL-HPC-LAB",
      name: "High Performance Computing (HPC) Lab",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 2,
      floorLabel: "First Floor (GAL-FF)",
      category: "Supercomputing & Data Centre",
      capacity: 60,
      wing: "West Wing (Upper Tier)",
      isSpecial: true,
      icon: "🖥️",
      features: [
        "12 Server Rack Enclosures (NVIDIA GPU Nodes)",
        "Precision Climate Control & Liquid Cooling",
        "40 High-Performance Workstation Terminals",
        "Direct Gigabit Internet & Redundant UPS Backup"
      ],
      fansCount: 6,
      lightsCount: 16,
      acUnits: 6,
      position: { x: -16.0, z: 0.0 },
      size: { w: 18.0, d: 15.0 }
    },
    {
      id: "GAL-FF-LH4",
      number: "GAL-FF-LH4",
      name: "Galleria Lecture Hall 04",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 2,
      floorLabel: "First Floor (GAL-FF)",
      category: "Lecture Hall",
      capacity: 75,
      wing: "East Wing",
      icon: "📚",
      features: ["Tiered Desks", "Smart Board", "6 Fans", "6 Lights"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 10.0, z: -6.0 },
      size: { w: 9.0, d: 9.0 }
    },
    {
      id: "GAL-FF-LH5",
      number: "GAL-FF-LH5",
      name: "Galleria Lecture Hall 05",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 2,
      floorLabel: "First Floor (GAL-FF)",
      category: "Lecture Hall",
      capacity: 75,
      wing: "East Wing",
      icon: "📚",
      features: ["Tiered Desks", "Smart Board", "6 Fans", "6 Lights"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 20.0, z: -6.0 },
      size: { w: 9.0, d: 9.0 }
    },
    {
      id: "GAL-FF-LH6",
      number: "GAL-FF-LH6",
      name: "Galleria Lecture Hall 06",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 2,
      floorLabel: "First Floor (GAL-FF)",
      category: "Lecture Hall",
      capacity: 75,
      wing: "East Wing",
      icon: "📚",
      features: ["Tiered Desks", "Smart Board", "6 Fans", "6 Lights"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 15.0, z: 6.0 },
      size: { w: 9.0, d: 9.0 }
    }
  );

  // Second Floor: IBM Centre for Excellence + 3 Lecture Halls
  rooms.push(
    {
      id: "GAL-IBM-COE",
      number: "GAL-IBM-COE",
      name: "IBM Centre for Excellence",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 3,
      floorLabel: "Second Floor (GAL-SF)",
      category: "Industry Collaboration Center",
      capacity: 70,
      wing: "West Wing",
      isSpecial: true,
      icon: "🌐",
      features: [
        "IBM Cloud & Enterprise Software Suite",
        "Collaborative Pod Workstations",
        "Video Conferencing & Keynote Screen",
        "Certification Examination Center"
      ],
      fansCount: 6,
      lightsCount: 14,
      acUnits: 5,
      position: { x: -16.0, z: 0.0 },
      size: { w: 18.0, d: 15.0 }
    },
    {
      id: "GAL-SF-LH7",
      number: "GAL-SF-LH7",
      name: "Galleria Lecture Hall 07",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 3,
      floorLabel: "Second Floor (GAL-SF)",
      category: "Lecture Hall",
      capacity: 75,
      wing: "East Wing",
      icon: "📚",
      features: ["Tiered Desks", "Projector", "6 Fans", "6 Lights"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 10.0, z: -6.0 },
      size: { w: 9.0, d: 9.0 }
    },
    {
      id: "GAL-SF-LH8",
      number: "GAL-SF-LH8",
      name: "Galleria Lecture Hall 08",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 3,
      floorLabel: "Second Floor (GAL-SF)",
      category: "Lecture Hall",
      capacity: 75,
      wing: "East Wing",
      icon: "📚",
      features: ["Tiered Desks", "Projector", "6 Fans", "6 Lights"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 20.0, z: -6.0 },
      size: { w: 9.0, d: 9.0 }
    },
    {
      id: "GAL-SF-LH9",
      number: "GAL-SF-LH9",
      name: "Galleria Lecture Hall 09",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 3,
      floorLabel: "Second Floor (GAL-SF)",
      category: "Lecture Hall",
      capacity: 75,
      wing: "East Wing",
      icon: "📚",
      features: ["Tiered Desks", "Projector", "6 Fans", "6 Lights"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 15.0, z: 6.0 },
      size: { w: 9.0, d: 9.0 }
    }
  );

  // Third Floor: NIST Technology Consultancy Services (NTCS) + 3 Lecture Halls
  rooms.push(
    {
      id: "GAL-NTCS",
      number: "GAL-NTCS",
      name: "NIST Technology Consultancy Services (NTCS)",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 4,
      floorLabel: "Third Floor (GAL-TF)",
      category: "Industry Consultancy & Incubation",
      capacity: 65,
      wing: "West Wing",
      isSpecial: true,
      icon: "💡",
      features: [
        "Client Briefing & Negotiation Suite",
        "R&D Incubation Project Workspaces",
        "Patent & IPR Documentation Cell",
        "High-Speed Fiber Connectivity"
      ],
      fansCount: 6,
      lightsCount: 14,
      acUnits: 4,
      position: { x: -16.0, z: 0.0 },
      size: { w: 18.0, d: 15.0 }
    },
    {
      id: "GAL-TF-LH10",
      number: "GAL-TF-LH10",
      name: "Galleria Lecture Hall 10",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 4,
      floorLabel: "Third Floor (GAL-TF)",
      category: "Lecture Hall",
      capacity: 75,
      wing: "East Wing",
      icon: "📚",
      features: ["Tiered Desks", "Projector", "6 Fans", "6 Lights"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 10.0, z: -6.0 },
      size: { w: 9.0, d: 9.0 }
    },
    {
      id: "GAL-TF-LH11",
      number: "GAL-TF-LH11",
      name: "Galleria Lecture Hall 11",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 4,
      floorLabel: "Third Floor (GAL-TF)",
      category: "Lecture Hall",
      capacity: 75,
      wing: "East Wing",
      icon: "📚",
      features: ["Tiered Desks", "Projector", "6 Fans", "6 Lights"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 20.0, z: -6.0 },
      size: { w: 9.0, d: 9.0 }
    },
    {
      id: "GAL-TF-LH12",
      number: "GAL-TF-LH12",
      name: "Galleria Lecture Hall 12",
      building: "GAL",
      buildingName: "Galleria Building",
      floor: 4,
      floorLabel: "Third Floor (GAL-TF)",
      category: "Lecture Hall",
      capacity: 75,
      wing: "East Wing",
      icon: "📚",
      features: ["Tiered Desks", "Projector", "6 Fans", "6 Lights"],
      fansCount: 6,
      lightsCount: 6,
      position: { x: 15.0, z: 6.0 },
      size: { w: 9.0, d: 9.0 }
    }
  );

  return rooms;
}

/**
 * Campus-Wide Washrooms Configuration
 */
export const CAMPUS_WASHROOMS = [
  // LHC Washrooms (Preserving original configuration)
  {
    id: "GIRLS_WASHROOM_F1",
    building: "LHC",
    buildingName: "Lecture Hall Complex",
    floor: 1,
    floorLabel: "Floor 1",
    name: "LHC Girls' Restroom (Floor 1)",
    wing: "West Concourse",
    position: { x: -26.0, y: 0.1, z: 6.8 },
    dimensions: { width: 5.6, depth: 10.5, height: 3.45 },
    fixtures: ["TAP_F1_01", "TAP_F1_02", "WC_F1_01", "WC_F1_02", "LIGHT_01", "EXHAUST_01"]
  },
  {
    id: "WASHROOM_F2",
    building: "LHC",
    buildingName: "Lecture Hall Complex",
    floor: 2,
    floorLabel: "Floor 2",
    name: "LHC Restroom (Floor 2)",
    wing: "West Concourse",
    position: { x: -26.0, y: 3.9, z: 6.8 },
    dimensions: { width: 5.6, depth: 10.5, height: 3.45 },
    fixtures: ["TAP_F2_01", "TAP_F2_02", "WC_F2_01", "WC_F2_02", "LIGHT_01", "EXHAUST_01"]
  },
  {
    id: "GIRLS_WASHROOM_F3",
    building: "LHC",
    buildingName: "Lecture Hall Complex",
    floor: 3,
    floorLabel: "Floor 3",
    name: "LHC Girls' Restroom (Floor 3)",
    wing: "East Wing",
    position: { x: 44.2, y: 7.7, z: 6.8 },
    dimensions: { width: 5.6, depth: 10.5, height: 3.45 },
    fixtures: ["TAP_F3_01", "TAP_F3_02", "WC_F3_01", "WC_F3_02", "LIGHT_01", "EXHAUST_01"]
  },
  {
    id: "FACULTY_WASHROOM_F3",
    building: "LHC",
    buildingName: "Lecture Hall Complex",
    floor: 3,
    floorLabel: "Floor 3",
    name: "LHC Faculty Restroom (Floor 3)",
    wing: "West Concourse",
    position: { x: -26.0, y: 7.7, z: 6.8 },
    dimensions: { width: 5.6, depth: 10.5, height: 3.45 },
    fixtures: ["TAP_F3_FAC", "WC_F3_FAC", "LIGHT_01", "EXHAUST_01"]
  },
  {
    id: "WASHROOM_F4",
    building: "LHC",
    buildingName: "Lecture Hall Complex",
    floor: 4,
    floorLabel: "Floor 4",
    name: "LHC Restroom (Floor 4)",
    wing: "West Concourse",
    position: { x: -26.0, y: 11.5, z: 6.8 },
    dimensions: { width: 5.6, depth: 10.5, height: 3.45 },
    fixtures: ["TAP_F4_01", "TAP_F4_02", "WC_F4_01", "WC_F4_02", "LIGHT_01", "EXHAUST_01"]
  },
  {
    id: "WASHROOM_F5",
    building: "LHC",
    buildingName: "Lecture Hall Complex",
    floor: 5,
    floorLabel: "Floor 5",
    name: "LHC Restroom (Floor 5)",
    wing: "West Concourse",
    position: { x: -26.0, y: 15.3, z: 6.8 },
    dimensions: { width: 5.6, depth: 10.5, height: 3.45 },
    fixtures: ["TAP_F5_01", "TAP_F5_02", "WC_F5_01", "WC_F5_02", "LIGHT_01", "EXHAUST_01"]
  },

  // Atrium Building Washrooms (Floors GF to FOF)
  {
    id: "ATR_WASHROOM_GF",
    building: "ATR",
    buildingName: "Atrium Building",
    floor: 1,
    floorLabel: "Ground Floor (ATR-GF)",
    name: "Atrium Ground Restroom",
    wing: "West Corridor",
    position: { x: -24.5, y: 0.3, z: 0.0 },
    dimensions: { width: 5.4, depth: 8.5, height: 3.6 },
    fixtures: ["ATR_TAP_GF_01", "ATR_TAP_GF_02", "ATR_WC_GF_01", "LIGHT_01", "EXHAUST_01"]
  },
  {
    id: "ATR_WASHROOM_FF",
    building: "ATR",
    buildingName: "Atrium Building",
    floor: 2,
    floorLabel: "First Floor (ATR-FF)",
    name: "Atrium Restroom (First Floor)",
    wing: "West Corridor",
    position: { x: -24.5, y: 0.3, z: 0.0 },
    dimensions: { width: 5.4, depth: 8.5, height: 3.6 },
    fixtures: ["ATR_TAP_FF_01", "ATR_TAP_FF_02", "ATR_WC_FF_01", "LIGHT_01", "EXHAUST_01"]
  },
  {
    id: "ATR_WASHROOM_SF",
    building: "ATR",
    buildingName: "Atrium Building",
    floor: 3,
    floorLabel: "Second Floor (ATR-SF)",
    name: "Atrium Business School Restroom",
    wing: "West Corridor",
    position: { x: -24.5, y: 0.3, z: 0.0 },
    dimensions: { width: 5.4, depth: 8.5, height: 3.6 },
    fixtures: ["ATR_TAP_SF_01", "ATR_TAP_SF_02", "ATR_WC_SF_01", "LIGHT_01", "EXHAUST_01"]
  },
  {
    id: "ATR_WASHROOM_TF",
    building: "ATR",
    buildingName: "Atrium Building",
    floor: 4,
    floorLabel: "Third Floor (ATR-TF)",
    name: "Atrium Library Level Restroom",
    wing: "West Corridor",
    position: { x: -24.5, y: 0.3, z: 0.0 },
    dimensions: { width: 5.4, depth: 8.5, height: 3.6 },
    fixtures: ["ATR_TAP_TF_01", "ATR_TAP_TF_02", "ATR_WC_TF_01", "LIGHT_01", "EXHAUST_01"]
  },
  {
    id: "ATR_WASHROOM_FOF",
    building: "ATR",
    buildingName: "Atrium Building",
    floor: 5,
    floorLabel: "Fourth Floor (ATR-FOF)",
    name: "Atrium Cineplex Level Restroom",
    wing: "West Corridor",
    position: { x: -24.5, y: 0.3, z: 0.0 },
    dimensions: { width: 5.4, depth: 8.5, height: 3.6 },
    fixtures: ["ATR_TAP_FOF_01", "ATR_TAP_FOF_02", "ATR_WC_FOF_01", "LIGHT_01", "EXHAUST_01"]
  },

  // Galleria Building Washrooms (Floors GF to TF)
  {
    id: "GAL_WASHROOM_GF",
    building: "GAL",
    buildingName: "Galleria Building",
    floor: 1,
    floorLabel: "Ground Floor (GAL-GF)",
    name: "Galleria Auditorium Restroom",
    wing: "Central Lobby",
    position: { x: 0.0, y: 0.3, z: -4.0 },
    dimensions: { width: 5.4, depth: 7.0, height: 3.6 },
    fixtures: ["GAL_TAP_GF_01", "GAL_TAP_GF_02", "GAL_WC_GF_01", "LIGHT_01", "EXHAUST_01"]
  },
  {
    id: "GAL_WASHROOM_FF",
    building: "GAL",
    buildingName: "Galleria Building",
    floor: 2,
    floorLabel: "First Floor (GAL-FF)",
    name: "Galleria HPC Lab Level Restroom",
    wing: "Central Lobby",
    position: { x: 0.0, y: 0.3, z: -4.0 },
    dimensions: { width: 5.4, depth: 7.0, height: 3.6 },
    fixtures: ["GAL_TAP_FF_01", "GAL_TAP_FF_02", "GAL_WC_FF_01", "LIGHT_01", "EXHAUST_01"]
  },
  {
    id: "GAL_WASHROOM_SF",
    building: "GAL",
    buildingName: "Galleria Building",
    floor: 3,
    floorLabel: "Second Floor (GAL-SF)",
    name: "Galleria IBM Centre Restroom",
    wing: "Central Lobby",
    position: { x: 0.0, y: 0.3, z: -4.0 },
    dimensions: { width: 5.4, depth: 7.0, height: 3.6 },
    fixtures: ["GAL_TAP_SF_01", "GAL_TAP_SF_02", "GAL_WC_SF_01", "LIGHT_01", "EXHAUST_01"]
  },
  {
    id: "GAL_WASHROOM_TF",
    building: "GAL",
    buildingName: "Galleria Building",
    floor: 4,
    floorLabel: "Third Floor (GAL-TF)",
    name: "Galleria NTCS Executive Restroom",
    wing: "Central Lobby",
    position: { x: 0.0, y: 0.3, z: -4.0 },
    dimensions: { width: 5.4, depth: 7.0, height: 3.6 },
    fixtures: ["GAL_TAP_TF_01", "GAL_TAP_TF_02", "GAL_WC_TF_01", "LIGHT_01", "EXHAUST_01"]
  }
];
