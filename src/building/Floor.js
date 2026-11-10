/**
 * Floor.js - Floor Level Assembly Manager
 * 
 * Assembles all components for a specific floor (1 through 5):
 * - Structural concrete floor slab
 * - Front balcony corridor with columns and brown railings
 * - Classrooms belonging to this floor
 * - Washroom facilities belonging to this floor
 * - Supports floor isolation, dimming/transparency, and exploded view
 */

import * as THREE from 'three';
import { BUILDING_CONFIG } from '../data/buildingConfig.js';
import { BalconyCorridor } from './Corridor.js';

export class FloorLevel {
  constructor({ floorNumber, elevationY, rooms = [], washrooms = [] }) {
    this.floorNumber = floorNumber;
    this.elevationY = elevationY;
    this.rooms = rooms;
    this.washrooms = washrooms;

    this.group = new THREE.Group();
    this.group.name = `Floor_${floorNumber}`;
    this.group.position.set(0, elevationY, 0);

    this.buildSlab();
    this.buildCorridor();
    this.attachRooms();
    this.attachWashrooms();
  }

  buildSlab() {
    const totalWidth = BUILDING_CONFIG.mainBlock.width + BUILDING_CONFIG.academicWing.width;
    const slabThick = BUILDING_CONFIG.slabThickness;
    const slabDepth = 17.5;

    const slabMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.5,
      metalness: 0.1
    });

    // Main floor concrete slab
    const slabGeo = new THREE.BoxGeometry(totalWidth, slabThick, slabDepth);
    this.slabMesh = new THREE.Mesh(slabGeo, slabMat);
    this.slabMesh.position.set(
      (BUILDING_CONFIG.mainBlock.centerX + BUILDING_CONFIG.academicWing.centerX) / 2 + 7.5,
      slabThick / 2,
      0
    );
    this.slabMesh.receiveShadow = true;
    this.group.add(this.slabMesh);
  }

  buildCorridor() {
    // Balcony corridor along the front of the academic wing
    const wingWidth = BUILDING_CONFIG.academicWing.width;
    const corridorZ = BUILDING_CONFIG.academicWing.centerZ + 8.0 - 1.4; // along front edge

    this.corridor = new BalconyCorridor({
      floor: this.floorNumber,
      length: wingWidth,
      width: BUILDING_CONFIG.academicWing.corridorWidth,
      position: {
        x: BUILDING_CONFIG.academicWing.centerX,
        y: 0,
        z: corridorZ
      },
      columnsCount: BUILDING_CONFIG.academicWing.columnsCount
    });

    this.group.add(this.corridor.group);
  }

  attachRooms() {
    this.rooms.forEach(room => {
      // Room position is relative to floor elevation
      room.group.position.y = BUILDING_CONFIG.slabThickness;
      this.group.add(room.group);
    });
  }

  attachWashrooms() {
    this.washrooms.forEach(washroom => {
      washroom.group.position.y = BUILDING_CONFIG.slabThickness;
      this.group.add(washroom.group);
    });
  }

  update(delta) {
    this.rooms.forEach(room => room.update(delta));
  }

  setOpacity(opacity) {
    this.group.traverse(child => {
      if (child.isMesh && child.material && !child.userData.isSelectable) {
        if (!child.userData.origTransparent) {
          child.userData.origTransparent = child.material.transparent;
          child.userData.origOpacity = child.material.opacity !== undefined ? child.material.opacity : 1.0;
        }
        child.material.transparent = opacity < 0.99;
        child.material.opacity = opacity;
      }
    });
  }
}
