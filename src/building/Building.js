/**
 * Building.js - Master LHC Architectural Reconstruction
 * 
 * Unifies all components:
 * - 5 Structurally aligned Floors (Floors 1 through 5)
 * - Prominent Left Main Anchor Block
 * - Elongated Connected Academic Wing
 * - External Left Staircase (Staircase 1)
 * - Opposite-Side Right Staircase (Staircase 2)
 * - Independent 5-Storey Lift Tower (LIFT_01)
 * - Flat Rooftop & Penthouse Structures
 * - Surrounding Campus Landscaping (Asphalt road, palms, hedges matching photo)
 */

import * as THREE from 'three';
import { BUILDING_CONFIG, generateRoomsData, WASHROOMS_CONFIG } from '../data/buildingConfig.js';
import { Classroom } from './Room.js';
import { Washroom } from './Washroom.js';
import { FloorLevel } from './Floor.js';
import { MainBlock } from './MainBlock.js';
import { AcademicWing } from './AcademicWing.js';
import { buildStaircaseStructure } from './Staircase.js';
import { PassengerLift } from '../structures/Lift.js';

export class LHCBuilding {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = "LHC_Building_Root";

    this.floors = [];
    this.classrooms = [];
    this.washrooms = [];
    this.selectableObjects = [];

    this.buildCampusEnvironment();
    this.buildBuildingStructures();
    this.buildRooftop();
    this.buildElevatorAndStairs();
  }

  buildCampusEnvironment() {
    this.siteGroup = new THREE.Group();
    this.siteGroup.name = "CampusSite";

    // 1. Manicured Campus Grass Lawn
    const lawnGeo = new THREE.PlaneGeometry(160, 120);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x2e5c2e, // lush natural green grass
      roughness: 0.9,
      metalness: 0.05
    });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.y = -0.05;
    lawn.receiveShadow = true;
    this.siteGroup.add(lawn);

    // 2. Concrete Campus Plaza & Building Plinth
    const plazaWidth = BUILDING_CONFIG.mainBlock.width + BUILDING_CONFIG.academicWing.width + 12;
    const plazaDepth = 32;
    const plazaGeo = new THREE.BoxGeometry(plazaWidth, 0.2, plazaDepth);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // paved plaza
      roughness: 0.7
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(3.0, 0.1, 4.0);
    plaza.receiveShadow = true;
    this.siteGroup.add(plaza);

    // 3. Asphalt Access Road (Running alongside front, visible in photo!)
    const roadGeo = new THREE.BoxGeometry(160, 0.08, 9.0);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // dark asphalt driveway
      roughness: 0.8
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(0, 0.14, 25.0);
    road.receiveShadow = true;
    this.siteGroup.add(road);

    // Road White Centerline Markings
    for (let m = -70; m < 70; m += 8) {
      const lineMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(4.0, 0.25),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      lineMesh.rotation.x = -Math.PI / 2;
      lineMesh.position.set(m, 0.19, 25.0);
      this.siteGroup.add(lineMesh);
    }

    // 4. Manicured Conical Green Shrubs along building base (visible in photo!)
    const shrubMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const shrubMat2 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });

    for (let x = -40; x <= 45; x += 3.2) {
      // Conical Cypress / Thuja bush
      const coneGeo = new THREE.ConeGeometry(0.85, 2.4, 8);
      const bush = new THREE.Mesh(coneGeo, (Math.abs(x) % 2 === 0) ? shrubMat1 : shrubMat2);
      bush.position.set(x, 1.2, 13.5);
      bush.castShadow = true;
      this.siteGroup.add(bush);
    }

    // Low Flowering Border Hedge in front of shrubs (visible in photo)
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.8 }); // golden/green hedge
    const hedgeGeo = new THREE.BoxGeometry(88, 0.6, 0.8);
    const hedge = new THREE.Mesh(hedgeGeo, hedgeMat);
    hedge.position.set(2.5, 0.4, 15.5);
    hedge.castShadow = true;
    this.siteGroup.add(hedge);

    // 5. Palm Trees along the right side walkway (recreating photo's tropical campus framing!)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });

    const palmCoords = [
      [22, 33], [32, 33], [42, 33], [52, 33], [62, 33], [72, 33],
      [55, 12], [65, 12], [75, 12]
    ];
    palmCoords.forEach(([px, pz]) => {
      const palmGroup = new THREE.Group();
      palmGroup.position.set(px, 0, pz);

      // Curved Trunk
      const trunkHeight = 9.5;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.42, trunkHeight, 8),
        trunkMat
      );
      trunk.position.set(0, trunkHeight / 2, 0);
      trunk.rotation.z = -0.06;
      trunk.castShadow = true;
      palmGroup.add(trunk);

      // Palm Crown Fronds
      for (let i = 0; i < 9; i++) {
        const angle = (i * Math.PI * 2) / 9;
        const frond = new THREE.Mesh(
          new THREE.ConeGeometry(1.6, 5.0, 5),
          frondMat
        );
        frond.position.set(
          Math.cos(angle) * 2.2,
          trunkHeight + 0.5,
          Math.sin(angle) * 2.2
        );
        frond.rotation.x = Math.sin(angle) * 0.8;
        frond.rotation.z = -Math.cos(angle) * 0.8;
        frond.castShadow = true;
        palmGroup.add(frond);
      }
      this.siteGroup.add(palmGroup);
    });

    this.group.add(this.siteGroup);
  }

  buildBuildingStructures() {
    // 1. Left Main Anchor Block
    this.mainBlock = new MainBlock();
    this.group.add(this.mainBlock.group);

    // 2. Long Connected Academic Wing
    this.academicWing = new AcademicWing();
    this.group.add(this.academicWing.group);

    // 3. Generate all Classrooms & Washrooms by Floor
    const allRoomsData = generateRoomsData();

    for (let f = 1; f <= BUILDING_CONFIG.floorsCount; f++) {
      const floorRoomsData = allRoomsData.filter(r => r.floor === f);
      const floorWashroomConfig = WASHROOMS_CONFIG.filter(w => w.floor === f);

      // Build Classroom instances
      const floorClassrooms = floorRoomsData.map(rData => {
        const room = new Classroom(rData);
        this.classrooms.push(room);
        this.selectableObjects.push(room.hitbox);

        // Add room's fans and lights to selectable objects
        room.fans.forEach(fan => this.selectableObjects.push(fan.hitbox));
        room.lights.forEach(light => this.selectableObjects.push(light.hitbox));

        return room;
      });

      // Build Washroom instances
      const floorWashrooms = floorWashroomConfig.map(wData => {
        const washroom = new Washroom(wData);
        this.washrooms.push(washroom);
        this.selectableObjects.push(washroom.hitbox);
        washroom.fixtures.forEach(fixture => this.selectableObjects.push(fixture));
        return washroom;
      });

      // Assemble Floor Level
      const floorLevel = new FloorLevel({
        floorNumber: f,
        elevationY: (f - 1) * BUILDING_CONFIG.floorHeight,
        rooms: floorClassrooms,
        washrooms: floorWashrooms
      });

      this.floors.push(floorLevel);
      this.group.add(floorLevel.group);
    }
  }

  buildRooftop() {
    this.roofGroup = new THREE.Group();
    this.roofGroup.name = "Rooftop_Level";

    const totalHeight = BUILDING_CONFIG.floorsCount * BUILDING_CONFIG.floorHeight;
    this.roofGroup.position.set(0, totalHeight, 0);

    const totalWidth = BUILDING_CONFIG.mainBlock.width + BUILDING_CONFIG.academicWing.width;
    const roofDepth = 17.5;

    const slabMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.6,
      metalness: 0.1
    });
    const parapetMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.5
    });
    const tealTrimMat = new THREE.MeshStandardMaterial({
      color: 0x115e59,
      roughness: 0.35
    });

    // 1. Flat Roof Concrete Slab
    const roofGeo = new THREE.BoxGeometry(totalWidth, 0.4, roofDepth);
    const roofMesh = new THREE.Mesh(roofGeo, slabMat);
    roofMesh.position.set(
      (BUILDING_CONFIG.mainBlock.centerX + BUILDING_CONFIG.academicWing.centerX) / 2 + 7.5,
      0.2,
      0
    );
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    this.roofGroup.add(roofMesh);

    // 2. Perimeter Parapet Wall (1.1m high)
    const ph = BUILDING_CONFIG.parapetHeight;
    const parapetGeo = new THREE.BoxGeometry(totalWidth, ph, 0.35);

    // Front parapet
    const frontParapet = new THREE.Mesh(parapetGeo, parapetMat);
    frontParapet.position.set(
      (BUILDING_CONFIG.mainBlock.centerX + BUILDING_CONFIG.academicWing.centerX) / 2 + 7.5,
      0.4 + ph / 2,
      roofDepth / 2 - 0.18
    );
    this.roofGroup.add(frontParapet);

    // Front Parapet Teal Cap (matches photo's roofline trim)
    const capGeo = new THREE.BoxGeometry(totalWidth + 0.1, 0.15, 0.45);
    const parapetCap = new THREE.Mesh(capGeo, tealTrimMat);
    parapetCap.position.set(
      (BUILDING_CONFIG.mainBlock.centerX + BUILDING_CONFIG.academicWing.centerX) / 2 + 7.5,
      0.4 + ph + 0.075,
      roofDepth / 2 - 0.18
    );
    this.roofGroup.add(parapetCap);

    // Rear parapet
    const rearParapet = new THREE.Mesh(parapetGeo, parapetMat);
    rearParapet.position.set(
      (BUILDING_CONFIG.mainBlock.centerX + BUILDING_CONFIG.academicWing.centerX) / 2 + 7.5,
      0.4 + ph / 2,
      -roofDepth / 2 + 0.18
    );
    this.roofGroup.add(rearParapet);

    // 3. Rooftop Solar Panel Arrays
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // dark solar blue
      metalness: 0.9,
      roughness: 0.1
    });

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 8; c++) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.5), solarMat);
        panel.position.set(c * 3.2 - 2, 0.65, -3.5 + r * 2.6);
        panel.rotation.x = -0.28; // tilted facing sunlight
        panel.castShadow = true;
        this.roofGroup.add(panel);
      }
    }

    // 4. Rooftop Mechanical HVAC Chillers
    const chillerMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.6,
      roughness: 0.4
    });
    for (let i = 0; i < 3; i++) {
      const chiller = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 2.0), chillerMat);
      chiller.position.set(24 + i * 4.2, 1.2, 2.5);
      chiller.castShadow = true;
      this.roofGroup.add(chiller);
    }

    this.group.add(this.roofGroup);
  }

  buildElevatorAndStairs() {
    // 1. Left-Side External Staircase (Staircase 1)
    this.leftStaircase = buildStaircaseStructure({
      id: BUILDING_CONFIG.leftStaircase.id,
      name: BUILDING_CONFIG.leftStaircase.name,
      position: BUILDING_CONFIG.leftStaircase.position,
      floorsCount: BUILDING_CONFIG.floorsCount,
      floorHeight: BUILDING_CONFIG.floorHeight,
      width: BUILDING_CONFIG.leftStaircase.flightWidth,
      isOpenExterior: true
    });
    this.group.add(this.leftStaircase);

    // 2. Opposite-Side Staircase (Staircase 2)
    this.rightStaircase = buildStaircaseStructure({
      id: BUILDING_CONFIG.rightStaircase.id,
      name: BUILDING_CONFIG.rightStaircase.name,
      position: BUILDING_CONFIG.rightStaircase.position,
      floorsCount: BUILDING_CONFIG.floorsCount,
      floorHeight: BUILDING_CONFIG.floorHeight,
      width: BUILDING_CONFIG.rightStaircase.flightWidth,
      isOpenExterior: false
    });
    this.group.add(this.rightStaircase);

    // 3. Independent Passenger Elevator (LIFT_01)
    this.lift = new PassengerLift(BUILDING_CONFIG.lift);
    this.group.add(this.lift.group);
    this.selectableObjects.push(this.lift.hitbox);
  }

  update(delta) {
    // Update animated ceiling fans
    this.floors.forEach(floor => floor.update(delta));
    // Update animated lift
    if (this.lift) {
      this.lift.update(delta);
    }
  }

  focusFloor(targetFloor) {
    // targetFloor: 0 = Entire Building, 1..5 = Specific Floor
    if (targetFloor === 0) {
      // Show all floors fully
      this.floors.forEach(floor => {
        floor.group.visible = true;
        floor.setOpacity(1.0);
      });
      this.roofGroup.visible = true;
    } else {
      // Focus on selected floor
      this.floors.forEach(floor => {
        if (floor.floorNumber === targetFloor) {
          floor.group.visible = true;
          floor.setOpacity(1.0);
        } else if (floor.floorNumber < targetFloor) {
          // Lower floors: visible as solid base
          floor.group.visible = true;
          floor.setOpacity(0.85);
        } else {
          // Upper floors: hide or make semi-transparent for clear interior view!
          floor.group.visible = false;
        }
      });
      // Hide roof so interior is visible
      this.roofGroup.visible = false;
    }
  }

  setExplodedView(isExploded) {
    const spacing = 5.5;
    this.floors.forEach((floor, idx) => {
      floor.group.position.y = isExploded
        ? floor.elevationY + idx * spacing
        : floor.elevationY;
    });

    if (this.roofGroup) {
      const totalH = BUILDING_CONFIG.floorsCount * BUILDING_CONFIG.floorHeight;
      this.roofGroup.position.y = isExploded ? totalH + 5 * spacing : totalH;
    }
  }
}
