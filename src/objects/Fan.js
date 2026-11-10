/**
 * Fan.js - Procedural 3D Ceiling Fan Model
 * 
 * Recreates a realistic college classroom 3-blade ceiling fan.
 * Supports:
 * - Raycaster selection with unique identifier (FAN_01 .. FAN_06)
 * - Parent room linkage
 * - Optional continuous blade rotation animation
 */

import * as THREE from 'three';

// Shared materials across fans for high rendering performance
let downrodMaterial = null;
let motorMaterial = null;
let bladeMaterial = null;

function getFanMaterials() {
  if (!downrodMaterial) {
    downrodMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.3
    });
    motorMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.6,
      roughness: 0.4
    });
    bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.5,
      roughness: 0.5
    });
  }
  return { downrodMaterial, motorMaterial, bladeMaterial };
}

export class CeilingFan {
  constructor({ id, roomId, roomNumber, position, rotationSpeed = 6.0 }) {
    this.id = id;
    this.roomId = roomId;
    this.roomNumber = roomNumber;
    this.rotationSpeed = rotationSpeed;
    this.isSpinning = true;

    this.group = new THREE.Group();
    this.group.name = `Fan_${id}`;
    this.group.position.set(position.x, position.y, position.z);

    const { downrodMaterial, motorMaterial, bladeMaterial } = getFanMaterials();

    // 1. Ceiling Canopy Cup
    const canopyGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.1, 12);
    const canopy = new THREE.Mesh(canopyGeo, motorMaterial);
    canopy.position.y = 0;
    this.group.add(canopy);

    // 2. Downrod
    const rodLength = 0.55;
    const rodGeo = new THREE.CylinderGeometry(0.025, 0.025, rodLength, 8);
    const rod = new THREE.Mesh(rodGeo, downrodMaterial);
    rod.position.y = -rodLength / 2;
    this.group.add(rod);

    // 3. Central Motor Housing
    const motorY = -rodLength;
    const motorGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.14, 16);
    const motor = new THREE.Mesh(motorGeo, motorMaterial);
    motor.position.y = motorY;
    this.group.add(motor);

    // 4. Rotating Blades Assembly
    this.bladesGroup = new THREE.Group();
    this.bladesGroup.position.y = motorY - 0.03;

    const bladeLength = 0.68;
    const bladeWidth = 0.14;
    const bladeThickness = 0.015;
    const bladeGeo = new THREE.BoxGeometry(bladeLength, bladeThickness, bladeWidth);

    // 3 aerodynamic blades spaced at 120 degrees
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMaterial);
      // Offset blade from center so it spins around motor hub
      bladeMesh.position.set(
        Math.cos(angle) * (bladeLength / 2 + 0.1),
        0,
        Math.sin(angle) * (bladeLength / 2 + 0.1)
      );
      bladeMesh.rotation.y = -angle;
      bladeMesh.rotation.z = 0.1; // slight aerofoil pitch
      bladeMesh.castShadow = true;
      this.bladesGroup.add(bladeMesh);
    }
    this.group.add(this.bladesGroup);

    // 5. Clickable Invisible Hitbox Volume for Raycaster
    const hitGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.7, 12);
    const hitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    this.hitbox = new THREE.Mesh(hitGeo, hitMat);
    this.hitbox.position.y = -rodLength / 2;
    this.hitbox.userData = {
      isSelectable: true,
      isEquipment: true,
      equipmentType: "fan",
      equipmentId: this.id,
      roomId: this.roomId,
      roomNumber: this.roomNumber,
      objectRef: this,
      name: `Ceiling Fan [${this.id}]`,
      category: "Electrical Equipment",
      parentLabel: `Room ${this.roomNumber}`
    };
    this.group.add(this.hitbox);
  }

  update(delta) {
    if (this.isSpinning && this.bladesGroup) {
      this.bladesGroup.rotation.y += this.rotationSpeed * delta;
    }
  }

  setHighlight(isHighlighted) {
    if (this.hitbox) {
      this.hitbox.material.opacity = isHighlighted ? 0.35 : 0.0;
      this.hitbox.material.color.setHex(isHighlighted ? 0x38bdf8 : 0x000000);
    }
  }
}
