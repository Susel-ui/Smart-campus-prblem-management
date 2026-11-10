/**
 * InformationPanel.js - Side Inspection Drawer for Campus Buildings, Facilities & Maintenance
 * 
 * Displays rich architectural telemetry and maintenance tracking for:
 * - Lecture Classrooms & Large Lecture Halls (LHC, ATR, GAL)
 * - Grand Facilities (Cineplex, Auditorium, HPC Lab, IBM CoE)
 * - Engineering Laboratories and Faculty Cabins
 * - Restrooms and sanitary assets
 * - Electrical and mechanical equipment
 */

import { SAMPLE_ISSUES } from '../data/sampleIssues.js';
import { Icons } from './icons.js';

export class InformationPanelUI {
  constructor(panelElement, onFocusCallback, onCloseCallback, onReportIssueCallback) {
    this.panel = panelElement;
    this.onFocus = onFocusCallback;
    this.onClose = onCloseCallback;
    this.onReportIssue = onReportIssueCallback;
    this.currentData = null;
    this.currentMesh = null;
  }

  show(userData, mesh) {
    this.currentData = userData;
    this.currentMesh = mesh;
    this.panel.classList.add('open');
    this.render();
  }

  hide() {
    this.currentData = null;
    this.currentMesh = null;
    this.panel.classList.remove('open');
    if (this.onClose) {
      this.onClose();
    }
  }

  render() {
    if (!this.currentData) return;
    const data = this.currentData;

    if (data.isRoom && !data.isWashroom) {
      this.renderRoomOrFacility(data);
    } else if (data.isWashroom) {
      this.renderWashroom(data);
    } else if (data.isEquipment) {
      this.renderEquipment(data);
    } else if (data.isStructure && data.structureType === 'lift') {
      this.renderLift(data);
    } else {
      this.renderGeneric(data);
    }
  }

  renderRoomOrFacility(data) {
    const issues = SAMPLE_ISSUES.filter(
      iss => iss.roomId === data.number || iss.roomId === data.id || iss.roomId === data.name
    );
    const hasHighIssue = issues.some(i => i.priority === 'high');
    const statusClass = issues.length > 0 ? (hasHighIssue ? 'status-high' : 'status-medium') : 'status-good';
    const statusText = issues.length > 0 ? `${issues.length} Active Issue(s)` : 'Optimal • Operational';

    const bldName = data.buildingName || (data.building === 'ATR' ? 'Atrium Building' : (data.building === 'GAL' ? 'Galleria Complex' : 'Lecture Hall Complex'));
    const badgeColor = data.isSpecial ? 'special-badge' : '';

    this.panel.innerHTML = `
      <div class="info-card">
        <div class="info-header">
          <div class="room-pill-badge ${badgeColor}">
            <span class="badge-num">${data.number || data.id}</span>
          </div>
          <button class="close-drawer-btn" title="Close Panel" aria-label="Close drawer">
            ${Icons.close('', 16)}
          </button>
        </div>

        <div class="info-title-group">
          <h2 class="entity-title">${data.name}</h2>
          <div class="meta-tags-row">
            <span class="tag-pill tag-bld">${bldName}</span>
            <span class="tag-pill">${data.floorLabel || `Floor ${data.floor}`}</span>
            <span class="tag-pill ${statusClass}">
              <span class="status-indicator-dot"></span>
              <span>${statusText}</span>
            </span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-lbl">CAPACITY</span>
            <span class="stat-val">${data.capacity || 60} Persons</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">FACILITY TYPE</span>
            <span class="stat-val">${data.category || 'Academic Room'}</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">VENTILATION</span>
            <span class="stat-val">${data.acUnits ? `${data.acUnits} AC + ` : ''}${data.fansCount || 6} Fans</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">LUMINAIRES</span>
            <span class="stat-val">${data.lightsCount || 8} LED Units</span>
          </div>
        </div>

        <div class="info-section">
          <h3 class="section-heading">Facility Features & Infrastructure</h3>
          <div class="features-list">
            ${(data.features && data.features.length > 0)
              ? data.features.map(f => `<span class="feature-chip">${Icons.check('', 12)} ${f}</span>`).join('')
              : `
                <span class="feature-chip">${Icons.check('', 12)} Tiered Acoustic Seating</span>
                <span class="feature-chip">${Icons.check('', 12)} 6 Rotating Ceiling Fans</span>
                <span class="feature-chip">${Icons.check('', 12)} Interactive Display / Board</span>
                <span class="feature-chip">${Icons.check('', 12)} Motorized Projector Screen</span>
                <span class="feature-chip">${Icons.check('', 12)} Smart Lecturer Podium</span>
              `
            }
          </div>
        </div>

        <div class="info-section">
          <div class="section-heading-row">
            <h3 class="section-heading">Maintenance & Telemetry Status</h3>
            <span class="issue-count-badge ${issues.length > 0 ? 'alert' : ''}">${issues.length} Issues</span>
          </div>
          ${this.renderIssuesList(issues)}
        </div>

        <div class="info-footer">
          <button class="focus-3d-btn" id="focusRoomBtn">
            ${Icons.target('', 14)}
            <span>Focus in 3D</span>
          </button>
          <button class="report-issue-btn" id="reportIssueBtn">
            ${Icons.plus('', 14)}
            <span>Report Issue</span>
          </button>
        </div>
      </div>
    `;

    this.attachButtonEvents();
  }

  renderWashroom(data) {
    const washIssues = SAMPLE_ISSUES.filter(iss => iss.roomId === data.roomId || iss.roomId === data.id);

    this.panel.innerHTML = `
      <div class="info-card">
        <div class="info-header">
          <div class="room-pill-badge washroom-badge">
            <span class="badge-num">${Icons.washroom('', 14)} ${data.roomId || data.id}</span>
          </div>
          <button class="close-drawer-btn" title="Close Panel" aria-label="Close drawer">
            ${Icons.close('', 16)}
          </button>
        </div>

        <div class="info-title-group">
          <h2 class="entity-title">${data.name}</h2>
          <div class="meta-tags-row">
            <span class="tag-pill tag-bld">${data.buildingName || data.building}</span>
            <span class="tag-pill">${data.floorLabel || `Floor ${data.floor}`}</span>
            <span class="tag-pill">Sanitary Asset</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-lbl">FACILITY</span>
            <span class="stat-val">Restroom</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">FLOOR LEVEL</span>
            <span class="stat-val">${data.floorLabel || `Floor ${data.floor}`}</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">ZONE</span>
            <span class="stat-val">${data.wing || 'Concourse'}</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">FIXTURES</span>
            <span class="stat-val">${(data.fixtures && data.fixtures.length) || 6} Units</span>
          </div>
        </div>

        <div class="info-section">
          <h3 class="section-heading">Maintainable Sanitary Fixtures</h3>
          <div class="features-list">
            <span class="feature-chip">${Icons.check('', 12)} Ceramic Washbasins with Chrome Taps</span>
            <span class="feature-chip">${Icons.check('', 12)} Water Closets & Concealed Flush</span>
            <span class="feature-chip">${Icons.check('', 12)} Polished Sanitary Wall Mirror</span>
            <span class="feature-chip">${Icons.check('', 12)} Forced Exhaust Ventilation Fan</span>
            <span class="feature-chip">${Icons.check('', 12)} Ceiling Moisture-Proof LED Light</span>
          </div>
        </div>

        <div class="info-section">
          <div class="section-heading-row">
            <h3 class="section-heading">Plumbing & Maintenance Status</h3>
            <span class="issue-count-badge ${washIssues.length > 0 ? 'alert' : ''}">${washIssues.length} Issues</span>
          </div>
          ${this.renderIssuesList(washIssues)}
        </div>

        <div class="info-footer">
          <button class="focus-3d-btn" id="focusRoomBtn">
            ${Icons.target('', 14)}
            <span>Focus in 3D</span>
          </button>
          <button class="report-issue-btn" id="reportIssueBtn">
            ${Icons.plus('', 14)}
            <span>Report Issue</span>
          </button>
        </div>
      </div>
    `;

    this.attachButtonEvents();
  }

  renderEquipment(data) {
    const equipIssues = SAMPLE_ISSUES.filter(iss => iss.equipmentId === data.id);

    this.panel.innerHTML = `
      <div class="info-card">
        <div class="info-header">
          <div class="room-pill-badge equip-badge">
            <span class="badge-num">${data.id}</span>
          </div>
          <button class="close-drawer-btn" title="Close Panel" aria-label="Close drawer">
            ${Icons.close('', 16)}
          </button>
        </div>

        <div class="info-title-group">
          <h2 class="entity-title">${data.name || data.id}</h2>
          <div class="meta-tags-row">
            <span class="tag-pill">${data.parentLabel || `Room ${data.roomId}`}</span>
            <span class="tag-pill">${data.category || 'Maintainable Fixture'}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-lbl">ASSET ID</span>
            <span class="stat-val">${data.id}</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">PARENT SPACE</span>
            <span class="stat-val">${data.roomId || 'Classroom'}</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">OPERATIONAL STATUS</span>
            <span class="stat-val">${data.status || 'Active'}</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">SCHEDULED SERVICE</span>
            <span class="stat-val">Q4 2026</span>
          </div>
        </div>

        <div class="info-section">
          <div class="section-heading-row">
            <h3 class="section-heading">Service History & Telemetry</h3>
            <span class="issue-count-badge ${equipIssues.length > 0 ? 'alert' : ''}">${equipIssues.length} Issues</span>
          </div>
          ${this.renderIssuesList(equipIssues)}
        </div>

        <div class="info-footer">
          <button class="focus-3d-btn" id="focusRoomBtn">
            ${Icons.target('', 14)}
            <span>Focus in 3D</span>
          </button>
          <button class="report-issue-btn" id="reportIssueBtn">
            ${Icons.plus('', 14)}
            <span>Report Issue</span>
          </button>
        </div>
      </div>
    `;

    this.attachButtonEvents();
  }

  renderLift(data) {
    this.panel.innerHTML = `
      <div class="info-card">
        <div class="info-header">
          <div class="room-pill-badge lift-badge">
            <span class="badge-num">${Icons.layers('', 14)} ${data.id}</span>
          </div>
          <button class="close-drawer-btn" title="Close Panel" aria-label="Close drawer">
            ${Icons.close('', 16)}
          </button>
        </div>

        <div class="info-title-group">
          <h2 class="entity-title">${data.name}</h2>
          <div class="meta-tags-row">
            <span class="tag-pill tag-bld">Lecture Hall Complex</span>
            <span class="tag-pill">Exterior Elevator Tower</span>
            <span class="tag-pill status-good">
              <span class="status-indicator-dot"></span>
              <span>Operational</span>
            </span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-lbl">FLOORS SERVED</span>
            <span class="stat-val">1 to 5</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">LIVE POSITION</span>
            <span class="stat-val" id="liveLiftFloor">Floor 1</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">SPEED</span>
            <span class="stat-val">2.5 m/s</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">RATED CAPACITY</span>
            <span class="stat-val">13 Persons (1000 kg)</span>
          </div>
        </div>

        <div class="info-section">
          <h3 class="section-heading">Elevator Telemetry</h3>
          <div class="features-list">
            <span class="feature-chip">${Icons.check('', 12)} Full Structural Clearance from Staircase</span>
            <span class="feature-chip">${Icons.check('', 12)} Automatic Glazed Telescopic Doors</span>
            <span class="feature-chip">${Icons.check('', 12)} Overload & Emergency Braking Sensors</span>
            <span class="feature-chip">${Icons.check('', 12)} Braille Floor Indicator & Voice Synthesizer</span>
          </div>
        </div>

        <div class="info-footer">
          <button class="focus-3d-btn" id="focusRoomBtn">
            ${Icons.target('', 14)}
            <span>Focus in 3D</span>
          </button>
          <button class="report-issue-btn" id="reportIssueBtn">
            ${Icons.plus('', 14)}
            <span>Report Issue</span>
          </button>
        </div>
      </div>
    `;

    this.attachButtonEvents();
  }

  renderGeneric(data) {
    this.panel.innerHTML = `
      <div class="info-card">
        <div class="info-header">
          <span class="room-pill-badge">${data.id || 'STRUCTURE'}</span>
          <button class="close-drawer-btn" title="Close Panel" aria-label="Close drawer">
            ${Icons.close('', 16)}
          </button>
        </div>
        <div class="info-title-group">
          <h2 class="entity-title">${data.name || 'Campus Architectural Element'}</h2>
        </div>
        <div class="info-footer">
          <button class="focus-3d-btn" id="focusRoomBtn">
            ${Icons.target('', 14)}
            <span>Focus in 3D</span>
          </button>
        </div>
      </div>
    `;
    this.attachButtonEvents();
  }

  renderIssuesList(issues) {
    if (!issues || issues.length === 0) {
      return `
        <div class="no-issues-box">
          <span class="check-icon">${Icons.check('', 14)}</span>
          <span>No open maintenance tickets. All fixtures verified operational.</span>
        </div>
      `;
    }

    return `
      <div class="issues-list">
        ${issues.map(iss => `
          <div class="issue-item-card priority-${iss.priority}">
            <div class="issue-top-row">
              <span class="issue-code">${iss.issueId}</span>
              <span class="priority-pill ${iss.priority}">${iss.priority.toUpperCase()}</span>
            </div>
            <div class="issue-title-text">${iss.title || iss.description}</div>
            <div class="issue-desc">${iss.description}</div>
            <div class="issue-meta-row">
              <span>${iss.reportedAt}</span>
              <span>${iss.reporter}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  attachButtonEvents() {
    const closeBtn = this.panel.querySelector('.close-drawer-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    const focusBtn = this.panel.querySelector('#focusRoomBtn');
    if (focusBtn && this.currentMesh && this.onFocus) {
      focusBtn.addEventListener('click', () => {
        const worldPos = new THREE.Vector3();
        this.currentMesh.getWorldPosition(worldPos);
        this.onFocus(worldPos);
      });
    }

    const reportBtn = this.panel.querySelector('#reportIssueBtn');
    if (reportBtn) {
      reportBtn.addEventListener('click', () => {
        if (this.onReportIssue && this.currentData) {
          this.onReportIssue(this.currentData);
        } else {
          const item = this.currentData ? (this.currentData.number || this.currentData.id) : 'Facility';
          alert(`Issue Report Form initiated for [${item}].\nTicket will be automatically routed to NIST Campus Facilities Management.`);
        }
      });
    }
  }
}
