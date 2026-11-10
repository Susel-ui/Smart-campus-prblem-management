/**
 * Furniture.js - Procedural Classroom Furniture Silhouettes
 * 
 * Creates:
 * - 60-student capacity desk & chair rows
 * - Teacher's podium / lecture desk
 * - Front chalkboard / whiteboard with aluminum frame
 * - Wall-mounted projector screen
 */

import * as THREE from 'three';

// Shared materials for classroom furniture
let deskWoodMat = null;
let deskFrameMat = null;
let chairMat = null;
let boardMat = null;
let boardFrameMat = null;
let screenMat = null;
let stageMat = null;

function getFurnitureMaterials() {
  if (!deskWoodMat) {
    deskWoodMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e, // warm educational wood laminate
      roughness: 0.6,
      metalness: 0.1
    });
    deskFrameMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // dark slate metal tubing
      roughness: 0.5,
      metalness: 0.6
    });
    chairMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7
    });
    boardMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // rich dark green magnetic chalkboard
      roughness: 0.4
    });
    boardFrameMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db, // anodized aluminum frame
      metalness: 0.8,
      roughness: 0.2
    });
    screenMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2
    });
    stageMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // elevated teacher stage
      roughness: 0.5
    });
  }
  return {
    deskWoodMat,
    deskFrameMat,
    chairMat,
    boardMat,
    boardFrameMat,
    screenMat,
    stageMat
  };
}

/**
 * Builds classroom interior furniture set
 */
export function buildClassroomFurniture({ width, depth, height }) {
  const group = new THREE.Group();
  group.name = "ClassroomFurniture";

  const {
    deskWoodMat,
    deskFrameMat,
    chairMat,
    boardMat,
    boardFrameMat,
    screenMat,
    stageMat
  } = getFurnitureMaterials();

  // Front wall is located at -depth/2 (facing south/corridor or north depending on orientation)
  // Let front wall be at Z = -depth/2 + 0.15
  const frontZ = -depth / 2 + 0.2;

  // 1. Front Teacher Lecture Stage (Raised 15cm)
  const stageWidth = width * 0.75;
  const stageDepth = 1.8;
  const stageGeo = new THREE.BoxGeometry(stageWidth, 0.15, stageDepth);
  const stageMesh = new THREE.Mesh(stageGeo, stageMat);
  stageMesh.position.set(0, 0.075, frontZ + stageDepth / 2 + 0.3);
  stageMesh.receiveShadow = true;
  group.add(stageMesh);

  // 2. Large Magnetic Chalkboard / Whiteboard on front wall
  const boardWidth = Math.min(width * 0.65, 5.8);
  const boardHeight = 1.6;
  const boardGeo = new THREE.BoxGeometry(boardWidth, boardHeight, 0.06);
  const boardMesh = new THREE.Mesh(boardGeo, boardMat);
  boardMesh.position.set(0, 1.8, frontZ + 0.05);
  boardMesh.castShadow = true;
  group.add(boardMesh);

  // Board Aluminum Frame
  const frameGeo = new THREE.BoxGeometry(boardWidth + 0.12, boardHeight + 0.12, 0.04);
  const frameMesh = new THREE.Mesh(frameGeo, boardFrameMat);
  frameMesh.position.set(0, 1.8, frontZ + 0.03);
  group.add(frameMesh);

  // 3. Wall-Mounted Projector Screen (Pulled down above/adjacent to board)
  const screenWidth = 2.4;
  const screenHeight = 1.5;
  const screenGeo = new THREE.BoxGeometry(screenWidth, screenHeight, 0.04);
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(boardWidth / 2 - screenWidth / 2 + 0.1, 2.2, frontZ + 0.12);
  screenMesh.userData = {
    isSelectable: true,
    isEquipment: true,
    equipmentType: "projector_screen",
    name: "Motorized Projector Screen"
  };
  group.add(screenMesh);

  // 4. Lecturer Podium / Desk & Teacher Chair
  const podiumGeo = new THREE.BoxGeometry(1.2, 1.0, 0.7);
  const podiumMesh = new THREE.Mesh(podiumGeo, deskWoodMat);
  podiumMesh.position.set(-boardWidth / 3, 0.15 + 0.5, frontZ + stageDepth / 2 + 0.2);
  podiumMesh.castShadow = true;
  group.add(podiumMesh);

  const teacherChairGeo = new THREE.BoxGeometry(0.55, 0.9, 0.55);
  const teacherChair = new THREE.Mesh(teacherChairGeo, chairMat);
  teacherChair.position.set(-boardWidth / 3, 0.15 + 0.45, frontZ + 0.6);
  group.add(teacherChair);

  // 5. Student Seating Grid (~60 Student Capacity)
  // 5 rows of 6 two-seater student desks = 30 desks x 2 = 60 student seats!
  const rows = 5;
  const cols = 3; // 3 columns of double-desks (left aisle, center aisle, right aisle)
  const deskWidth = 1.8; // 2 students per desk
  const deskDepth = 0.55;
  const deskHeight = 0.74;

  const startZ = frontZ + stageDepth + 1.2;
  const rowSpacing = (depth - stageDepth - 2.0) / rows;
  const colSpacing = (width - 2.4) / cols;

  // Single shared geometry for desk top and chair for performance
  const deskTopGeo = new THREE.BoxGeometry(deskWidth, 0.05, deskDepth);
  const deskLegsGeo = new THREE.BoxGeometry(deskWidth * 0.95, deskHeight - 0.05, deskDepth * 0.85);
  const benchGeo = new THREE.BoxGeometry(deskWidth, 0.45, 0.35);

  for (let r = 0; r < rows; r++) {
    const rowZ = startZ + r * rowSpacing;
    // Tiered stadium rise for back rows
    const tierRise = r * 0.06;

    for (let c = 0; c < cols; c++) {
      const colX = -width / 2 + 1.6 + c * colSpacing;

      // Desk Top
      const dTop = new THREE.Mesh(deskTopGeo, deskWoodMat);
      dTop.position.set(colX, tierRise + deskHeight, rowZ);
      dTop.castShadow = true;
      group.add(dTop);

      // Desk Metal Frame Base
      const dBase = new THREE.Mesh(deskLegsGeo, deskFrameMat);
      dBase.position.set(colX, tierRise + (deskHeight - 0.05) / 2, rowZ);
      group.add(dBase);

      // Student Bench / Chair attached behind desk
      const bench = new THREE.Mesh(benchGeo, chairMat);
      bench.position.set(colX, tierRise + 0.225, rowZ + deskDepth / 2 + 0.32);
      bench.castShadow = true;
      group.add(bench);
    }
  }

  return group;
}
