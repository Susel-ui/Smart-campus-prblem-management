/**
 * Room.js - Modular Classroom Constructor
 * 
 * Assembles:
 * - Classroom floor tile & cutaway architectural walls
 * - Exterior rectangular windows with brown grilles matching reference photo
 * - Corridor access door
 * - Stadium/Tiered classroom furniture (~60 student capacity, podium, chalkboard)
 * - 6 Ceiling fans (FAN_01 .. FAN_06) with animated spinning blades
 * - 6 Ceiling luminaires (LIGHT_01 .. LIGHT_06)
 * - Door header plaque with room number
 * - Raycaster selectable volume
 */

import * as THREE from 'three';
import { CeilingFan } from '../objects/Fan.js';
import { CeilingLight } from '../objects/Light.js';
import { buildClassroomFurniture } from '../objects/Furniture.js';

let wallMaterial = null;
let floorTileMaterial = null;
let windowFrameMaterial = null;
let glassMaterial = null;
let doorMaterial = null;

function getRoomMaterials() {
  if (!wallMaterial) {
    wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.6,
      metalness: 0.05
    });
    floorTileMaterial = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      roughness: 0.4,
      metalness: 0.1
    });
    windowFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0x3e2723, // dark brown wooden/bronze window grille from photo
      roughness: 0.4,
      metalness: 0.4
    });
    glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x8ba3b5,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1
    });
    doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x8d5b32,
      roughness: 0.5
    });
  }
  return {
    wallMaterial,
    floorTileMaterial,
    windowFrameMaterial,
    glassMaterial,
    doorMaterial
  };
}

// Doorway Room Number Plaque Generator
function createDoorSignMaterial(roomNumber) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  // Background card
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 96);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#115e59'; // teal border
  ctx.strokeRect(4, 4, 248, 88);

  // Teal badge pill on left
  ctx.fillStyle = '#115e59';
  ctx.fillRect(14, 16, 90, 64);

  // Room number text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(roomNumber, 59, 50);

  // Subtitle
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText("LECTURE", 118, 40);
  ctx.font = '500 18px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText("HALL", 118, 66);

  const texture = new THREE.CanvasTexture(canvas);
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.2 });
}

export class Classroom {
  constructor(roomData) {
    this.data = roomData;
    this.id = roomData.id;
    this.number = roomData.number;
    this.floor = roomData.floor;
    this.fans = [];
    this.lights = [];

    this.group = new THREE.Group();
    this.group.name = `Classroom_${roomData.number}`;
    this.group.position.set(roomData.position.x, roomData.position.y, roomData.position.z);

    this.buildEnclosure();
    this.buildEquipment();
    this.buildHitbox();
  }

  buildEnclosure() {
    const { width, depth, height } = this.data.dimensions;
    const {
      wallMaterial,
      floorTileMaterial,
      windowFrameMaterial,
      glassMaterial,
      doorMaterial
    } = getRoomMaterials();

    // 1. Room Floor Surface
    const floorGeo = new THREE.BoxGeometry(width, 0.04, depth);
    const floorMesh = new THREE.Mesh(floorGeo, floorTileMaterial);
    floorMesh.position.y = 0.02;
    floorMesh.receiveShadow = true;
    this.group.add(floorMesh);

    // 2. Architectural Cutaway Walls (Height 2.3m for clear interior visibility)
    const wallHeight = 2.3;
    const wallThick = 0.22;

    // Rear / Back Wall (with 2 large repeated rectangular windows & grilles)
    const rearWallGeo = new THREE.BoxGeometry(width, wallHeight, wallThick);
    const rearWall = new THREE.Mesh(rearWallGeo, wallMaterial);
    rearWall.position.set(0, wallHeight / 2, -depth / 2 + wallThick / 2);
    rearWall.castShadow = true;
    this.group.add(rearWall);

    // Repeated Windows with brown louvers on rear wall
    const winWidth = 2.4;
    const winHeight = 1.4;
    [-width / 4, width / 4].forEach(winX => {
      // Window frame
      const frameGeo = new THREE.BoxGeometry(winWidth, winHeight, 0.08);
      const frameMesh = new THREE.Mesh(frameGeo, windowFrameMaterial);
      frameMesh.position.set(winX, 1.5, -depth / 2 + 0.12);
      this.group.add(frameMesh);

      // Glass pane
      const glassGeo = new THREE.PlaneGeometry(winWidth - 0.2, winHeight - 0.2);
      const glassMesh = new THREE.Mesh(glassGeo, glassMaterial);
      glassMesh.position.set(winX, 1.5, -depth / 2 + 0.14);
      this.group.add(glassMesh);

      // Brown vertical window grilles (matching photo)
      for (let g = -winWidth / 2 + 0.3; g < winWidth / 2; g += 0.4) {
        const grilleBar = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, winHeight - 0.1, 0.04),
          windowFrameMaterial
        );
        grilleBar.position.set(winX + g, 1.5, -depth / 2 + 0.16);
        this.group.add(grilleBar);
      }
    });

    // Side Partition Walls
    const sideWallGeo = new THREE.BoxGeometry(wallThick, wallHeight, depth);
    const leftWall = new THREE.Mesh(sideWallGeo, wallMaterial);
    leftWall.position.set(-width / 2 + wallThick / 2, wallHeight / 2, 0);
    this.group.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, wallMaterial);
    rightWall.position.set(width / 2 - wallThick / 2, wallHeight / 2, 0);
    this.group.add(rightWall);

    // Front Wall facing corridor (with door opening & door frame)
    const doorWidth = 1.4;
    const frontWallLeftWidth = width - doorWidth - 0.8;
    const frontWallLeft = new THREE.Mesh(
      new THREE.BoxGeometry(frontWallLeftWidth, wallHeight, wallThick),
      wallMaterial
    );
    frontWallLeft.position.set(
      -width / 2 + frontWallLeftWidth / 2,
      wallHeight / 2,
      depth / 2 - wallThick / 2
    );
    this.group.add(frontWallLeft);

    // Front classroom window
    const fWinMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.2, 0.08),
      windowFrameMaterial
    );
    fWinMesh.position.set(
      -width / 2 + frontWallLeftWidth / 2,
      1.5,
      depth / 2 - 0.05
    );
    this.group.add(fWinMesh);

    // Teak Classroom Entry Door
    const doorGeo = new THREE.BoxGeometry(doorWidth, 2.1, 0.06);
    const doorMesh = new THREE.Mesh(doorGeo, doorMaterial);
    const doorX = width / 2 - doorWidth / 2 - 0.4;
    doorMesh.position.set(doorX, 1.05, depth / 2 - wallThick / 2);
    this.group.add(doorMesh);

    // Door Header Sign Plaque above door
    const signMat = createDoorSignMaterial(this.number);
    const signGeo = new THREE.PlaneGeometry(1.6, 0.6);
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(doorX, 2.45, depth / 2 + 0.02);
    this.group.add(signMesh);

    // 3. Procedural Classroom Furniture Silhouettes
    const furniture = buildClassroomFurniture({ width, depth, height });
    this.group.add(furniture);
  }

  buildEquipment() {
    const { width, depth, height } = this.data.dimensions;
    const ceilingY = height - 0.2;

    // 1. Exactly 6 Ceiling Fans (Grid: 2 rows x 3 columns)
    // Meets prompt requirement: "At least 6 ceiling fans per classroom, identifiers FAN_01 .. FAN_06"
    const fanRows = 2;
    const fanCols = 3;
    const fanXSpacing = (width - 2.8) / fanCols;
    const fanZSpacing = (depth - 3.2) / fanRows;

    let fanIndex = 1;
    for (let r = 0; r < fanRows; r++) {
      const fz = -depth / 2 + 2.0 + r * fanZSpacing;
      for (let c = 0; c < fanCols; c++) {
        const fx = -width / 2 + 1.8 + c * fanXSpacing;
        const fanId = `FAN_${this.number}_0${fanIndex}`;

        const fan = new CeilingFan({
          id: fanId,
          roomId: this.id,
          roomNumber: this.number,
          position: { x: fx, y: ceilingY, z: fz },
          rotationSpeed: 6.0 + Math.random() * 2.0
        });

        this.group.add(fan.group);
        this.fans.push(fan);
        fanIndex++;
      }
    }

    // 2. Ceiling Lights (Grid of 6 luminaires)
    let lightIndex = 1;
    for (let r = 0; r < 3; r++) {
      const lz = -depth / 2 + 1.8 + r * (depth - 3.6) / 2;
      for (let c = 0; c < 2; c++) {
        const lx = -width / 4 + c * (width / 2);
        const lightId = `LIGHT_${this.number}_0${lightIndex}`;

        const light = new CeilingLight({
          id: lightId,
          roomId: this.id,
          roomNumber: this.number,
          position: { x: lx, y: ceilingY, z: lz }
        });

        this.group.add(light.group);
        this.lights.push(light);
        lightIndex++;
      }
    }
  }

  buildHitbox() {
    const { width, depth, height } = this.data.dimensions;
    const hitGeo = new THREE.BoxGeometry(width, height, depth);
    const hitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    this.hitbox = new THREE.Mesh(hitGeo, hitMat);
    this.hitbox.position.y = height / 2;
    this.hitbox.userData = {
      isSelectable: true,
      isRoom: true,
      roomId: this.id,
      number: this.number,
      name: this.data.name,
      floor: this.floor,
      category: this.data.category,
      capacity: this.data.capacity,
      fansCount: this.fans.length,
      lightsCount: this.lights.length,
      wing: this.data.wing,
      objectRef: this
    };
    this.group.add(this.hitbox);
  }

  update(delta) {
    this.fans.forEach(fan => fan.update(delta));
  }

  setHighlight(isHighlighted) {
    if (this.hitbox) {
      this.hitbox.material.opacity = isHighlighted ? 0.35 : 0.0;
      this.hitbox.material.color.setHex(isHighlighted ? 0x38bdf8 : 0x000000);
    }
  }
}
