/**
 * CameraControls.js - OrbitControls & Architectural Camera Presets for Campus & Buildings
 * 
 * Provides:
 * - Completely uninhibited 360-degree rotation, zooming, and panning
 * - Smooth physics damping with ground-clamping
 * - Seamless timed camera presets for:
 *   • Campus Overview (All 3 buildings in isometric bird's eye view)
 *   • Lecture Hall Complex (LHC Focus)
 *   • Atrium Building (ATR Focus)
 *   • Galleria Building (GAL Focus)
 *   • Cardinal Angles: Front, Left, Right, Back, Top/Plan
 * - Instant cancellation on user interaction (never fights mouse drag or zoom)
 * - Automatic preset button state synchronization
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Orbit Controls configuration
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = true;
    
    // Zoom limits: allow zooming very close into rooms & fixtures, and far out across campus
    this.controls.minDistance = 3;
    this.controls.maxDistance = 450;
    
    // Polar rotation limits: allow looking from ground level to high overhead
    this.controls.minPolarAngle = 0.05; // avoids gimbal lock at exact 90 deg zenith
    this.controls.maxPolarAngle = Math.PI / 2 - 0.01; // clamps above ground plane

    this.controls.rotateSpeed = 0.9;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.9;

    // Transition animation variables
    this.isTransitioning = false;
    this.startPos = new THREE.Vector3();
    this.startLook = new THREE.Vector3();
    this.targetPos = new THREE.Vector3();
    this.targetLook = new THREE.Vector3();
    this.transitionDuration = 700;
    this.transitionTime = 0;

    this.currentBuildingFocus = 'CAMPUS'; // 'CAMPUS' | 'LHC' | 'ATR' | 'GAL'

    // Focus Centers for each building & overall campus
    this.buildingCenters = {
      CAMPUS: { pos: new THREE.Vector3(-25, 105, 170), target: new THREE.Vector3(0, 10, 5) },
      LHC:    { pos: new THREE.Vector3(-118, 22, 57),  target: new THREE.Vector3(-70, 9, 5) },
      ATR:    { pos: new THREE.Vector3(35, 20, 16),    target: new THREE.Vector3(35, 10, -45) },
      GAL:    { pos: new THREE.Vector3(45, 24, 118),   target: new THREE.Vector3(45, 8, 50) }
    };

    this.initInteractionListeners();
    this.applyBuildingFocus('CAMPUS', false);
  }

  initInteractionListeners() {
    this.controls.addEventListener('start', () => {
      this.cancelTransition();
    });

    this.domElement.addEventListener('pointerdown', () => {
      this.cancelTransition();
    }, { capture: true });

    this.domElement.addEventListener('wheel', () => {
      this.cancelTransition();
    }, { capture: true, passive: true });

    this.controls.addEventListener('change', () => {
      if (!this.isTransitioning) {
        document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
      }
    });
  }

  cancelTransition() {
    if (this.isTransitioning) {
      this.isTransitioning = false;
    }
  }

  applyBuildingFocus(buildingKey, smooth = true) {
    this.currentBuildingFocus = buildingKey;
    const center = this.buildingCenters[buildingKey] || this.buildingCenters.CAMPUS;

    if (!smooth) {
      this.cancelTransition();
      this.camera.position.copy(center.pos);
      this.controls.target.copy(center.target);
      this.controls.update();
    } else {
      this.startTransition(center.pos, center.target, 850);
    }
  }

  applyPreset(presetKey, smooth = true) {
    const center = this.buildingCenters[this.currentBuildingFocus] || this.buildingCenters.CAMPUS;
    const tgt = center.target.clone();

    let pos = center.pos.clone();

    if (presetKey === 'default') {
      pos = center.pos.clone();
    } else if (presetKey === 'front') {
      const dist = (this.currentBuildingFocus === 'CAMPUS') ? 160 : 70;
      pos.set(tgt.x, tgt.y + 12, tgt.z + dist);
    } else if (presetKey === 'back') {
      const dist = (this.currentBuildingFocus === 'CAMPUS') ? 160 : 70;
      pos.set(tgt.x, tgt.y + 12, tgt.z - dist);
    } else if (presetKey === 'left') {
      const dist = (this.currentBuildingFocus === 'CAMPUS') ? 180 : 75;
      pos.set(tgt.x - dist, tgt.y + 12, tgt.z);
    } else if (presetKey === 'right') {
      const dist = (this.currentBuildingFocus === 'CAMPUS') ? 180 : 75;
      pos.set(tgt.x + dist, tgt.y + 12, tgt.z);
    } else if (presetKey === 'top') {
      const height = (this.currentBuildingFocus === 'CAMPUS') ? 220 : 90;
      pos.set(tgt.x, tgt.y + height, tgt.z + 5);
    }

    if (!smooth) {
      this.cancelTransition();
      this.camera.position.copy(pos);
      this.controls.target.copy(tgt);
      this.controls.update();
    } else {
      this.startTransition(pos, tgt, 750);
    }
  }

  focusOnObject(position, distance = 14) {
    const targetLook = new THREE.Vector3(position.x, position.y + 0.6, position.z);
    const targetPos = new THREE.Vector3(
      position.x + distance * 0.5,
      position.y + distance * 0.45,
      position.z + distance * 0.75
    );
    this.startTransition(targetPos, targetLook, 800);
  }

  focusFloor(buildingKey, floorNumber) {
    const center = this.buildingCenters[buildingKey] || this.buildingCenters.LHC;
    const floorHeight = (buildingKey === 'ATR') ? 4.0 : (buildingKey === 'GAL' ? 4.2 : 3.8);
    const floorY = (floorNumber - 1) * floorHeight + floorHeight / 2;

    const targetLook = new THREE.Vector3(center.target.x, floorY, center.target.z);
    const targetPos = new THREE.Vector3(
      center.target.x - 30,
      floorY + 16,
      center.target.z + 45
    );
    this.startTransition(targetPos, targetLook, 750);
  }

  startTransition(targetPos, targetLook, duration = 750) {
    this.startPos.copy(this.camera.position);
    this.startLook.copy(this.controls.target);
    this.targetPos.copy(targetPos);
    this.targetLook.copy(targetLook);
    this.transitionDuration = duration;
    this.transitionTime = 0;
    this.isTransitioning = true;
  }

  update(delta) {
    if (this.isTransitioning) {
      this.transitionTime += delta * 1000;
      const progress = Math.min(this.transitionTime / this.transitionDuration, 1.0);
      
      // Smooth cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(this.startPos, this.targetPos, ease);
      this.controls.target.lerpVectors(this.startLook, this.targetLook, ease);

      if (progress >= 1.0) {
        this.isTransitioning = false;
        this.camera.position.copy(this.targetPos);
        this.controls.target.copy(this.targetLook);
      }
    }

    this.controls.update();
  }
}
