/**
 * Washroom.js - Procedural Washroom Interior & Maintainable Fixtures
 * 
 * Recreates designated washroom facilities across LHC, Atrium, and Galleria:
 * - LHC: GIRLS_WASHROOM_F1, WASHROOM_F2..F5, FACULTY_WASHROOM_F3
 * - ATR: ATR_WASHROOM_GF..FOF
 * - GAL: GAL_WASHROOM_GF..TF
 * 
 * Features:
 * - Distinctive sanitary cyan/teal non-slip tile floor
 * - Floating 3D billboard badge sprite ("🚾 RESTROOM")
 * - Front entrance doorway with 3D illuminated header plaque
 * - Ceramic washbasins, chrome taps (TAP_01, TAP_02), wall mirror
 * - Private toilet cubicles with WC pans and flush tanks
 * - Ceiling LED light and wall ventilation exhaust fan
 * - Fully selectable via Raycaster
 */

import * as THREE from 'three';

let tileMat = null;
let wallMat = null;
let ceramicMat = null;
let chromeMat = null;
let mirrorMat = null;
let partitionMat = null;

function getWashroomMaterials() {
  if (!tileMat) {
    tileMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e, // distinctive sanitary deep teal/cyan floor tile
      roughness: 0.25,
      metalness: 0.15
    });
    wallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // clean sanitary glazed white wall
      roughness: 0.3,
      metalness: 0.05
    });
    ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // vitreous china white
      roughness: 0.1,
      metalness: 0.1
    });
    chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // polished chrome plumbing
      metalness: 0.9,
      roughness: 0.15
    });
    mirrorMat = new THREE.MeshStandardMaterial({
      color: 0xdbeafe, // reflective mirror panel
      roughness: 0.05,
      metalness: 0.95
    });
    partitionMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // slate gray cubicle partition panels
      roughness: 0.6
    });
  }
  return { tileMat, wallMat, ceramicMat, chromeMat, mirrorMat, partitionMat };
}

// 3D Floating Canvas Badge Sprite for Washrooms
function createWashroomBadgeSprite(washroom) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  // Background rounded card
  const r = 24;
  const x = 8, y = 8, w = 496, h = 144;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#0d9488';
  ctx.stroke();

  // Cyan Pill on Left
  ctx.fillStyle = '#0d9488';
  ctx.fillRect(24, 28, 80, 104);

  // Icon inside pill
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚾', 64, 80);

  // Title text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  const displayName = washroom.name || "Restroom";
  ctx.fillText(displayName.substring(0, 20), 125, 60);

  // Subtitle
  ctx.fillStyle = '#2dd4bf';
  ctx.font = '600 24px monospace';
  ctx.fillText(`${washroom.id || 'WASHROOM'} • Floor ${washroom.floor || 1}`, 125, 106);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(4.2, 1.35, 1);
  const hPos = (washroom.dimensions && washroom.dimensions.height) ? washroom.dimensions.height : 3.45;
  sprite.position.set(0, hPos + 1.2, 0);
  sprite.userData = { isBadge: true, parentWashroomId: washroom.id };

  return sprite;
}

// 3D Doorway Plaque Header Texture
function createDoorHeaderMaterial(washroom) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 96);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#0d9488';
  ctx.strokeRect(4, 4, 248, 88);

  ctx.fillStyle = '#0d9488';
  ctx.fillRect(14, 16, 75, 64);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText("🚾", 51, 48);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  const name = washroom.name || "";
  ctx.fillText(name.includes("Girls") ? "GIRLS' RESTROOM" : (name.includes("Faculty") ? "FACULTY RESTROOM" : "WASHROOM"), 100, 42);

  ctx.fillStyle = '#2dd4bf';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(washroom.id || "WASHROOM", 100, 68);

  const texture = new THREE.CanvasTexture(canvas);
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.2 });
}

export class Washroom {
  constructor(config = {}) {
    this.config = config;
    this.id = config.id || "WASHROOM";
    this.name = config.name || "Campus Restroom";
    this.floor = config.floor || 1;
    this.fixtures = [];

    // Safe fallback dimensions
    this.dimensions = config.dimensions || { width: 5.6, depth: 8.5, height: 3.45 };
    if (!this.config.dimensions) {
      this.config.dimensions = this.dimensions;
    }

    this.group = new THREE.Group();
    this.group.name = this.id;
    const pos = config.position || { x: 0, y: 0, z: 0 };
    // Guard against double elevation when mounted inside an elevated floorGroup
    const posY = (pos.y !== undefined && pos.y >= 0 && pos.y <= 0.5) ? pos.y : 0.32;
    this.group.position.set(pos.x, posY, pos.z);

    this.buildStructure();
    this.buildFixtures();
    this.buildHitbox();

    // Floating 3D Badge Sprite for instant visual discovery
    this.badge = createWashroomBadgeSprite(this.config);
    this.group.add(this.badge);
  }

  buildStructure() {
    const { width, depth } = this.dimensions;
    const { tileMat, wallMat } = getWashroomMaterials();

    // 1. Teal Sanitary Non-Slip Floor Tile
    const floorGeo = new THREE.BoxGeometry(width, 0.05, depth);
    const floorMesh = new THREE.Mesh(floorGeo, tileMat);
    floorMesh.position.y = 0.025;
    floorMesh.receiveShadow = true;
    this.group.add(floorMesh);

    // 2. Cutaway Perimeter Walls (Height 2.3m for interior inspection)
    const wallHeight = 2.3;
    const wallThick = 0.22;

    // Rear wall
    const backGeo = new THREE.BoxGeometry(width, wallHeight, wallThick);
    const backWall = new THREE.Mesh(backGeo, wallMat);
    backWall.position.set(0, wallHeight / 2, -depth / 2 + wallThick / 2);
    backWall.castShadow = true;
    this.group.add(backWall);

    // Left wall
    const sideGeo = new THREE.BoxGeometry(wallThick, wallHeight, depth);
    const leftWall = new THREE.Mesh(sideGeo, wallMat);
    leftWall.position.set(-width / 2 + wallThick / 2, wallHeight / 2, 0);
    this.group.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(sideGeo, wallMat);
    rightWall.position.set(width / 2 - wallThick / 2, wallHeight / 2, 0);
    this.group.add(rightWall);

    // Front Wall with Entrance Doorway Opening facing the corridor
    const doorWidth = 1.4;
    const frontWallLeftWidth = Math.max(0.5, (width - doorWidth) / 2);

    const fWall1 = new THREE.Mesh(
      new THREE.BoxGeometry(frontWallLeftWidth, wallHeight, wallThick),
      wallMat
    );
    fWall1.position.set(-width / 2 + frontWallLeftWidth / 2, wallHeight / 2, depth / 2 - wallThick / 2);
    this.group.add(fWall1);

    const fWall2 = new THREE.Mesh(
      new THREE.BoxGeometry(frontWallLeftWidth, wallHeight, wallThick),
      wallMat
    );
    fWall2.position.set(width / 2 - frontWallLeftWidth / 2, wallHeight / 2, depth / 2 - wallThick / 2);
    this.group.add(fWall2);

    // Doorway Lintel Header & 3D Plaque
    const lintelHeight = 0.55;
    const lintelGeo = new THREE.BoxGeometry(doorWidth + 0.1, lintelHeight, wallThick);
    const lintel = new THREE.Mesh(lintelGeo, wallMat);
    lintel.position.set(0, wallHeight - lintelHeight / 2, depth / 2 - wallThick / 2);
    this.group.add(lintel);

    // 3D Doorway Header Sign Plaque above door
    const signMat = createDoorHeaderMaterial(this.config);
    const signGeo = new THREE.PlaneGeometry(1.6, 0.6);
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, wallHeight - lintelHeight / 2, depth / 2 + 0.02);
    this.group.add(signMesh);
  }

  buildFixtures() {
    const { width, depth } = this.dimensions;
    const { ceramicMat, chromeMat, mirrorMat, partitionMat } = getWashroomMaterials();

    // 1. Vanity Wash Counter along the left wall
    const counterWidth = 1.0;
    const counterLength = Math.min(depth * 0.45, 4.2);
    const counterGeo = new THREE.BoxGeometry(counterWidth, 0.12, counterLength);
    const counter = new THREE.Mesh(counterGeo, ceramicMat);
    counter.position.set(-width / 2 + counterWidth / 2 + 0.25, 0.85, 0.5);
    this.group.add(counter);

    // Large Wall Mirror above vanity
    const mirrorGeo = new THREE.BoxGeometry(0.04, 1.2, counterLength);
    const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
    mirror.position.set(-width / 2 + 0.23, 1.6, 0.5);
    this.group.add(mirror);

    // Two Ceramic Washbasins & Chrome Taps on counter
    [-counterLength / 3, counterLength / 3].forEach((basinZ, idx) => {
      let tapId = `TAP_${this.id}_0${idx + 1}`;
      if (this.config.fixtures && this.config.fixtures[idx]) {
        tapId = (typeof this.config.fixtures[idx] === 'object') ? (this.config.fixtures[idx].id || tapId) : this.config.fixtures[idx];
      }
      const basinX = -width / 2 + counterWidth / 2 + 0.25;

      // Basin Bowl
      const basinGeo = new THREE.CylinderGeometry(0.32, 0.24, 0.35, 14);
      const basin = new THREE.Mesh(basinGeo, ceramicMat);
      basin.position.set(basinX, 0.85, 0.5 + basinZ);
      this.group.add(basin);

      // Chrome Gooseneck Tap
      const tapGroup = new THREE.Group();
      tapGroup.position.set(basinX - 0.25, 0.92, 0.5 + basinZ);

      const tapSpoutGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.26, 8);
      const tapSpout = new THREE.Mesh(tapSpoutGeo, chromeMat);
      tapSpout.position.y = 0.13;
      tapGroup.add(tapSpout);

      const tapHeadGeo = new THREE.BoxGeometry(0.08, 0.04, 0.14);
      const tapHead = new THREE.Mesh(tapHeadGeo, chromeMat);
      tapHead.position.set(0.04, 0.24, 0);
      tapGroup.add(tapHead);

      // Tap Hitbox for Raycaster selection
      const tapHitGeo = new THREE.BoxGeometry(0.4, 0.5, 0.4);
      const tapHitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 });
      const tapHit = new THREE.Mesh(tapHitGeo, tapHitMat);
      tapHit.position.y = 0.2;
      tapHit.userData = {
        isSelectable: true,
        isEquipment: true,
        equipmentType: "tap",
        equipmentId: tapId,
        roomId: this.id,
        parentLabel: this.name,
        name: `Plumbing Tap [${tapId}]`,
        category: "Plumbing Fixture"
      };
      tapGroup.add(tapHit);

      this.group.add(tapGroup);
      this.fixtures.push(tapHit);
    });

    // 2. Private Toilet Cubicles along the right wall
    const numCubicles = 2;
    const cubicleDepth = 1.6;
    const cubicleWidth = 1.4;

    for (let c = 0; c < numCubicles; c++) {
      const cubicleZ = -depth / 2 + 1.2 + c * (cubicleDepth + 0.3);
      const cubicleX = width / 2 - cubicleWidth / 2 - 0.25;

      // Divider partition panel
      const partGeo = new THREE.BoxGeometry(cubicleWidth, 2.0, 0.05);
      const partition = new THREE.Mesh(partGeo, partitionMat);
      partition.position.set(cubicleX, 1.0, cubicleZ - cubicleDepth / 2);
      this.group.add(partition);

      // Ceramic WC Pan
      const wcGeo = new THREE.BoxGeometry(0.45, 0.45, 0.65);
      const wc = new THREE.Mesh(wcGeo, ceramicMat);
      wc.position.set(cubicleX, 0.225, cubicleZ);
      this.group.add(wc);

      // WC Cistern Tank
      const tankGeo = new THREE.BoxGeometry(0.48, 0.55, 0.24);
      const tank = new THREE.Mesh(tankGeo, ceramicMat);
      tank.position.set(width / 2 - 0.35, 0.65, cubicleZ);
      this.group.add(tank);
    }

    // 3. Ceiling Light Fixture
    const lightId = `LIGHT_${this.id}`;
    const lightGeo = new THREE.BoxGeometry(1.2, 0.06, 0.4);
    const lightMesh = new THREE.Mesh(
      lightGeo,
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfff8e7,
        emissiveIntensity: 0.8
      })
    );
    lightMesh.position.set(0, 2.25, 0);
    this.group.add(lightMesh);

    const lightHitGeo = new THREE.BoxGeometry(1.4, 0.3, 0.6);
    const lightHit = new THREE.Mesh(lightHitGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 }));
    lightHit.position.set(0, 2.2, 0);
    lightHit.userData = {
      isSelectable: true,
      isEquipment: true,
      equipmentType: "light",
      equipmentId: lightId,
      roomId: this.id,
      parentLabel: this.name,
      name: `Ceiling Luminaire [${lightId}]`,
      category: "Lighting Fixture"
    };
    this.group.add(lightHit);
    this.fixtures.push(lightHit);

    // 4. Ventilation Exhaust Fan
    const exhaustId = `EXHAUST_${this.id}`;
    const exGeo = new THREE.BoxGeometry(0.45, 0.45, 0.1);
    const exhaustMesh = new THREE.Mesh(exGeo, chromeMat);
    exhaustMesh.position.set(0, 2.0, -depth / 2 + 0.15);
    this.group.add(exhaustMesh);

    const exHitGeo = new THREE.BoxGeometry(0.6, 0.6, 0.4);
    const exHit = new THREE.Mesh(exHitGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 }));
    exHit.position.set(0, 2.0, -depth / 2 + 0.2);
    exHit.userData = {
      isSelectable: true,
      isEquipment: true,
      equipmentType: "exhaust_fan",
      equipmentId: exhaustId,
      roomId: this.id,
      parentLabel: this.name,
      name: `Ventilation Exhaust [${exhaustId}]`,
      category: "Ventilation Equipment"
    };
    this.group.add(exHit);
    this.fixtures.push(exHit);
  }

  buildHitbox() {
    const { width, depth, height } = this.dimensions;
    const hitGeo = new THREE.BoxGeometry(width, height, depth);
    const hitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    this.hitbox = new THREE.Mesh(hitGeo, hitMat);
    this.hitbox.position.y = height / 2;
    this.hitbox.userData = {
      isSelectable: true,
      isRoom: true,
      isWashroom: true,
      roomId: this.id,
      number: this.id,
      name: this.name,
      floor: this.floor,
      category: "Sanitary & Washroom",
      capacity: 0,
      fansCount: 1,
      lightsCount: 1,
      dataAccuracy: this.config.verifiedStatus || "estimated",
      objectRef: this
    };
    this.group.add(this.hitbox);
  }

  setHighlight(isHighlighted) {
    if (this.hitbox) {
      this.hitbox.material.opacity = isHighlighted ? 0.38 : 0.0;
      this.hitbox.material.color.setHex(isHighlighted ? 0x14b8a6 : 0x000000);
    }
  }
}
