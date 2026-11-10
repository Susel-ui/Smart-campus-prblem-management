/**
 * Campus2DMap.js - Tactical Game-Inspired Side-by-Side Campus Maintenance Command Map
 * 
 * Features:
 * - Combined Side-by-Side Command View:
 *   • Left: Master Campus Blueprint (2.5D Isometric complexes, animated radar sweep, active sonar alert pings)
 *   • Right: Active Sector Floor Schematic (interactive rooms, hazard vector icons) + Live Inline Inspector
 *   • One-click building sync: clicking any sector on the left instantly updates the right floor plan
 * - Game HUD Aesthetics:
 *   • Military/Sci-Fi coordinate grid & DEFCON status readouts
 *   • Glowing cyan/amber/red neon edges and corner brackets
 *   • Web Audio synthesized tactical sound effects (chirps, radar pings, clicks) with mute toggle
 *   • Dynamic zoom controls (+ / – / Reset)
 * - Triage Workflow & 3D Synchronization:
 *   • Fast dispatch workflow (Submitted -> Under Review -> Resolved)
 *   • "Open in 3D Digital Twin" spatial camera navigation
 *   • Real-time reactive updates from DataManager
 */

import { campusData } from '../data/DataManager.js';
import { CAMPUS_CONFIG } from '../data/campusConfig.js';
import { Icons, getCategoryIconInfo } from './icons.js';

// Web Audio API Synthesizer for tactical sound feedback (zero audio asset dependencies)
class TacticalAudioFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playBeep(freq = 880, type = 'sine', duration = 0.06, gainVal = 0.04) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  playChirp() {
    this.playBeep(1200, 'triangle', 0.05, 0.03);
    setTimeout(() => this.playBeep(1760, 'sine', 0.08, 0.03), 40);
  }

  playRadarPing() {
    this.playBeep(520, 'sine', 0.15, 0.02);
  }
}

const audioFX = new TacticalAudioFX();

export class Campus2DMap {
  constructor(containerElement, onLocateIn3D) {
    this.container = containerElement;
    this.onLocateIn3D = onLocateIn3D;

    // View state: 'SPLIT' (default side-by-side command), 'CAMPUS' (level 1 only), 'FLOOR' (level 2 only)
    this.viewMode = 'SPLIT';
    this.currentLevel = 1; // Maintained for backwards compatibility
    this.selectedBuilding = 'LHC'; // 'LHC' | 'ATR' | 'GAL'
    this.selectedFloor = 2; // Floor number (1 to 5)
    this.selectedRoom = null;
    this.selectedComplaintId = null;

    // Zoom & Pan state
    this.zoomLevel = 1.0;
    this.radarActive = true;
    this.soundEnabled = true;

    // Filters
    this.filterStatus = 'ALL';
    this.filterCategory = 'ALL';
    this.searchQuery = '';

    // Active modal ticket
    this.activeModalComplaint = null;

    // Subscribe to live synchronization
    this.unsubscribe = campusData.subscribe((type, payload) => {
      this.refreshMap();
    });
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    this.container.innerHTML = `
      <div class="campus-2d-tactical-wrapper">
        <!-- Top Tactical HUD Command Header -->
        <div class="tactical-hud-header">
          <div class="hud-header-left">
            <div class="hud-brand-row">
              <span class="hud-radar-glyph">${Icons.target('', 20)}</span>
              <h2 class="hud-main-title">CAMPUS TACTICAL MAP // COMMAND HUD</h2>
              <span class="hud-status-chip ${this.radarActive ? 'active' : ''}">
                <span class="hud-sonar-dot"></span>
                <span class="hud-status-text">RADAR SCAN ACTIVE</span>
              </span>
            </div>
            <div class="hud-telemetry-meta">
              <span class="hud-coord">LOC: NIST-HQ [19°18'53"N 84°47'38"E]</span>
              <span class="hud-sep">//</span>
              <span class="hud-metric">RESTRICTED FACILITY GRID</span>
              <span class="hud-sep">//</span>
              <span class="hud-metric">ACTIVE DEFECTS: <strong id="hudTotalDefects" class="highlight-cyan">0</strong> DETECTED</span>
            </div>
          </div>

          <!-- Tactical Action Controls -->
          <div class="hud-header-right">
            <!-- Layout Switcher: SPLIT COMMAND (DUAL) vs CAMPUS vs FLOOR -->
            <div class="tactical-mode-switch">
              <button class="tactical-mode-btn ${this.viewMode === 'SPLIT' ? 'active' : ''}" id="btnModeSplit" title="Side-by-Side Dual Command Mode">
                ${Icons.dashboard('', 15)}
                <span>1. SPLIT COMMAND [DUAL]</span>
              </button>
              <button class="tactical-mode-btn ${this.viewMode === 'CAMPUS' ? 'active' : ''}" id="btnModeCampus" title="Full Campus Overview">
                ${Icons.map('', 15)}
                <span>2. CAMPUS BLUEPRINT</span>
              </button>
              <button class="tactical-mode-btn ${this.viewMode === 'FLOOR' ? 'active' : ''}" id="btnModeFloor" title="Focused Sector Floor Plan">
                ${Icons.building('', 15)}
                <span>3. FLOOR SCHEMATIC</span>
              </button>
            </div>

            <!-- Zoom Controls -->
            <div class="hud-zoom-controls">
              <button class="hud-ctrl-btn" id="btnZoomOut" title="Zoom Out (–)">–</button>
              <span class="hud-zoom-label" id="lblZoomLevel">100%</span>
              <button class="hud-ctrl-btn" id="btnZoomIn" title="Zoom In (+)">+</button>
              <button class="hud-ctrl-btn" id="btnZoomReset" title="Reset View">${Icons.rotate('', 13)}</button>
            </div>

            <!-- Audio & Refresh Toggles -->
            <button class="hud-action-btn ${this.soundEnabled ? 'active' : ''}" id="btnToggleAudio" title="Toggle Tactical Audio FX">
              ${this.soundEnabled ? Icons.power('', 14) : Icons.close('', 14)}
              <span>${this.soundEnabled ? 'SFX ON' : 'SFX MUTED'}</span>
            </button>

            <button class="hud-action-btn refresh-btn" id="btnManualSync" title="Sync Live Facility Telemetry">
              ${Icons.refresh('', 14)}
              <span>SYNC RADAR</span>
            </button>
          </div>
        </div>

        <!-- Tactical Filter Ribbon with Target Counts -->
        <div class="tactical-filter-ribbon">
          <!-- Status Filters -->
          <div class="tactical-filter-group">
            <span class="t-filter-title">${Icons.filter('', 13)} SIGNAL STATUS:</span>
            <div class="tactical-pills" id="statusFilterPills">
              <button class="tactical-pill ${this.filterStatus === 'ALL' ? 'active' : ''}" data-status="ALL">
                [ALL TICKETS: <span id="countAll">0</span>]
              </button>
              <button class="tactical-pill pill-sub ${this.filterStatus === 'Submitted' ? 'active' : ''}" data-status="Submitted">
                <span class="t-dot dot-red"></span>
                NEW ALERTS: <span id="countSubmitted">0</span>
              </button>
              <button class="tactical-pill pill-rev ${this.filterStatus === 'Under Review' ? 'active' : ''}" data-status="Under Review">
                <span class="t-dot dot-amber"></span>
                DISPATCHED: <span id="countReview">0</span>
              </button>
              <button class="tactical-pill pill-res ${this.filterStatus === 'Resolved' ? 'active' : ''}" data-status="Resolved">
                <span class="t-dot dot-green"></span>
                RESOLVED: <span id="countResolved">0</span>
              </button>
            </div>
          </div>

          <!-- Category Filter & Search -->
          <div class="tactical-filter-group right-group">
            <label class="t-filter-title" for="categoryFilterSelect">SUBSYSTEM TYPE:</label>
            <select id="categoryFilterSelect" class="tactical-select">
              <option value="ALL">ALL SUBSYSTEMS</option>
              <option value="Fan">HVAC / FAN REGULATION</option>
              <option value="Light">ELECTRICAL LIGHTING</option>
              <option value="Electrical">POWER DISTRIBUTION</option>
              <option value="Water Leakage">WATER INGRESS / LEAK</option>
              <option value="Plumbing">PLUMBING & SANITATION</option>
              <option value="Cleaning">REFUSE & GROUNDS</option>
              <option value="Other">GENERAL FACILITY</option>
            </select>

            <div class="tactical-search">
              ${Icons.search('', 14)}
              <input type="text" id="mapSearchInput" placeholder="FILTER TARGET ID / ROOM..." value="${this.searchQuery}" />
              ${this.searchQuery ? `<button id="clearSearchBtn" class="t-clear-btn">${Icons.close('', 12)}</button>` : ''}
            </div>
          </div>
        </div>

        <!-- Tactical Viewport Canvas Box with HUD Corner Brackets -->
        <div class="tactical-viewport" id="tacticalViewport">
          <div class="hud-corner top-left"></div>
          <div class="hud-corner top-right"></div>
          <div class="hud-corner bottom-left"></div>
          <div class="hud-corner bottom-right"></div>

          <div id="mapCanvasSlot"></div>
        </div>

        <!-- General Campus Grounds Drawer -->
        <div class="tactical-general-drawer" id="generalIssuesDrawer">
          <!-- Rendered by renderGeneralIssues() -->
        </div>

        <!-- Tactical Ticket Detail Slide-Over / Modal -->
        <div class="tactical-modal-backdrop" id="mapTicketModal" style="display:none;">
          <div class="tactical-modal-card" id="mapTicketModalSlot"></div>
        </div>
      </div>
    `;

    this.attachTopEvents();
    this.refreshMap();
  }

  attachTopEvents() {
    const btnSplit = this.container.querySelector('#btnModeSplit');
    const btnCampus = this.container.querySelector('#btnModeCampus');
    const btnFloor = this.container.querySelector('#btnModeFloor');

    if (btnSplit) {
      btnSplit.addEventListener('click', () => {
        audioFX.playChirp();
        this.viewMode = 'SPLIT';
        this.currentLevel = 1;
        this.render();
      });
    }

    if (btnCampus) {
      btnCampus.addEventListener('click', () => {
        audioFX.playChirp();
        this.viewMode = 'CAMPUS';
        this.currentLevel = 1;
        this.render();
      });
    }

    if (btnFloor) {
      btnFloor.addEventListener('click', () => {
        audioFX.playChirp();
        this.viewMode = 'FLOOR';
        this.currentLevel = 2;
        this.render();
      });
    }

    // Zoom Controls
    const btnZoomIn = this.container.querySelector('#btnZoomIn');
    const btnZoomOut = this.container.querySelector('#btnZoomOut');
    const btnZoomReset = this.container.querySelector('#btnZoomReset');
    const lblZoom = this.container.querySelector('#lblZoomLevel');

    const updateZoom = (z) => {
      this.zoomLevel = Math.max(0.7, Math.min(1.8, z));
      if (lblZoom) lblZoom.textContent = `${Math.round(this.zoomLevel * 100)}%`;
      const svgBoxes = this.container.querySelectorAll('.tactical-svg-container');
      svgBoxes.forEach(box => { box.style.transform = `scale(${this.zoomLevel})`; });
      audioFX.playBeep(700, 'sine', 0.04, 0.02);
    };

    if (btnZoomIn) btnZoomIn.addEventListener('click', () => updateZoom(this.zoomLevel + 0.15));
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => updateZoom(this.zoomLevel - 0.15));
    if (btnZoomReset) btnZoomReset.addEventListener('click', () => updateZoom(1.0));

    // Audio Mute toggle
    const btnAudio = this.container.querySelector('#btnToggleAudio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        audioFX.muted = !this.soundEnabled;
        if (this.soundEnabled) audioFX.playChirp();
        this.render();
      });
    }

    // Manual sync button
    const btnSync = this.container.querySelector('#btnManualSync');
    if (btnSync) {
      btnSync.addEventListener('click', async () => {
        audioFX.playRadarPing();
        btnSync.classList.add('spinning');
        await campusData.fetchFromServer();
        setTimeout(() => {
          btnSync.classList.remove('spinning');
          this.refreshMap();
        }, 400);
      });
    }

    // Status filter buttons
    const statusPills = this.container.querySelectorAll('#statusFilterPills .tactical-pill');
    statusPills.forEach(btn => {
      btn.addEventListener('click', () => {
        audioFX.playBeep(900, 'sine', 0.04, 0.02);
        statusPills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterStatus = btn.dataset.status;
        this.refreshMap();
      });
    });

    // Category dropdown
    const catSelect = this.container.querySelector('#categoryFilterSelect');
    if (catSelect) {
      catSelect.value = this.filterCategory;
      catSelect.addEventListener('change', () => {
        audioFX.playChirp();
        this.filterCategory = catSelect.value;
        this.refreshMap();
      });
    }

    // Search input
    const searchInput = this.container.querySelector('#mapSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.refreshMap();
      });
    }

    const clearSearch = this.container.querySelector('#clearSearchBtn');
    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        this.searchQuery = '';
        if (searchInput) searchInput.value = '';
        this.refreshMap();
      });
    }

    // Close modal on backdrop click
    const modalBackdrop = this.container.querySelector('#mapTicketModal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) this.closeTicketModal();
      });
    }
  }

  refreshMap() {
    this.updateCounterBadges();

    const slot = this.container.querySelector('#mapCanvasSlot');
    if (!slot) return;

    if (this.viewMode === 'SPLIT') {
      slot.innerHTML = this.renderSplitCommandView();
      this.attachSplitEvents();
    } else if (this.viewMode === 'CAMPUS') {
      slot.innerHTML = `
        <div class="tactical-single-viewport">
          <div class="tactical-svg-container" style="transform: scale(${this.zoomLevel});">
            ${this.renderLevel1TacticalCampusView(false)}
          </div>
        </div>
      `;
      this.attachLevel1Events();
    } else {
      slot.innerHTML = `
        <div class="tactical-single-viewport">
          <div class="tactical-svg-container" style="transform: scale(${this.zoomLevel});">
            ${this.renderLevel2TacticalBuildingView(false)}
          </div>
        </div>
      `;
      this.attachLevel2Events();
    }

    this.renderGeneralIssues();
  }

  getFilteredComplaints() {
    const all = campusData.getComplaints();

    return all.filter(c => {
      if (this.filterStatus !== 'ALL' && c.status !== this.filterStatus) return false;

      if (this.filterCategory !== 'ALL') {
        const catInfo = getCategoryIconInfo(c.category);
        if (catInfo.name !== this.filterCategory && !c.category?.toLowerCase().includes(this.filterCategory.toLowerCase())) {
          return false;
        }
      }

      if (this.searchQuery) {
        const haystack = `${c.id} ${c.room || ''} ${c.building || ''} ${c.title || ''} ${c.description || ''} ${c.studentName || ''}`.toLowerCase();
        if (!haystack.includes(this.searchQuery)) return false;
      }

      return true;
    });
  }

  updateCounterBadges() {
    const all = campusData.getComplaints();
    const countAll = this.container.querySelector('#countAll');
    const countSub = this.container.querySelector('#countSubmitted');
    const countRev = this.container.querySelector('#countReview');
    const countRes = this.container.querySelector('#countResolved');
    const hudDefects = this.container.querySelector('#hudTotalDefects');

    const activeCount = all.filter(c => c.status !== 'Resolved').length;

    if (countAll) countAll.textContent = all.length;
    if (countSub) countSub.textContent = all.filter(c => c.status === 'Submitted').length;
    if (countRev) countRev.textContent = all.filter(c => c.status === 'Under Review').length;
    if (countRes) countRes.textContent = all.filter(c => c.status === 'Resolved').length;
    if (hudDefects) hudDefects.textContent = activeCount;
  }

  /* ========================================================================
     SPLIT / SIDE-BY-SIDE COMMAND VIEW
     ======================================================================== */
  renderSplitCommandView() {
    const bldCode = this.selectedBuilding;
    const bldConfig = CAMPUS_CONFIG.buildings[bldCode] || CAMPUS_CONFIG.buildings.LHC;
    const complaints = this.getFilteredComplaints();
    const floorComplaints = complaints.filter(c => (c.building === bldCode || c.buildingCode === bldCode) && parseInt(c.floor || c.floorNumber) === this.selectedFloor);

    return `
      <div class="tactical-split-viewport">
        <!-- Left Side: Sector Master Campus Blueprint -->
        <div class="tactical-split-pane tactical-pane-left">
          <div class="tactical-pane-header">
            <div class="pane-title-wrap">
              <span class="pane-glyph">${Icons.map('', 15)}</span>
              <h3 class="pane-title">CAMPUS BLUEPRINT // 2.5D OVERVIEW</h3>
            </div>
            <div class="pane-action-tags">
              <span class="active-sector-tag">TARGET: ${bldConfig.code}</span>
              <span class="pane-action-hint">CLICK SECTOR TO INSPECT</span>
            </div>
          </div>
          <div class="tactical-svg-container" style="transform: scale(${this.zoomLevel});">
            ${this.renderLevel1TacticalCampusView(true)}
          </div>
        </div>

        <!-- Right Side: Active Sector Floor Schematic & Interactive Inspector -->
        <div class="tactical-split-pane tactical-pane-right">
          <div class="tactical-pane-header">
            <div class="pane-title-wrap">
              <span class="pane-glyph">${Icons.building('', 15)}</span>
              <h3 class="pane-title">SECTOR SCHEMATIC // ${bldConfig.name.toUpperCase()}</h3>
            </div>
            <div class="tactical-bld-selector">
              <button class="t-bld-pill ${bldCode === 'LHC' ? 'active' : ''}" data-switch-bld="LHC">LHC (5F)</button>
              <button class="t-bld-pill ${bldCode === 'ATR' ? 'active' : ''}" data-switch-bld="ATR">ATRIUM (5F)</button>
              <button class="t-bld-pill ${bldCode === 'GAL' ? 'active' : ''}" data-switch-bld="GAL">GALLERIA (4F)</button>
            </div>
          </div>

          <!-- Floor Selector Tabs with Live Alert Badges -->
          <div class="tactical-floor-selector">
            ${bldConfig.floors.map(floor => {
              const count = complaints.filter(c => (c.building === bldCode || c.buildingCode === bldCode) && parseInt(c.floor || c.floorNumber) === floor.id && c.status !== 'Resolved').length;
              const isSelected = floor.id === this.selectedFloor;
              return `
                <button class="t-floor-btn ${isSelected ? 'active' : ''}" data-floor-id="${floor.id}">
                  <span class="t-floor-tag">${floor.label.toUpperCase()}</span>
                  ${count > 0 ? `<span class="t-alert-badge">${count} ALERTS</span>` : `<span class="t-clean-badge">OK</span>`}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Floor Schematic Architectural SVG -->
          <div class="tactical-blueprint-canvas">
            ${this.renderFloorSchematicSVG(bldCode, this.selectedFloor, floorComplaints)}
          </div>

          <!-- Live Inline Inspector & Triage Panel -->
          <div class="tactical-inline-inspector" id="inlineInspectorSlot">
            ${this.renderInlineInspector(floorComplaints, bldCode, this.selectedFloor)}
          </div>
        </div>
      </div>
    `;
  }

  attachSplitEvents() {
    this.attachLevel1Events();
    this.attachLevel2Events();
    this.attachInlineInspectorEvents();
  }

  /* ========================================================================
     LEVEL 1: GAME-INSPIRED TACTICAL CAMPUS COMMAND MAP
     ======================================================================== */
  renderLevel1TacticalCampusView(isSplit = false) {
    const complaints = this.getFilteredComplaints();

    const lhcActive = complaints.filter(c => (c.building === 'LHC' || c.buildingCode === 'LHC') && c.status !== 'Resolved');
    const atrActive = complaints.filter(c => (c.building === 'ATR' || c.buildingCode === 'ATR') && c.status !== 'Resolved');
    const galActive = complaints.filter(c => (c.building === 'GAL' || c.buildingCode === 'GAL') && c.status !== 'Resolved');

    const isLhcSelected = this.selectedBuilding === 'LHC';
    const isAtrSelected = this.selectedBuilding === 'ATR';
    const isGalSelected = this.selectedBuilding === 'GAL';

    return `
      <div class="tactical-map-viewport ${isSplit ? 'is-split-mode' : ''}">
        <!-- SVG Canvas with Holographic Cyber Grids, 2.5D Footprints, and Radar Sweeps -->
        <svg class="tactical-svg-canvas" viewBox="0 0 1000 660" preserveAspectRatio="xMidYMid meet">
          <defs>
            <!-- Cyber Neon Glow Filters -->
            <filter id="neonCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="neonAmberGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="neonRedAlert" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <!-- Holographic Radar Sweep Gradient -->
            <linearGradient id="radarSweepGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.35"/>
              <stop offset="50%" stop-color="#0ea5e9" stop-opacity="0.08"/>
              <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0"/>
            </linearGradient>

            <!-- Building 2.5D Massing Gradients -->
            <linearGradient id="lhcIsoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0f2b48" stop-opacity="0.95"/>
              <stop offset="100%" stop-color="#0a192f" stop-opacity="0.95"/>
            </linearGradient>

            <linearGradient id="atrIsoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#1e1b4b" stop-opacity="0.95"/>
              <stop offset="100%" stop-color="#0b1329" stop-opacity="0.95"/>
            </linearGradient>

            <linearGradient id="galIsoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#451a03" stop-opacity="0.95"/>
              <stop offset="100%" stop-color="#1c1917" stop-opacity="0.95"/>
            </linearGradient>

            <!-- Cyber Pattern for Grounds -->
            <pattern id="tacticalGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.8" stroke-opacity="0.4"/>
              <circle cx="0" cy="0" r="1.5" fill="#38bdf8" fill-opacity="0.25"/>
            </pattern>
          </defs>

          <!-- Background Cybernetic Grid & Terrain -->
          <rect width="1000" height="660" fill="#040914" />
          <rect width="1000" height="660" fill="url(#tacticalGridPattern)" />

          <!-- Alpha-Numeric Quadrant Coordinates HUD markings -->
          <g font-family="monospace" font-size="9" fill="#475569" font-weight="700">
            <text x="25" y="25">QUAD-A1 [NORTH-WEST]</text>
            <text x="510" y="25">QUAD-B1 [NORTH-EAST]</text>
            <text x="25" y="340">QUAD-A2 [MID-WEST]</text>
            <text x="510" y="340">QUAD-B2 [MID-EAST]</text>
            <text x="25" y="645">QUAD-A3 [SOUTH-WEST]</text>
            <text x="510" y="645">QUAD-B3 [SOUTH-EAST]</text>
          </g>

          <!-- Compass Rose Reticle Overlay -->
          <g transform="translate(940, 50)" opacity="0.65">
            <circle cx="0" cy="0" r="24" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4,2"/>
            <line x1="0" y1="-28" x2="0" y2="28" stroke="#38bdf8" stroke-width="1.2"/>
            <line x1="-28" y1="0" x2="28" y2="0" stroke="#38bdf8" stroke-width="1.2"/>
            <polygon points="0,-26 5,-14 -5,-14" fill="#38bdf8"/>
            <text x="0" y="-30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="10" font-weight="900">N</text>
          </g>

          <!-- Concentric Tactical Radar Range Rings -->
          <g stroke="#0ea5e9" stroke-width="0.8" fill="none" stroke-opacity="0.18">
            <circle cx="450" cy="330" r="120" />
            <circle cx="450" cy="330" r="220" stroke-dasharray="6,4"/>
            <circle cx="450" cy="330" r="320" />
            <circle cx="450" cy="330" r="420" stroke-dasharray="10,6"/>
          </g>

          <!-- Rotating Radar Sweep Cone -->
          ${this.radarActive ? `
            <g class="radar-beam-rotator">
              <path d="M 450 330 L 870 110 A 450 450 0 0 1 870 550 Z" fill="url(#radarSweepGrad)" />
              <line x1="450" y1="330" x2="870" y2="110" stroke="#38bdf8" stroke-width="1.8" filter="url(#neonCyanGlow)"/>
            </g>
          ` : ''}

          <!-- Paved Campus Arteries & Walkways -->
          <g stroke="#334155" stroke-width="24" stroke-linecap="round" fill="none" opacity="0.4">
            <line x1="380" y1="80" x2="380" y2="600" />
            <line x1="380" y1="330" x2="600" y2="330" />
            <line x1="600" y1="200" x2="600" y2="480" />
          </g>
          <g stroke="#0284c7" stroke-width="1.5" stroke-dasharray="8,6" fill="none" opacity="0.7">
            <line x1="380" y1="80" x2="380" y2="600" />
            <line x1="380" y1="330" x2="600" y2="330" />
            <line x1="600" y1="200" x2="600" y2="480" />
          </g>

          <!-- Main Campus Lawn & Green Central Quad -->
          <rect x="400" y="240" width="180" height="180" rx="14" fill="#064e3b" fill-opacity="0.2" stroke="#10b981" stroke-width="1.2" stroke-dasharray="6,4"/>
          <text x="490" y="335" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="10" font-weight="700" letter-spacing="1">CENTRAL QUAD / PARK</text>


          <!-- ================================================================
               SECTOR 01: LECTURE HALL COMPLEX (LHC) - West Campus
               ================================================================ -->
          <g class="tactical-building-node ${isLhcSelected ? 'is-target-active' : ''}" data-bld="LHC" cursor="pointer">
            <!-- Active Target Halo if selected in split view -->
            ${isLhcSelected ? `
              <rect x="65" y="75" width="270" height="510" rx="14" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="10,5" filter="url(#neonCyanGlow)"/>
            ` : ''}

            <!-- Alert Beacon Radar Rings if active issues exist -->
            ${lhcActive.length > 0 ? `
              <circle cx="200" cy="330" r="160" fill="#ef4444" fill-opacity="0.06" class="sonar-ping-3"/>
              <circle cx="200" cy="330" r="110" fill="#ef4444" fill-opacity="0.1" class="sonar-ping-2"/>
              <circle cx="200" cy="330" r="60" fill="#ef4444" fill-opacity="0.18" class="sonar-ping-1"/>
            ` : ''}

            <!-- 2.5D Extrusion Shadows -->
            <polygon points="80,95 320,95 330,105 90,105" fill="#0284c7" fill-opacity="0.3"/>
            <polygon points="320,95 320,565 330,575 330,105" fill="#0284c7" fill-opacity="0.5"/>

            <!-- Base Footprint Envelope -->
            <rect x="80" y="85" width="240" height="480" rx="10" fill="url(#lhcIsoGrad)" stroke="${isLhcSelected ? '#38bdf8' : '#0284c7'}" stroke-width="${isLhcSelected ? '2.8' : '2.0'}" filter="url(#neonCyanGlow)"/>

            <!-- Architectural Concourse & Balconies -->
            <rect x="95" y="100" width="210" height="450" rx="6" fill="#0b1e36" stroke="#0ea5e9" stroke-width="1.2" stroke-dasharray="4,2"/>

            <!-- Individual Classroom Wings (01 through 09) -->
            ${[0,1,2,3,4,5,6,7,8].map(i => {
              const yPos = 115 + i * 47;
              return `
                <rect x="110" y="${yPos}" width="180" height="38" rx="4" fill="#0d2442" stroke="#1e40af" stroke-width="1"/>
                <text x="125" y="${yPos + 23}" fill="#94a3b8" font-family="monospace" font-size="9.5" font-weight="700">HALL 20${i+1}</text>
              `;
            }).join('')}

            <!-- Central Entry Core -->
            <rect x="290" y="300" width="30" height="60" rx="4" fill="#38bdf8" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1.5"/>

            <!-- Building Tactical Target Header -->
            <g font-family="monospace" text-anchor="middle">
              <text x="200" y="60" fill="#f8fafc" font-size="14" font-weight="800" letter-spacing="1">SECTOR-01: LHC</text>
              <text x="200" y="76" fill="#38bdf8" font-size="10.5" font-weight="700" letter-spacing="1.5">LECTURE HALL COMPLEX // 5 FLOORS</text>
            </g>

            <!-- Holographic Status Badge Pill -->
            ${this.renderTacticalBuildingBadge(lhcActive, 200, 535)}
          </g>


          <!-- ================================================================
               SECTOR 02: GALLERIA ATRIUM (ATR) - Northeast Campus
               ================================================================ -->
          <g class="tactical-building-node ${isAtrSelected ? 'is-target-active' : ''}" data-bld="ATR" cursor="pointer">
            <!-- Active Target Halo -->
            ${isAtrSelected ? `
              <rect x="585" y="70" width="300" height="210" rx="14" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="10,5" filter="url(#neonCyanGlow)"/>
            ` : ''}

            <!-- Alert Beacon Radar Rings if active issues exist -->
            ${atrActive.length > 0 ? `
              <circle cx="735" cy="170" r="130" fill="#ef4444" fill-opacity="0.06" class="sonar-ping-3"/>
              <circle cx="735" cy="170" r="90" fill="#ef4444" fill-opacity="0.1" class="sonar-ping-2"/>
              <circle cx="735" cy="170" r="50" fill="#ef4444" fill-opacity="0.18" class="sonar-ping-1"/>
            ` : ''}

            <!-- 2.5D Extrusion Shadows -->
            <polygon points="595,85 875,85 885,95 605,95" fill="#4338ca" fill-opacity="0.3"/>
            <polygon points="875,85 875,255 885,265 885,95" fill="#4338ca" fill-opacity="0.5"/>

            <!-- Base Footprint Envelope -->
            <rect x="595" y="80" width="280" height="180" rx="10" fill="url(#atrIsoGrad)" stroke="${isAtrSelected ? '#38bdf8' : '#6366f1'}" stroke-width="${isAtrSelected ? '2.8' : '2.0'}" filter="url(#neonCyanGlow)"/>

            <!-- Curved Atrium Skylight / Void -->
            <path d="M 685 110 Q 735 90 785 110 L 785 230 Q 735 250 685 230 Z" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.8" stroke-dasharray="5,3"/>
            <text x="735" y="175" text-anchor="middle" fill="#a5b4fc" font-family="monospace" font-size="10" font-weight="700">SKYLIGHT VOID</text>

            <!-- West Labs & East Classrooms -->
            <rect x="610" y="95" width="60" height="150" rx="4" fill="#1e1b4b" stroke="#4f46e5" stroke-width="1"/>
            <rect x="800" y="95" width="60" height="150" rx="4" fill="#1e1b4b" stroke="#4f46e5" stroke-width="1"/>

            <!-- Building Tactical Target Header -->
            <g font-family="monospace" text-anchor="middle">
              <text x="735" y="55" fill="#f8fafc" font-size="14" font-weight="800" letter-spacing="1">SECTOR-02: ATRIUM</text>
              <text x="735" y="71" fill="#818cf8" font-size="10.5" font-weight="700" letter-spacing="1.5">GALLERIA ATRIUM COMPLEX // 5 FLOORS</text>
            </g>

            <!-- Holographic Status Badge Pill -->
            ${this.renderTacticalBuildingBadge(atrActive, 735, 235)}
          </g>


          <!-- ================================================================
               SECTOR 03: GALLERIA BUILDING (GAL) - Southeast Campus
               ================================================================ -->
          <g class="tactical-building-node ${isGalSelected ? 'is-target-active' : ''}" data-bld="GAL" cursor="pointer">
            <!-- Active Target Halo -->
            ${isGalSelected ? `
              <rect x="585" y="360" width="300" height="220" rx="14" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="10,5" filter="url(#neonCyanGlow)"/>
            ` : ''}

            <!-- Alert Beacon Radar Rings if active issues exist -->
            ${galActive.length > 0 ? `
              <circle cx="735" cy="470" r="130" fill="#ef4444" fill-opacity="0.06" class="sonar-ping-3"/>
              <circle cx="735" cy="470" r="90" fill="#ef4444" fill-opacity="0.1" class="sonar-ping-2"/>
              <circle cx="735" cy="470" r="50" fill="#ef4444" fill-opacity="0.18" class="sonar-ping-1"/>
            ` : ''}

            <!-- 2.5D Extrusion Shadows -->
            <polygon points="595,375 875,375 885,385 605,385" fill="#c2410c" fill-opacity="0.3"/>
            <polygon points="875,375 875,555 885,565 885,385" fill="#c2410c" fill-opacity="0.5"/>

            <!-- Base Footprint Envelope -->
            <rect x="595" y="370" width="280" height="190" rx="10" fill="url(#galIsoGrad)" stroke="${isGalSelected ? '#38bdf8' : '#f97316'}" stroke-width="${isGalSelected ? '2.8' : '2.0'}" filter="url(#neonAmberGlow)"/>

            <!-- West Wing (Auditorium & HPC) & East Wing (Lecture Halls) -->
            <rect x="610" y="385" width="105" height="160" rx="6" fill="#431407" fill-opacity="0.75" stroke="#ea580c" stroke-width="1.2"/>
            <rect x="760" y="385" width="105" height="160" rx="6" fill="#431407" fill-opacity="0.75" stroke="#ea580c" stroke-width="1.2"/>

            <!-- Central Curved Glass Spine -->
            <path d="M 720 395 Q 735 375 750 395 L 750 535 Q 735 555 720 535 Z" fill="#0f172a" stroke="#f97316" stroke-width="1.5"/>

            <!-- Building Tactical Target Header -->
            <g font-family="monospace" text-anchor="middle">
              <text x="735" y="348" fill="#f8fafc" font-size="14" font-weight="800" letter-spacing="1">SECTOR-03: GALLERIA</text>
              <text x="735" y="364" fill="#fb923c" font-size="10.5" font-weight="700" letter-spacing="1.5">GALLERIA COMPLEX // 4 FLOORS</text>
            </g>

            <!-- Holographic Status Badge Pill -->
            ${this.renderTacticalBuildingBadge(galActive, 735, 525)}
          </g>
        </svg>

        <!-- Tactical Map Bottom Telemetry HUD Bar -->
        <div class="tactical-hud-footer">
          <div class="hud-f-col">
            <span class="hud-f-label">TELEMETRY GRID:</span>
            <span class="hud-f-val">MULTI-SPECTRAL FACILITY MONITORING</span>
          </div>
          <div class="hud-f-col center">
            <span class="hud-f-prompt">${Icons.mouse('', 14)} <strong>TACTICAL SYNC:</strong> CLICK ANY SECTOR BOX TO DRILL DOWN</span>
          </div>
          <div class="hud-f-col right">
            <span class="hud-f-label">PROTOCOL:</span>
            <span class="hud-f-val highlight-green">NIST-FACILITY-NET // SECURE</span>
          </div>
        </div>
      </div>
    `;
  }

  renderTacticalBuildingBadge(activeComplaints, cx, cy) {
    if (activeComplaints.length === 0) {
      return `
        <g transform="translate(${cx - 75}, ${cy - 14})">
          <rect width="150" height="28" rx="4" fill="#064e3b" stroke="#10b981" stroke-width="1.5" />
          <circle cx="15" cy="14" r="4.5" fill="#10b981"/>
          <text x="27" y="18" fill="#a7f3d0" font-family="monospace" font-size="10.5" font-weight="800" letter-spacing="1">STATUS: ALL CLEAR</text>
        </g>
      `;
    }

    const count = activeComplaints.length;
    const categories = Array.from(new Set(activeComplaints.map(c => getCategoryIconInfo(c.category).name)));
    const catLabel = categories.slice(0, 2).join("/") + (categories.length > 2 ? `+` : "");

    return `
      <g transform="translate(${cx - 95}, ${cy - 16})">
        <rect width="190" height="32" rx="4" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.8" filter="url(#neonRedAlert)"/>
        <circle cx="16" cy="16" r="5.5" fill="#ef4444" class="pulse-anim-dot"/>
        <text x="28" y="20" fill="#ffffff" font-family="monospace" font-size="11" font-weight="900" letter-spacing="0.5">
          ALERT: ${count} DEFECT${count > 1 ? 'S' : ''} [${catLabel}]
        </text>
      </g>
    `;
  }

  attachLevel1Events() {
    this.container.querySelectorAll('.tactical-building-node').forEach(group => {
      group.addEventListener('click', () => {
        audioFX.playChirp();
        const bld = group.dataset.bld;
        this.selectedBuilding = bld;
        this.selectedFloor = bld === 'LHC' ? 2 : 1;
        this.selectedRoom = null;
        this.selectedComplaintId = null;

        if (this.viewMode === 'CAMPUS') {
          // If in full campus mode, user clicked to drill down into floor schematic
          this.viewMode = 'SPLIT';
        }
        this.refreshMap();
      });
    });
  }

  /* ========================================================================
     LEVEL 2: TACTICAL ARCHITECTURAL FLOOR PLAN VIEW
     ======================================================================== */
  renderLevel2TacticalBuildingView(isSplit = false) {
    const bldCode = this.selectedBuilding;
    const bldConfig = CAMPUS_CONFIG.buildings[bldCode] || CAMPUS_CONFIG.buildings.LHC;
    const complaints = this.getFilteredComplaints().filter(c => c.building === bldCode || c.buildingCode === bldCode);

    const floorComplaints = complaints.filter(c => {
      const fNum = parseInt(c.floor || c.floorNumber);
      return fNum === this.selectedFloor;
    });

    return `
      <div class="level2-tactical-floorplan ${isSplit ? 'is-split-mode' : ''}">
        <!-- Tactical Breadcrumbs & Building Switcher -->
        <div class="tactical-sub-header">
          <div class="tactical-crumbs">
            <button class="tactical-back-btn" id="btnBackToCampus">
              ${Icons.arrowLeft('', 14)}
              <span>CAMPUS OVERVIEW</span>
            </button>
            <span class="crumb-slash">//</span>
            <span class="current-sector-title">SECTOR: ${bldConfig.name.toUpperCase()} [${bldConfig.code}]</span>
          </div>

          <div class="tactical-bld-selector">
            <button class="t-bld-pill ${bldCode === 'LHC' ? 'active' : ''}" data-switch-bld="LHC">LHC (5F)</button>
            <button class="t-bld-pill ${bldCode === 'ATR' ? 'active' : ''}" data-switch-bld="ATR">ATRIUM (5F)</button>
            <button class="t-bld-pill ${bldCode === 'GAL' ? 'active' : ''}" data-switch-bld="GAL">GALLERIA (4F)</button>
          </div>
        </div>

        <!-- Floor Switcher Buttons with Game Badge Counters -->
        <div class="tactical-floor-selector">
          ${bldConfig.floors.map(floor => {
            const count = complaints.filter(c => parseInt(c.floor || c.floorNumber) === floor.id && c.status !== 'Resolved').length;
            const isSelected = floor.id === this.selectedFloor;
            return `
              <button class="t-floor-btn ${isSelected ? 'active' : ''}" data-floor-id="${floor.id}">
                <span class="t-floor-tag">${floor.label.toUpperCase()}</span>
                ${count > 0 ? `<span class="t-alert-badge">${count} ALERTS</span>` : `<span class="t-clean-badge">OK</span>`}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Tactical Architectural Schematic Canvas -->
        <div class="tactical-blueprint-canvas">
          ${this.renderFloorSchematicSVG(bldCode, this.selectedFloor, floorComplaints)}
        </div>

        <!-- Floor Telemetry Legend Bar -->
        <div class="tactical-floor-telemetry">
          <div class="telemetry-info">
            <span class="telemetry-status">FLOOR ${this.selectedFloor} DIAGNOSTIC: 
              <strong class="${floorComplaints.length > 0 ? 'highlight-red' : 'highlight-green'}">
                ${floorComplaints.filter(c => c.status !== 'Resolved').length} ACTIVE DEFECTS REPORTED
              </strong>
            </span>
          </div>
          <div class="telemetry-legend-pills">
            <span class="t-leg-pill"><span class="t-leg-dot dot-red"></span> CRITICAL / SUBMITTED</span>
            <span class="t-leg-pill"><span class="t-leg-dot dot-amber"></span> IN-PROGRESS / REVIEW</span>
            <span class="t-leg-pill"><span class="t-leg-dot dot-green"></span> RESOLVED</span>
          </div>
        </div>

        ${!isSplit ? `
          <!-- Inline Inspector for Full-width floor view -->
          <div class="tactical-inline-inspector" id="inlineInspectorSlot">
            ${this.renderInlineInspector(floorComplaints, bldCode, this.selectedFloor)}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderFloorSchematicSVG(buildingCode, floorNum, floorComplaints) {
    if (buildingCode === 'LHC') {
      return this.renderTacticalLHCFloorPlan(floorNum, floorComplaints);
    } else if (buildingCode === 'ATR') {
      return this.renderTacticalAtriumFloorPlan(floorNum, floorComplaints);
    } else {
      return this.renderTacticalGalleriaFloorPlan(floorNum, floorComplaints);
    }
  }

  /* --- TACTICAL LHC FLOOR PLAN --- */
  renderTacticalLHCFloorPlan(floorNum, floorComplaints) {
    const roomSlots = [
      { num: `${floorNum}01`, label: `Smart Hall ${floorNum}01`, x: 120, y: 50, w: 75, h: 100, type: "Smart Classroom" },
      { num: `${floorNum}02`, label: `Lecture Hall ${floorNum}02`, x: 205, y: 50, w: 75, h: 100, type: "Lecture Hall" },
      { num: `${floorNum}03`, label: `Lecture Hall ${floorNum}03`, x: 290, y: 50, w: 75, h: 100, type: "Lecture Hall" },
      { num: `${floorNum}04`, label: `Lecture Hall ${floorNum}04`, x: 375, y: 50, w: 75, h: 100, type: "Lecture Hall" },
      { num: `${floorNum}05`, label: `Lecture Hall ${floorNum}05`, x: 460, y: 50, w: 75, h: 100, type: "Lecture Hall" },
      { num: `${floorNum}06`, label: `Lecture Hall ${floorNum}06`, x: 545, y: 50, w: 75, h: 100, type: "Lecture Hall" },
      { num: `${floorNum}07`, label: `Lecture Hall ${floorNum}07`, x: 630, y: 50, w: 75, h: 100, type: "Lecture Hall" },
      { num: `${floorNum}08`, label: `Lecture Hall ${floorNum}08`, x: 715, y: 50, w: 75, h: 100, type: "Lecture Hall" },
      { num: `${floorNum}09`, label: `Seminar Lab ${floorNum}09`, x: 800, y: 50, w: 75, h: 100, type: "Lab / Seminar" }
    ];

    const washroomWest = { id: `WASHROOM_F${floorNum}`, name: "West Restroom", x: 35, y: 50, w: 75, h: 100 };
    const washroomEast = { id: `WASHROOM_F${floorNum}_EAST`, name: "East Restroom", x: 885, y: 50, w: 75, h: 100 };

    return `
      <svg class="tactical-schematic-svg" viewBox="0 0 1000 240" preserveAspectRatio="xMidYMid meet">
        <rect width="1000" height="240" rx="8" fill="#070d19" stroke="#1e293b" stroke-width="1.5"/>

        <!-- Front Balcony Corridor with Cyber Neon Border -->
        <rect x="25" y="160" width="950" height="50" rx="4" fill="#0f172a" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="8,4"/>
        <text x="500" y="190" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="700" letter-spacing="3">
          FRONT OPEN-AIR BALCONY CONCOURSE // ACCESSWAY
        </text>

        <!-- West Washroom -->
        ${this.renderTacticalRoomCell(washroomWest, floorComplaints)}

        <!-- Rooms 01-09 -->
        ${roomSlots.map(r => this.renderTacticalRoomCell(r, floorComplaints)).join('')}

        <!-- East Washroom -->
        ${this.renderTacticalRoomCell(washroomEast, floorComplaints)}
      </svg>
    `;
  }

  /* --- TACTICAL ATRIUM FLOOR PLAN --- */
  renderTacticalAtriumFloorPlan(floorNum, floorComplaints) {
    const centerRoom = floorNum === 1 ? { id: "ATR-GF-SAC", num: "SAC", label: "Student Activities Centre", x: 340, y: 40, w: 320, h: 110, type: "Hub" }
                     : floorNum === 3 ? { id: "ATR-SF-BIZ", num: "BIZ", label: "NIST Business School Wing", x: 340, y: 40, w: 320, h: 110, type: "Business" }
                     : floorNum === 4 ? { id: "ATR-TF-LIB", num: "LIB", label: "Business School Library", x: 340, y: 40, w: 320, h: 110, type: "Library" }
                     : floorNum === 5 ? { id: "ATR-FOF-CINEPLEX", num: "CINE", label: "Stephen Hawking Cineplex", x: 340, y: 40, w: 320, h: 110, type: "Auditorium" }
                     : { id: "ATR-ATRIUM-VOID", num: "VOID", label: "Central Open Atrium Gallery", x: 340, y: 40, w: 320, h: 110, type: "Atrium" };

    const westWash = { id: `ATR_WASHROOM_${floorNum}`, num: "WASH", name: "West Restroom", x: 30, y: 40, w: 70, h: 110 };
    const lab1 = { id: `ATR-F${floorNum}-LAB1`, num: `LAB1`, label: `Specialized Lab 1`, x: 110, y: 40, w: 105, h: 52 };
    const lab2 = { id: `ATR-F${floorNum}-LAB2`, num: `LAB2`, label: `Specialized Lab 2`, x: 110, y: 98, w: 105, h: 52 };
    const fac = { id: `ATR-F${floorNum}-FAC`, num: `FACULTY`, label: `Faculty Cabins`, x: 225, y: 40, w: 105, h: 110 };

    const eastRooms = [
      { id: `ATR-F${floorNum}-01`, num: `01`, label: `Classroom 01`, x: 670, y: 40, w: 58, h: 110 },
      { id: `ATR-F${floorNum}-02`, num: `02`, label: `Classroom 02`, x: 733, y: 40, w: 58, h: 110 },
      { id: `ATR-F${floorNum}-03`, num: `03`, label: `Classroom 03`, x: 796, y: 40, w: 58, h: 110 },
      { id: `ATR-F${floorNum}-04`, num: `04`, label: `Classroom 04`, x: 859, y: 40, w: 58, h: 110 },
      { id: `ATR-F${floorNum}-05`, num: `05`, label: `Classroom 05`, x: 922, y: 40, w: 58, h: 110 }
    ];

    return `
      <svg class="tactical-schematic-svg" viewBox="0 0 1000 240" preserveAspectRatio="xMidYMid meet">
        <rect width="1000" height="240" rx="8" fill="#070d19" stroke="#1e293b" stroke-width="1.5"/>

        <!-- Central Atrium Connecting Concourse -->
        <rect x="25" y="160" width="950" height="50" rx="4" fill="#0f172a" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="8,4"/>
        <text x="500" y="190" text-anchor="middle" fill="#60a5fa" font-family="monospace" font-size="11" font-weight="700" letter-spacing="3">
          MEZZANINE CONCOURSE & CURVED ATRIUM GLASS WALKWAY
        </text>

        <!-- West Wing -->
        ${this.renderTacticalRoomCell(westWash, floorComplaints)}
        ${this.renderTacticalRoomCell(lab1, floorComplaints)}
        ${this.renderTacticalRoomCell(lab2, floorComplaints)}
        ${this.renderTacticalRoomCell(fac, floorComplaints)}

        <!-- Central Atrium Bay -->
        ${this.renderTacticalRoomCell(centerRoom, floorComplaints)}

        <!-- East Wing Classrooms -->
        ${eastRooms.map(r => this.renderTacticalRoomCell(r, floorComplaints)).join('')}
      </svg>
    `;
  }

  /* --- TACTICAL GALLERIA FLOOR PLAN --- */
  renderTacticalGalleriaFloorPlan(floorNum, floorComplaints) {
    const westRoom = floorNum === 1 ? { id: "GAL-GF-AUD", num: "AUD", label: "250-Seat Main Auditorium", x: 40, y: 40, w: 300, h: 110, type: "Auditorium" }
                   : floorNum === 2 ? { id: "GAL-FF-HPC", num: "HPC", label: "High Performance Computing Lab", x: 40, y: 40, w: 300, h: 110, type: "Supercomputing" }
                   : floorNum === 3 ? { id: "GAL-SF-IBM", num: "IBM", label: "IBM Centre of Excellence", x: 40, y: 40, w: 300, h: 110, type: "CoE" }
                   : { id: "GAL-TF-ROBO", num: "ROBO", label: "Advanced Robotics & IoT Arena", x: 40, y: 40, w: 300, h: 110, type: "Robotics" };

    const spineWash = { id: `GAL_WASHROOM_${floorNum}`, num: "REST", name: "Spine Restrooms", x: 360, y: 40, w: 90, h: 110 };

    const eastHalls = [
      { id: `GAL-F${floorNum}-H1`, num: `HALL 1`, label: `Interactive Hall 1`, x: 470, y: 40, w: 155, h: 110 },
      { id: `GAL-F${floorNum}-H2`, num: `HALL 2`, label: `Interactive Hall 2`, x: 640, y: 40, w: 155, h: 110 },
      { id: `GAL-F${floorNum}-H3`, num: `HALL 3`, label: `Interactive Hall 3`, x: 810, y: 40, w: 155, h: 110 }
    ];

    return `
      <svg class="tactical-schematic-svg" viewBox="0 0 1000 240" preserveAspectRatio="xMidYMid meet">
        <rect width="1000" height="240" rx="8" fill="#070d19" stroke="#1e293b" stroke-width="1.5"/>

        <!-- Spine Concourse -->
        <rect x="25" y="160" width="950" height="50" rx="4" fill="#0f172a" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="8,4"/>
        <text x="500" y="190" text-anchor="middle" fill="#fb923c" font-family="monospace" font-size="11" font-weight="700" letter-spacing="3">
          TERRACOTTA CORRIDOR & ROTUNDA CONCOURSE
        </text>

        ${this.renderTacticalRoomCell(westRoom, floorComplaints)}
        ${this.renderTacticalRoomCell(spineWash, floorComplaints)}
        ${eastHalls.map(r => this.renderTacticalRoomCell(r, floorComplaints)).join('')}
      </svg>
    `;
  }

  /**
   * Renders tactical room cell with glowing borders, hover states, and hazard beacons
   */
  renderTacticalRoomCell(room, floorComplaints) {
    const { x, y, w, h } = room;
    const roomIdentifier = room.num || room.id;
    const roomTitle = room.label || room.name || `Room ${roomIdentifier}`;

    const matchedComplaints = floorComplaints.filter(c => {
      const cRoom = (c.room || c.roomNumber || c.roomId || '').toLowerCase();
      const rNum = (room.num || '').toLowerCase();
      const rId = (room.id || '').toLowerCase();

      return (
        cRoom === rNum ||
        cRoom === rId ||
        (rNum && cRoom.includes(rNum)) ||
        (rId && cRoom.includes(rId))
      );
    });

    const hasComplaints = matchedComplaints.length > 0;
    const hasUnresolved = matchedComplaints.some(c => c.status !== 'Resolved');
    const primaryComplaint = matchedComplaints[0];
    const isSelected = this.selectedRoom === roomIdentifier || (primaryComplaint && this.selectedComplaintId === primaryComplaint.id);

    let strokeColor = "#1e293b";
    let fillColor = "#0b1329";
    let filterClass = "";

    if (isSelected) {
      strokeColor = "#38bdf8";
      fillColor = "#0f2b48";
      filterClass = "neonCyanGlow";
    } else if (hasUnresolved) {
      const isReview = matchedComplaints.some(c => c.status === 'Under Review');
      strokeColor = isReview ? "#f59e0b" : "#ef4444";
      fillColor = isReview ? "#451a03" : "#450a0a";
      filterClass = isReview ? "neonAmberGlow" : "neonRedAlert";
    } else if (hasComplaints) {
      strokeColor = "#10b981";
      fillColor = "#064e3b";
    }

    return `
      <g class="tactical-room-cell ${hasComplaints ? 'has-alert' : ''} ${isSelected ? 'selected' : ''}" data-room-id="${roomIdentifier}" data-complaint-id="${primaryComplaint ? primaryComplaint.id : ''}" cursor="pointer">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isSelected ? 2.8 : (hasComplaints ? 2.2 : 1.2)}" ${filterClass ? `filter="url(#${filterClass})"` : ''}/>

        <!-- Cyber Corner Reticle Accents -->
        <line x1="${x + 4}" y1="${y + 4}" x2="${x + 10}" y2="${y + 4}" stroke="${strokeColor}" stroke-width="1.2"/>
        <line x1="${x + 4}" y1="${y + 4}" x2="${x + 4}" y2="${y + 10}" stroke="${strokeColor}" stroke-width="1.2"/>
        <line x1="${x + w - 4}" y1="${y + 4}" x2="${x + w - 10}" y2="${y + 4}" stroke="${strokeColor}" stroke-width="1.2"/>
        <line x1="${x + w - 4}" y1="${y + 4}" x2="${x + w - 4}" y2="${y + 10}" stroke="${strokeColor}" stroke-width="1.2"/>

        <!-- Room Label -->
        <text x="${x + w / 2}" y="${y + (h > 60 ? 24 : 18)}" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="${h > 60 ? 12 : 10.5}" font-weight="800">
          ${roomIdentifier}
        </text>

        ${h > 60 ? `
          <text x="${x + w / 2}" y="${y + 40}" text-anchor="middle" fill="#64748b" font-family="monospace" font-size="8.5">
            ${roomTitle.length > 15 ? roomTitle.substring(0, 14) + '…' : roomTitle}
          </text>
        ` : ''}

        <!-- Animated Tactical Marker -->
        ${hasComplaints ? this.renderTacticalRoomMarker(matchedComplaints, x + w / 2, y + (h > 60 ? h - 26 : h - 18)) : ''}
      </g>
    `;
  }

  renderTacticalRoomMarker(complaintsList, cx, cy) {
    const primary = complaintsList[0];
    const catInfo = getCategoryIconInfo(primary.category);
    const count = complaintsList.length;

    const isResolved = complaintsList.every(c => c.status === 'Resolved');
    const isReview = !isResolved && complaintsList.some(c => c.status === 'Under Review');
    const markerColor = isResolved ? '#10b981' : (isReview ? '#f59e0b' : '#ef4444');

    return `
      <g class="tactical-marker-group" transform="translate(${cx}, ${cy})">
        <!-- Radar Ping Wave -->
        ${!isResolved ? `<circle cx="0" cy="0" r="16" fill="${markerColor}" fill-opacity="0.22" class="marker-pulse"/>` : ''}

        <!-- Target Center Ring -->
        <circle cx="0" cy="0" r="12" fill="#070d19" stroke="${markerColor}" stroke-width="1.8"/>

        <!-- Clean SVG Category Icon via foreignObject -->
        <foreignObject x="-7.5" y="-7.5" width="15" height="15">
          <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;color:${markerColor};">
            ${catInfo.icon('', 14)}
          </div>
        </foreignObject>

        <!-- Grouped Count Badge -->
        ${count > 1 ? `
          <circle cx="10" cy="-8" r="7" fill="#f59e0b" stroke="#070d19" stroke-width="1.5"/>
          <text x="10" y="-5" text-anchor="middle" fill="#070d19" font-family="monospace" font-size="9" font-weight="900">${count}</text>
        ` : ''}
      </g>
    `;
  }

  attachLevel2Events() {
    const btnBack = this.container.querySelector('#btnBackToCampus');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        audioFX.playChirp();
        this.viewMode = 'CAMPUS';
        this.currentLevel = 1;
        this.render();
      });
    }

    this.container.querySelectorAll('.t-bld-pill').forEach(chip => {
      chip.addEventListener('click', () => {
        audioFX.playBeep(920, 'sine', 0.04, 0.02);
        this.selectedBuilding = chip.dataset.switchBld;
        this.selectedFloor = this.selectedBuilding === 'LHC' ? 2 : 1;
        this.selectedRoom = null;
        this.selectedComplaintId = null;
        this.refreshMap();
      });
    });

    this.container.querySelectorAll('.t-floor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audioFX.playBeep(850, 'sine', 0.04, 0.02);
        this.selectedFloor = parseInt(btn.dataset.floorId);
        this.selectedRoom = null;
        this.selectedComplaintId = null;
        this.refreshMap();
      });
    });

    this.container.querySelectorAll('.tactical-room-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const roomId = cell.dataset.roomId;
        const cmpId = cell.dataset.complaintId;
        this.selectedRoom = roomId;
        this.selectedComplaintId = cmpId || null;

        audioFX.playRadarPing();
        if (cmpId) {
          // If in split mode, update inline inspector smoothly; also allow double click or button to open full modal
          this.refreshMap();
        } else {
          this.refreshMap();
        }
      });
    });
  }

  /* ========================================================================
     INLINE TRIAGE & INSPECTOR PANEL (For Split View)
     ======================================================================== */
  renderInlineInspector(floorComplaints, buildingCode, floorNum) {
    let complaint = null;
    if (this.selectedComplaintId) {
      complaint = campusData.getComplaintById(this.selectedComplaintId);
    }
    if (!complaint && floorComplaints.length > 0) {
      // Default to first active complaint on this floor
      complaint = floorComplaints.find(c => c.status !== 'Resolved') || floorComplaints[0];
    }

    if (!complaint) {
      return `
        <div class="t-inspector-empty">
          <div class="t-insp-empty-icon">${Icons.check('', 20)}</div>
          <div class="t-insp-empty-text">
            <strong>ALL SYSTEMS NOMINAL ON FLOOR ${floorNum}</strong>
            <span>Zero critical maintenance alerts. Click any room cell on the schematic above to inspect fixture status.</span>
          </div>
        </div>
      `;
    }

    const catInfo = getCategoryIconInfo(complaint.category);
    const statusClass = complaint.status === 'Resolved' ? 'status-resolved' : (complaint.status === 'Under Review' ? 'status-review' : 'status-submitted');

    return `
      <div class="t-inline-inspector-card" data-cmp-id="${complaint.id}">
        <div class="t-insp-header">
          <div class="t-insp-tags">
            <span class="t-insp-cat ${catInfo.badgeClass}">
              ${catInfo.icon('', 14)}
              <span>${complaint.category.toUpperCase()}</span>
            </span>
            <span class="t-insp-id">ID: ${complaint.id}</span>
            <span class="badge-status ${statusClass}">${complaint.status}</span>
          </div>

          <button class="t-insp-modal-btn" id="btnOpenFullModal" title="Open Full Screen Ticket Detail">
            ${Icons.eye('', 13)}
            <span>FULL AUDIT</span>
          </button>
        </div>

        <div class="t-insp-body">
          <div class="t-insp-main">
            <h4 class="t-insp-title">${complaint.title || complaint.description.substring(0, 45)}</h4>
            <p class="t-insp-desc">${complaint.description}</p>
            <div class="t-insp-meta-row">
              <span class="t-insp-meta-item"><strong>ROOM:</strong> ${complaint.room || 'N/A'}</span>
              <span class="t-insp-meta-sep">•</span>
              <span class="t-insp-meta-item"><strong>REPORTER:</strong> ${complaint.studentName || 'Student'}</span>
              <span class="t-insp-meta-sep">•</span>
              <span class="t-insp-meta-item"><strong>LOGGED:</strong> ${complaint.submittedAt || 'Recent'}</span>
            </div>
          </div>

          ${complaint.photoUrl ? `
            <div class="t-insp-photo" id="btnPreviewPhoto" title="Inspect Photo Evidence">
              <img src="${complaint.photoUrl}" alt="Evidence" />
              <span class="t-photo-zoom-hint">${Icons.search('', 12)}</span>
            </div>
          ` : ''}
        </div>

        <!-- Inline Triage Action Dispatch Box -->
        <div class="t-insp-action-bar">
          <div class="t-insp-dispatch-group">
            <label class="t-insp-lbl">DISPATCH STATUS:</label>
            <select id="inlineActionStatus" class="t-insp-select">
              <option value="Submitted" ${complaint.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
              <option value="Under Review" ${complaint.status === 'Under Review' ? 'selected' : ''}>Under Review (Dispatched)</option>
              <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved (Complete)</option>
            </select>
            <input type="text" id="inlineActionRemarks" placeholder="Technician notes..." class="t-insp-inp" />
            <button id="btnInlineDispatch" class="t-btn-dispatch-sm">UPDATE</button>
          </div>

          ${complaint.building ? `
            <button class="t-btn-open3d-sm" id="btnInlineOpen3D">
              ${Icons.building('', 14)}
              <span>OPEN IN 3D DIGITAL TWIN</span>
              ${Icons.arrowRight('', 13)}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  attachInlineInspectorEvents() {
    const card = this.container.querySelector('.t-inline-inspector-card');
    if (!card) return;

    const cmpId = card.dataset.cmpId;
    const complaint = campusData.getComplaintById(cmpId);
    if (!complaint) return;

    // Full modal trigger
    const btnFull = card.querySelector('#btnOpenFullModal');
    if (btnFull) {
      btnFull.addEventListener('click', () => {
        audioFX.playChirp();
        this.openTicketModal(complaint.id);
      });
    }

    // Photo preview
    const photoBox = card.querySelector('#btnPreviewPhoto');
    if (photoBox) {
      photoBox.addEventListener('click', () => {
        this.openTicketModal(complaint.id);
      });
    }

    // Inline Dispatch
    const btnDispatch = card.querySelector('#btnInlineDispatch');
    if (btnDispatch) {
      btnDispatch.addEventListener('click', () => {
        audioFX.playChirp();
        const newStatus = card.querySelector('#inlineActionStatus').value;
        const remarks = card.querySelector('#inlineActionRemarks').value.trim() || `Status updated to ${newStatus}`;

        campusData.updateComplaintStatus(complaint.id, newStatus, remarks, "Authority Facilities Officer");
        this.refreshMap();
      });
    }

    // 3D Locate
    const btn3D = card.querySelector('#btnInlineOpen3D');
    if (btn3D) {
      btn3D.addEventListener('click', () => {
        audioFX.playRadarPing();
        if (this.onLocateIn3D) {
          this.onLocateIn3D(complaint);
        }
      });
    }
  }

  /* ========================================================================
     GENERAL CAMPUS INCIDENTS DRAWER
     ======================================================================== */
  renderGeneralIssues() {
    const slot = this.container.querySelector('#generalIssuesDrawer');
    if (!slot) return;

    const complaints = this.getFilteredComplaints().filter(c => c.type === 'GENERAL' || !c.building);

    slot.innerHTML = `
      <div class="tactical-drawer-header">
        <div class="t-drawer-title">
          <span class="t-drawer-glyph">${Icons.alert('', 16)}</span>
          <h3>EXTERIOR GROUNDS & PERIMETER INCIDENTS // GENERAL DISPATCH</h3>
          <span class="t-count-tag">${complaints.length} LOGGED</span>
        </div>
        <span class="t-drawer-sub">Outdoor lighting, paved concourses, perimeter sanitation, irrigation</span>
      </div>

      ${complaints.length === 0 ? `
        <div class="t-empty-state">
          <span>${Icons.check('', 16)} ALL CAMPUS PERIMETER GROUNDS AND EXTERIOR INFRASTRUCTURE NOMINAL.</span>
        </div>
      ` : `
        <div class="tactical-cards-grid">
          ${complaints.map(c => {
            const catInfo = getCategoryIconInfo(c.category);
            const statusClass = c.status === 'Resolved' ? 'status-resolved' : (c.status === 'Under Review' ? 'status-review' : 'status-submitted');

            return `
              <div class="tactical-card" data-cmp-id="${c.id}">
                <div class="t-card-top">
                  <span class="t-cat-badge ${catInfo.badgeClass}">
                    ${catInfo.icon('', 13)}
                    <span>${c.category.toUpperCase()}</span>
                  </span>
                  <span class="badge-status ${statusClass}">${c.status}</span>
                </div>
                <h4 class="t-card-heading">${c.title || c.description.substring(0, 40)}</h4>
                <p class="t-card-snippet">${c.description}</p>
                <div class="t-card-foot">
                  <span class="t-loc">${Icons.mapPin('', 13)} ${c.locationDetail || c.area || 'Grounds'}</span>
                  <button class="t-view-btn" data-cmp-id="${c.id}">INSPECT TICKET →</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    slot.querySelectorAll('[data-cmp-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.cmpId;
        if (id) {
          audioFX.playRadarPing();
          this.openTicketModal(id);
        }
      });
    });
  }

  /* ========================================================================
     TACTICAL TICKET MODAL WITH "OPEN IN 3D MODEL"
     ======================================================================== */
  openTicketModal(complaintId) {
    const complaint = campusData.getComplaintById(complaintId);
    if (!complaint) return;

    this.activeModalComplaint = complaint;
    const modalBackdrop = this.container.querySelector('#mapTicketModal');
    const modalSlot = this.container.querySelector('#mapTicketModalSlot');
    if (!modalBackdrop || !modalSlot) return;

    const catInfo = getCategoryIconInfo(complaint.category);
    const statusClass = complaint.status === 'Resolved' ? 'status-resolved' : (complaint.status === 'Under Review' ? 'status-review' : 'status-submitted');

    modalSlot.innerHTML = `
      <div class="t-modal-top">
        <div class="t-modal-tag">
          <span class="t-modal-icon">${catInfo.icon('', 16)}</span>
          <span class="t-modal-id">TARGET ID: ${complaint.id}</span>
          <span class="badge-status ${statusClass}">${complaint.status}</span>
        </div>
        <button class="t-modal-close" id="btnCloseMapModal" aria-label="Close modal">
          ${Icons.close('', 16)}
        </button>
      </div>

      <div class="t-modal-body">
        <h3 class="t-modal-title">${complaint.title || complaint.description.substring(0, 50)}</h3>
        <p class="t-modal-desc">${complaint.description}</p>

        <!-- Tactical Metadata Matrix -->
        <div class="t-meta-matrix">
          <div class="t-meta-cell">
            <span class="t-cell-k">SECTOR / BUILDING</span>
            <span class="t-cell-v">${complaint.buildingName || complaint.building || 'Campus Grounds'}</span>
          </div>
          <div class="t-meta-cell">
            <span class="t-cell-k">ELEVATION / FLOOR</span>
            <span class="t-cell-v">${complaint.floorLabel || (complaint.floor ? `Floor ${complaint.floor}` : 'Exterior')}</span>
          </div>
          <div class="t-meta-cell">
            <span class="t-cell-k">ROOM / TARGET FIXTURE</span>
            <span class="t-cell-v highlight-cyan">${complaint.room || complaint.roomNumber || complaint.roomId || 'General Area'}</span>
          </div>
          <div class="t-meta-cell">
            <span class="t-cell-k">SUBSYSTEM CATEGORY</span>
            <span class="t-cell-v">${complaint.category}</span>
          </div>
          <div class="t-meta-cell">
            <span class="t-cell-k">REPORTED BY</span>
            <span class="t-cell-v">${complaint.studentName || 'Student'} [${complaint.studentId || ''}]</span>
          </div>
          <div class="t-meta-cell">
            <span class="t-cell-k">LOGGED TIMESTAMP</span>
            <span class="t-cell-v">${complaint.submittedAt || 'Recent'}</span>
          </div>
        </div>

        <!-- Photograph Evidence -->
        ${complaint.photoUrl ? `
          <div class="t-photo-section">
            <span class="t-cell-k">PHOTOGRAPHIC EVIDENCE ATTACHMENT:</span>
            <div class="t-photo-container">
              <img src="${complaint.photoUrl}" alt="Issue Evidence" class="t-photo-img" />
            </div>
          </div>
        ` : ''}

        <!-- Status History Audit Trail -->
        <div class="t-history-section">
          <span class="t-cell-k">TACTICAL LIFECYCLE AUDIT TRAIL:</span>
          <div class="t-timeline">
            ${(complaint.statusHistory || []).map(h => `
              <div class="t-timeline-step">
                <span class="t-step-bullet"></span>
                <div class="t-step-text">
                  <span class="t-step-h"><strong>${h.status}</strong> by ${h.by || 'Authority'} [${h.at || ''}]</span>
                  ${h.notes ? `<p class="t-step-n">"${h.notes}"</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Administrative Triage Workflow Form -->
        <div class="t-action-box">
          <label class="t-action-lbl" for="ticketActionStatus">DISPATCH / ADVANCE STATUS:</label>
          <div class="t-action-row">
            <select id="ticketActionStatus" class="t-action-select">
              <option value="Submitted" ${complaint.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
              <option value="Under Review" ${complaint.status === 'Under Review' ? 'selected' : ''}>Under Review (Technician Dispatched)</option>
              <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved (Work Completed)</option>
            </select>
            <input type="text" id="ticketActionRemarks" placeholder="Enter maintenance dispatch / resolution remarks..." class="t-action-inp" />
            <button id="btnSaveStatusChange" class="t-btn-dispatch">DISPATCH</button>
          </div>
        </div>
      </div>

      <!-- Footer with Open in 3D Model -->
      <div class="t-modal-footer">
        <button class="t-btn-close" id="btnCancelModal">DISMISS</button>
        ${complaint.building ? `
          <button class="t-btn-open3d" id="btnOpenIn3DModel">
            ${Icons.building('', 16)}
            <span>OPEN IN 3D DIGITAL TWIN</span>
            <span class="t-arrow">${Icons.arrowRight('', 14)}</span>
          </button>
        ` : ''}
      </div>
    `;

    modalBackdrop.style.display = 'flex';
    this.attachModalEvents(complaint);
  }

  attachModalEvents(complaint) {
    const modalBackdrop = this.container.querySelector('#mapTicketModal');
    const closeBtn = this.container.querySelector('#btnCloseMapModal');
    const cancelBtn = this.container.querySelector('#btnCancelModal');

    const close = () => {
      audioFX.playBeep(600, 'sine', 0.04, 0.02);
      modalBackdrop.style.display = 'none';
      this.activeModalComplaint = null;
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (cancelBtn) cancelBtn.addEventListener('click', close);

    const saveBtn = this.container.querySelector('#btnSaveStatusChange');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        audioFX.playChirp();
        const newStatus = this.container.querySelector('#ticketActionStatus').value;
        const remarks = this.container.querySelector('#ticketActionRemarks').value.trim() || `Status updated to ${newStatus}`;

        campusData.updateComplaintStatus(complaint.id, newStatus, remarks, "Authority Facilities Officer");
        this.openTicketModal(complaint.id);
        this.refreshMap();
      });
    }

    const btn3D = this.container.querySelector('#btnOpenIn3DModel');
    if (btn3D) {
      btn3D.addEventListener('click', () => {
        audioFX.playRadarPing();
        close();
        if (this.onLocateIn3D) {
          this.onLocateIn3D(complaint);
        }
      });
    }
  }

  closeTicketModal() {
    const modalBackdrop = this.container.querySelector('#mapTicketModal');
    if (modalBackdrop) modalBackdrop.style.display = 'none';
    this.activeModalComplaint = null;
  }
}