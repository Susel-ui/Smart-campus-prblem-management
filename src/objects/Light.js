/**
 * Light.js - Procedural Classroom Ceiling Light Fixture
 * 
 * Recreates dual-tube fluorescent / LED commercial classroom luminaires.
 * Selectable via Raycaster with stable identifier (LIGHT_01 .. LIGHT_06).
 */

import * as THREE from 'three';

let casingMaterial = null;
let tubeMaterial = null;

function getLightMaterials() {
  if (!casingMaterial) {
    casingMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.3
    });
    tubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffaed,
      emissiveIntensity: 0.75,
      roughness: 0.2
    });
  }
  return { casingMaterial, tubeMaterial };
}

export class CeilingLight {
  constructor({ id, roomId, roomNumber, position }) {
    this.id = id;
    this.roomId = roomId;
    this.roomNumber = roomNumber;

    this.group = new THREE.Group();
    this.group.name = `Light_${id}`;
    this.group.position.set(position.x, position.y, position.z);

    const { casingMaterial, tubeMaterial } = getLightMaterials();

    // Luminaire troffer casing
    const casingGeo = new THREE.BoxGeometry(1.4, 0.08, 0.45);
    const casing = new THREE.Mesh(casingGeo, casingMaterial);
    casing.position.y = -0.04;
    this.group.add(casing);

    // Glowing tube diffuser panel
    const diffuserGeo = new THREE.BoxGeometry(1.3, 0.04, 0.38);
    const diffuser = new THREE.Mesh(diffuserGeo, tubeMaterial);
    diffuser.position.y = -0.08;
    this.group.add(diffuser);

    // Clickable volume
    const hitGeo = new THREE.BoxGeometry(1.5, 0.3, 0.55);
    const hitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    this.hitbox = new THREE.Mesh(hitGeo, hitMat);
    this.hitbox.position.y = -0.1;
    this.hitbox.userData = {
      isSelectable: true,
      isEquipment: true,
      equipmentType: "light",
      equipmentId: this.id,
      roomId: this.roomId,
      roomNumber: this.roomNumber,
      objectRef: this,
      name: `Ceiling Luminaire [${this.id}]`,
      category: "Lighting Fixture",
      parentLabel: `Room ${this.roomNumber}`
    };
    this.group.add(this.hitbox);
  }

  setHighlight(isHighlighted) {
    if (this.hitbox) {
      this.hitbox.material.opacity = isHighlighted ? 0.35 : 0.0;
      this.hitbox.material.color.setHex(isHighlighted ? 0xfacc15 : 0x000000);
    }
  }
}
