/**
 * MainBlock.js - Left Anchor Building Block
 * 
 * Accurately models the prominent left-side structure from the reference photograph:
 * - 5-storey vertical anchor massing
 * - West exterior end-wall with 5 levels of rectangular windows and dark teal lintel trim
 * - Front open balcony bays and staircase bay
 * - Vertical wall bay with stacked brown-louvred rectangular windows
 * - Raised rooftop penthouse stairhead/machine tower with open rectangular vent
 */

import * as THREE from 'three';
import { BUILDING_CONFIG } from '../data/buildingConfig.js';

let concreteWhiteMat = null;
let tealTrimMat = null;
let windowGrilleMat = null;
let glassMat = null;

function getMainBlockMaterials() {
  if (!concreteWhiteMat) {
    concreteWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.6,
      metalness: 0.05
    });
    tealTrimMat = new THREE.MeshStandardMaterial({
      color: 0x115e59, // dark teal / blue-green architectural trim
      roughness: 0.35,
      metalness: 0.2
    });
    windowGrilleMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723, // dark brown wooden/bronze louvers
      roughness: 0.4,
      metalness: 0.4
    });
    glassMat = new THREE.MeshStandardMaterial({
      color: 0x8ba3b5,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1
    });
  }
  return { concreteWhiteMat, tealTrimMat, windowGrilleMat, glassMat };
}

export class MainBlock {
  constructor(config = BUILDING_CONFIG.mainBlock) {
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = "MainBlock_Left";
    this.group.position.set(config.centerX, 0, config.centerZ);

    this.buildStructure();
  }

  buildStructure() {
    const { width, depth, rooftopPenthouseHeight, penthouseWidth, penthouseDepth } = this.config;
    const totalHeight = BUILDING_CONFIG.floorsCount * BUILDING_CONFIG.floorHeight;
    const { concreteWhiteMat, tealTrimMat, windowGrilleMat, glassMat } = getMainBlockMaterials();

    // 1. West End-Wall (Far Left Exterior Wall, X = -width/2)
    const endWallThick = 0.45;
    const endWallGeo = new THREE.BoxGeometry(endWallThick, totalHeight, depth);
    const endWall = new THREE.Mesh(endWallGeo, concreteWhiteMat);
    endWall.position.set(-width / 2 + endWallThick / 2, totalHeight / 2, 0);
    endWall.castShadow = true;
    endWall.receiveShadow = true;
    this.group.add(endWall);

    // 5 Storeys of Windows & Teal Trim Bands on West End-Wall
    for (let f = 1; f <= BUILDING_CONFIG.floorsCount; f++) {
      const floorY = (f - 1) * BUILDING_CONFIG.floorHeight;

      // Dark Teal Lintel Trim Band running horizontally across the end-wall
      const bandGeo = new THREE.BoxGeometry(endWallThick + 0.1, 0.22, depth + 0.15);
      const band = new THREE.Mesh(bandGeo, tealTrimMat);
      band.position.set(-width / 2 + endWallThick / 2, floorY + 3.2, 0);
      this.group.add(band);

      // Rectangular Window on end wall
      const winGeo = new THREE.BoxGeometry(endWallThick + 0.12, 1.4, 2.0);
      const winFrame = new THREE.Mesh(winGeo, windowGrilleMat);
      winFrame.position.set(-width / 2 + endWallThick / 2, floorY + 1.8, 0);
      this.group.add(winFrame);

      // Glass inside window
      const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), glassMat);
      glassMesh.rotation.y = Math.PI / 2;
      glassMesh.position.set(-width / 2 - 0.08, floorY + 1.8, 0);
      this.group.add(glassMesh);
    }

    // 2. Vertical Wall Bay with Stacked Brown Louvered Windows (Right of staircase)
    // Sits around X = +2.0 relative to main block center
    const louverBayWidth = 5.5;
    const louverBayGeo = new THREE.BoxGeometry(louverBayWidth, totalHeight, 0.35);
    const louverBay = new THREE.Mesh(louverBayGeo, concreteWhiteMat);
    louverBay.position.set(width / 2 - louverBayWidth / 2, totalHeight / 2, depth / 2 - 0.18);
    louverBay.castShadow = true;
    this.group.add(louverBay);

    // Stacked brown louvered windows on each floor
    for (let f = 1; f <= BUILDING_CONFIG.floorsCount; f++) {
      const floorY = (f - 1) * BUILDING_CONFIG.floorHeight;
      const louverWinGeo = new THREE.BoxGeometry(2.4, 1.5, 0.2);
      const louverWin = new THREE.Mesh(louverWinGeo, windowGrilleMat);
      louverWin.position.set(width / 2 - louverBayWidth / 2, floorY + 1.8, depth / 2 - 0.15);
      this.group.add(louverWin);

      // Vertical louvers/grilles inside window
      for (let g = -1.0; g <= 1.0; g += 0.35) {
        const barGeo = new THREE.BoxGeometry(0.04, 1.4, 0.05);
        const bar = new THREE.Mesh(barGeo, windowGrilleMat);
        bar.position.set(width / 2 - louverBayWidth / 2 + g, floorY + 1.8, depth / 2 - 0.03);
        this.group.add(bar);
      }
    }

    // 3. Main Block Rooftop Penthouse Tower (Stairhead & Elevator Machine Enclosure)
    const phHeight = rooftopPenthouseHeight;
    const phGeo = new THREE.BoxGeometry(penthouseWidth, phHeight, penthouseDepth);
    const penthouse = new THREE.Mesh(phGeo, concreteWhiteMat);
    penthouse.position.set(
      -width / 2 + penthouseWidth / 2 + 1.5,
      totalHeight + phHeight / 2,
      0
    );
    penthouse.castShadow = true;
    this.group.add(penthouse);

    // Open rectangular window/vent in the penthouse (visible in photo!)
    const ventGeo = new THREE.BoxGeometry(3.2, 1.8, penthouseDepth + 0.2);
    const ventHole = new THREE.Mesh(
      ventGeo,
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    ventHole.position.set(
      -width / 2 + penthouseWidth / 2 + 1.5,
      totalHeight + phHeight / 2 + 0.2,
      0
    );
    this.group.add(ventHole);

    // Penthouse Roof Teal Parapet Cap
    const pCapGeo = new THREE.BoxGeometry(penthouseWidth + 0.4, 0.25, penthouseDepth + 0.4);
    const pCap = new THREE.Mesh(pCapGeo, tealTrimMat);
    pCap.position.set(
      -width / 2 + penthouseWidth / 2 + 1.5,
      totalHeight + phHeight + 0.125,
      0
    );
    this.group.add(pCap);
  }
}
