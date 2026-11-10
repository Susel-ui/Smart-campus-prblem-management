/**
 * FloorSelector.js - Campus Building Switcher & Dynamic Floor Level Navigation
 * 
 * Provides:
 * - Top-level Building Selector: Campus Overview, LHC, Atrium, Galleria
 * - Architectural floor badges tailored to each building's structural levels:
 *   • LHC: All Levels, L1, L2, L3, L4, L5
 *   • Atrium: All Levels, GF, L1, L2, L3, L4 (Cineplex)
 *   • Galleria: All Levels, GF, L1, L2, L3
 * - Dynamic Facilities Bar with direct click inspection for washrooms & labs
 */

import { CAMPUS_CONFIG, CAMPUS_WASHROOMS } from '../data/campusConfig.js';
import { Icons } from './icons.js';

export class FloorSelectorUI {
  constructor(containerElement, onBuildingChange, onFloorChange, onWashroomSelect) {
    this.container = containerElement;
    this.onBuildingChange = onBuildingChange;
    this.onFloorChange = onFloorChange;
    this.onWashroomSelect = onWashroomSelect;

    this.activeBuilding = 'CAMPUS'; // 'CAMPUS' | 'LHC' | 'ATR' | 'GAL'
    this.activeFloor = 0; // 0 = All Floors

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="floor-selector-card">
        <!-- Building Tabs Header -->
        <div class="building-tabs-row">
          <button class="bld-tab-btn ${this.activeBuilding === 'CAMPUS' ? 'active' : ''}" data-bld="CAMPUS">
            <span class="tab-icon">${Icons.building('', 15)}</span>
            <span class="tab-label">Master Campus Plan</span>
          </button>
          <button class="bld-tab-btn ${this.activeBuilding === 'LHC' ? 'active' : ''}" data-bld="LHC">
            <span class="tab-icon">${Icons.layers('', 15)}</span>
            <span class="tab-label">Lecture Hall Complex</span>
          </button>
          <button class="bld-tab-btn ${this.activeBuilding === 'ATR' ? 'active' : ''}" data-bld="ATR">
            <span class="tab-icon">${Icons.layers('', 15)}</span>
            <span class="tab-label">Atrium Building</span>
          </button>
          <button class="bld-tab-btn ${this.activeBuilding === 'GAL' ? 'active' : ''}" data-bld="GAL">
            <span class="tab-icon">${Icons.layers('', 15)}</span>
            <span class="tab-label">Galleria Complex</span>
          </button>
        </div>

        <!-- Dynamic Floor Buttons Row -->
        <div class="floor-buttons-row" id="floorButtonsSlot">
          ${this.getFloorButtonsHTML()}
        </div>

        <!-- Facilities Bar -->
        <div class="floor-facilities-bar" id="floorFacilitiesBar">
          ${this.getFacilitiesHTML()}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    // 1. Building Tab Clicks
    const bldButtons = this.container.querySelectorAll('.bld-tab-btn');
    bldButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        bldButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeBuilding = btn.dataset.bld;
        this.activeFloor = 0; // reset to all floors

        // Update floor buttons and facilities bar
        const slot = this.container.querySelector('#floorButtonsSlot');
        if (slot) slot.innerHTML = this.getFloorButtonsHTML();

        const bar = this.container.querySelector('#floorFacilitiesBar');
        if (bar) bar.innerHTML = this.getFacilitiesHTML();

        this.attachFloorButtonEvents();
        this.attachFacilityChipEvents();

        if (this.onBuildingChange) {
          this.onBuildingChange(this.activeBuilding);
        }
      });
    });

    this.attachFloorButtonEvents();
    this.attachFacilityChipEvents();
    this.attachCampusChipEvents();
  }

  attachCampusChipEvents() {
    const campusChips = this.container.querySelectorAll('.campus-chip-btn');
    campusChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetBld = chip.dataset.targetBld;
        this.setBuilding(targetBld);
        if (this.onBuildingChange) {
          this.onBuildingChange(targetBld);
        }
      });
    });
  }

  attachFloorButtonEvents() {
    const floorButtons = this.container.querySelectorAll('.floor-pill-btn');
    floorButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        floorButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const floor = parseInt(btn.dataset.floor, 10);
        this.activeFloor = floor;

        const bar = this.container.querySelector('#floorFacilitiesBar');
        if (bar) bar.innerHTML = this.getFacilitiesHTML();
        this.attachFacilityChipEvents();

        if (this.onFloorChange) {
          this.onFloorChange(this.activeBuilding, floor);
        }
      });
    });
  }

  attachFacilityChipEvents() {
    const chips = this.container.querySelectorAll('.washroom-chip-btn');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const wId = chip.dataset.washroomId;
        if (this.onWashroomSelect) {
          this.onWashroomSelect(wId);
        }
      });
    });
  }

  getFloorButtonsHTML() {
    if (this.activeBuilding === 'CAMPUS') {
      return `
        <div class="campus-quick-row">
          <span class="campus-meta-pill">NIST University Campus Digital Infrastructure</span>
          <button class="campus-chip-btn" data-target-bld="LHC">Focus LHC (5 Floors)</button>
          <button class="campus-chip-btn" data-target-bld="ATR">Focus Atrium (5 Floors)</button>
          <button class="campus-chip-btn" data-target-bld="GAL">Focus Galleria (4 Floors)</button>
        </div>
      `;
    }

    if (this.activeBuilding === 'LHC') {
      return `
        <button class="floor-pill-btn ${this.activeFloor === 0 ? 'active' : ''}" data-floor="0">
          <span class="floor-code-badge">ALL</span>
          <div class="btn-text"><span class="btn-title">All Floors</span><span class="btn-sub">Entire Structure</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 1 ? 'active' : ''}" data-floor="1">
          <span class="floor-code-badge">L1</span>
          <div class="btn-text"><span class="btn-title">Floor 1</span><span class="btn-sub">Rooms 101–109</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 2 ? 'active' : ''}" data-floor="2">
          <span class="floor-code-badge">L2</span>
          <div class="btn-text"><span class="btn-title">Floor 2</span><span class="btn-sub">Rooms 201–209</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 3 ? 'active' : ''}" data-floor="3">
          <span class="floor-code-badge">L3</span>
          <div class="btn-text"><span class="btn-title">Floor 3</span><span class="btn-sub">Rooms 301–309</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 4 ? 'active' : ''}" data-floor="4">
          <span class="floor-code-badge">L4</span>
          <div class="btn-text"><span class="btn-title">Floor 4</span><span class="btn-sub">Rooms 401–409</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 5 ? 'active' : ''}" data-floor="5">
          <span class="floor-code-badge">L5</span>
          <div class="btn-text"><span class="btn-title">Floor 5</span><span class="btn-sub">Rooms 501–509</span></div>
        </button>
      `;
    }

    if (this.activeBuilding === 'ATR') {
      return `
        <button class="floor-pill-btn ${this.activeFloor === 0 ? 'active' : ''}" data-floor="0">
          <span class="floor-code-badge">ALL</span>
          <div class="btn-text"><span class="btn-title">All Floors</span><span class="btn-sub">Atrium</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 1 ? 'active' : ''}" data-floor="1">
          <span class="floor-code-badge">GF</span>
          <div class="btn-text"><span class="btn-title">Ground Level</span><span class="btn-sub">SAC & Labs</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 2 ? 'active' : ''}" data-floor="2">
          <span class="floor-code-badge">L1</span>
          <div class="btn-text"><span class="btn-title">Level 1</span><span class="btn-sub">AI & CS Labs</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 3 ? 'active' : ''}" data-floor="3">
          <span class="floor-code-badge">L2</span>
          <div class="btn-text"><span class="btn-title">Level 2</span><span class="btn-sub">Business School</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 4 ? 'active' : ''}" data-floor="4">
          <span class="floor-code-badge">L3</span>
          <div class="btn-text"><span class="btn-title">Level 3</span><span class="btn-sub">BS Library</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 5 ? 'active' : ''}" data-floor="5">
          <span class="floor-code-badge">L4</span>
          <div class="btn-text"><span class="btn-title">Level 4</span><span class="btn-sub">Cineplex</span></div>
        </button>
      `;
    }

    if (this.activeBuilding === 'GAL') {
      return `
        <button class="floor-pill-btn ${this.activeFloor === 0 ? 'active' : ''}" data-floor="0">
          <span class="floor-code-badge">ALL</span>
          <div class="btn-text"><span class="btn-title">All Floors</span><span class="btn-sub">Galleria</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 1 ? 'active' : ''}" data-floor="1">
          <span class="floor-code-badge">GF</span>
          <div class="btn-text"><span class="btn-title">Ground Level</span><span class="btn-sub">250-Seat Aud</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 2 ? 'active' : ''}" data-floor="2">
          <span class="floor-code-badge">L1</span>
          <div class="btn-text"><span class="btn-title">Level 1</span><span class="btn-sub">HPC Computing Lab</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 3 ? 'active' : ''}" data-floor="3">
          <span class="floor-code-badge">L2</span>
          <div class="btn-text"><span class="btn-title">Level 2</span><span class="btn-sub">IBM CoE</span></div>
        </button>
        <button class="floor-pill-btn ${this.activeFloor === 4 ? 'active' : ''}" data-floor="4">
          <span class="floor-code-badge">L3</span>
          <div class="btn-text"><span class="btn-title">Level 3</span><span class="btn-sub">NTCS Suite</span></div>
        </button>
      `;
    }

    return '';
  }

  getFacilitiesHTML() {
    if (this.activeBuilding === 'CAMPUS') {
      return `
        <span class="fac-meta">
          NIST Academic Enclave • 14 Structural Floors • 50+ Classrooms • 15 Laboratories • 2 Keynote Auditoriums
        </span>
      `;
    }

    const bldWashrooms = CAMPUS_WASHROOMS.filter(w => w.building === this.activeBuilding);
    const floorWashrooms = this.activeFloor === 0
      ? bldWashrooms
      : bldWashrooms.filter(w => w.floor === this.activeFloor);

    let highlights = '';
    if (this.activeBuilding === 'ATR') {
      if (this.activeFloor === 1) highlights = '<span class="fac-tag highlight">Student Activities Centre (SAC)</span><span class="fac-tag">Electronics & Physics Labs</span>';
      else if (this.activeFloor === 2) highlights = '<span class="fac-tag highlight">AI & Machine Learning Studio</span><span class="fac-tag">Data Science Lab</span>';
      else if (this.activeFloor === 3) highlights = '<span class="fac-tag highlight">NIST Business School</span><span class="fac-tag">VLSI & IoT Research</span>';
      else if (this.activeFloor === 4) highlights = '<span class="fac-tag highlight">Business School Library</span><span class="fac-tag">Cloud & Robotics Labs</span>';
      else if (this.activeFloor === 5) highlights = '<span class="fac-tag highlight">Stephen Hawking Cineplex (140 seats)</span><span class="fac-tag">Maker Space</span>';
      else highlights = '<span class="fac-tag">25 Classrooms • 11 Labs • Cineplex • Library • SAC</span>';
    } else if (this.activeBuilding === 'GAL') {
      if (this.activeFloor === 1) highlights = '<span class="fac-tag highlight">250-Seat Grand Auditorium</span><span class="fac-tag">Lecture Halls 01–03</span>';
      else if (this.activeFloor === 2) highlights = '<span class="fac-tag highlight">HPC Supercomputing Lab</span><span class="fac-tag">Lecture Halls 04–06</span>';
      else if (this.activeFloor === 3) highlights = '<span class="fac-tag highlight">IBM Centre of Excellence</span><span class="fac-tag">Lecture Halls 07–09</span>';
      else if (this.activeFloor === 4) highlights = '<span class="fac-tag highlight">NTCS Consultancy Suite</span><span class="fac-tag">Lecture Halls 10–12</span>';
      else highlights = '<span class="fac-tag">12 Lecture Halls • 250-Seat Aud • HPC Lab • IBM CoE • NTCS</span>';
    } else if (this.activeBuilding === 'LHC') {
      highlights = (this.activeFloor === 0)
        ? '<span class="fac-tag">5-Storey Tiered Academic Wing • Rooms 101–509 • External Staircase • Lift Tower</span>'
        : `<span class="fac-tag">Rooms ${this.activeFloor}01–${this.activeFloor}09</span>`;
    }

    return `
      <div class="fac-row">
        ${highlights}
        ${floorWashrooms.map(w => `
          <button class="washroom-chip-btn" data-washroom-id="${w.id}">
            ${Icons.washroom('', 13)}
            <span>${w.name}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  setBuilding(buildingKey) {
    this.activeBuilding = buildingKey;
    this.activeFloor = 0;
    this.render();
  }

  setFloor(floorNum) {
    this.activeFloor = floorNum;
    const floorButtons = this.container.querySelectorAll('.floor-pill-btn');
    floorButtons.forEach(btn => {
      if (parseInt(btn.dataset.floor, 10) === floorNum) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const bar = this.container.querySelector('#floorFacilitiesBar');
    if (bar) bar.innerHTML = this.getFacilitiesHTML();
    this.attachFacilityChipEvents();
  }
}
