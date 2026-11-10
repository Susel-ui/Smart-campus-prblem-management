/**
 * AtriumBuilding.js - Procedural 3D Reconstruction of NIST University Atrium Building
 * 
 * Faithfully reproduces the architectural identity from reference photos:
 * - 5-Storey structure (Ground Floor GF, FF, SF, TF, FOF)
 * - Sweeping curved blue curtain-wall glass atrium with "ATRIUM" signage
 * - Grand double-height entrance portico with monumental cylindrical white columns & wide entry stairs
 * - Cream-white flanking wings with distinctive vertical triple-slit windows
 * - Cylindrical/drum rooftop penthouse structure
 * - Reconstructed interiors: 25 Classrooms, 11 Labs, 13 Faculty Rooms,
 *   SAC, Business School, Business School Library, Stephen Hawking Cineplex,
 *   washrooms, internal atrium gallery, stairs & passenger lift
 */

import * as THREE from 'three';
import { CAMPUS_CONFIG, generateAtriumRooms, CAMPUS_WASHROOMS } from '../data/campusConfig.js';
import { Classroom } from './Room.js';
import { Washroom } from './Washroom.js';

export class AtriumBuilding {
  constructor() {
    this.config = CAMPUS_CONFIG.buildings.ATR;
    this.group = new THREE.Group();
    this.group.name = "Building_Atrium_Root";
    this.group.position.set(this.config.position.x, this.config.position.y, this.config.position.z);

    this.floorsCount = 5;
    this.floorHeight = 4.0;
    this.width = 62.0;
    this.depth = 34.0;
    this.totalHeight = this.floorsCount * this.floorHeight; // 20.0m

    this.floors = [];
    this.classrooms = [];
    this.washrooms = [];
    this.specialFacilities = [];
    this.selectableObjects = [];

    this.initMaterials();
    this.buildExteriorShell();
    this.buildPorticoAndStairs();
    this.buildCurvedGlassAtrium();
    this.buildRooftopDrum();
    this.buildFloorsAndInteriors();
  }

  initMaterials() {
    this.matConcreteCream = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6, // cream-white exterior concrete from photo
      roughness: 0.65,
      metalness: 0.05
    });

    this.matWallInterior = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      roughness: 0.7
    });

    this.matFloorSlab = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.5
    });

    this.matCurtainGlass = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8, // vibrant royal blue curtain wall glass from photo
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 0.8,
      transparent: true,
      opacity: 0.85,
      reflectivity: 0.9
    });

    this.matMullionDark = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3
    });

    this.matWindowBronze = new THREE.MeshStandardMaterial({
      color: 0x451a03, // dark bronze/wood frames matching photos
      metalness: 0.3,
      roughness: 0.5
    });

    this.matWindowGlass = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.5,
      roughness: 0.2
    });

    this.matDarkStairs = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // dark charcoal/black stone entrance steps
      roughness: 0.8
    });

    this.matFasciaSign = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3
    });
  }

  buildExteriorShell() {
    this.shellGroup = new THREE.Group();
    this.shellGroup.name = "Atrium_Exterior_Shell";

    const wingWidth = 19.0;
    const wingDepth = 28.0;

    // 1. Left (West) Wing Main Massing
    const leftWingGeo = new THREE.BoxGeometry(wingWidth, this.totalHeight, wingDepth);
    const leftWing = new THREE.Mesh(leftWingGeo, this.matConcreteCream);
    leftWing.position.set(-this.width / 2 + wingWidth / 2, this.totalHeight / 2, -2.0);
    leftWing.castShadow = true;
    leftWing.receiveShadow = true;
    this.shellGroup.add(leftWing);

    // 2. Right (East) Wing Main Massing
    const rightWingGeo = new THREE.BoxGeometry(wingWidth, this.totalHeight, wingDepth);
    const rightWing = new THREE.Mesh(rightWingGeo, this.matConcreteCream);
    rightWing.position.set(this.width / 2 - wingWidth / 2, this.totalHeight / 2, -2.0);
    rightWing.castShadow = true;
    rightWing.receiveShadow = true;
    this.shellGroup.add(rightWing);

    // 3. Rear Connecting Spine
    const rearSpineGeo = new THREE.BoxGeometry(this.width, this.totalHeight, 6.0);
    const rearSpine = new THREE.Mesh(rearSpineGeo, this.matConcreteCream);
    rearSpine.position.set(0, this.totalHeight / 2, -wingDepth / 2 - 1.0);
    rearSpine.castShadow = true;
    rearSpine.receiveShadow = true;
    this.shellGroup.add(rearSpine);

    // 4. Punch out Distinctive Triple-Slit Windows on Front Facade of Both Wings
    this.buildTripleSlitWindows();

    this.group.add(this.shellGroup);
  }

  buildTripleSlitWindows() {
    // Recreates the distinctive vertical triplet rectangular windows visible in photos
    const slotW = 0.55;
    const slotH = 2.1;
    const slotD = 0.25;

    // Window frame geometry
    const frameGeo = new THREE.BoxGeometry(slotW, slotH, slotD);
    const glassGeo = new THREE.BoxGeometry(slotW - 0.08, slotH - 0.08, slotD + 0.05);

    for (let f = 0; f < this.floorsCount; f++) {
      const y = f * this.floorHeight + 2.2;

      // Left Wing: 2 column sets of triple windows
      const leftCols = [-26.0, -18.0];
      leftCols.forEach(cx => {
        // 3 slits spaced closely together
        [-0.8, 0, 0.8].forEach(dx => {
          const frame = new THREE.Mesh(frameGeo, this.matWindowBronze);
          frame.position.set(cx + dx, y, 12.05);
          this.shellGroup.add(frame);

          const glass = new THREE.Mesh(glassGeo, this.matWindowGlass);
          glass.position.set(cx + dx, y, 12.05);
          this.shellGroup.add(glass);
        });
      });

      // Right Wing: 3 column sets of triple windows (matches atrium-reference-1.png!)
      const rightCols = [15.0, 21.0, 27.0];
      rightCols.forEach(cx => {
        [-0.8, 0, 0.8].forEach(dx => {
          const frame = new THREE.Mesh(frameGeo, this.matWindowBronze);
          frame.position.set(cx + dx, y, 12.05);
          this.shellGroup.add(frame);

          const glass = new THREE.Mesh(glassGeo, this.matWindowGlass);
          glass.position.set(cx + dx, y, 12.05);
          this.shellGroup.add(glass);
        });
      });

      // Side Wall regular windows (East elevation, visible in photo 1)
      for (let sz = -10; sz <= 8; sz += 5.0) {
        const sideFrame = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.0, 1.8), this.matWindowBronze);
        sideFrame.position.set(this.width / 2 + 0.1, y, sz);
        this.shellGroup.add(sideFrame);

        const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.85, 1.65), this.matWindowGlass);
        sideGlass.position.set(this.width / 2 + 0.1, y, sz);
        this.shellGroup.add(sideGlass);
      }
    }
  }

  buildPorticoAndStairs() {
    this.porticoGroup = new THREE.Group();
    this.porticoGroup.name = "Atrium_Portico_Stairs";

    // 1. Wide Entrance Flight of Dark Black/Grey Steps (visible in atrium-reference-2.png)
    const stepStepsCount = 8;
    const stepWidth = 26.0;
    const stepTread = 0.65;
    const stepRise = 0.18;

    for (let s = 0; s < stepStepsCount; s++) {
      const stepGeo = new THREE.BoxGeometry(
        stepWidth + s * 0.8,
        stepRise,
        stepTread * (stepStepsCount - s)
      );
      const step = new THREE.Mesh(stepGeo, this.matDarkStairs);
      step.position.set(0, s * stepRise + stepRise / 2, 12.0 + (stepStepsCount - s) * stepTread * 0.5);
      step.receiveShadow = true;
      this.porticoGroup.add(step);
    }

    // 2. Portico Podium Plinth
    const plinthGeo = new THREE.BoxGeometry(26.0, 0.4, 8.0);
    const plinth = new THREE.Mesh(plinthGeo, this.matDarkStairs);
    plinth.position.set(0, stepStepsCount * stepRise + 0.2, 10.0);
    plinth.receiveShadow = true;
    this.porticoGroup.add(plinth);

    // 3. Tall Monumental Cylindrical White Columns
    // In photo: 4 massive cylindrical columns supporting the open portico below the curved glass
    const colGeo = new THREE.CylinderGeometry(0.65, 0.65, this.floorHeight, 24);
    const colMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4
    });

    const colXPositions = [-9.0, -3.0, 3.0, 9.0];
    colXPositions.forEach(cx => {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(cx, this.floorHeight / 2, 12.5);
      col.castShadow = true;
      this.porticoGroup.add(col);

      // Column capital trim
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.65, 0.35, 24), colMat);
      cap.position.set(cx, this.floorHeight - 0.17, 12.5);
      this.porticoGroup.add(cap);
    });

    // 4. Portico Ceiling / Transition Beam
    const beamGeo = new THREE.BoxGeometry(25.5, 0.6, 6.0);
    const beam = new THREE.Mesh(beamGeo, this.matConcreteCream);
    beam.position.set(0, this.floorHeight + 0.3, 11.5);
    beam.castShadow = true;
    this.porticoGroup.add(beam);

    // 5. Signage Fascia: "ATRIUM"
    this.buildAtriumSignage();

    // 6. Two Prominent Royal Palm Trees with Indian Tricolor Trunk Wraps (Directly visible in photo 2!)
    this.buildTricolorPalmTrees();

    this.group.add(this.porticoGroup);
  }

  buildAtriumSignage() {
    // Canvas texture for crisp official "A T R I U M" lettering on the fascia band
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Clean white acrylic background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 128);

    // Blue accent line
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(0, 116, 1024, 12);

    // Bold spaced letters: A T R I U M
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 58px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '18px';
    ctx.fillText('A  T  R  I  U  M', 512, 60);

    const signTexture = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture });

    const signGeo = new THREE.PlaneGeometry(16.0, 1.8);
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, this.floorHeight + 0.9, 13.52);
    this.porticoGroup.add(signMesh);
  }

  buildTricolorPalmTrees() {
    // In photo: 2 large royal palms directly framing the central steps with Indian tricolor base wraps
    const palmPositions = [
      { x: -11.5, z: 21.0 },
      { x: 11.5, z: 21.0 }
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    const saffronMat = new THREE.MeshStandardMaterial({ color: 0xff9933 }); // Indian saffron
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });   // Indian white
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x138808 });   // Indian green
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

    palmPositions.forEach(pos => {
      const palmGroup = new THREE.Group();
      palmGroup.position.set(pos.x, 0, pos.z);

      // Main trunk (tall royal palm)
      const trunkH = 14.0;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.52, trunkH, 12),
        trunkMat
      );
      trunk.position.y = trunkH / 2;
      trunk.castShadow = true;
      palmGroup.add(trunk);

      // Tricolor wraps at base of trunk
      const wrapR = 0.54;
      const wrapH = 0.65;

      const saffronMesh = new THREE.Mesh(new THREE.CylinderGeometry(wrapR, wrapR, wrapH, 12), saffronMat);
      saffronMesh.position.y = wrapH * 2.5;
      palmGroup.add(saffronMesh);

      const whiteMesh = new THREE.Mesh(new THREE.CylinderGeometry(wrapR, wrapR, wrapH, 12), whiteMat);
      whiteMesh.position.y = wrapH * 1.5;
      palmGroup.add(whiteMesh);

      const greenMesh = new THREE.Mesh(new THREE.CylinderGeometry(wrapR, wrapR, wrapH, 12), greenMat);
      greenMesh.position.y = wrapH * 0.5;
      palmGroup.add(greenMesh);

      // Palm Crown fronds
      for (let i = 0; i < 14; i++) {
        const angle = (i * Math.PI * 2) / 14;
        const frond = new THREE.Mesh(new THREE.ConeGeometry(2.0, 7.5, 5), frondMat);
        frond.position.set(Math.cos(angle) * 3.0, trunkH + 0.8, Math.sin(angle) * 3.0);
        frond.rotation.x = Math.sin(angle) * 0.9;
        frond.rotation.z = -Math.cos(angle) * 0.9;
        frond.castShadow = true;
        palmGroup.add(frond);
      }

      this.porticoGroup.add(palmGroup);
    });
  }

  buildCurvedGlassAtrium() {
    this.atriumCurtainGroup = new THREE.Group();
    this.atriumCurtainGroup.name = "Curved_Glass_Curtain_Wall";

    // Reconstructs the monumental curved blue curtain glass facade (floors 2 to 5)
    // Curvature: arc spanning 24 meters wide with outward bow
    const segments = 16;
    const glassWidth = 24.0;
    const glassHeight = (this.floorsCount - 1) * this.floorHeight; // 16.0m
    const radius = 28.0;
    const arcAngle = 0.85; // approx 48 degrees arc

    // Curved cylinder sector for glass
    const glassGeo = new THREE.CylinderGeometry(
      radius,
      radius,
      glassHeight,
      segments,
      4,
      true, // open-ended
      -arcAngle / 2 + Math.PI / 2,
      arcAngle
    );

    const glassMesh = new THREE.Mesh(glassGeo, this.matCurtainGlass);
    glassMesh.position.set(0, this.floorHeight + glassHeight / 2, 13.5 - radius);
    glassMesh.castShadow = true;
    glassMesh.receiveShadow = true;
    this.atriumCurtainGroup.add(glassMesh);

    // Structural Horizontal and Vertical Mullion Grid
    const mullionMat = this.matMullionDark;

    // Horizontal Mullion Rings
    for (let f = 1; f <= this.floorsCount; f++) {
      const ringGeo = new THREE.CylinderGeometry(
        radius + 0.05,
        radius + 0.05,
        0.18,
        segments,
        1,
        true,
        -arcAngle / 2 + Math.PI / 2,
        arcAngle
      );
      const ring = new THREE.Mesh(ringGeo, mullionMat);
      ring.position.set(0, f * this.floorHeight, 13.5 - radius);
      this.atriumCurtainGroup.add(ring);
    }

    // Vertical Mullion Posts
    for (let i = 0; i <= segments; i++) {
      const theta = -arcAngle / 2 + (i / segments) * arcAngle;
      const vx = Math.sin(theta) * radius;
      const vz = Math.cos(theta) * radius;

      const postGeo = new THREE.BoxGeometry(0.12, glassHeight, 0.2);
      const post = new THREE.Mesh(postGeo, mullionMat);
      post.position.set(vx, this.floorHeight + glassHeight / 2, 13.5 - radius + vz);
      post.rotation.y = theta;
      this.atriumCurtainGroup.add(post);
    }

    this.group.add(this.atriumCurtainGroup);
  }

  buildRooftopDrum() {
    this.roofGroup = new THREE.Group();
    this.roofGroup.name = "Atrium_Rooftop_Drum";
    this.roofGroup.position.set(0, this.totalHeight, 0);

    // 1. Main Roof Concrete Slab
    const slabGeo = new THREE.BoxGeometry(this.width + 1.0, 0.4, this.depth + 1.0);
    const slab = new THREE.Mesh(slabGeo, this.matConcreteCream);
    slab.position.set(0, 0.2, -2.0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    this.roofGroup.add(slab);

    // 2. Rooftop Parapet Wall
    const parapetMat = this.matConcreteCream;
    const ph = 1.1;

    // Front left parapet
    const pl = new THREE.Mesh(new THREE.BoxGeometry(19.0, ph, 0.35), parapetMat);
    pl.position.set(-this.width / 2 + 9.5, ph / 2 + 0.4, 12.0);
    this.roofGroup.add(pl);

    // Front right parapet
    const pr = new THREE.Mesh(new THREE.BoxGeometry(19.0, ph, 0.35), parapetMat);
    pr.position.set(this.width / 2 - 9.5, ph / 2 + 0.4, 12.0);
    this.roofGroup.add(pr);

    // Rear and side parapets
    const prear = new THREE.Mesh(new THREE.BoxGeometry(this.width, ph, 0.35), parapetMat);
    prear.position.set(0, ph / 2 + 0.4, -this.depth / 2 - 1.0);
    this.roofGroup.add(prear);

    // 3. Distinctive Cylindrical Rooftop Penthouse Drum (Prominently visible in atrium-reference-2.png!)
    const drumR = 9.5;
    const drumH = 4.5;
    const drumGeo = new THREE.CylinderGeometry(drumR, drumR, drumH, 32);
    const drum = new THREE.Mesh(drumGeo, this.matConcreteCream);
    drum.position.set(0, drumH / 2 + 0.4, -1.0);
    drum.castShadow = true;
    this.roofGroup.add(drum);

    // Drum Upper Ring & Cap
    const drumCap = new THREE.Mesh(new THREE.CylinderGeometry(drumR + 0.4, drumR + 0.4, 0.3, 32), parapetMat);
    drumCap.position.set(0, drumH + 0.45, -1.0);
    this.roofGroup.add(drumCap);

    // Drum Mechanical Louvers / Windows
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const louver = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.2), this.matMullionDark);
      louver.position.set(Math.cos(angle) * (drumR + 0.05), drumH / 2 + 0.4, -1.0 + Math.sin(angle) * (drumR + 0.05));
      louver.rotation.y = -angle + Math.PI / 2;
      this.roofGroup.add(louver);
    }

    this.group.add(this.roofGroup);
  }

  buildFloorsAndInteriors() {
    const atriumRooms = generateAtriumRooms();
    const atriumWashrooms = CAMPUS_WASHROOMS.filter(w => w.building === "ATR");

    for (let f = 1; f <= this.floorsCount; f++) {
      const floorGroup = new THREE.Group();
      floorGroup.name = `Atrium_Floor_${f}`;
      const elevationY = (f - 1) * this.floorHeight;
      floorGroup.position.set(0, elevationY, 0);

      // Floor Concrete Intermediate Slab
      const slabMesh = new THREE.Mesh(
        new THREE.BoxGeometry(this.width - 0.5, 0.3, this.depth - 0.5),
        this.matFloorSlab
      );
      slabMesh.position.set(0, 0.15, -2.0);
      slabMesh.receiveShadow = true;
      floorGroup.add(slabMesh);

      // Open Atrium Light Well Void in Center of Slab (allows natural light down all storeys)
      if (f > 1) {
        // Balcony guard railing around open atrium void
        const railMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.8, roughness: 0.2 });
        const railGeo = new THREE.BoxGeometry(16.0, 0.9, 0.1);
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.set(0, 0.6, 4.0);
        floorGroup.add(rail);
      }

      // Filter rooms for this floor
      const floorRooms = atriumRooms.filter(r => r.floor === f);
      floorRooms.forEach(rData => {
        const hitbox = this.buildAtriumRoomMesh(rData, elevationY, floorGroup);
        this.selectableObjects.push(hitbox);
        this.classrooms.push(hitbox);
      });

      // Filter washrooms for this floor
      const floorWashroomConfig = atriumWashrooms.filter(w => w.floor === f);
      floorWashroomConfig.forEach(wData => {
        const washroomInstance = new Washroom(wData);
        washroomInstance.group.position.y = 0.32;
        floorGroup.add(washroomInstance.group);
        this.washrooms.push(washroomInstance);
        this.selectableObjects.push(washroomInstance.hitbox);
        washroomInstance.fixtures.forEach(fix => this.selectableObjects.push(fix));
      });

      this.floors.push({
        floorNumber: f,
        elevationY,
        group: floorGroup
      });

      this.group.add(floorGroup);
    }
  }

  buildAtriumRoomMesh(rData, elevationY, floorGroup) {
    const group = new THREE.Group();
    group.name = rData.id;

    const w = rData.size ? rData.size.w : 8.0;
    const d = rData.size ? rData.size.d : 8.0;
    const h = this.floorHeight - 0.3;

    // Room Interior Floor Tile
    const tileColor = rData.isSpecial ? 0x1e3a8a : (rData.category.includes('Lab') ? 0x0f766e : 0xe2e8f0);
    const floorTile = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshStandardMaterial({ color: tileColor, roughness: 0.4 })
    );
    floorTile.rotation.x = -Math.PI / 2;
    floorTile.position.set(rData.position.x, 0.32, rData.position.z);
    floorTile.receiveShadow = true;
    group.add(floorTile);

    // Room Cutaway Boundary Walls
    const wallMat = this.matWallInterior;
    const wallH = 2.4; // Cutaway height for optimal interior inspection

    // Rear wall
    const rearWall = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, 0.2), wallMat);
    rearWall.position.set(rData.position.x, wallH / 2 + 0.3, rData.position.z - d / 2);
    group.add(rearWall);

    // Side partition walls
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, wallH, d), wallMat);
    leftWall.position.set(rData.position.x - w / 2, wallH / 2 + 0.3, rData.position.z);
    group.add(leftWall);

    // Front Plaque / Door Header
    const signMat = this.createRoomHeaderSign(rData);
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.7), signMat);
    signMesh.position.set(rData.position.x, 2.2, rData.position.z + d / 2 + 0.05);
    group.add(signMesh);

    // Hitbox for Raycaster Selection (transparent with opacity: 0.0 so raycaster intersects it)
    const hitboxGeo = new THREE.BoxGeometry(w, h, d);
    const hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false });
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    hitbox.position.set(rData.position.x, h / 2 + 0.3, rData.position.z);
    hitbox.userData = {
      isSelectable: true,
      isRoom: true,
      isSpecial: rData.isSpecial,
      building: "ATR",
      buildingName: "Atrium Building",
      id: rData.id,
      number: rData.number,
      name: rData.name,
      floor: rData.floor,
      floorLabel: rData.floorLabel,
      category: rData.category,
      capacity: rData.capacity,
      wing: rData.wing,
      features: rData.features,
      fansCount: rData.fansCount,
      lightsCount: rData.lightsCount,
      acUnits: rData.acUnits || 0,
      icon: rData.icon || "🏛️",
      parentGroup: group
    };
    group.add(hitbox);

    // Add visible room assembly into the floor group
    floorGroup.add(group);

    return hitbox;
  }

  createRoomHeaderSign(data) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = data.isSpecial ? '#1d4ed8' : '#0f172a';
    ctx.fillRect(0, 0, 512, 160);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(4, 4, 504, 152);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.number, 256, 50);

    ctx.font = '500 24px system-ui, sans-serif';
    ctx.fillStyle = '#93c5fd';
    ctx.fillText(data.name.substring(0, 26), 256, 105);

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshBasicMaterial({ map: texture });
  }

  update(delta) {
    // Rotation or animations if any
  }

  focusFloor(targetFloor) {
    if (targetFloor === 0) {
      this.floors.forEach(f => {
        f.group.visible = true;
      });
      this.roofGroup.visible = true;
      this.shellGroup.visible = true;
    } else {
      this.floors.forEach(f => {
        if (f.floorNumber === targetFloor) {
          f.group.visible = true;
        } else if (f.floorNumber < targetFloor) {
          f.group.visible = true;
        } else {
          f.group.visible = false;
        }
      });
      this.roofGroup.visible = false;
      // Fade exterior shell for clear interior inspection
      this.shellGroup.visible = false;
    }
  }

  setExplodedView(isExploded) {
    const spacing = 5.5;
    this.floors.forEach((f, idx) => {
      f.group.position.y = isExploded ? f.elevationY + idx * spacing : f.elevationY;
    });

    if (this.roofGroup) {
      this.roofGroup.position.y = isExploded ? this.totalHeight + 5 * spacing : this.totalHeight;
    }
  }
}
