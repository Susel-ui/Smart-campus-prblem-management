/**
 * SelectionManager.js - Raycaster Mouse Picking & Hover Highlights
 * 
 * Interactively detects and selects:
 * - Classrooms & Lecture Halls
 * - Washroom facilities & Sanitary Fixtures (Taps, Lights, Exhausts)
 * - Equipment fixtures: Ceiling fans, Luminaires, Projector Screen
 * - Independent Passenger Lift (LIFT_01)
 * 
 * Distinguishes true mouse clicks from camera rotation drags
 * so orbiting the 3D model is always smooth and never interrupted.
 */

import * as THREE from 'three';

export class SelectionManager {
  constructor(camera, domElement, selectableObjects, onSelectCallback, onHoverCallback) {
    this.camera = camera;
    this.domElement = domElement;
    this.selectableObjects = selectableObjects;
    this.onSelect = onSelectCallback;
    this.onHover = onHoverCallback;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.hoveredObject = null;
    this.selectedObject = null;

    // Track click vs drag
    this.pointerDownPos = { x: 0, y: 0 };
    this.pointerDownTime = 0;

    this.initListeners();
  }

  setSelectableObjects(objects) {
    this.selectableObjects = objects;
  }

  initListeners() {
    this.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.domElement.addEventListener('pointerup', this.onPointerUp.bind(this));
  }

  updateMouse(e) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  onPointerMove(e) {
    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.selectableObjects, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;

      if (hit.userData && hit.userData.isSelectable) {
        this.domElement.style.cursor = 'pointer';

        if (this.hoveredObject !== hit) {
          if (this.hoveredObject && this.hoveredObject !== this.selectedObject) {
            this.clearHighlight(this.hoveredObject);
          }
          this.hoveredObject = hit;
          this.applyHighlight(hit, 0.25);
        }

        if (this.onHover) {
          this.onHover(hit.userData, e);
        }
        return;
      }
    }

    // Nothing hovered
    this.domElement.style.cursor = 'default';
    if (this.hoveredObject && this.hoveredObject !== this.selectedObject) {
      this.clearHighlight(this.hoveredObject);
    }
    this.hoveredObject = null;
    if (this.onHover) {
      this.onHover(null, e);
    }
  }

  onPointerDown(e) {
    // Record starting coordinate to distinguish click vs drag
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.pointerDownTime = performance.now();
  }

  onPointerUp(e) {
    // Only primary left button
    if (e.button !== 0) return;

    // Calculate movement distance
    const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
    const duration = performance.now() - this.pointerDownTime;

    // If moved more than 6px or held longer than 800ms, it was a camera drag, NOT a click!
    if (dist > 6 || duration > 800) {
      return;
    }

    this.updateMouse(e);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.selectableObjects, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData && hit.userData.isSelectable) {
        this.selectObject(hit);
        return;
      }
    }

    // Clicked on empty space: deselect
    // this.deselect();
  }

  selectObject(mesh) {
    if (this.selectedObject && this.selectedObject !== mesh) {
      this.clearHighlight(this.selectedObject);
    }

    this.selectedObject = mesh;
    this.applyHighlight(mesh, 0.45);

    if (this.onSelect) {
      this.onSelect(mesh.userData, mesh);
    }
  }

  deselect() {
    if (this.selectedObject) {
      this.clearHighlight(this.selectedObject);
      this.selectedObject = null;
    }
    if (this.onSelect) {
      this.onSelect(null, null);
    }
  }

  applyHighlight(mesh, opacity) {
    if (!mesh || !mesh.material) return;
    mesh.material.opacity = opacity;
    const highlightColor = mesh.userData.isWashroom ? 0x14b8a6 : 0x38bdf8;
    mesh.material.color.setHex(highlightColor);
  }

  clearHighlight(mesh) {
    if (!mesh || !mesh.material) return;
    mesh.material.opacity = 0.0;
  }
}
