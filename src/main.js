/**
 * main.js - Master Application Controller for NIST University Smart Campus System
 * 
 * Orchestrates:
 * 1. 3D Digital Twin Engine (Three.js WebGL Scene, CampusMaster, CameraController, SelectionManager)
 * 2. Multi-View Routing:
 *    • WelcomeView: Institutional landing page with dual portals (Student vs Authority)
 *    • AuthView: Dedicated Student Login (strict no self-registration) and Authority Login/Sign-up
 *    • StudentDashboard: Campus building cards, 3D explorer, auto-filled room issue form, general issue form, "My Complaints" live timeline
 *    • AuthorityDashboard: Maintenance ticket review with status workflow (Submitted -> Under Review -> Resolved), 3D spatial ticket localization, student account management, and electricity consumption telemetry
 *    • 3D Scene View: Fullscreen interactive 3D twin with OrbitControls, presets, washroom directory, and architectural photo references
 * 3. Bidirectional Integration:
 *    • 3D Room/Equipment Drawer "+ Report Issue" -> Student Dashboard complaint modal with locked auto-filled data
 *    • Authority Ticket "🎯 3D Locate" -> Smooth camera flight, building/floor isolation, and room highlight in 3D
 */

import * as THREE from 'three';
import { CampusMaster } from './building/Campus.js';
import { CameraController } from './interaction/CameraControls.js';
import { SelectionManager } from './interaction/SelectionManager.js';
import { FloorSelectorUI } from './ui/FloorSelector.js';
import { InformationPanelUI } from './ui/InformationPanel.js';
import { IssueMarkersManager } from './ui/IssueMarkers.js';
import { CAMPUS_CONFIG, CAMPUS_WASHROOMS } from './data/campusConfig.js';
import { campusData } from './data/DataManager.js';
import { authManager } from './auth/AuthManager.js';
import { Icons } from './ui/icons.js';

import { WelcomeView } from './views/WelcomeView.js';
import { AuthView } from './views/AuthView.js';
import { StudentDashboard } from './views/StudentDashboard.js';
import { AuthorityDashboard } from './views/AuthorityDashboard.js';

class NISTCampusApplication {
  constructor() {
    this.currentView = 'welcome';
    this.isNightMode = false;
    this.isExploded = false;
    this.roofVisible = true;
    this.activeBuilding = 'CAMPUS'; // 'CAMPUS' | 'LHC' | 'ATR' | 'GAL'

    // DOM containers
    this.welcomeContainer = document.getElementById('welcome-view-container');
    this.authContainer = document.getElementById('auth-view-container');
    this.studentContainer = document.getElementById('student-view-container');
    this.authorityContainer = document.getElementById('authority-view-container');
    this.scene3DContainer = document.getElementById('scene-3d-view-container');
    this.canvasContainer = document.getElementById('canvas-container');

    // 1. Initialize 3D Engine
    this.init3DScene();
    this.initLighting();
    this.initCampus();
    this.initControls();
    this.init3DUI();
    this.initModals();

    // 2. Initialize Dashboard Views
    this.initViews();

    // 3. Global Event Listeners & Router setup
    this.initGlobalEvents();

    // 4. Start 3D Render Loop
    this.animate();

    // 5. Determine Initial View (Default to Welcome page on fresh visit)
    const currentUser = authManager.getCurrentUser();
    if (currentUser) {
      if (authManager.isAuthority()) {
        this.switchView('authority_dashboard');
      } else {
        this.switchView('student_dashboard');
      }
    } else {
      this.switchView('welcome');
    }
  }

  /* ========================================================================
     THREE.JS 3D ENGINE & SCENE INITIALIZATION
     ======================================================================== */

  init3DScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x93c5fd); // Clear sunny sky
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.0035);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.5, 600);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.canvasContainer.appendChild(this.renderer.domElement);
  }

  initLighting() {
    // Hemisphere Sky/Ground Natural Ambient Light
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x475569, 0.85);
    this.hemiLight.position.set(0, 120, 0);
    this.scene.add(this.hemiLight);

    // Directional Sunlight (Positioned to illuminate all 3 buildings naturally)
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    this.sunLight.position.set(-80, 100, 70);
    this.sunLight.castShadow = true;

    // Shadow Map coverage for entire campus
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 300;
    const d = 140;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0004;
    this.scene.add(this.sunLight);

    // Soft Fill Light from opposite direction
    this.fillLight = new THREE.DirectionalLight(0x93c5fd, 0.4);
    this.fillLight.position.set(90, 70, -70);
    this.scene.add(this.fillLight);
  }

  initCampus() {
    this.campus = new CampusMaster();
    this.scene.add(this.campus.group);
  }

  initControls() {
    this.cameraController = new CameraController(this.camera, this.renderer.domElement);

    this.selectionManager = new SelectionManager(
      this.camera,
      this.renderer.domElement,
      this.campus.selectableObjects,
      (userData, mesh) => this.onObjectSelected(userData, mesh),
      (userData, e) => this.onObjectHovered(userData, e)
    );
  }

  init3DUI() {
    // 1. Bottom Dock Level & Building Selector
    const floorSlot = document.getElementById('floor-selector-slot');
    this.floorSelector = new FloorSelectorUI(
      floorSlot,
      (buildingKey) => this.handleBuildingChange(buildingKey),
      (buildingKey, floorNum) => this.handleFloorChange(buildingKey, floorNum),
      (washroomId) => this.selectWashroom(washroomId)
    );

    // 2. Side Information Panel (with Report Issue callback wired to Student Dashboard)
    const infoSlot = document.getElementById('info-drawer-slot');
    this.infoPanel = new InformationPanelUI(
      infoSlot,
      (worldPos) => this.cameraController.focusOnObject(worldPos, 14),
      () => this.selectionManager.deselect(),
      (roomData) => this.onReportIssueFrom3D(roomData)
    );

    // 3. Maintenance Issue 3D Markers
    this.issueMarkers = new IssueMarkersManager(
      this.scene,
      this.campus,
      (issueData) => this.handleIssueSelected(issueData)
    );

    // 4. Camera Presets Bar
    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.cameraController.applyPreset(btn.dataset.preset, true);
      });
    });

    // 5. 3D Header Action Buttons
    const roofBtn = document.getElementById('toggleRoofBtn');
    if (roofBtn) {
      roofBtn.addEventListener('click', () => {
        this.roofVisible = !this.roofVisible;
        this.campus.setRoofVisible(this.roofVisible, this.activeBuilding);
        roofBtn.classList.toggle('active', !this.roofVisible);
        roofBtn.querySelector('span:last-child').textContent = this.roofVisible ? 'Hide Roof' : 'Roof Hidden';
      });
    }

    const explodeBtn = document.getElementById('toggleExplodeBtn');
    if (explodeBtn) {
      explodeBtn.addEventListener('click', () => {
        this.isExploded = !this.isExploded;
        this.campus.setExplodedView(this.isExploded, this.activeBuilding);
        explodeBtn.classList.toggle('active', this.isExploded);
        explodeBtn.querySelector('span:last-child').textContent = this.isExploded ? 'Collapsed' : 'Explode View';
      });
    }

    const nightBtn = document.getElementById('toggleNightBtn');
    if (nightBtn) {
      nightBtn.addEventListener('click', () => {
        this.isNightMode = !this.isNightMode;
        this.applyLightingMode(this.isNightMode);
        nightBtn.querySelector('span:last-child').textContent = this.isNightMode ? 'Day Mode' : 'Night Mode';
      });
    }

    const resetBtn = document.getElementById('resetCamBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.handleBuildingChange('CAMPUS');
        this.floorSelector.setBuilding('CAMPUS');
        this.infoPanel.hide();
      });
    }

    const backDashBtn = document.getElementById('btnBackToDashboard');
    if (backDashBtn) {
      backDashBtn.addEventListener('click', () => {
        if (authManager.isAuthority()) {
          this.switchView('authority_dashboard');
        } else if (authManager.isStudent()) {
          this.switchView('student_dashboard');
        } else {
          this.switchView('welcome');
        }
      });
    }

    // Quick jump chips inside campus overview card
    this.canvasContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.campus-chip-btn');
      if (chip && chip.dataset.targetBld) {
        const bld = chip.dataset.targetBld;
        this.handleBuildingChange(bld);
        this.floorSelector.setBuilding(bld);
      }
    });
  }

  initModals() {
    this.initWashroomsModal();
    this.initPhotoModal();
  }

  /* ========================================================================
     MULTI-VIEW ROUTING & AUTH LIFECYCLE
     ======================================================================== */

  initViews() {
    // 1. Welcome View
    this.welcomeView = new WelcomeView(this.welcomeContainer, (portal) => {
      if (portal === 'student') {
        this.switchView('auth_student');
      } else if (portal === 'authority') {
        this.switchView('auth_authority');
      } else if (portal === '3d') {
        this.switchView('3d_view');
      }
    });

    // 2. Dedicated Auth View
    this.authView = new AuthView(
      this.authContainer,
      (user) => {
        if (authManager.isAuthority()) {
          this.switchView('authority_dashboard');
        } else {
          this.switchView('student_dashboard');
        }
      },
      () => this.switchView('welcome')
    );

    // 3. Student Dashboard
    this.studentDashboard = new StudentDashboard(
      this.studentContainer,
      (buildingKey) => this.open3DBuilding(buildingKey),
      (roomData) => this.onReportIssueFrom3D(roomData)
    );

    // 4. Authority Dashboard
    this.authorityDashboard = new AuthorityDashboard(
      this.authorityContainer,
      (complaint) => this.locateIn3D(complaint),
      () => this.switchView('3d_view')
    );
  }

  switchView(viewName, params = {}) {
    this.currentView = viewName;

    // Hide all view containers
    [
      this.welcomeContainer,
      this.authContainer,
      this.studentContainer,
      this.authorityContainer,
      this.scene3DContainer
    ].forEach(c => {
      if (c) c.style.display = 'none';
    });

    // Show and render target container
    if (viewName === 'welcome') {
      this.welcomeContainer.style.display = 'block';
      this.welcomeView.render();
    } else if (viewName === 'auth_student') {
      this.authContainer.style.display = 'flex';
      this.authContainer.style.justifyContent = 'center';
      this.authContainer.style.alignItems = 'center';
      this.authView.render('student');
    } else if (viewName === 'auth_authority') {
      this.authContainer.style.display = 'flex';
      this.authContainer.style.justifyContent = 'center';
      this.authContainer.style.alignItems = 'center';
      this.authView.render('authority');
    } else if (viewName === 'student_dashboard') {
      if (!authManager.isStudent()) {
        this.switchView('auth_student');
        return;
      }
      this.studentContainer.style.display = 'block';
      this.studentDashboard.render(params.subTab || 'overview');
    } else if (viewName === 'authority_dashboard') {
      if (!authManager.isAuthority()) {
        this.switchView('auth_authority');
        return;
      }
      this.authorityContainer.style.display = 'block';
      this.authorityDashboard.render(params.subTab || 'complaints');
    } else if (viewName === '3d_view') {
      this.scene3DContainer.style.display = 'block';
      // Adjust Three.js dimensions to viewport
      this.onWindowResize();
    }

    this.updateGlobalHeader();
  }

  updateGlobalHeader() {
    const navSlot = document.getElementById('global-nav-controls');
    const headerTitle = document.getElementById('globalAppTitle');
    const headerSub = document.getElementById('globalAppSub');
    if (!navSlot) return;

    const user = authManager.getCurrentUser();

    if (!user) {
      // Unauthenticated state (Welcome or Auth views)
      headerTitle.textContent = "Smart Campus Maintenance & Intelligence System";
      headerSub.textContent = "NIST University Berhampur • Spatial 3D Digital Infrastructure";

      navSlot.innerHTML = `
        <div class="nav-guest-row">
          <button class="nav-ghost-btn ${this.currentView === 'welcome' ? 'active' : ''}" id="hdrNavHome">
            <span>Campus Overview</span>
          </button>
          <button class="nav-ghost-btn ${this.currentView === '3d_view' ? 'active' : ''}" id="hdrNavGuest3D">
            ${Icons.building('', 15)}
            <span>3D Campus Twin</span>
          </button>
          <button class="nav-ghost-btn ${this.currentView === 'auth_student' ? 'active' : ''}" id="hdrNavStudent">
            ${Icons.graduate('', 15)}
            <span>Student Portal</span>
          </button>
          <button class="nav-ghost-btn ${this.currentView === 'auth_authority' ? 'active' : ''}" id="hdrNavAuth">
            ${Icons.shield('', 15)}
            <span>Facilities Administration</span>
          </button>
        </div>
      `;

      const btnHome = navSlot.querySelector('#hdrNavHome');
      if (btnHome) btnHome.addEventListener('click', () => this.switchView('welcome'));

      const btn3D = navSlot.querySelector('#hdrNavGuest3D');
      if (btn3D) btn3D.addEventListener('click', () => this.switchView('3d_view'));

      const btnStd = navSlot.querySelector('#hdrNavStudent');
      if (btnStd) btnStd.addEventListener('click', () => this.switchView('auth_student'));

      const btnAuth = navSlot.querySelector('#hdrNavAuth');
      if (btnAuth) btnAuth.addEventListener('click', () => this.switchView('auth_authority'));

    } else if (authManager.isStudent()) {
      // Student Logged In
      headerTitle.textContent = "Student Portal • Smart Campus";
      headerSub.textContent = `Welcome, ${user.fullName} (${user.regNo}) • ${user.department}`;

      navSlot.innerHTML = `
        <div class="nav-user-row">
          <button class="nav-ghost-btn ${this.currentView === 'student_dashboard' ? 'active' : ''}" id="hdrNavStdDash">
            ${Icons.dashboard('', 15)}
            <span>Dashboard</span>
          </button>
          <button class="nav-ghost-btn ${this.currentView === '3d_view' ? 'active' : ''}" id="hdrNavStd3D">
            ${Icons.building('', 15)}
            <span>3D Digital Twin</span>
          </button>
          <div class="nav-user-badge student-badge-pill">
            <span class="user-role-dot"></span>
            <span>${user.fullName.split(' ')[0]} (${user.regNo})</span>
          </div>
          <button class="nav-logout-btn" id="hdrNavLogout" title="Sign out of account">
            <span>Sign Out</span>
            ${Icons.arrowRight('', 13)}
          </button>
        </div>
      `;

      const btnDash = navSlot.querySelector('#hdrNavStdDash');
      if (btnDash) btnDash.addEventListener('click', () => this.switchView('student_dashboard'));

      const btn3D = navSlot.querySelector('#hdrNavStd3D');
      if (btn3D) btn3D.addEventListener('click', () => this.switchView('3d_view'));

      const btnLogout = navSlot.querySelector('#hdrNavLogout');
      if (btnLogout) btnLogout.addEventListener('click', () => {
        authManager.logout();
        this.switchView('welcome');
      });

    } else if (authManager.isAuthority()) {
      // Authority Logged In
      headerTitle.textContent = "Authority Portal • Smart Campus Administration";
      headerSub.textContent = `${user.fullName} (${user.employeeId || 'Administration'}) • Facilities & Security`;

      navSlot.innerHTML = `
        <div class="nav-user-row">
          <button class="nav-ghost-btn ${this.currentView === 'authority_dashboard' ? 'active' : ''}" id="hdrNavAuthDash">
            ${Icons.dashboard('', 15)}
            <span>Authority Hub</span>
          </button>
          <button class="nav-ghost-btn ${this.currentView === '3d_view' ? 'active' : ''}" id="hdrNavAuth3D">
            ${Icons.building('', 15)}
            <span>3D Campus Twin</span>
          </button>
          <div class="nav-user-badge authority-badge-pill">
            <span class="user-role-dot auth-dot"></span>
            <span>${user.fullName.split(' ')[0]} (Admin)</span>
          </div>
          <button class="nav-logout-btn" id="hdrNavLogout" title="Sign out of administrative account">
            <span>Sign Out</span>
            ${Icons.arrowRight('', 13)}
          </button>
        </div>
      `;

      const btnDash = navSlot.querySelector('#hdrNavAuthDash');
      if (btnDash) btnDash.addEventListener('click', () => this.switchView('authority_dashboard'));

      const btn3D = navSlot.querySelector('#hdrNavAuth3D');
      if (btn3D) btn3D.addEventListener('click', () => this.switchView('3d_view'));

      const btnLogout = navSlot.querySelector('#hdrNavLogout');
      if (btnLogout) btnLogout.addEventListener('click', () => {
        authManager.logout();
        this.switchView('welcome');
      });
    }
  }

  /* ========================================================================
     BIDIRECTIONAL 3D <-> DASHBOARD INTERACTIONS
     ======================================================================== */

  open3DBuilding(buildingKey) {
    this.switchView('3d_view');
    this.handleBuildingChange(buildingKey);
    this.floorSelector.setBuilding(buildingKey);
  }

  locateIn3D(complaint) {
    if (!complaint) return;
    this.switchView('3d_view');

    // 1. Switch to specified building
    const bldCode = complaint.building || 'LHC';
    this.handleBuildingChange(bldCode);
    this.floorSelector.setBuilding(bldCode);

    // 2. Isolate floor if provided
    const floorNum = parseInt(complaint.floor);
    if (!isNaN(floorNum) && floorNum > 0) {
      this.handleFloorChange(bldCode, floorNum);
      this.floorSelector.setFloor(floorNum);
    }

    // 3. Locate and highlight target room or washroom
    setTimeout(() => {
      const roomTarget = complaint.room || complaint.roomId || complaint.equipment;
      let matchedMesh = null;

      if (this.campus && this.campus.selectableObjects) {
        matchedMesh = this.campus.selectableObjects.find(m => {
          const u = m.userData;
          if (!u) return false;
          return (
            u.number === roomTarget ||
            u.id === roomTarget ||
            u.name === roomTarget ||
            (u.roomId && u.roomId === roomTarget)
          );
        });
      }

      if (matchedMesh) {
        const worldPos = new THREE.Vector3();
        matchedMesh.getWorldPosition(worldPos);
        this.cameraController.focusOnObject(worldPos, 14);
        this.selectionManager.selectObject(matchedMesh);
        this.infoPanel.show(matchedMesh.userData, matchedMesh);
      } else {
        // Focus building general position
        this.cameraController.applyBuildingFocus(bldCode, true);
      }
    }, 200);
  }

  onReportIssueFrom3D(roomData) {
    if (authManager.isStudent()) {
      this.switchView('student_dashboard');
      setTimeout(() => {
        this.studentDashboard.openBuildingComplaintModal(roomData);
      }, 50);
    } else if (authManager.isAuthority()) {
      this.switchView('authority_dashboard', { subTab: 'complaints' });
    } else {
      // Prompt student login
      alert("Please log in to your Student Account to submit an official maintenance complaint.");
      this.switchView('auth_student');
    }
  }

  /* ========================================================================
     3D NAVIGATION & SELECTION HANDLERS
     ======================================================================== */

  handleBuildingChange(buildingKey) {
    this.activeBuilding = buildingKey;
    this.cameraController.applyBuildingFocus(buildingKey, true);
    this.campus.focusBuilding(buildingKey);

    document.querySelectorAll('.cam-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.preset === 'default');
    });
  }

  handleFloorChange(buildingKey, floorNum) {
    if (buildingKey === 'LHC' && this.campus.lhc) {
      this.campus.lhc.focusFloor(floorNum);
      if (floorNum > 0) this.cameraController.focusFloor('LHC', floorNum);
    } else if (buildingKey === 'ATR' && this.campus.atrium) {
      this.campus.atrium.focusFloor(floorNum);
      if (floorNum > 0) this.cameraController.focusFloor('ATR', floorNum);
    } else if (buildingKey === 'GAL' && this.campus.galleria) {
      this.campus.galleria.focusFloor(floorNum);
      if (floorNum > 0) this.cameraController.focusFloor('GAL', floorNum);
    }
  }

  selectWashroom(washroomId) {
    const washroomMeta = CAMPUS_WASHROOMS.find(w => w.id === washroomId);
    if (!washroomMeta) return;

    this.activeBuilding = washroomMeta.building;
    this.floorSelector.setBuilding(washroomMeta.building);
    this.floorSelector.setFloor(washroomMeta.floor);
    this.handleFloorChange(washroomMeta.building, washroomMeta.floor);

    let washroomObj = null;
    if (washroomMeta.building === 'LHC' && this.campus.lhc) {
      washroomObj = this.campus.lhc.washrooms.find(w => w.id === washroomId);
    } else if (washroomMeta.building === 'ATR' && this.campus.atrium) {
      washroomObj = this.campus.atrium.washrooms.find(w => w.id === washroomId);
    } else if (washroomMeta.building === 'GAL' && this.campus.galleria) {
      washroomObj = this.campus.galleria.washrooms.find(w => w.id === washroomId);
    }

    if (washroomObj && washroomObj.hitbox) {
      const worldPos = new THREE.Vector3();
      washroomObj.hitbox.getWorldPosition(worldPos);
      this.cameraController.focusOnObject(worldPos, 14);
      this.selectionManager.selectObject(washroomObj.hitbox);
    }
  }

  onObjectSelected(userData, mesh) {
    if (!userData) {
      this.infoPanel.hide();
      return;
    }

    if (userData.isIssueMarker) {
      const targetMesh = userData.targetMesh;
      if (targetMesh && targetMesh.userData) {
        this.selectionManager.selectObject(targetMesh);
      }
      return;
    }

    this.infoPanel.show(userData, mesh);
  }

  onObjectHovered(userData, e) {
    const tooltip = document.getElementById('hover-tooltip');
    if (!tooltip) return;

    if (userData) {
      let label = userData.name || userData.id;
      let bld = userData.buildingName || (userData.building === 'ATR' ? 'Atrium' : (userData.building === 'GAL' ? 'Galleria' : 'LHC'));
      let sub = userData.floorLabel || (userData.floor ? `Floor ${userData.floor}` : '');

      tooltip.innerHTML = `
        <span class="tt-title" style="font-weight:700;">${label}</span>
        <br><span class="tt-sub" style="font-size:0.68rem;color:#94a3b8;">${bld}${sub ? ` • ${sub}` : ''}</span>
      `;
      tooltip.style.display = 'block';
      tooltip.style.left = `${e.clientX + 14}px`;
      tooltip.style.top = `${e.clientY + 14}px`;
    } else {
      tooltip.style.display = 'none';
    }
  }

  applyLightingMode(isNight) {
    if (isNight) {
      this.scene.background.setHex(0x060b18);
      this.scene.fog.color.setHex(0x060b18);
      this.sunLight.intensity = 0.2;
      this.sunLight.color.setHex(0x38bdf8);
      this.hemiLight.intensity = 0.25;
      this.hemiLight.color.setHex(0x1e293b);
      this.campus.setNightMode(true);
    } else {
      this.scene.background.setHex(0x93c5fd);
      this.scene.fog.color.setHex(0x93c5fd);
      this.sunLight.intensity = 1.4;
      this.sunLight.color.setHex(0xfffaed);
      this.hemiLight.intensity = 0.85;
      this.hemiLight.color.setHex(0xffffff);
      this.campus.setNightMode(false);
    }
  }

  initWashroomsModal() {
    const washroomsModal = document.getElementById('washrooms-modal');
    const openBtn = document.getElementById('viewWashroomsBtn');
    const closeBtn = document.getElementById('closeWashroomsBtn');
    const container = document.getElementById('washrooms-list-container');

    if (openBtn && washroomsModal) {
      openBtn.addEventListener('click', () => {
        washroomsModal.classList.add('open');
        this.renderWashroomsDirectory('ALL');
      });
    }
    if (closeBtn && washroomsModal) {
      closeBtn.addEventListener('click', () => washroomsModal.classList.remove('open'));
    }
    if (washroomsModal) {
      washroomsModal.addEventListener('click', (e) => {
        if (e.target === washroomsModal) washroomsModal.classList.remove('open');
      });
    }

    document.querySelectorAll('.washroom-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.washroom-filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.renderWashroomsDirectory(pill.dataset.filter);
      });
    });
  }

  renderWashroomsDirectory(filter = 'ALL') {
    const container = document.getElementById('washrooms-list-container');
    if (!container) return;

    const list = (filter === 'ALL')
      ? CAMPUS_WASHROOMS
      : CAMPUS_WASHROOMS.filter(w => w.building === filter);

    container.innerHTML = list.map(w => `
      <div class="washroom-card-item" data-id="${w.id}">
        <div class="w-card-top">
          <span class="w-badge">${w.building}</span>
          <span class="w-floor">${w.floorLabel || `Floor ${w.floor}`}</span>
        </div>
        <div class="w-card-title">🚾 ${w.name}</div>
        <div class="w-card-meta">${w.buildingName} • ${w.wing}</div>
      </div>
    `).join('');

    container.querySelectorAll('.washroom-card-item').forEach(card => {
      card.addEventListener('click', () => {
        const wId = card.dataset.id;
        document.getElementById('washrooms-modal').classList.remove('open');
        this.selectWashroom(wId);
      });
    });
  }

  initPhotoModal() {
    const photoModal = document.getElementById('photo-modal');
    const openPhotoBtn = document.getElementById('viewPhotoBtn');
    const closePhotoBtn = document.getElementById('closePhotoBtn');

    const photosData = [
      {
        id: "lhc",
        title: "Lecture Hall Complex (LHC)",
        img: "./public/reference/lhc-reference.jpg",
        badge: "VERIFIED REFERENCE",
        caption: "5-Storey white concrete construction, prominent Left Main Block with open external staircase (sawtooth stepped soffit and brown railings), independent passenger lift shaft positioned in front, continuous open front balcony corridors with teal trim and white columns, flat roof with penthouse stairhead, and surrounding campus landscape."
      },
      {
        id: "atrium1",
        title: "Atrium Building (3/4 Perspective)",
        img: "./public/reference/atrium-reference-1.png",
        badge: "VERIFIED REFERENCE",
        caption: "5-Storey academic landmark featuring a sweeping curved blue curtain-wall glass atrium facade, cream-white flanking wings with vertical stacks of triple-slit rectangular windows, grand portico with monumental white columns, and cylindrical rooftop penthouse drum."
      },
      {
        id: "atrium2",
        title: "Atrium Building (Front Elevation)",
        img: "./public/reference/atrium-reference-2.png",
        badge: "VERIFIED REFERENCE",
        caption: "Frontal elevation showing 'ATRIUM' official signage on the fascia band, grand flight of dark entrance steps, massive cylindrical portico columns, and prominent royal palm trees with Indian tricolor (saffron, white, green) wraps on the lower trunks."
      },
      {
        id: "galleria",
        title: "Galleria Building (Aerial View)",
        img: "./public/reference/galleria-reference.jpg",
        badge: "VERIFIED REFERENCE",
        caption: "4-Storey curvilinear academic complex finished in rich terracotta/brick-red with white horizontal floor bands and window trims, curved dark-blue glass central atrium, distinctive cylindrical spiral staircase towers with blue rings, white castellated roof parapet, and red-brick courtyard."
      }
    ];

    const renderPhotoTab = (idx) => {
      const data = photosData[idx];
      const modalTitle = document.querySelector('.photo-modal-title');
      const imgElem = document.querySelector('.photo-container img');
      const captionElem = document.querySelector('.photo-caption');

      if (modalTitle) modalTitle.textContent = data.title;
      if (imgElem) imgElem.src = data.img;
      if (captionElem) {
        captionElem.innerHTML = `
          <div style="margin-bottom:6px;"><span class="tag-pill tag-bld" style="background:#1d4ed8;color:#fff;">${data.badge}</span></div>
          <b>Key Architectural Features Reconstructed:</b> ${data.caption}
        `;
      }

      document.querySelectorAll('.photo-tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
      });
    };

    if (openPhotoBtn && photoModal) {
      openPhotoBtn.addEventListener('click', () => {
        photoModal.classList.add('open');
        renderPhotoTab(0);
      });
    }
    if (closePhotoBtn && photoModal) {
      closePhotoBtn.addEventListener('click', () => photoModal.classList.remove('open'));
    }
    if (photoModal) {
      photoModal.addEventListener('click', (e) => {
        if (e.target === photoModal) photoModal.classList.remove('open');
      });
    }

    document.querySelectorAll('.photo-tab-btn').forEach((btn, idx) => {
      btn.addEventListener('click', () => renderPhotoTab(idx));
    });
  }

  initGlobalEvents() {
    window.addEventListener('resize', () => this.onWindowResize());

    const brandBtn = document.getElementById('btnBrandHome');
    if (brandBtn) {
      brandBtn.addEventListener('click', () => {
        if (authManager.isAuthority()) {
          this.switchView('authority_dashboard');
        } else if (authManager.isStudent()) {
          this.switchView('student_dashboard');
        } else {
          this.switchView('welcome');
        }
      });
    }
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (this.camera && this.renderer) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock ? this.clock.getDelta() : 0.016;
    if (!this.clock) this.clock = new THREE.Clock();

    if (this.campus) {
      this.campus.update(delta);
    }

    if (this.issueMarkers) {
      this.issueMarkers.update(delta);
    }

    if (this.cameraController) {
      this.cameraController.update(delta);
    }

    // Update live lift floor telemetry in panel if open
    const liveLiftElem = document.getElementById('liveLiftFloor');
    if (liveLiftElem && this.campus && this.campus.lhc && this.campus.lhc.lift) {
      const lift = this.campus.lhc.lift;
      liveLiftElem.textContent = `Floor ${lift.currentFloor} (${lift.pauseTimer > 0 ? 'Doors Open' : (lift.direction > 0 ? 'Ascending ▲' : 'Descending ▼')})`;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Start Application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  try {
    window.campusApp = new NISTCampusApplication();
  } catch (err) {
    console.error("Critical error starting NIST Campus Smart System:", err);
    const errBox = document.createElement('div');
    errBox.style.cssText = "position:fixed;top:30px;left:30px;right:30px;background:#b91c1c;color:#fff;padding:24px;border-radius:12px;z-index:99999;font-family:monospace;font-size:14px;box-shadow:0 20px 40px rgba(0,0,0,0.8);white-space:pre-wrap;";
    errBox.innerHTML = `<b>NIST Campus Smart System - Startup Error:</b><br><br>${err.stack || err.message || err}`;
    document.body.appendChild(errBox);
  }
});
