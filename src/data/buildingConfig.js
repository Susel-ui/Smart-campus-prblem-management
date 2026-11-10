/**
 * buildingConfig.js - Master Architectural & Dimensional Configuration for LHC
 * 
 * Configurable parameters for the Lecture Hall Complex (LHC) 3D model.
 * Distinguishes verified observations (from reference photograph & college specs)
 * from provisional/estimated engineering dimensions.
 */

export const BUILDING_CONFIG = {
  // General Metadata
  name: "Lecture Hall Complex",
  shortName: "LHC",
  description: "Five-storey premier academic and lecture facility with prominent left anchor block, open external staircases, and elongated academic wing.",
  referenceImage: "./public/reference/lhc-reference.jpg",
  dataAccuracy: {
    floorsCount: "verified",         // Exactly 5 storeys
    generalForm: "verified",         // Left main block + long academic wing + open staircase
    leftStaircase: "verified",       // Prominent external staircase visible on left in photo
    rightStaircase: "verified",      // Opposite-side staircase structure
    liftPosition: "verified",        // Independent passenger lift in front of left staircase
    colorPalette: "verified",        // White concrete, brown railings, dark teal trim
    totalFootprint: "estimated",     // Scaled proportionally to accommodate 60,000+ sq ft
    classroomDimensions: "estimated",// Scaled for ~60 capacity square lecture halls
    washroomExactCoords: "estimated" // Placed per provided floor guidelines
  },

  // Global Structural Dimensions (in 3D world meters)
  floorsCount: 5,
  floorHeight: 3.8,                  // 3.8m per floor
  slabThickness: 0.35,               // Concrete slab thickness
  parapetHeight: 1.1,                // Rooftop perimeter wall
  totalBuildingHeight: 20.1,         // Base to main roof slab top

  // Left Main Anchor Block Dimensions
  mainBlock: {
    width: 24.0,                     // X-axis span (-42 to -18)
    depth: 18.0,                     // Z-axis span (-8 to +10)
    centerX: -30.0,
    centerZ: 1.0,
    staircaseBayWidth: 8.5,          // Prominent open staircase facade
    rooftopPenthouseHeight: 3.8,     // Raised stairhead/machine room tower
    penthouseWidth: 10.0,
    penthouseDepth: 12.0
  },

  // Long Connected Academic Wing Dimensions
  academicWing: {
    width: 66.0,                     // X-axis span (-18 to +48)
    depth: 16.0,                     // Z-axis span (-8 to +8)
    centerX: 15.0,
    centerZ: 0.0,
    corridorWidth: 2.8,              // Open front balcony corridor width
    corridorOffsetZ: 6.6,            // Front edge of corridor
    columnSpacing: 6.0,              // Repeated structural column grid
    columnsCount: 11                 // 11 column bays along the facade
  },

  // Left-Side External Staircase (Staircase 1)
  leftStaircase: {
    id: "STAIRCASE_LEFT",
    name: "Main External Staircase (Left Wing)",
    position: { x: -33.5, y: 0, z: 2.5 },
    flightWidth: 2.2,
    landingDepth: 2.4,
    stepRise: 0.19,                  // Height per riser
    stepTread: 0.30,                 // Depth per step
    stepsPerFlight: 10,
    hasSawtoothSoffit: true,         // Stepped diagonal underside visible in photo
    railingColor: "#452718",         // Dark brown railing
    trimColor: "#115e59"             // Teal trim
  },

  // Opposite-Side Staircase (Staircase 2)
  rightStaircase: {
    id: "STAIRCASE_RIGHT",
    name: "East Wing Staircase (Right Wing)",
    position: { x: 49.5, y: 0, z: 0.0 },
    flightWidth: 2.0,
    landingDepth: 2.2,
    stepRise: 0.19,
    stepTread: 0.30,
    stepsPerFlight: 10,
    railingColor: "#452718"
  },

  // Independent Passenger Lift (LIFT_01)
  lift: {
    id: "LIFT_01",
    name: "Passenger Elevator Tower 01",
    // Positioned IN FRONT OF left staircase with distinct physical clearance (4.5m distance)
    position: { x: -33.5, y: 0, z: 13.5 },
    shaftDimensions: { width: 3.8, depth: 3.8, height: 21.0 },
    cabinDimensions: { width: 2.4, depth: 2.4, height: 2.7 },
    floorsServed: [1, 2, 3, 4, 5],
    defaultFloor: 1,
    travelSpeed: 2.5,               // meters per second simulated
    status: "Operational",
    description: "Independent exterior glazed elevator tower serving all five academic floors."
  },

  // Architectural Color Palette (Matched to Reference Photograph)
  colors: {
    concreteWhite: "#f8fafc",        // Crisp white exterior concrete
    concreteOffWhite: "#e2e8f0",     // Interior walls and underside soffits
    balconyTrimTeal: "#115e59",      // Distinctive blue-green/teal floor band trim
    balconyTrimDark: "#0f766e",
    railingBrown: "#452718",         // Dark brown railings visible on balconies and stairs
    railingMetal: "#3e2723",
    windowFrame: "#2e1a0f",          // Dark brown window frames and grilles
    glassWindow: "#8ba3b5",          // Glazed window reflection
    doorWood: "#8d5b32",             // Teak classroom doors
    floorSlab: "#cbd5e1",            // Concrete floor surface
    corridorTile: "#94a3b8",         // Polished exterior corridor tile
    columnColor: "#ffffff",          // Clean white structural columns
    roofGravel: "#64748b",           // Rooftop waterproof membrane
    grassField: "#385d38",           // Manicured campus lawns
    roadAsphalt: "#334155",          // Access driveway
    hedgeGreen: "#15803d"            // Dense conical shrubs
  },

  // Rooms Grid Template per Floor
  roomTypes: {
    LECTURE_HALL: {
      type: "lecture_hall",
      category: "Lecture Classroom",
      capacity: 60,
      fansCount: 6,
      lightsCount: 6,
      desksCount: 30, // 30 two-seater desks = 60 capacity
      hasPodium: true,
      hasProjector: true
    },
    SMART_CLASSROOM: {
      type: "smart_classroom",
      category: "Multimedia Smart Hall",
      capacity: 60,
      fansCount: 6,
      lightsCount: 8,
      desksCount: 30,
      hasPodium: true,
      hasProjector: true
    },
    LAB_SEMINAR: {
      type: "seminar_room",
      category: "Advanced Seminar & Tutorial",
      capacity: 45,
      fansCount: 6,
      lightsCount: 6,
      desksCount: 24,
      hasPodium: true,
      hasProjector: true
    }
  }
};

/**
 * Generates the full master database of classrooms for all 5 floors
 * with stable IDs and non-overlapping coordinates.
 */
export function generateRoomsData() {
  const rooms = [];
  const floors = [1, 2, 3, 4, 5];

  // Room placement layout across the X-axis:
  // Sits between West Washroom (X = -26) and East Washroom (X = +44.2):
  // All classrooms have width 6.8m and depth 10.5m
  const roomXPositions = [
    { numSuffix: "01", x: -19.5, z: -1.0, width: 6.8, depth: 10.5, type: "SMART_CLASSROOM", wing: "Main Anchor Block (West)" },
    { numSuffix: "02", x: -12.0, z: -1.0, width: 6.8, depth: 10.5, type: "LECTURE_HALL", wing: "Academic Wing - Bay 1" },
    { numSuffix: "03", x:  -5.0, z: -1.0, width: 6.8, depth: 10.5, type: "LECTURE_HALL", wing: "Academic Wing - Bay 2" },
    { numSuffix: "04", x:   2.0, z: -1.0, width: 6.8, depth: 10.5, type: "LECTURE_HALL", wing: "Academic Wing - Bay 3" },
    { numSuffix: "05", x:   9.0, z: -1.0, width: 6.8, depth: 10.5, type: "LECTURE_HALL", wing: "Academic Wing - Bay 4" },
    { numSuffix: "06", x:  16.0, z: -1.0, width: 6.8, depth: 10.5, type: "LECTURE_HALL", wing: "Academic Wing - Bay 5" },
    { numSuffix: "07", x:  23.0, z: -1.0, width: 6.8, depth: 10.5, type: "LECTURE_HALL", wing: "Academic Wing - Bay 6" },
    { numSuffix: "08", x:  30.0, z: -1.0, width: 6.8, depth: 10.5, type: "LECTURE_HALL", wing: "Academic Wing - Bay 7" },
    { numSuffix: "09", x:  37.0, z: -1.0, width: 6.8, depth: 10.5, type: "LAB_SEMINAR",  wing: "Academic Wing - East Wing" }
  ];

  floors.forEach(floorNum => {
    const floorY = (floorNum - 1) * BUILDING_CONFIG.floorHeight;

    roomXPositions.forEach(slot => {
      const roomNumber = `${floorNum}${slot.numSuffix}`;
      const template = BUILDING_CONFIG.roomTypes[slot.type];

      rooms.push({
        id: `ROOM_${roomNumber}`,
        number: roomNumber,
        floor: floorNum,
        floorLabel: `Floor ${floorNum}`,
        elevationY: floorY,
        name: `Lecture Hall ${roomNumber}`,
        wing: slot.wing,
        type: template.type,
        category: template.category,
        capacity: template.capacity,
        dimensions: {
          width: slot.width,
          depth: slot.depth,
          height: BUILDING_CONFIG.floorHeight - BUILDING_CONFIG.slabThickness
        },
        position: {
          x: slot.x,
          y: floorY + BUILDING_CONFIG.slabThickness,
          z: slot.z
        },
        fansCount: template.fansCount,
        lightsCount: template.lightsCount,
        desksCount: template.desksCount,
        hasPodium: template.hasPodium,
        hasProjector: template.hasProjector,
        dataAccuracy: "estimated_coordinates"
      });
    });
  });

  return rooms;
}

/**
 * Designated Washrooms across Floors 1 to 5.
 * Strictly positioned along the corridor with no classroom overlap.
 * Uses internal software identifiers (no official room numbers).
 */
export const WASHROOMS_CONFIG = [
  // --- FLOOR 1 (GROUND FLOOR) ---
  {
    id: "GIRLS_WASHROOM_F1",
    floor: 1,
    name: "Girls' Washroom (Floor 1)",
    wing: "West Concourse",
    position: { x: -26.0, y: 0.35, z: -1.0 },
    dimensions: { width: 5.6, depth: 10.5, height: 3.45 },
    verifiedStatus: "verified_floor_confirmed",
    fixtures: [
      { id: "TAP_F1_01", type: "tap", name: "Washbasin Tap 1" },
      { id: "TAP_F1_02", type: "tap", name: "Washbasin Tap 2" },
      { id: "LIGHT_F1_W01", type: "light", name: "Ceiling Luminaire" },
      { id: "EXHAUST_F1_01", type: "exhaust_fan", name: "Ventilation Exhaust" }
    ]
  },
  {
    id: "WASHROOM_F1_EAST",
    floor: 1,
    name: "East Restroom (Floor 1)",
    wing: "East Wing Concourse",
    position: { x: 44.2, y: 0.35, z: -1.0 },
    dimensions: { width: 5.2, depth: 10.5, height: 3.45 },
    verifiedStatus: "provisional_confirmed_floor",
    fixtures: [
      { id: "TAP_F1_E01", type: "tap", name: "Washbasin Tap 1" },
      { id: "LIGHT_F1_E01", type: "light", name: "Ceiling Light" }
    ]
  },

  // --- FLOOR 2 ---
  {
    id: "WASHROOM_F2",
    floor: 2,
    name: "General Washroom (Floor 2)",
    wing: "West Concourse",
    position: { x: -26.0, y: 3.8 + 0.35, z: -1.0 },
    dimensions: { width: 5.6, depth: 10.5, height: 3.45 },
    verifiedStatus: "provisional_confirmed_floor",
    fixtures: [
      { id: "TAP_F2_01", type: "tap", name: "Washbasin Tap 1" },
      { id: "TAP_F2_02", type: "tap", name: "Washbasin Tap 2" },
      { id: "LIGHT_F2_W01", type: "light", name: "Ceiling Light" },
      { id: "EXHAUST_F2_01", type: "exhaust_fan", name: "Exhaust Fan" }
    ]
  },
  {
    id: "WASHROOM_F2_EAST",
    floor: 2,
    name: "East Restroom (Floor 2)",
    wing: "East Wing Concourse",
    position: { x: 44.2, y: 3.8 + 0.35, z: -1.0 },
    dimensions: { width: 5.2, depth: 10.5, height: 3.45 },
    verifiedStatus: "provisional_confirmed_floor",
    fixtures: [
      { id: "TAP_F2_E01", type: "tap", name: "Washbasin Tap 1" }
    ]
  },

  // --- FLOOR 3 ---
  {
    id: "FACULTY_WASHROOM_F3",
    floor: 3,
    name: "Faculty & Staff Washroom (Floor 3)",
    wing: "West Concourse",
    position: { x: -26.0, y: 7.6 + 0.35, z: -1.0 },
    dimensions: { width: 5.6, depth: 10.5, height: 3.45 },
    verifiedStatus: "verified_floor_confirmed",
    fixtures: [
      { id: "TAP_F3_FAC_01", type: "tap", name: "Executive Washbasin Tap" },
      { id: "LIGHT_F3_FAC_01", type: "light", name: "Warm LED Fixture" },
      { id: "EXHAUST_F3_FAC_01", type: "exhaust_fan", name: "Ventilation Exhaust" }
    ]
  },
  {
    id: "GIRLS_WASHROOM_F3",
    floor: 3,
    name: "Girls' Washroom (Floor 3 - near Room 309)",
    wing: "East Wing Corridor (Adjacent to Room 309)",
    position: { x: 44.2, y: 7.6 + 0.35, z: -1.0 },
    dimensions: { width: 5.2, depth: 10.5, height: 3.45 },
    verifiedStatus: "verified_location_confirmed", // specifically near 309 per prompt!
    fixtures: [
      { id: "TAP_F3_01", type: "tap", name: "Washbasin Tap 1" },
      { id: "TAP_F3_02", type: "tap", name: "Washbasin Tap 2" },
      { id: "LIGHT_F3_W01", type: "light", name: "Main Light" },
      { id: "EXHAUST_F3_01", type: "exhaust_fan", name: "Ventilation Exhaust" }
    ]
  },

  // --- FLOOR 4 ---
  {
    id: "WASHROOM_F4",
    floor: 4,
    name: "General Washroom (Floor 4)",
    wing: "West Concourse",
    position: { x: -26.0, y: 11.4 + 0.35, z: -1.0 },
    dimensions: { width: 5.6, depth: 10.5, height: 3.45 },
    verifiedStatus: "estimated_position",
    fixtures: [
      { id: "TAP_F4_01", type: "tap", name: "Washbasin Tap" },
      { id: "LIGHT_F4_W01", type: "light", name: "Ceiling Light" }
    ]
  },
  {
    id: "WASHROOM_F4_EAST",
    floor: 4,
    name: "East Restroom (Floor 4)",
    wing: "East Wing Concourse",
    position: { x: 44.2, y: 11.4 + 0.35, z: -1.0 },
    dimensions: { width: 5.2, depth: 10.5, height: 3.45 },
    verifiedStatus: "estimated_position",
    fixtures: [
      { id: "TAP_F4_E01", type: "tap", name: "Washbasin Tap" }
    ]
  },

  // --- FLOOR 5 (TOP FLOOR) ---
  {
    id: "WASHROOM_F5",
    floor: 5,
    name: "Top Floor Washroom (Floor 5)",
    wing: "West Concourse",
    position: { x: -26.0, y: 15.2 + 0.35, z: -1.0 },
    dimensions: { width: 5.6, depth: 10.5, height: 3.45 },
    verifiedStatus: "provisional_confirmed_floor",
    fixtures: [
      { id: "TAP_F5_01", type: "tap", name: "Washbasin Tap" },
      { id: "LIGHT_F5_W01", type: "light", name: "Ceiling Light" },
      { id: "EXHAUST_F5_01", type: "exhaust_fan", name: "Exhaust Fan" }
    ]
  },
  {
    id: "WASHROOM_F5_EAST",
    floor: 5,
    name: "East Restroom (Floor 5)",
    wing: "East Wing Concourse",
    position: { x: 44.2, y: 15.2 + 0.35, z: -1.0 },
    dimensions: { width: 5.2, depth: 10.5, height: 3.45 },
    verifiedStatus: "provisional_confirmed_floor",
    fixtures: [
      { id: "TAP_F5_E01", type: "tap", name: "Washbasin Tap" }
    ]
  }
];
