/**
 * AcademicWing.js - Elongated 5-Storey Academic Wing
 * 
 * Recreates the long linear academic classroom block extending to the right:
 * - 5 storeys connecting to Main Block
 * - North/rear facade with regular classroom window fenestration
 * - Structural grid supporting classrooms and balcony corridors
 * - East end anchor wall enclosing Staircase 2
 */

import * as THREE from 'three';
import { BUILDING_CONFIG } from '../data/buildingConfig.js';

export class AcademicWing {
  constructor(config = BUILDING_CONFIG.academicWing) {
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = "AcademicWing_Right";
    this.group.position.set(config.centerX, 0, config.centerZ);

    this.buildStructuralBackbone();
  }

  buildStructuralBackbone() {
    const { width, depth } = this.config;
    const totalHeight = BUILDING_CONFIG.floorsCount * BUILDING_CONFIG.floorHeight;

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.6,
      metalness: 0.05
    });

    const windowGrilleMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723,
      roughness: 0.4
    });

    const tealTrimMat = new THREE.MeshStandardMaterial({
      color: 0x115e59,
      roughness: 0.35
    });

    // 1. North / Rear Exterior Continuous Wall
    const rearWallThick = 0.35;
    const rearWallGeo = new THREE.BoxGeometry(width, totalHeight, rearWallThick);
    const rearWall = new THREE.Mesh(rearWallGeo, concreteMat);
    rearWall.position.set(0, totalHeight / 2, -depth / 2 + rearWallThick / 2);
    rearWall.castShadow = true;
    rearWall.receiveShadow = true;
    this.group.add(rearWall);

    // 2. East End-Wall (Far Right Pavilion Wall)
    const eastWallThick = 0.45;
    const eastWallGeo = new THREE.BoxGeometry(eastWallThick, totalHeight, depth);
    const eastWall = new THREE.Mesh(eastWallGeo, concreteMat);
    eastWall.position.set(width / 2 - eastWallThick / 2, totalHeight / 2, 0);
    eastWall.castShadow = true;
    this.group.add(eastWall);

    // East End-Wall Horizontal Teal Trim Bands
    for (let f = 1; f <= BUILDING_CONFIG.floorsCount; f++) {
      const floorY = (f - 1) * BUILDING_CONFIG.floorHeight;
      const bandGeo = new THREE.BoxGeometry(eastWallThick + 0.1, 0.22, depth + 0.15);
      const band = new THREE.Mesh(bandGeo, tealTrimMat);
      band.position.set(width / 2 - eastWallThick / 2, floorY + 3.2, 0);
      this.group.add(band);
    }

    // Repeated Windows on Rear Wall
    const winWidth = 2.4;
    const winHeight = 1.4;
    const bays = 9;
    const baySpacing = width / bays;

    for (let f = 1; f <= BUILDING_CONFIG.floorsCount; f++) {
      const floorY = (f - 1) * BUILDING_CONFIG.floorHeight;

      for (let b = 0; b < bays; b++) {
        const wx = -width / 2 + baySpacing / 2 + b * baySpacing;

        const wFrame = new THREE.Mesh(
          new THREE.BoxGeometry(winWidth, winHeight, 0.12),
          windowGrilleMat
        );
        wFrame.position.set(wx, floorY + 1.8, -depth / 2 - 0.05);
        this.group.add(wFrame);
      }
    }
  }
}
