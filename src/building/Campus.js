/**
 * Campus.js - Master NIST University Smart Campus Assembly
 * 
 * Recreates the comprehensive campus environment containing:
 * 1. Lecture Hall Complex (LHC) - 5 Storeys (Floors 1 to 5)
 * 2. Atrium Building (ATR) - 5 Storeys (Floors GF to FOF)
 * 3. Galleria Building (GAL) - 4 Storeys (Floors GF to TF)
 * 
 * Features:
 * - Central Campus Quadrangle connecting all three complexes
 * - Asphalt roadways with traffic markings & concrete pedestrian boulevards
 * - Tropical landscaping: coconut palms, royal palms with tricolor wraps, cypress shrubs
 * - 3D Campus Wayfinding Monolith Signposts
 * - Architectural Streetlamps with illuminated night glow
 * - Consolidated raycaster selectable objects array across all 3 buildings
 */

import * as THREE from 'three';
import { LHCBuilding } from './Building.js';
import { AtriumBuilding } from './AtriumBuilding.js';
import { GalleriaBuilding } from './GalleriaBuilding.js';
import { CAMPUS_CONFIG } from '../data/campusConfig.js';

export class CampusMaster {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = "NIST_University_Campus";

    this.selectableObjects = [];
    this.streetLamps = [];

    this.buildGroundAndRoadways();
    this.buildPedestrianPromenades();
    this.buildCampusLandscaping();
    this.buildWayfindingMonoliths();
    this.buildStreetLamps();
    this.assembleBuildings();
  }

  buildGroundAndRoadways() {
    this.terrainGroup = new THREE.Group();
    this.terrainGroup.name = "Campus_Terrain";

    // 1. Vast Campus Grass Lawn Plane (280m x 240m)
    const lawnGeo = new THREE.PlaneGeometry(280, 240);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x2e5c2e, // lush natural green grass
      roughness: 0.9,
      metalness: 0.05
    });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.y = -0.08;
    lawn.receiveShadow = true;
    this.terrainGroup.add(lawn);

    // 2. Main Campus Peripheral Asphalt Roadway
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x2b3442, // dark campus asphalt
      roughness: 0.8
    });

    // West-East Main Driveway (Z = 25.0)
    const mainRoadGeo = new THREE.BoxGeometry(260, 0.12, 10.0);
    const mainRoad = new THREE.Mesh(mainRoadGeo, roadMat);
    mainRoad.position.set(0, 0.06, 25.0);
    mainRoad.receiveShadow = true;
    this.terrainGroup.add(mainRoad);

    // North-South Avenue connecting Atrium (X = 0.0)
    const northAvenueGeo = new THREE.BoxGeometry(9.0, 0.12, 160);
    const northAvenue = new THREE.Mesh(northAvenueGeo, roadMat);
    northAvenue.position.set(0, 0.06, -30.0);
    northAvenue.receiveShadow = true;
    this.terrainGroup.add(northAvenue);

    // Road White Centerlines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let x = -120; x <= 120; x += 10.0) {
      const lineMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 0.28), lineMat);
      lineMesh.rotation.x = -Math.PI / 2;
      lineMesh.position.set(x, 0.13, 25.0);
      this.terrainGroup.add(lineMesh);
    }

    this.group.add(this.terrainGroup);
  }

  buildPedestrianPromenades() {
    this.walkwaysGroup = new THREE.Group();
    this.walkwaysGroup.name = "Campus_Walkways";

    // Paved stone/brick promenade materials
    const plazaTileMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // modern grey stone pavers
      roughness: 0.65
    });

    const brickPavedMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412, // red terracotta brick paving (matches Galleria front court!)
      roughness: 0.7
    });

    // 1. Central Campus Quad Plaza (Connecting LHC, Atrium, and Galleria)
    const quadGeo = new THREE.BoxGeometry(45.0, 0.15, 35.0);
    const quad = new THREE.Mesh(quadGeo, plazaTileMat);
    quad.position.set(0, 0.08, -5.0);
    quad.receiveShadow = true;
    this.walkwaysGroup.add(quad);

    // 2. Red Brick Pathway leading to Galleria (as seen in galleria-reference.jpg)
    const galWalkwayGeo = new THREE.BoxGeometry(18.0, 0.16, 42.0);
    const galWalkway = new THREE.Mesh(galWalkwayGeo, brickPavedMat);
    galWalkway.position.set(45.0, 0.09, 20.0);
    galWalkway.receiveShadow = true;
    this.walkwaysGroup.add(galWalkway);

    // 3. Paved Promenade leading to Atrium Grand Portico
    const atrWalkwayGeo = new THREE.BoxGeometry(28.0, 0.16, 32.0);
    const atrWalkway = new THREE.Mesh(atrWalkwayGeo, plazaTileMat);
    atrWalkway.position.set(35.0, 0.09, -20.0);
    atrWalkway.receiveShadow = true;
    this.walkwaysGroup.add(atrWalkway);

    // 4. Concrete Walkway connecting LHC Plaza
    const lhcWalkwayGeo = new THREE.BoxGeometry(40.0, 0.16, 12.0);
    const lhcWalkway = new THREE.Mesh(lhcWalkwayGeo, plazaTileMat);
    lhcWalkway.position.set(-35.0, 0.09, 10.0);
    lhcWalkway.receiveShadow = true;
    this.walkwaysGroup.add(lhcWalkway);

    this.group.add(this.walkwaysGroup);
  }

  buildCampusLandscaping() {
    this.landscapeGroup = new THREE.Group();
    this.landscapeGroup.name = "Campus_Landscaping";

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
    const bushMat1 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
    const bushMat2 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });

    // 1. Tropical Palm Tree Alleys along Central Promenade
    const centralPalms = [
      [-15, 35], [-5, 35], [5, 35], [15, 35],
      [-15, 12], [15, 12],
      [-8, -25], [-8, -45],
      [15, -25], [15, -45],
      [25, 45], [35, 45], [55, 45], [65, 45]
    ];

    centralPalms.forEach(([px, pz]) => {
      const palm = new THREE.Group();
      palm.position.set(px, 0, pz);

      const trunkH = 10.5;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.44, trunkH, 8), trunkMat);
      trunk.position.y = trunkH / 2;
      trunk.rotation.z = (Math.random() - 0.5) * 0.08;
      trunk.castShadow = true;
      palm.add(trunk);

      for (let i = 0; i < 9; i++) {
        const angle = (i * Math.PI * 2) / 9;
        const frond = new THREE.Mesh(new THREE.ConeGeometry(1.8, 5.5, 5), frondMat);
        frond.position.set(Math.cos(angle) * 2.4, trunkH + 0.6, Math.sin(angle) * 2.4);
        frond.rotation.x = Math.sin(angle) * 0.8;
        frond.rotation.z = -Math.cos(angle) * 0.8;
        frond.castShadow = true;
        palm.add(frond);
      }
      this.landscapeGroup.add(palm);
    });

    // 2. Conical Cypress / Thuja Shrubs along borders
    for (let x = -20; x <= 20; x += 3.5) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 2.2, 8),
        Math.abs(x) % 2 === 0 ? bushMat1 : bushMat2
      );
      cone.position.set(x, 1.1, -18.0);
      cone.castShadow = true;
      this.landscapeGroup.add(cone);
    }

    // 3. Central Quad Flowerbed Feature
    const flowerbedMat = new THREE.MeshStandardMaterial({ color: 0xb45309 }); // rich soil
    const bedGeo = new THREE.CylinderGeometry(6.0, 6.0, 0.4, 24);
    const flowerbed = new THREE.Mesh(bedGeo, flowerbedMat);
    flowerbed.position.set(0, 0.2, -5.0);
    this.landscapeGroup.add(flowerbed);

    // Quad Central Fountain / Sculpture Plinth
    const centerSculpture = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 2.0, 2.4, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    centerSculpture.position.set(0, 1.4, -5.0);
    centerSculpture.castShadow = true;
    this.landscapeGroup.add(centerSculpture);

    this.group.add(this.landscapeGroup);
  }

  buildWayfindingMonoliths() {
    this.monolithsGroup = new THREE.Group();
    this.monolithsGroup.name = "Campus_Wayfinding";

    // 3D Campus Directional Monolith Signpost at the Central Quad (0, 0, 10)
    const signpost = new THREE.Group();
    signpost.position.set(0, 0, 12.0);

    // Sleek architectural monolith pillar
    const pillarGeo = new THREE.BoxGeometry(2.4, 4.2, 0.5);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 2.1;
    pillar.castShadow = true;
    signpost.add(pillar);

    // Directional Canvas Signboard
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // Dark sleek background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 768);

    // Header banner
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 512, 140);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NIST UNIVERSITY', 256, 65);
    ctx.font = '500 24px system-ui, sans-serif';
    ctx.fillStyle = '#93c5fd';
    ctx.fillText('CAMPUS DIRECTORY', 256, 110);

    // LHC Entry
    ctx.fillStyle = '#115e59';
    ctx.fillRect(24, 165, 464, 160);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⬅️ LECTURE HALL COMPLEX', 44, 225);
    ctx.font = '400 22px system-ui, sans-serif';
    ctx.fillStyle = '#99f6e4';
    ctx.fillText('5 Floors • Lecture Halls 101–509', 44, 275);

    // Atrium Entry
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(24, 355, 464, 160);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.fillText('⬆️ ATRIUM BUILDING', 44, 415);
    ctx.font = '400 22px system-ui, sans-serif';
    ctx.fillStyle = '#bfdbfe';
    ctx.fillText('5 Floors • Cineplex • Labs • Library', 44, 465);

    // Galleria Entry
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(24, 545, 464, 160);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.fillText('➡️ GALLERIA BUILDING', 44, 605);
    ctx.font = '400 22px system-ui, sans-serif';
    ctx.fillStyle = '#fecaca';
    ctx.fillText('4 Floors • 250-Seat Aud • HPC • IBM', 44, 655);

    const signTexture = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
    const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 3.6), signMat);
    signBoard.position.set(0, 2.3, 0.26);
    signpost.add(signBoard);

    // Reverse side sign
    const signBoardBack = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 3.6), signMat);
    signBoardBack.rotation.y = Math.PI;
    signBoardBack.position.set(0, 2.3, -0.26);
    signpost.add(signBoardBack);

    this.monolithsGroup.add(signpost);
    this.group.add(this.monolithsGroup);
  }

  buildStreetLamps() {
    this.lampsGroup = new THREE.Group();
    this.lampsGroup.name = "Campus_Street_Lamps";

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffbeb,
      emissiveIntensity: 0.2
    });

    const lampPositions = [
      [-40, 20], [-10, 20], [20, 20], [50, 20],
      [0, -10], [0, -35], [0, -60],
      [20, 0], [45, 10], [45, 35]
    ];

    lampPositions.forEach(([lx, lz]) => {
      const lamp = new THREE.Group();
      lamp.position.set(lx, 0, lz);

      // Pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.5, 8), poleMat);
      pole.position.y = 2.75;
      pole.castShadow = true;
      lamp.add(pole);

      // Curved Luminaire Arm
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.1), poleMat);
      arm.position.set(0.4, 5.4, 0);
      lamp.add(arm);

      // Light Fixture Box
      const fixture = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.3), lampMat);
      fixture.position.set(0.8, 5.3, 0);
      lamp.add(fixture);

      // PointLight for Night illumination
      const light = new THREE.PointLight(0xfffaed, 0.0, 22.0);
      light.position.set(0.8, 5.1, 0);
      lamp.add(light);

      this.streetLamps.push({ fixture, light });
      this.lampsGroup.add(lamp);
    });

    this.group.add(this.lampsGroup);
  }

  assembleBuildings() {
    // 1. Lecture Hall Complex (LHC)
    this.lhc = new LHCBuilding();
    // Offset LHC to the west side of campus
    this.lhc.group.position.set(
      CAMPUS_CONFIG.buildings.LHC.position.x,
      CAMPUS_CONFIG.buildings.LHC.position.y,
      CAMPUS_CONFIG.buildings.LHC.position.z
    );
    this.group.add(this.lhc.group);

    // 2. Atrium Building (ATR)
    this.atrium = new AtriumBuilding();
    this.group.add(this.atrium.group);

    // 3. Galleria Building (GAL)
    this.galleria = new GalleriaBuilding();
    this.group.add(this.galleria.group);

    // Consolidate selectable objects for Raycaster across all buildings
    this.selectableObjects.push(...this.lhc.selectableObjects);
    this.selectableObjects.push(...this.atrium.selectableObjects);
    this.selectableObjects.push(...this.galleria.selectableObjects);
  }

  setNightMode(isNight) {
    const lampIntensity = isNight ? 1.8 : 0.0;
    const fixtureEmissive = isNight ? 1.0 : 0.2;

    this.streetLamps.forEach(({ fixture, light }) => {
      light.intensity = lampIntensity;
      fixture.material.emissiveIntensity = fixtureEmissive;
    });
  }

  update(delta) {
    if (this.lhc) this.lhc.update(delta);
    if (this.atrium) this.atrium.update(delta);
    if (this.galleria) this.galleria.update(delta);
  }

  focusBuilding(buildingKey) {
    // buildingKey: 'ALL' | 'LHC' | 'ATR' | 'GAL'
    if (buildingKey === 'ALL') {
      this.lhc.focusFloor(0);
      this.atrium.focusFloor(0);
      this.galleria.focusFloor(0);
      this.lhc.group.visible = true;
      this.atrium.group.visible = true;
      this.galleria.group.visible = true;
    } else if (buildingKey === 'LHC') {
      this.lhc.group.visible = true;
      this.atrium.group.visible = true;
      this.galleria.group.visible = true;
    } else if (buildingKey === 'ATR') {
      this.lhc.group.visible = true;
      this.atrium.group.visible = true;
      this.galleria.group.visible = true;
    } else if (buildingKey === 'GAL') {
      this.lhc.group.visible = true;
      this.atrium.group.visible = true;
      this.galleria.group.visible = true;
    }
  }

  setExplodedView(isExploded, targetBuilding = 'ALL') {
    if (targetBuilding === 'ALL' || targetBuilding === 'LHC') {
      this.lhc.setExplodedView(isExploded);
    }
    if (targetBuilding === 'ALL' || targetBuilding === 'ATR') {
      this.atrium.setExplodedView(isExploded);
    }
    if (targetBuilding === 'ALL' || targetBuilding === 'GAL') {
      this.galleria.setExplodedView(isExploded);
    }
  }

  setRoofVisible(visible, targetBuilding = 'ALL') {
    if (targetBuilding === 'ALL' || targetBuilding === 'LHC') {
      if (this.lhc.roofGroup) this.lhc.roofGroup.visible = visible;
    }
    if (targetBuilding === 'ALL' || targetBuilding === 'ATR') {
      if (this.atrium.roofGroup) this.atrium.roofGroup.visible = visible;
    }
    if (targetBuilding === 'ALL' || targetBuilding === 'GAL') {
      if (this.galleria.roofGroup) this.galleria.roofGroup.visible = visible;
    }
  }
}
