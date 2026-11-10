/**
 * Corridor.js - Open Balcony Corridors & Column Grid
 * 
 * Accurately recreates the prominent front architectural facade:
 * - 5 storeys of open balcony corridors
 * - White concrete structural columns spaced evenly along the exterior
 * - Dark brown horizontal & vertical balcony safety railings
 * - Distinctive dark teal / blue-green horizontal fascia trim band
 */

import * as THREE from 'three';
import { BUILDING_CONFIG } from '../data/buildingConfig.js';

let columnMat = null;
let floorTileMat = null;
let railingMat = null;
let tealTrimMat = null;

function getCorridorMaterials() {
  if (!columnMat) {
    columnMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1
    });
    floorTileMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.4,
      metalness: 0.1
    });
    railingMat = new THREE.MeshStandardMaterial({
      color: 0x452718, // dark brown railing from photo
      metalness: 0.8,
      roughness: 0.3
    });
    tealTrimMat = new THREE.MeshStandardMaterial({
      color: 0x115e59, // teal / blue-green slab edge trim from photo
      roughness: 0.3,
      metalness: 0.2
    });
  }
  return { columnMat, floorTileMat, railingMat, tealTrimMat };
}

export class BalconyCorridor {
  constructor({ floor, length, width = 2.8, position, columnsCount = 11 }) {
    this.floor = floor;
    this.length = length;
    this.width = width;
    this.columnsCount = columnsCount;

    this.group = new THREE.Group();
    this.group.name = `Corridor_Floor_${floor}`;
    this.group.position.set(position.x, position.y, position.z);

    this.buildCorridor();
  }

  buildCorridor() {
    const { columnMat, floorTileMat, railingMat, tealTrimMat } = getCorridorMaterials();
    const floorHeight = BUILDING_CONFIG.floorHeight;

    // 1. Corridor Walkway Floor Slab
    const slabGeo = new THREE.BoxGeometry(this.length, 0.35, this.width);
    const floorMesh = new THREE.Mesh(slabGeo, floorTileMat);
    floorMesh.position.y = 0.175;
    floorMesh.receiveShadow = true;
    this.group.add(floorMesh);

    // 2. Distinctive Dark Teal Architectural Fascia Trim Band (Front slab edge)
    const fasciaGeo = new THREE.BoxGeometry(this.length + 0.1, 0.38, 0.12);
    const fascia = new THREE.Mesh(fasciaGeo, tealTrimMat);
    fascia.position.set(0, 0.175, this.width / 2 + 0.05);
    this.group.add(fascia);

    // 3. Repeated White Structural Columns along front edge
    const colSpacing = this.length / (this.columnsCount - 1);
    const colWidth = 0.5;
    const colDepth = 0.5;
    const colHeight = floorHeight - 0.35;
    const colGeo = new THREE.BoxGeometry(colWidth, colHeight, colDepth);

    for (let i = 0; i < this.columnsCount; i++) {
      const colX = -this.length / 2 + i * colSpacing;
      const colMesh = new THREE.Mesh(colGeo, columnMat);
      colMesh.position.set(colX, colHeight / 2 + 0.35, this.width / 2 - colDepth / 2);
      colMesh.castShadow = true;
      colMesh.receiveShadow = true;
      this.group.add(colMesh);
    }

    // 4. Dark Brown Corridor Balcony Railing along front opening
    const railHeight = 1.05;
    const frontEdgeZ = this.width / 2;

    // Top Handrail
    const topRailGeo = new THREE.BoxGeometry(this.length, 0.08, 0.08);
    const topRail = new THREE.Mesh(topRailGeo, railingMat);
    topRail.position.set(0, 0.35 + railHeight, frontEdgeZ);
    this.group.add(topRail);

    // Mid Rail
    const midRailGeo = new THREE.BoxGeometry(this.length, 0.05, 0.05);
    const midRail = new THREE.Mesh(midRailGeo, railingMat);
    midRail.position.set(0, 0.35 + railHeight * 0.5, frontEdgeZ);
    this.group.add(midRail);

    // Vertical pickets along the entire railing length
    const picketSpacing = 0.35;
    const numPickets = Math.floor(this.length / picketSpacing);
    const picketGeo = new THREE.BoxGeometry(0.025, railHeight, 0.025);

    for (let p = 0; p < numPickets; p++) {
      const pX = -this.length / 2 + 0.2 + p * picketSpacing;
      const picket = new THREE.Mesh(picketGeo, railingMat);
      picket.position.set(pX, 0.35 + railHeight / 2, frontEdgeZ);
      this.group.add(picket);
    }
  }
}
