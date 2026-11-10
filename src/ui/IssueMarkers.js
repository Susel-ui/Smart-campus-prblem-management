/**
 * IssueMarkers.js - 3D Maintenance Issue Pins & Visual Alerts across NIST Campus
 * 
 * Renders pulsing 3D glowing markers hovering over rooms, auditoriums, labs,
 * and equipment with active maintenance reports across:
 * - Lecture Hall Complex (LHC)
 * - Atrium Building (ATR)
 * - Galleria Building (GAL)
 * 
 * Priority Color Codes:
 * - High:     Red (#ef4444)
 * - Medium:   Orange (#f97316)
 * - Low:      Yellow (#eab308)
 * - Resolved: Green (#22c55e)
 */

import * as THREE from 'three';
import { SAMPLE_ISSUES, ISSUE_PRIORITY_COLORS } from '../data/sampleIssues.js';

export class IssueMarkersManager {
  constructor(scene, campus, onSelectIssue) {
    this.scene = scene;
    this.campus = campus;
    this.onSelectIssue = onSelectIssue;

    this.group = new THREE.Group();
    this.group.name = "MaintenanceIssueMarkers";
    this.scene.add(this.group);

    this.markers = [];
    this.pulseTime = 0;

    this.buildMarkers();
  }

  buildMarkers() {
    // Ensure all world matrices are calculated
    if (this.campus && this.campus.group) {
      this.campus.group.updateMatrixWorld(true);
    }

    SAMPLE_ISSUES.forEach(issue => {
      let targetMesh = null;

      // 1. Check LHC
      if (issue.buildingId === 'LHC' && this.campus.lhc) {
        if (issue.roomId === 'LIFT_01') {
          targetMesh = this.campus.lhc.lift ? this.campus.lhc.lift.hitbox : null;
        } else {
          const room = this.campus.lhc.classrooms.find(r => r.number === issue.roomId);
          if (room) {
            targetMesh = room.hitbox;
          } else {
            const washroom = this.campus.lhc.washrooms.find(w => w.id === issue.roomId);
            if (washroom) targetMesh = washroom.hitbox;
          }
        }
      }

      // 2. Check Atrium
      if (issue.buildingId === 'ATR' && this.campus.atrium) {
        const room = this.campus.atrium.classrooms.find(r => r.userData && (r.userData.id === issue.roomId || r.userData.number === issue.roomId));
        if (room) {
          targetMesh = room;
        } else {
          const washroom = this.campus.atrium.washrooms.find(w => w.id === issue.roomId);
          if (washroom) targetMesh = washroom.hitbox;
        }
      }

      // 3. Check Galleria
      if (issue.buildingId === 'GAL' && this.campus.galleria) {
        const room = this.campus.galleria.classrooms.find(r => r.userData && (r.userData.id === issue.roomId || r.userData.number === issue.roomId));
        if (room) {
          targetMesh = room;
        } else {
          const washroom = this.campus.galleria.washrooms.find(w => w.id === issue.roomId);
          if (washroom) targetMesh = washroom.hitbox;
        }
      }

      if (targetMesh) {
        const markerGroup = new THREE.Group();
        const worldPos = new THREE.Vector3();
        targetMesh.getWorldPosition(worldPos);

        const colorHex = ISSUE_PRIORITY_COLORS[issue.priority] || 0xf97316;

        // 1. Glowing Marker Sphere
        const sphereGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: 0.85,
          roughness: 0.2
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        markerGroup.add(sphere);

        // 2. Pulsing Halo Ring
        const ringGeo = new THREE.RingGeometry(0.55, 0.85, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        markerGroup.add(ring);

        // Position above the facility ceiling
        markerGroup.position.set(worldPos.x, worldPos.y + 3.2, worldPos.z);

        // Make marker clickable
        sphere.userData = {
          isSelectable: true,
          isIssueMarker: true,
          issueData: issue,
          targetMesh: targetMesh
        };

        this.group.add(markerGroup);
        this.markers.push({ group: markerGroup, ring, sphere, baseY: markerGroup.position.y });
        this.campus.selectableObjects.push(sphere);
      }
    });
  }

  update(delta) {
    this.pulseTime += delta * 3.5;

    this.markers.forEach((item, index) => {
      const offset = index * 0.4;
      const scale = 1.0 + Math.sin(this.pulseTime + offset) * 0.25;
      item.ring.scale.set(scale, scale, scale);
      item.ring.material.opacity = 0.7 - (scale - 1.0) * 1.5;

      // Bobbing floating motion
      item.group.position.y = item.baseY + Math.sin(this.pulseTime * 0.7 + offset) * 0.2;
    });
  }
}
