/**
 * Staircase.js - Modular Multi-Floor Concrete Staircase Generator
 * 
 * Accurately reproduces:
 * - Prominent external open staircase visible in the reference photograph
 * - Multiple flights and intermediate landings connecting all 5 floors
 * - Distinctive stepped / sawtooth underside concrete profile
 * - Dark brown vertical railings & handrails
 * - White supporting structural columns and stringer beams
 */

import * as THREE from 'three';
import { BUILDING_CONFIG } from '../data/buildingConfig.js';

let concreteMat = null;
let railingMat = null;
let stepMat = null;

function getStairMaterials() {
  if (!concreteMat) {
    concreteMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.6,
      metalness: 0.1
    });
    railingMat = new THREE.MeshStandardMaterial({
      color: 0x452718, // dark brown architectural railing from photo
      metalness: 0.7,
      roughness: 0.3
    });
    stepMat = new THREE.MeshStandardMaterial({
      color: 0xd9e2ec,
      roughness: 0.5
    });
  }
  return { concreteMat, railingMat, stepMat };
}

/**
 * Builds a single flight of stairs with steps, sawtooth soffit, and railing
 */
function buildFlight({ width, numSteps, stepRise, stepTread, direction = 1 }) {
  const flightGroup = new THREE.Group();
  const { concreteMat, railingMat, stepMat } = getStairMaterials();

  const totalLength = numSteps * stepTread;
  const totalHeight = numSteps * stepRise;

  // 1. Individual solid step treads & risers
  const stepGeo = new THREE.BoxGeometry(width, stepRise, stepTread);

  for (let i = 0; i < numSteps; i++) {
    const stepMesh = new THREE.Mesh(stepGeo, stepMat);
    stepMesh.position.set(
      0,
      i * stepRise + stepRise / 2,
      (i * stepTread + stepTread / 2) * direction
    );
    stepMesh.castShadow = true;
    stepMesh.receiveShadow = true;
    flightGroup.add(stepMesh);
  }

  // 2. Sawtooth / Stepped concrete soffit underneath (recreates the photo's visible zig-zag underside)
  const soffitThickness = 0.14;
  const soffitGeo = new THREE.BoxGeometry(width, soffitThickness, stepTread);
  for (let i = 0; i < numSteps; i++) {
    const soffitBlock = new THREE.Mesh(soffitGeo, concreteMat);
    soffitBlock.position.set(
      0,
      i * stepRise - soffitThickness / 2,
      (i * stepTread + stepTread / 2) * direction
    );
    soffitBlock.castShadow = true;
    flightGroup.add(soffitBlock);
  }

  // 3. Diagonal Brown Handrail & Vertical Pickets
  const railHeight = 0.95;
  const railingGroup = new THREE.Group();

  // Top handrail bar
  const railLength = Math.hypot(totalHeight, totalLength);
  const railAngle = Math.atan2(totalHeight, totalLength);
  const handrailGeo = new THREE.CylinderGeometry(0.035, 0.035, railLength, 8);
  const handrailMesh = new THREE.Mesh(handrailGeo, railingMat);
  handrailMesh.rotation.x = (direction > 0 ? -1 : 1) * (Math.PI / 2 - railAngle);
  handrailMesh.position.set(
    width / 2,
    totalHeight / 2 + railHeight,
    (totalLength / 2) * direction
  );
  railingGroup.add(handrailMesh);

  // Vertical balusters every 2 steps
  const balusterGeo = new THREE.CylinderGeometry(0.015, 0.015, railHeight, 6);
  for (let i = 0; i < numSteps; i += 2) {
    const baluster = new THREE.Mesh(balusterGeo, railingMat);
    baluster.position.set(
      width / 2,
      i * stepRise + railHeight / 2 + stepRise,
      (i * stepTread + stepTread / 2) * direction
    );
    railingGroup.add(baluster);
  }

  flightGroup.add(railingGroup);

  return { flightGroup, totalHeight, totalLength };
}

/**
 * Builds a complete 5-floor vertical staircase tower structure
 */
export function buildStaircaseStructure({
  id = "STAIRCASE",
  name = "Staircase",
  position = { x: 0, y: 0, z: 0 },
  floorsCount = 5,
  floorHeight = 3.8,
  width = 2.2,
  isOpenExterior = true
}) {
  const staircaseRoot = new THREE.Group();
  staircaseRoot.name = id;
  staircaseRoot.position.set(position.x, position.y, position.z);

  const { concreteMat, railingMat } = getStairMaterials();

  const numStepsPerFlight = 10;
  const stepRise = (floorHeight / 2) / numStepsPerFlight; // half floor height per flight
  const stepTread = 0.28;
  const landingDepth = 2.4;

  // Build for all 5 floors (4 floor transitions + roof access)
  for (let f = 1; f <= floorsCount; f++) {
    const floorBaseY = (f - 1) * floorHeight;
    const floorStairGroup = new THREE.Group();
    floorStairGroup.name = `${id}_Floor_${f}`;

    // 1. Floor Level Connecting Landing Slab
    const landingGeo = new THREE.BoxGeometry(width * 2 + 0.4, 0.35, landingDepth);
    const landingMesh = new THREE.Mesh(landingGeo, concreteMat);
    landingMesh.position.set(width / 2, floorBaseY + 0.175, -landingDepth / 2);
    landingMesh.receiveShadow = true;
    floorStairGroup.add(landingMesh);

    // Brown railing on floor landing edge
    const landRailGeo = new THREE.BoxGeometry(width * 2 + 0.4, 0.95, 0.06);
    const landRail = new THREE.Mesh(landRailGeo, railingMat);
    landRail.position.set(width / 2, floorBaseY + 0.35 + 0.475, -landingDepth);
    floorStairGroup.add(landRail);

    // If not top roof, build ascending flights
    if (f < floorsCount) {
      // Flight 1: Ascends from floor level to intermediate landing
      const flight1 = buildFlight({
        width,
        numSteps: numStepsPerFlight,
        stepRise,
        stepTread,
        direction: 1
      });
      flight1.flightGroup.position.set(0, floorBaseY + 0.35, 0);
      floorStairGroup.add(flight1.flightGroup);

      // Intermediate Mid-Landing (halfway up)
      const midLandingY = floorBaseY + floorHeight / 2;
      const midLandingMesh = new THREE.Mesh(landingGeo, concreteMat);
      midLandingMesh.position.set(
        width / 2,
        midLandingY + 0.175,
        flight1.totalLength + landingDepth / 2
      );
      midLandingMesh.receiveShadow = true;
      floorStairGroup.add(midLandingMesh);

      // Outer brown railing on intermediate landing
      const midRail = new THREE.Mesh(landRailGeo, railingMat);
      midRail.position.set(
        width / 2,
        midLandingY + 0.35 + 0.475,
        flight1.totalLength + landingDepth
      );
      floorStairGroup.add(midRail);

      // Flight 2: Returns back to next floor landing
      const flight2 = buildFlight({
        width,
        numSteps: numStepsPerFlight,
        stepRise,
        stepTread,
        direction: -1
      });
      flight2.flightGroup.position.set(
        width + 0.4,
        midLandingY + 0.35,
        flight1.totalLength
      );
      floorStairGroup.add(flight2.flightGroup);
    }

    staircaseRoot.add(floorStairGroup);
  }

  // Structural Support Columns for Staircase Tower
  const colHeight = floorsCount * floorHeight;
  const colGeo = new THREE.BoxGeometry(0.55, colHeight, 0.55);
  const columnPositions = [
    [-width / 2 - 0.2, colHeight / 2, -landingDepth],
    [width * 1.5 + 0.4, colHeight / 2, -landingDepth],
    [-width / 2 - 0.2, colHeight / 2, numStepsPerFlight * stepTread + landingDepth],
    [width * 1.5 + 0.4, colHeight / 2, numStepsPerFlight * stepTread + landingDepth]
  ];

  columnPositions.forEach(([cx, cy, cz]) => {
    const col = new THREE.Mesh(colGeo, concreteMat);
    col.position.set(cx, cy, cz);
    col.castShadow = true;
    staircaseRoot.add(col);
  });

  return staircaseRoot;
}
