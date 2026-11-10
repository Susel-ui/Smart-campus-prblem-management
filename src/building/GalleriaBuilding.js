/**
 * GalleriaBuilding.js - Procedural 3D Reconstruction of NIST University Galleria Building
 * 
 * Faithfully reproduces the architectural identity from reference photograph (galleria-reference.jpg):
 * - 4-Storey curvilinear academic complex (GF, FF, SF, TF)
 * - Terracotta / brick-red exterior with white horizontal concrete floor banding
 * - Central curved dark-blue curtain glass atrium bay
 * - Distinctive cylindrical spiral staircase towers at the extremities with white concrete & blue accent rings
 * - White castellated / crenellated parapet wall along the roofline
 * - Reconstructed interiors:
 *   • 12 Large Lecture Halls (LH01 to LH12)
 *   • 250-Seat Grand Auditorium with stage and tiered seating
 *   • High Performance Computing (HPC) Supercomputing Lab
 *   • IBM Centre for Excellence
 *   • NIST Technology Consultancy Services (NTCS)
 *   • Floor-level washrooms, corridors & spiral stairs
 */

import * as THREE from 'three';
import { CAMPUS_CONFIG, generateGalleriaRooms, CAMPUS_WASHROOMS } from '../data/campusConfig.js';
import { Washroom } from './Washroom.js';

export class GalleriaBuilding {
  constructor() {
    this.config = CAMPUS_CONFIG.buildings.GAL;
    this.group = new THREE.Group();
    this.group.name = "Building_Galleria_Root";
    this.group.position.set(this.config.position.x, this.config.position.y, this.config.position.z);

    this.floorsCount = 4;
    this.floorHeight = 4.2;
    this.width = 68.0;
    this.depth = 36.0;
    this.totalHeight = this.floorsCount * this.floorHeight; // 16.8m

    this.floors = [];
    this.classrooms = [];
    this.washrooms = [];
    this.selectableObjects = [];

    this.initMaterials();
    this.buildExteriorCurvilinearShell();
    this.buildSpiralStairTowers();
    this.buildCentralGlassCurvature();
    this.buildCastellatedRooftop();
    this.buildFloorsAndInteriors();
  }

  initMaterials() {
    this.matTerracotta = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // rich terracotta / brick-red exterior wall from photo
      roughness: 0.75,
      metalness: 0.05
    });

    this.matWhiteTrim = new THREE.MeshStandardMaterial({
      color: 0xffffff, // crisp white horizontal banding & window frames
      roughness: 0.4
    });

    this.matBlueAccent = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // vibrant sky blue accent rings on spiral towers & balconies
      roughness: 0.35
    });

    this.matCurtainGlass = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a8a, // dark navy / royal blue curtain glass
      metalness: 0.3,
      roughness: 0.1,
      transmission: 0.65,
      thickness: 0.8,
      transparent: true,
      opacity: 0.85
    });

    this.matFloorSlab = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      roughness: 0.5
    });

    this.matWallInterior = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.6
    });

    this.matWindowGlass = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.5,
      roughness: 0.15
    });
  }

  buildExteriorCurvilinearShell() {
    this.shellGroup = new THREE.Group();
    this.shellGroup.name = "Galleria_Shell";

    const wingW = 24.0;
    const wingD = 22.0;

    // 1. Left (West) Curvilinear Wing Massing
    const leftWingGeo = new THREE.BoxGeometry(wingW, this.totalHeight, wingD);
    const leftWing = new THREE.Mesh(leftWingGeo, this.matTerracotta);
    leftWing.position.set(-this.width / 2 + wingW / 2 + 3.0, this.totalHeight / 2, 0);
    leftWing.castShadow = true;
    leftWing.receiveShadow = true;
    this.shellGroup.add(leftWing);

    // 2. Right (East) Curvilinear Wing Massing
    const rightWingGeo = new THREE.BoxGeometry(wingW, this.totalHeight, wingD);
    const rightWing = new THREE.Mesh(rightWingGeo, this.matTerracotta);
    rightWing.position.set(this.width / 2 - wingW / 2 - 3.0, this.totalHeight / 2, 0);
    rightWing.castShadow = true;
    rightWing.receiveShadow = true;
    this.shellGroup.add(rightWing);

    // 3. Central Connecting Spine Block
    const centerSpineGeo = new THREE.BoxGeometry(22.0, this.totalHeight, 14.0);
    const centerSpine = new THREE.Mesh(centerSpineGeo, this.matTerracotta);
    centerSpine.position.set(0, this.totalHeight / 2, -4.0);
    centerSpine.castShadow = true;
    centerSpine.receiveShadow = true;
    this.shellGroup.add(centerSpine);

    // 4. White Horizontal Architectural Bands (Prominent in reference photo!)
    for (let f = 1; f <= this.floorsCount; f++) {
      const y = f * this.floorHeight;

      // Band on Left Wing
      const bandLeft = new THREE.Mesh(new THREE.BoxGeometry(wingW + 0.3, 0.45, wingD + 0.3), this.matWhiteTrim);
      bandLeft.position.set(-this.width / 2 + wingW / 2 + 3.0, y - 0.22, 0);
      this.shellGroup.add(bandLeft);

      // Band on Right Wing
      const bandRight = new THREE.Mesh(new THREE.BoxGeometry(wingW + 0.3, 0.45, wingD + 0.3), this.matWhiteTrim);
      bandRight.position.set(this.width / 2 - wingW / 2 - 3.0, y - 0.22, 0);
      this.shellGroup.add(bandRight);

      // Band on Central Spine
      const bandCenter = new THREE.Mesh(new THREE.BoxGeometry(22.3, 0.45, 14.3), this.matWhiteTrim);
      bandCenter.position.set(0, y - 0.22, -4.0);
      this.shellGroup.add(bandCenter);
    }

    // 5. White Framed Window Matrix
    this.buildFramedWindows();

    this.group.add(this.shellGroup);
  }

  buildFramedWindows() {
    const winGeo = new THREE.BoxGeometry(1.6, 1.8, 0.25);
    const glassGeo = new THREE.BoxGeometry(1.4, 1.6, 0.3);

    for (let f = 0; f < this.floorsCount; f++) {
      const y = f * this.floorHeight + 2.2;

      // West Wing Front Windows
      for (let x = -28.0; x <= -12.0; x += 4.5) {
        const frame = new THREE.Mesh(winGeo, this.matWhiteTrim);
        frame.position.set(x, y, 11.1);
        this.shellGroup.add(frame);

        const glass = new THREE.Mesh(glassGeo, this.matWindowGlass);
        glass.position.set(x, y, 11.1);
        this.shellGroup.add(glass);
      }

      // East Wing Front Windows
      for (let x = 12.0; x <= 28.0; x += 4.5) {
        const frame = new THREE.Mesh(winGeo, this.matWhiteTrim);
        frame.position.set(x, y, 11.1);
        this.shellGroup.add(frame);

        const glass = new THREE.Mesh(glassGeo, this.matWindowGlass);
        glass.position.set(x, y, 11.1);
        this.shellGroup.add(glass);
      }
    }
  }

  buildSpiralStairTowers() {
    this.towersGroup = new THREE.Group();
    this.towersGroup.name = "Galleria_Spiral_Stair_Towers";

    // Reconstructs the 2 distinctive cylindrical spiral staircase towers visible at the wing extremities
    const towerRadius = 4.2;
    const towerH = this.totalHeight + 2.2; // Rises slightly above roofline

    const towerPositions = [
      { x: -this.width / 2 + 1.5, z: 8.0 },  // West Wing Extremity
      { x: this.width / 2 - 1.5, z: 8.0 }    // East Wing Extremity
    ];

    towerPositions.forEach(pos => {
      const tower = new THREE.Group();
      tower.position.set(pos.x, 0, pos.z);

      // Central concrete cylinder core
      const coreGeo = new THREE.CylinderGeometry(1.4, 1.4, towerH, 24);
      const core = new THREE.Mesh(coreGeo, this.matWhiteTrim);
      core.position.y = towerH / 2;
      core.castShadow = true;
      tower.add(core);

      // Open cylindrical perimeter frame with blue horizontal rings at each floor
      for (let f = 0; f <= this.floorsCount; f++) {
        const ringY = f * this.floorHeight;

        // White base deck ring
        const whiteDeck = new THREE.Mesh(
          new THREE.CylinderGeometry(towerRadius, towerRadius, 0.45, 24, 1, false),
          this.matWhiteTrim
        );
        whiteDeck.position.y = ringY + 0.22;
        tower.add(whiteDeck);

        // Vibrant Blue Accent Ring (Directly visible in reference photo!)
        const blueRing = new THREE.Mesh(
          new THREE.CylinderGeometry(towerRadius + 0.15, towerRadius + 0.15, 0.35, 24, 1, true),
          this.matBlueAccent
        );
        blueRing.position.y = ringY + 0.6;
        tower.add(blueRing);

        // Spiral steps simulation
        if (f < this.floorsCount) {
          const stepsCount = 10;
          for (let s = 0; s < stepsCount; s++) {
            const angle = (s * Math.PI * 1.5) / stepsCount;
            const stepGeo = new THREE.BoxGeometry(towerRadius - 1.2, 0.15, 0.8);
            const step = new THREE.Mesh(stepGeo, this.matWhiteTrim);
            step.position.set(
              Math.cos(angle) * (towerRadius / 2 + 0.7),
              ringY + (s * this.floorHeight) / stepsCount + 0.1,
              Math.sin(angle) * (towerRadius / 2 + 0.7)
            );
            step.rotation.y = -angle;
            tower.add(step);
          }
        }
      }

      // Vertical structural support columns around the spiral tower perimeter
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, towerH, 12),
          this.matWhiteTrim
        );
        col.position.set(Math.cos(angle) * (towerRadius - 0.2), towerH / 2, Math.sin(angle) * (towerRadius - 0.2));
        col.castShadow = true;
        tower.add(col);
      }

      // Tower Rooftop Drum Cap with Blue Band
      const capH = 1.6;
      const capGeo = new THREE.CylinderGeometry(towerRadius + 0.3, towerRadius + 0.3, capH, 24);
      const cap = new THREE.Mesh(capGeo, this.matWhiteTrim);
      cap.position.y = towerH + capH / 2;
      tower.add(cap);

      const capBlueBand = new THREE.Mesh(
        new THREE.CylinderGeometry(towerRadius + 0.35, towerRadius + 0.35, 0.6, 24, 1, true),
        this.matBlueAccent
      );
      capBlueBand.position.y = towerH + capH / 2;
      tower.add(capBlueBand);

      this.towersGroup.add(tower);
    });

    this.group.add(this.towersGroup);
  }

  buildCentralGlassCurvature() {
    this.centralGlassGroup = new THREE.Group();
    this.centralGlassGroup.name = "Galleria_Central_Glass_Atrium";

    // Reconstructs the curved dark blue glass central atrium bay connecting the wings
    const radius = 22.0;
    const arcAngle = 0.75;
    const segments = 16;
    const glassH = this.totalHeight;

    const glassGeo = new THREE.CylinderGeometry(
      radius,
      radius,
      glassH,
      segments,
      4,
      true,
      -arcAngle / 2 + Math.PI / 2,
      arcAngle
    );

    const glassMesh = new THREE.Mesh(glassGeo, this.matCurtainGlass);
    glassMesh.position.set(0, glassH / 2, 7.5 - radius);
    glassMesh.castShadow = true;
    glassMesh.receiveShadow = true;
    this.centralGlassGroup.add(glassMesh);

    // Floor transition bands across the curved glass
    for (let f = 1; f < this.floorsCount; f++) {
      const ringGeo = new THREE.CylinderGeometry(
        radius + 0.1,
        radius + 0.1,
        0.25,
        segments,
        1,
        true,
        -arcAngle / 2 + Math.PI / 2,
        arcAngle
      );
      const ring = new THREE.Mesh(ringGeo, this.matWhiteTrim);
      ring.position.set(0, f * this.floorHeight, 7.5 - radius);
      this.centralGlassGroup.add(ring);
    }

    this.group.add(this.centralGlassGroup);
  }

  buildCastellatedRooftop() {
    this.roofGroup = new THREE.Group();
    this.roofGroup.name = "Galleria_Castellated_Rooftop";
    this.roofGroup.position.set(0, this.totalHeight, 0);

    // 1. Concrete Roof Slab
    const slabGeo = new THREE.BoxGeometry(this.width + 1.0, 0.4, this.depth + 1.0);
    const slab = new THREE.Mesh(slabGeo, this.matFloorSlab);
    slab.position.set(0, 0.2, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    this.roofGroup.add(slab);

    // 2. Distinctive White Castellated / Crenellated Parapet (Visible in aerial photo!)
    // Creates alternating crenels and merlons along front and side roof edges
    const merlonW = 1.4;
    const merlonH = 1.1;
    const merlonD = 0.4;
    const merlonMat = this.matWhiteTrim;

    // Front Left Wing Merlons
    for (let x = -this.width / 2 + 3.0; x <= -10.0; x += 2.6) {
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(merlonW, merlonH, merlonD), merlonMat);
      merlon.position.set(x, merlonH / 2 + 0.4, 11.2);
      this.roofGroup.add(merlon);
    }

    // Front Right Wing Merlons
    for (let x = 10.0; x <= this.width / 2 - 3.0; x += 2.6) {
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(merlonW, merlonH, merlonD), merlonMat);
      merlon.position.set(x, merlonH / 2 + 0.4, 11.2);
      this.roofGroup.add(merlon);
    }

    // Continuous base parapet curb
    const curbGeoLeft = new THREE.BoxGeometry(22.0, 0.4, 0.45);
    const curbLeft = new THREE.Mesh(curbGeoLeft, merlonMat);
    curbLeft.position.set(-this.width / 2 + 14.0, 0.6, 11.2);
    this.roofGroup.add(curbLeft);

    const curbRight = new THREE.Mesh(curbGeoLeft, merlonMat);
    curbRight.position.set(this.width / 2 - 14.0, 0.6, 11.2);
    this.roofGroup.add(curbRight);

    // 3. Central Rooftop Machine & HVAC Enclosure (Visible in aerial photo)
    const hvacH = 2.8;
    const hvacGeo = new THREE.BoxGeometry(10.0, hvacH, 6.0);
    const hvac = new THREE.Mesh(hvacGeo, this.matWhiteTrim);
    hvac.position.set(0, hvacH / 2 + 0.4, -4.0);
    hvac.castShadow = true;
    this.roofGroup.add(hvac);

    // Air vents on HVAC box
    for (let i = 0; i < 4; i++) {
      const chiller = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 0.6, 16),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 })
      );
      chiller.position.set(-3.0 + i * 2.0, hvacH + 0.7, -4.0);
      this.roofGroup.add(chiller);
    }

    this.group.add(this.roofGroup);
  }

  buildFloorsAndInteriors() {
    const galleriaRooms = generateGalleriaRooms();
    const galleriaWashrooms = CAMPUS_WASHROOMS.filter(w => w.building === "GAL");

    for (let f = 1; f <= this.floorsCount; f++) {
      const floorGroup = new THREE.Group();
      floorGroup.name = `Galleria_Floor_${f}`;
      const elevationY = (f - 1) * this.floorHeight;
      floorGroup.position.set(0, elevationY, 0);

      // Intermediate concrete slab
      const slabMesh = new THREE.Mesh(
        new THREE.BoxGeometry(this.width - 1.0, 0.32, this.depth - 1.0),
        this.matFloorSlab
      );
      slabMesh.position.set(0, 0.16, 0);
      slabMesh.receiveShadow = true;
      floorGroup.add(slabMesh);

      // Filter rooms for this floor
      const floorRooms = galleriaRooms.filter(r => r.floor === f);
      floorRooms.forEach(rData => {
        const hitbox = this.buildGalleriaRoomMesh(rData, elevationY, floorGroup);
        this.selectableObjects.push(hitbox);
        this.classrooms.push(hitbox);
      });

      // Filter washrooms for this floor
      const floorWashroomConfig = galleriaWashrooms.filter(w => w.floor === f);
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

  buildGalleriaRoomMesh(rData, elevationY, floorGroup) {
    const group = new THREE.Group();
    group.name = rData.id;

    const w = rData.size ? rData.size.w : 9.0;
    const d = rData.size ? rData.size.d : 9.0;
    const h = this.floorHeight - 0.35;

    // Room Floor Tile
    const tileColor = rData.isSpecial ? 0x7f1d1d : 0xe2e8f0; // rich burgundy/red for Grand Auditorium
    const floorTile = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshStandardMaterial({ color: tileColor, roughness: 0.4 })
    );
    floorTile.rotation.x = -Math.PI / 2;
    floorTile.position.set(rData.position.x, 0.34, rData.position.z);
    floorTile.receiveShadow = true;
    group.add(floorTile);

    // If Grand Auditorium (GAL-AUD-250), build mini 3D Keynote Stage & Tiered Rows
    if (rData.id === "GAL-AUD-250") {
      this.buildAuditoriumStage(group, rData.position.x, rData.position.z);
    }

    // Cutaway Interior Walls
    const wallH = 2.4;
    const wallMat = this.matWallInterior;

    const rearWall = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, 0.2), wallMat);
    rearWall.position.set(rData.position.x, wallH / 2 + 0.3, rData.position.z - d / 2);
    group.add(rearWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, wallH, d), wallMat);
    leftWall.position.set(rData.position.x - w / 2, wallH / 2 + 0.3, rData.position.z);
    group.add(leftWall);

    // Front Signboard Header
    const signMat = this.createRoomHeaderSign(rData);
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.75), signMat);
    signMesh.position.set(rData.position.x, 2.3, rData.position.z + d / 2 + 0.05);
    group.add(signMesh);

    // Hitbox for Raycasting (transparent with opacity: 0.0 so raycaster intersects it)
    const hitboxGeo = new THREE.BoxGeometry(w, h, d);
    const hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false });
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    hitbox.position.set(rData.position.x, h / 2 + 0.3, rData.position.z);
    hitbox.userData = {
      isSelectable: true,
      isRoom: true,
      isSpecial: rData.isSpecial,
      building: "GAL",
      buildingName: "Galleria Building",
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

  buildAuditoriumStage(group, cx, cz) {
    // Elevated Keynote Stage
    const stageGeo = new THREE.BoxGeometry(14.0, 0.65, 4.0);
    const stageMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 }); // polished teak stage
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.set(cx, 0.35 + 0.32, cz - 4.5);
    group.add(stage);

    // Projection Keynote Screen
    const screenGeo = new THREE.PlaneGeometry(9.0, 2.4);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(cx, 2.0, cz - 6.3);
    group.add(screen);

    // Tiered Velvet Seating Blocks (reconstructed 250 capacity)
    const seatRowMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 }); // red velvet
    for (let r = 0; r < 5; r++) {
      const rowY = 0.4 + r * 0.28;
      const rowZ = cz - 1.5 + r * 1.6;
      const rowMesh = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.35, 0.7), seatRowMat);
      rowMesh.position.set(cx, rowY, rowZ);
      group.add(rowMesh);
    }
  }

  createRoomHeaderSign(data) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = data.isSpecial ? '#7f1d1d' : '#0f172a';
    ctx.fillRect(0, 0, 512, 160);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ef4444';
    ctx.strokeRect(4, 4, 504, 152);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.number, 256, 50);

    ctx.font = '500 24px system-ui, sans-serif';
    ctx.fillStyle = '#fca5a5';
    ctx.fillText(data.name.substring(0, 26), 256, 105);

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshBasicMaterial({ map: texture });
  }

  update(delta) {
    // Animations if any
  }

  focusFloor(targetFloor) {
    if (targetFloor === 0) {
      this.floors.forEach(f => {
        f.group.visible = true;
      });
      this.roofGroup.visible = true;
      this.shellGroup.visible = true;
      this.towersGroup.visible = true;
      this.centralGlassGroup.visible = true;
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
      this.shellGroup.visible = false;
      this.towersGroup.visible = false;
      this.centralGlassGroup.visible = false;
    }
  }

  setExplodedView(isExploded) {
    const spacing = 5.5;
    this.floors.forEach((f, idx) => {
      f.group.position.y = isExploded ? f.elevationY + idx * spacing : f.elevationY;
    });

    if (this.roofGroup) {
      this.roofGroup.position.y = isExploded ? this.totalHeight + 4 * spacing : this.totalHeight;
    }
  }
}
