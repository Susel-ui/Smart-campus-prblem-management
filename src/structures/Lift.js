/**
 * Lift.js - Independent 5-Storey Passenger Elevator Structure (LIFT_01)
 * 
 * Standalone architectural structure positioned in front of the left-side staircase.
 * Features:
 * - Independent 5-storey vertical shaft with glazed panoramic facade
 * - Structural steel and concrete frame connecting all 5 floors
 * - Floor-level entrance portals with digital floor indicators
 * - Animated passenger cabin traveling smoothly between floors 1 to 5
 * - Raycaster selectable with real-time status and telemetry
 */

import * as THREE from 'three';
import { BUILDING_CONFIG } from '../data/buildingConfig.js';

export class PassengerLift {
  constructor(config = BUILDING_CONFIG.lift) {
    this.config = config;
    this.id = config.id || "LIFT_01";
    this.name = config.name || "Passenger Elevator Tower 01";
    this.floorsServed = config.floorsServed || [1, 2, 3, 4, 5];
    this.currentFloor = config.defaultFloor || 1;
    this.targetFloor = 5;
    this.isMoving = true;
    this.direction = 1; // 1 = moving up, -1 = moving down
    this.status = config.status || "Operational";

    this.group = new THREE.Group();
    this.group.name = this.id;
    this.group.position.set(config.position.x, config.position.y, config.position.z);

    // Floor elevations (Y coordinates) for Floors 1 to 5
    this.floorHeights = [
      0.35,  // Floor 1
      4.15,  // Floor 2
      7.95,  // Floor 3
      11.75, // Floor 4
      15.55  // Floor 5
    ];

    this.cabinY = this.floorHeights[0];
    this.pauseTimer = 0;

    this.buildMaterials();
    this.buildShaft();
    this.buildCabin();
    this.buildEntrancePortals();
    this.buildHitbox();
  }

  buildMaterials() {
    this.frameMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // slate dark structural steel
      metalness: 0.8,
      roughness: 0.25
    });

    this.glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd, // tinted panoramic glass
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.3
    });

    this.cabinMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // brushed stainless steel
      metalness: 0.7,
      roughness: 0.3
    });

    this.doorMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2
    });

    this.accentTealMat = new THREE.MeshStandardMaterial({
      color: 0x115e59, // matches LHC architectural teal trim
      roughness: 0.4
    });

    this.glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8
    });
  }

  buildShaft() {
    const sw = this.config.shaftDimensions.width;
    const sd = this.config.shaftDimensions.depth;
    const sh = this.config.shaftDimensions.height;

    // 1. Concrete Base Plinth (Ground foundation)
    const baseGeo = new THREE.BoxGeometry(sw + 0.6, 0.4, sd + 0.6);
    const baseMesh = new THREE.Mesh(baseGeo, this.frameMat);
    baseMesh.position.y = 0.2;
    baseMesh.receiveShadow = true;
    this.group.add(baseMesh);

    // 2. Corner Steel Columns (4 vertical columns from base to top)
    const colSize = 0.24;
    const colGeo = new THREE.BoxGeometry(colSize, sh, colSize);
    const colCoords = [
      [-sw / 2 + colSize / 2, sh / 2, -sd / 2 + colSize / 2],
      [sw / 2 - colSize / 2, sh / 2, -sd / 2 + colSize / 2],
      [-sw / 2 + colSize / 2, sh / 2, sd / 2 - colSize / 2],
      [sw / 2 - colSize / 2, sh / 2, sd / 2 - colSize / 2]
    ];
    colCoords.forEach(([cx, cy, cz]) => {
      const col = new THREE.Mesh(colGeo, this.frameMat);
      col.position.set(cx, cy, cz);
      col.castShadow = true;
      this.group.add(col);
    });

    // 3. Panoramic Glazing Enclosure (Front & Sides)
    // Front Glass
    const frontGlassGeo = new THREE.PlaneGeometry(sw - colSize * 2, sh - 1.0);
    const frontGlass = new THREE.Mesh(frontGlassGeo, this.glassMat);
    frontGlass.position.set(0, sh / 2, sd / 2 - 0.05);
    this.group.add(frontGlass);

    // Side Glasses
    const sideGlassGeo = new THREE.PlaneGeometry(sd - colSize * 2, sh - 1.0);
    const leftGlass = new THREE.Mesh(sideGlassGeo, this.glassMat);
    leftGlass.rotation.y = Math.PI / 2;
    leftGlass.position.set(-sw / 2 + 0.05, sh / 2, 0);
    this.group.add(leftGlass);

    const rightGlass = new THREE.Mesh(sideGlassGeo, this.glassMat);
    rightGlass.rotation.y = -Math.PI / 2;
    rightGlass.position.set(sw / 2 - 0.05, sh / 2, 0);
    this.group.add(rightGlass);

    // Horizontal Steel Ring Beams at each floor level
    this.floorHeights.forEach(fy => {
      const ringGeo = new THREE.BoxGeometry(sw + 0.1, 0.2, sd + 0.1);
      const ring = new THREE.Mesh(ringGeo, this.accentTealMat);
      ring.position.set(0, fy + 2.8, 0);
      this.group.add(ring);
    });

    // 4. Overhead Machine Room Enclosure on top
    const topCapGeo = new THREE.BoxGeometry(sw + 0.4, 1.8, sd + 0.4);
    const topCap = new THREE.Mesh(topCapGeo, this.frameMat);
    topCap.position.y = sh + 0.9;
    topCap.castShadow = true;
    this.group.add(topCap);

    // Decorative crown trim
    const crownGeo = new THREE.BoxGeometry(sw + 0.6, 0.2, sd + 0.6);
    const crown = new THREE.Mesh(crownGeo, this.accentTealMat);
    crown.position.y = sh + 1.8;
    this.group.add(crown);
  }

  buildCabin() {
    const cw = this.config.cabinDimensions.width;
    const cd = this.config.cabinDimensions.depth;
    const ch = this.config.cabinDimensions.height;

    this.cabin = new THREE.Group();
    this.cabin.name = "LiftCabin";
    this.cabin.position.set(0, this.cabinY, 0);

    // Cabin Floor & Ceiling Slabs
    const slabGeo = new THREE.BoxGeometry(cw, 0.1, cd);
    const floorSlab = new THREE.Mesh(slabGeo, this.cabinMat);
    floorSlab.position.y = 0.05;
    this.cabin.add(floorSlab);

    const ceilSlab = new THREE.Mesh(slabGeo, this.cabinMat);
    ceilSlab.position.y = ch - 0.05;
    this.cabin.add(ceilSlab);

    // Rear Solid Wall
    const rearGeo = new THREE.BoxGeometry(cw, ch, 0.08);
    const rearWall = new THREE.Mesh(rearGeo, this.cabinMat);
    rearWall.position.set(0, ch / 2, -cd / 2 + 0.04);
    this.cabin.add(rearWall);

    // Glass Panoramic Cabin Front & Sides
    const glassGeo = new THREE.PlaneGeometry(cw * 0.9, ch * 0.85);
    const glassFront = new THREE.Mesh(glassGeo, this.glassMat);
    glassFront.position.set(0, ch / 2, cd / 2 - 0.02);
    this.cabin.add(glassFront);

    // Interior Warm Ceiling Light
    const lightGeo = new THREE.BoxGeometry(0.8, 0.04, 0.8);
    const cabinLight = new THREE.Mesh(lightGeo, this.glowMat);
    cabinLight.position.set(0, ch - 0.1, 0);
    this.cabin.add(cabinLight);

    // Cabin Suspension Steel Cable
    const cableGeo = new THREE.CylinderGeometry(0.015, 0.015, this.config.shaftDimensions.height, 8);
    this.cable = new THREE.Mesh(cableGeo, this.frameMat);
    this.cable.position.set(0, this.config.shaftDimensions.height / 2, 0);
    this.group.add(this.cable);

    this.group.add(this.cabin);
  }

  buildEntrancePortals() {
    // Portal frames on the rear side facing the building bridge/walkway
    const sd = this.config.shaftDimensions.depth;

    this.floorHeights.forEach((fy, idx) => {
      const portalGroup = new THREE.Group();
      portalGroup.position.set(0, fy, -sd / 2);

      // Door frame architrave
      const frameGeo = new THREE.BoxGeometry(2.0, 2.5, 0.15);
      const frameMesh = new THREE.Mesh(frameGeo, this.frameMat);
      frameMesh.position.y = 1.25;
      portalGroup.add(frameMesh);

      // Sliding elevator doors (stainless steel)
      const doorGeo = new THREE.BoxGeometry(1.6, 2.3, 0.08);
      const doorMesh = new THREE.Mesh(doorGeo, this.doorMat);
      doorMesh.position.y = 1.15;
      portalGroup.add(doorMesh);

      // Center seam line on doors
      const seamGeo = new THREE.BoxGeometry(0.02, 2.3, 0.09);
      const seam = new THREE.Mesh(seamGeo, this.frameMat);
      seam.position.y = 1.15;
      portalGroup.add(seam);

      // Floor indicator digital sign above door
      const signCanvas = document.createElement('canvas');
      signCanvas.width = 128;
      signCanvas.height = 48;
      const ctx = signCanvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 128, 48);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`LHC • F${idx + 1}`, 64, 24);

      const signTex = new THREE.CanvasTexture(signCanvas);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex });
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), signMat);
      signMesh.rotation.y = Math.PI;
      signMesh.position.set(0, 2.55, -0.09);
      portalGroup.add(signMesh);

      // Connecting walkway bridge to main building
      const bridgeGeo = new THREE.BoxGeometry(2.4, 0.25, 4.5);
      const bridge = new THREE.Mesh(bridgeGeo, this.frameMat);
      bridge.position.set(0, 0.125, -2.25);
      bridge.receiveShadow = true;
      portalGroup.add(bridge);

      // Bridge safety railings
      const bRailGeo = new THREE.BoxGeometry(0.06, 0.95, 4.5);
      const bRailLeft = new THREE.Mesh(bRailGeo, this.accentTealMat);
      bRailLeft.position.set(-1.15, 0.6, -2.25);
      portalGroup.add(bRailLeft);

      const bRailRight = new THREE.Mesh(bRailGeo, this.accentTealMat);
      bRailRight.position.set(1.15, 0.6, -2.25);
      portalGroup.add(bRailRight);

      this.group.add(portalGroup);
    });
  }

  buildHitbox() {
    // Large bounding volume for easy Raycaster selection
    const sw = this.config.shaftDimensions.width;
    const sd = this.config.shaftDimensions.depth;
    const sh = this.config.shaftDimensions.height;

    const hitGeo = new THREE.BoxGeometry(sw + 0.8, sh, sd + 0.8);
    const hitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    this.hitbox = new THREE.Mesh(hitGeo, hitMat);
    this.hitbox.position.y = sh / 2;
    this.hitbox.userData = {
      isSelectable: true,
      isStructure: true,
      structureType: "lift",
      id: this.id,
      name: this.name,
      floorsServed: this.floorsServed,
      objectRef: this,
      status: this.status
    };
    this.group.add(this.hitbox);
  }

  update(delta) {
    if (!this.cabin) return;

    // Simulated elevator movement
    if (this.pauseTimer > 0) {
      this.pauseTimer -= delta;
      return;
    }

    const targetY = this.floorHeights[this.targetFloor - 1];
    const diff = targetY - this.cabin.position.y;
    const speed = this.config.travelSpeed * delta;

    if (Math.abs(diff) < speed) {
      // Reached floor!
      this.cabin.position.y = targetY;
      this.currentFloor = this.targetFloor;
      this.pauseTimer = 3.5; // Pause 3.5s at floor before moving to next

      // Select next target floor (patrol 1 -> 5 -> 1)
      if (this.currentFloor === 5) {
        this.direction = -1;
      } else if (this.currentFloor === 1) {
        this.direction = 1;
      }
      this.targetFloor = this.currentFloor + this.direction;
    } else {
      this.cabin.position.y += Math.sign(diff) * speed;
      // Interpolate current simulated floor based on height
      const rawFloor = 1 + (this.cabin.position.y - this.floorHeights[0]) / BUILDING_CONFIG.floorHeight;
      this.currentFloor = Math.max(1, Math.min(5, Math.round(rawFloor)));
    }
  }

  setHighlight(isHighlighted) {
    if (this.hitbox) {
      this.hitbox.material.opacity = isHighlighted ? 0.3 : 0.0;
      this.hitbox.material.color.setHex(isHighlighted ? 0x06b6d4 : 0x000000);
    }
  }
}
