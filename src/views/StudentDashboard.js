/**
 * StudentDashboard.js - Student Portal Interface
 * 
 * Features:
 * - Enterprise academic UI with zero emoji placeholders
 * - Crisp vector iconography via Icons helper
 * - Building selection cards (LHC, Atrium, Galleria, Master Campus)
 * - Auto-populated spatial room reporting modal
 * - General campus problem reporting with photo preview
 * - Status lifecycle timeline for personal tickets
 */

import { campusData } from '../data/DataManager.js';
import { authManager } from '../auth/AuthManager.js';
import { Icons } from '../ui/icons.js';

export class StudentDashboard {
  constructor(containerElement, onOpen3DBuilding, onReportIssueRequest) {
    this.container = containerElement;
    this.onOpen3DBuilding = onOpen3DBuilding;
    this.onReportIssueRequest = onReportIssueRequest;
    this.activeTab = 'overview'; // 'overview' | '3d' | 'complaints'
    this.pendingComplaintData = null;
  }

  render(activeSubView = 'overview') {
    this.activeTab = activeSubView;
    const user = authManager.getCurrentUser();
    if (!user) return;

    const myComplaints = campusData.getComplaints({ studentId: user.regNo });

    this.container.innerHTML = `
      <div class="student-dashboard">
        <!-- Dashboard Top Navigation / Header -->
        <div class="dash-top-bar">
          <div class="student-profile-chip">
            <div class="student-avatar">${user.fullName.charAt(0)}</div>
            <div class="student-info-text">
              <span class="student-name">${user.fullName}</span>
              <span class="student-meta">${user.regNo} • ${user.department || 'B.Tech Student'}</span>
            </div>
          </div>

          <!-- Navigation Pills -->
          <div class="dash-nav-pills">
            <button class="dash-pill-btn ${this.activeTab === 'overview' ? 'active' : ''}" id="navTabOverview">
              ${Icons.dashboard('', 15)}
              <span>Overview</span>
            </button>
            <button class="dash-pill-btn ${this.activeTab === '3d' ? 'active' : ''}" id="navTab3D">
              ${Icons.building('', 15)}
              <span>3D Campus Twin</span>
            </button>
            <button class="dash-pill-btn ${this.activeTab === 'complaints' ? 'active' : ''}" id="navTabComplaints">
              ${Icons.clipboard('', 15)}
              <span>My Reports (${myComplaints.length})</span>
            </button>
            <button class="dash-pill-btn highlight-btn" id="btnOpenGeneralReport">
              ${Icons.alert('', 15)}
              <span>Report General Issue</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Main Content -->
        <div class="dash-main-content" id="studentMainContentSlot">
          ${this.renderActiveTab(user, myComplaints)}
        </div>

        <!-- Complaint Modal (Building or General) -->
        <div class="complaint-modal-overlay" id="complaintModalOverlay" style="display:none;">
          <div class="complaint-modal-card" id="complaintModalSlot"></div>
        </div>

        <!-- Complaint Detail View Modal -->
        <div class="complaint-modal-overlay" id="complaintDetailModalOverlay" style="display:none;">
          <div class="complaint-modal-card" id="complaintDetailModalSlot"></div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderActiveTab(user, myComplaints) {
    if (this.activeTab === 'complaints') {
      return this.renderMyComplaintsSection(myComplaints);
    }
    if (this.activeTab === '3d') {
      return this.render3DExplorerSection();
    }
    return this.renderOverviewSection(user, myComplaints);
  }

  renderOverviewSection(user, myComplaints) {
    const resolvedCount = myComplaints.filter(c => c.status === 'Resolved').length;
    const reviewCount = myComplaints.filter(c => c.status === 'Under Review').length;
    const submittedCount = myComplaints.filter(c => c.status === 'Submitted').length;

    return `
      <!-- Welcome & Quick Stats Hero -->
      <section class="student-hero-card">
        <div class="hero-left">
          <div class="hero-badge">STUDENT WORKSPACE • CAMPUS FACILITIES</div>
          <h2 class="hero-greeting">Welcome back, ${user.fullName.split(' ')[0]}</h2>
          <p class="hero-sub">
            Identify and geolocate maintenance defects directly inside interactive 3D digital campus models,
            or log general campus grounds and sanitation issues with photographic evidence.
          </p>
          <div class="hero-actions">
            <button class="hero-btn primary" id="heroOpen3DBtn">
              ${Icons.building('', 16)}
              <span>Explore Buildings in 3D</span>
            </button>
            <button class="hero-btn secondary" id="heroGeneralReportBtn">
              ${Icons.alert('', 16)}
              <span>Report General Issue</span>
            </button>
          </div>
        </div>

        <!-- Student Metrics -->
        <div class="hero-metrics-grid">
          <div class="stat-counter-card">
            <span class="counter-num">${myComplaints.length}</span>
            <span class="counter-label">Total Reports</span>
          </div>
          <div class="stat-counter-card text-yellow">
            <span class="counter-num">${submittedCount}</span>
            <span class="counter-label">Pending Triage</span>
          </div>
          <div class="stat-counter-card text-blue">
            <span class="counter-num">${reviewCount}</span>
            <span class="counter-label">Under Investigation</span>
          </div>
          <div class="stat-counter-card text-green">
            <span class="counter-num">${resolvedCount}</span>
            <span class="counter-label">Resolved</span>
          </div>
        </div>
      </section>

      <!-- Campus Building Selection Grid -->
      <section class="section-container">
        <div class="section-header-row">
          <div>
            <h3 class="section-title">Select Academic Complex to Inspect</h3>
            <p class="section-sub">Choose any complex to open its 3D digital twin, isolate floors, and select classrooms or assets to report issues.</p>
          </div>
        </div>

        <div class="buildings-selection-grid">
          <!-- LHC Card -->
          <div class="building-select-card" data-building="LHC">
            <div class="bld-thumb-box">
              <img src="./public/reference/lhc-reference.jpg" alt="Lecture Hall Complex" />
              <span class="bld-floors-tag">5 FLOORS</span>
            </div>
            <div class="bld-card-body">
              <div class="bld-code-badge lhc-badge">LHC</div>
              <h4 class="bld-name">Lecture Hall Complex</h4>
              <p class="bld-desc">Five-storey academic facility with cantilevered corridors, exterior sawtooth staircase, and central elevator shaft.</p>
              <div class="bld-meta-tags">
                <span>50+ Classrooms</span>
                <span>Rooms 101–509</span>
                <span>Sanitary Units</span>
              </div>
              <button class="bld-open-btn">
                <span>Open 3D Model</span>
                ${Icons.arrowRight('', 14)}
              </button>
            </div>
          </div>

          <!-- Atrium Card -->
          <div class="building-select-card" data-building="ATR">
            <div class="bld-thumb-box">
              <img src="./public/reference/atrium-reference-1.png" alt="Atrium Building" />
              <span class="bld-floors-tag">5 FLOORS</span>
            </div>
            <div class="bld-card-body">
              <div class="bld-code-badge atr-badge">ATR</div>
              <h4 class="bld-name">Atrium Building</h4>
              <p class="bld-desc">Curved architectural facade with blue glass curtain wall, Stephen Hawking Cineplex, 11 computing labs, and Business School.</p>
              <div class="bld-meta-tags">
                <span>140-Seat Cineplex</span>
                <span>11 Computing Labs</span>
                <span>Library</span>
              </div>
              <button class="bld-open-btn">
                <span>Open 3D Model</span>
                ${Icons.arrowRight('', 14)}
              </button>
            </div>
          </div>

          <!-- Galleria Card -->
          <div class="building-select-card" data-building="GAL">
            <div class="bld-thumb-box">
              <img src="./public/reference/galleria-reference.jpg" alt="Galleria Building" />
              <span class="bld-floors-tag">4 FLOORS</span>
            </div>
            <div class="bld-card-body">
              <div class="bld-code-badge gal-badge">GAL</div>
              <h4 class="bld-name">Galleria Complex</h4>
              <p class="bld-desc">Curvilinear terracotta-red structure with spiral observation towers, 250-Seat Grand Auditorium, and High Performance Computing Lab.</p>
              <div class="bld-meta-tags">
                <span>250-Seat Auditorium</span>
                <span>HPC Supercluster</span>
                <span>IBM CoE</span>
              </div>
              <button class="bld-open-btn">
                <span>Open 3D Model</span>
                ${Icons.arrowRight('', 14)}
              </button>
            </div>
          </div>

          <!-- Campus Overview Card -->
          <div class="building-select-card" data-building="CAMPUS">
            <div class="bld-thumb-box campus-thumb">
              <div class="thumb-campus-icon">${Icons.building('', 36)}</div>
              <span class="bld-floors-tag">CAMPUS MASTER</span>
            </div>
            <div class="bld-card-body">
              <div class="bld-code-badge quad-badge">QUAD</div>
              <h4 class="bld-name">Campus Master Enclave</h4>
              <p class="bld-desc">Isometric perspective displaying LHC, Atrium, and Galleria together with landscape walkways and substation connections.</p>
              <div class="bld-meta-tags">
                <span>3 Major Blocks</span>
                <span>Central Courtyard</span>
                <span>Promenade</span>
              </div>
              <button class="bld-open-btn">
                <span>Open 3D Model</span>
                ${Icons.arrowRight('', 14)}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Complaints Preview -->
      <section class="section-container">
        <div class="section-header-row">
          <div>
            <h3 class="section-title">My Recent Activity</h3>
            <p class="section-sub">Real-time status updates on maintenance issues you have filed.</p>
          </div>
          <button class="link-action-btn" id="linkViewAllComplaints">
            <span>View All Reports (${myComplaints.length})</span>
            ${Icons.arrowRight('', 13)}
          </button>
        </div>

        <div class="recent-complaints-list">
          ${myComplaints.length === 0 ? `
            <div class="empty-state-box">
              <div class="empty-icon-circle">${Icons.check('', 24)}</div>
              <h4>No pending maintenance reports</h4>
              <p>Everything in your record is clear. If you spot a broken fixture, electrical fault, or sanitary leak, select any building above to pinpoint it.</p>
            </div>
          ` : myComplaints.slice(0, 3).map(c => this.renderComplaintCard(c)).join('')}
        </div>
      </section>
    `;
  }

  render3DExplorerSection() {
    return `
      <div class="embedded-3d-wrapper">
        <div class="embedded-3d-header">
          <div class="emb-title-group">
            <span class="emb-badge">SPATIAL DIGITAL TWIN</span>
            <h3 class="emb-title">Navigate Buildings & Click Rooms to Report</h3>
          </div>
          <div class="emb-instructions">
            <span>Orbit: Left Drag</span>
            <span>•</span>
            <span>Pan: Right Drag</span>
            <span>•</span>
            <span>Select: Click Room</span>
          </div>
        </div>
        <div class="embedded-canvas-placeholder" id="embedded3DSlot"></div>
      </div>
    `;
  }

  renderMyComplaintsSection(complaints) {
    return `
      <section class="section-container">
        <div class="section-header-row">
          <div>
            <span class="section-badge">TICKET ARCHIVE</span>
            <h3 class="section-title">Maintenance Tickets Log (${complaints.length})</h3>
            <p class="section-sub">Review administrative review notes, technician dispatch logs, and status transitions for your submissions.</p>
          </div>
          <button class="auth-submit-btn student-submit" id="btnOpenGeneralReportInner">
            ${Icons.plus('', 15)}
            <span>Log Campus Incident</span>
          </button>
        </div>

        ${complaints.length === 0 ? `
          <div class="empty-state-box">
            <div class="empty-icon-circle">${Icons.clipboard('', 24)}</div>
            <h4>No tickets on record</h4>
            <p>You have not submitted any complaints yet. Report a classroom problem via 3D models or file a general campus issue.</p>
          </div>
        ` : `
          <div class="complaints-cards-grid">
            ${complaints.map(c => this.renderComplaintCard(c)).join('')}
          </div>
        `}
      </section>
    `;
  }

  renderComplaintCard(c) {
    const statusClass = c.status === 'Resolved' ? 'status-resolved' : (c.status === 'Under Review' ? 'status-review' : 'status-submitted');
    const isBuilding = c.type === 'building';

    return `
      <div class="complaint-item-card" data-id="${c.id}">
        <div class="cmp-card-top">
          <div class="cmp-ref-group">
            <span class="cmp-id">${c.id}</span>
            <span class="cmp-type-tag ${isBuilding ? 'type-bld' : 'type-gen'}">
              ${isBuilding ? Icons.building('', 12) : Icons.alert('', 12)}
              <span>${isBuilding ? 'Building Asset' : 'Campus Area'}</span>
            </span>
          </div>
          <span class="cmp-status-pill ${statusClass}">
            <span class="status-indicator-dot"></span>
            <span>${c.status}</span>
          </span>
        </div>

        <div class="cmp-title-row">
          <span class="cmp-category">${c.category}</span>
          <span class="cmp-location">${c.locationDetail || 'General Campus'}</span>
        </div>

        <p class="cmp-desc">${c.description}</p>

        <div class="cmp-card-footer">
          <span class="cmp-date">${c.submittedAt}</span>
          <button class="cmp-view-btn">
            <span>Details</span>
            ${Icons.arrowRight('', 12)}
          </button>
        </div>
      </div>
    `;
  }

  // --- COMPLAINT REPORT MODAL ---
  openBuildingComplaintModal(roomData) {
    const user = authManager.getCurrentUser();
    const overlay = document.getElementById('complaintModalOverlay');
    const slot = document.getElementById('complaintModalSlot');
    if (!overlay || !slot) return;

    const bldCode = roomData.building || (roomData.buildingCode || "LHC");
    const bldName = roomData.buildingName || (bldCode === 'ATR' ? 'Atrium Building' : (bldCode === 'GAL' ? 'Galleria Building' : 'Lecture Hall Complex'));
    const floorLabel = roomData.floorLabel || `Floor ${roomData.floor}`;
    const roomNumber = roomData.number || roomData.id || "Room";

    slot.innerHTML = `
      <div class="modal-header">
        <div>
          <span class="modal-badge-pill">SPATIAL WORK ORDER</span>
          <h3 class="modal-title">Report Facility Issue • ${roomNumber}</h3>
        </div>
        <button class="close-modal-btn" id="closeComplaintModalBtn" aria-label="Close modal">
          ${Icons.close('', 16)}
        </button>
      </div>

      <form id="buildingComplaintForm" class="complaint-form">
        <!-- Auto-filled Readonly Meta Grid -->
        <div class="auto-fill-grid">
          <div class="auto-field">
            <label>Student Name</label>
            <input type="text" value="${user.fullName}" readonly class="input-readonly" />
          </div>
          <div class="auto-field">
            <label>Registration Number</label>
            <input type="text" value="${user.regNo}" readonly class="input-readonly" />
          </div>
          <div class="auto-field">
            <label>Building Name</label>
            <input type="text" value="${bldName}" readonly class="input-readonly" />
          </div>
          <div class="auto-field">
            <label>Floor Level</label>
            <input type="text" value="${floorLabel}" readonly class="input-readonly" />
          </div>
          <div class="auto-field">
            <label>Room / Space ID</label>
            <input type="text" value="${roomNumber}" readonly class="input-readonly" />
          </div>
        </div>

        <!-- Complaint Details -->
        <div class="form-group">
          <label for="cmpCategory">Problem Classification *</label>
          <select id="cmpCategory" required>
            <option value="">Select issue category...</option>
            <option value="Electrical">Electrical (Fan, Luminaire, Switchgear, Wire)</option>
            <option value="Plumbing">Plumbing (Tap, Valve, Drainage, Restroom)</option>
            <option value="Furniture">Furniture (Desk, Ergonomic Chair, Podium, Door)</option>
            <option value="Classroom Equipment">Classroom Equipment (Laser Projector, Smart Display)</option>
            <option value="Internet / Network">Networking / LAN Port / Wi-Fi Access Point</option>
            <option value="Cleaning">Sanitation & Janitorial Services</option>
            <option value="Other">Structural / Architectural Defect</option>
          </select>
        </div>

        <div class="form-group">
          <label for="cmpDescription">Problem Description *</label>
          <textarea id="cmpDescription" rows="4" placeholder="Detail the fault with specific identifiers (e.g., Luminaire fixture L-03 flickers continuously in Room 204)..." required></textarea>
        </div>

        <!-- Photograph Upload with Preview -->
        <div class="form-group">
          <label for="cmpPhotoInput">Photographic Evidence (Optional)</label>
          <div class="file-upload-box" id="photoUploadDropzone">
            <input type="file" id="cmpPhotoInput" accept="image/*" class="file-input-hidden" />
            <div class="upload-prompt" id="uploadPrompt">
              <span class="upload-icon">${Icons.photo('', 22)}</span>
              <span>Select photo or drag image file here</span>
              <span class="upload-sub">Supports PNG, JPG, WebP formats</span>
            </div>
            <div class="photo-preview-box" id="photoPreviewBox" style="display:none;">
              <img id="photoPreviewImg" src="" alt="Issue Preview" />
              <button type="button" class="remove-photo-btn" id="removePhotoBtn">
                ${Icons.close('', 12)}
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" id="cancelComplaintBtn">Cancel</button>
          <button type="submit" class="auth-submit-btn student-submit">
            <span>Submit Maintenance Ticket</span>
            <span class="btn-arrow">${Icons.arrowRight('', 14)}</span>
          </button>
        </div>
      </form>
    `;

    overlay.style.display = 'flex';
    this.attachComplaintFormEvents({
      type: "building",
      buildingCode: bldCode,
      buildingName: bldName,
      floorNumber: roomData.floor,
      floorLabel: floorLabel,
      roomNumber: roomNumber,
      roomId: roomData.id
    });
  }

  // --- GENERAL COMPLAINT REPORT MODAL ---
  openGeneralComplaintModal() {
    const user = authManager.getCurrentUser();
    const overlay = document.getElementById('complaintModalOverlay');
    const slot = document.getElementById('complaintModalSlot');
    if (!overlay || !slot) return;

    slot.innerHTML = `
      <div class="modal-header">
        <div>
          <span class="modal-badge-pill gen-badge">CAMPUS INFRASTRUCTURE</span>
          <h3 class="modal-title">Log Campus Grounds / Exterior Incident</h3>
        </div>
        <button class="close-modal-btn" id="closeComplaintModalBtn" aria-label="Close modal">
          ${Icons.close('', 16)}
        </button>
      </div>

      <form id="generalComplaintForm" class="complaint-form">
        <div class="auto-fill-grid">
          <div class="auto-field">
            <label>Student Name</label>
            <input type="text" value="${user.fullName}" readonly class="input-readonly" />
          </div>
          <div class="auto-field">
            <label>Registration Number</label>
            <input type="text" value="${user.regNo}" readonly class="input-readonly" />
          </div>
        </div>

        <div class="form-group">
          <label for="cmpCategory">Incident Category *</label>
          <select id="cmpCategory" required>
            <option value="">Select general category...</option>
            <option value="Roads & Pathways">Promenade Pavement / Walkway Damage</option>
            <option value="Streetlights">Campus Lighting / Perimeter Luminaire</option>
            <option value="Plumbing & Drainage">Groundwater Drainage / Irrigation Pipeline</option>
            <option value="Waste Disposal">Waste Management / Refuse Clearance</option>
            <option value="Campus Cleanliness">Landscape Maintenance & Grounds Sanitation</option>
            <option value="Other">General Infrastructure Issue</option>
          </select>
        </div>

        <div class="form-group">
          <label for="cmpLocation">Campus Area / Landmark</label>
          <input type="text" id="cmpLocation" placeholder="e.g. Near Central Quad promenade / Main Academic Gate" />
        </div>

        <div class="form-group">
          <label for="cmpDescription">Problem Description *</label>
          <textarea id="cmpDescription" rows="4" placeholder="Describe the physical condition, hazard level, and exact location..." required></textarea>
        </div>

        <!-- Photograph Upload with Preview -->
        <div class="form-group">
          <label for="cmpPhotoInput">Photographic Evidence (Optional)</label>
          <div class="file-upload-box" id="photoUploadDropzone">
            <input type="file" id="cmpPhotoInput" accept="image/*" class="file-input-hidden" />
            <div class="upload-prompt" id="uploadPrompt">
              <span class="upload-icon">${Icons.photo('', 22)}</span>
              <span>Select photo or drag image file here</span>
              <span class="upload-sub">Supports PNG, JPG, WebP formats</span>
            </div>
            <div class="photo-preview-box" id="photoPreviewBox" style="display:none;">
              <img id="photoPreviewImg" src="" alt="Issue Preview" />
              <button type="button" class="remove-photo-btn" id="removePhotoBtn">
                ${Icons.close('', 12)}
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" id="cancelComplaintBtn">Cancel</button>
          <button type="submit" class="auth-submit-btn student-submit">
            <span>Submit Maintenance Ticket</span>
            <span class="btn-arrow">${Icons.arrowRight('', 14)}</span>
          </button>
        </div>
      </form>
    `;

    overlay.style.display = 'flex';
    this.attachComplaintFormEvents({
      type: "general"
    });
  }

  attachComplaintFormEvents(prefill) {
    const overlay = document.getElementById('complaintModalOverlay');
    const closeBtn = document.getElementById('closeComplaintModalBtn');
    const cancelBtn = document.getElementById('cancelComplaintBtn');

    const closeModal = () => {
      overlay.style.display = 'none';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Photo input handling
    let base64Photo = null;
    const photoInput = document.getElementById('cmpPhotoInput');
    const dropzone = document.getElementById('photoUploadDropzone');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const previewBox = document.getElementById('photoPreviewBox');
    const previewImg = document.getElementById('photoPreviewImg');
    const removeBtn = document.getElementById('removePhotoBtn');

    if (dropzone && photoInput) {
      dropzone.addEventListener('click', (e) => {
        if (e.target !== removeBtn && !removeBtn?.contains(e.target)) photoInput.click();
      });

      photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            base64Photo = re.target.result;
            previewImg.src = base64Photo;
            uploadPrompt.style.display = 'none';
            previewBox.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        base64Photo = null;
        photoInput.value = '';
        previewImg.src = '';
        uploadPrompt.style.display = 'flex';
        previewBox.style.display = 'none';
      });
    }

    // Form submission
    const form = document.querySelector('.complaint-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = authManager.getCurrentUser();
        const category = document.getElementById('cmpCategory').value;
        const description = document.getElementById('cmpDescription').value;
        const locationInput = document.getElementById('cmpLocation');

        const complaintPayload = {
          ...prefill,
          studentId: user.regNo,
          studentName: user.fullName,
          studentDept: user.department,
          category,
          description,
          locationDetail: locationInput ? locationInput.value : (prefill.roomNumber ? `Room ${prefill.roomNumber}, ${prefill.buildingName}` : "Campus"),
          photoUrl: base64Photo
        };

        const newComplaint = campusData.addComplaint(complaintPayload);

        closeModal();

        // Re-render to reflect new complaint
        this.render('complaints');
      });
    }
  }

  openComplaintDetail(complaintId) {
    const c = campusData.getComplaintById(complaintId);
    if (!c) return;

    const overlay = document.getElementById('complaintDetailModalOverlay');
    const slot = document.getElementById('complaintDetailModalSlot');
    if (!overlay || !slot) return;

    const isBuilding = c.type === 'building';
    const statusClass = c.status === 'Resolved' ? 'status-resolved' : (c.status === 'Under Review' ? 'status-review' : 'status-submitted');

    slot.innerHTML = `
      <div class="modal-header">
        <div>
          <div class="cmp-ref-group">
            <span class="modal-badge-pill">${c.id}</span>
            <span class="cmp-status-pill ${statusClass}">
              <span class="status-indicator-dot"></span>
              <span>${c.status}</span>
            </span>
          </div>
          <h3 class="modal-title">${c.category}</h3>
        </div>
        <button class="close-modal-btn" id="closeCmpDetailBtn" aria-label="Close modal">
          ${Icons.close('', 16)}
        </button>
      </div>

      <div class="detail-body">
        <div class="detail-meta-grid">
          <div><label>Filing Student</label><strong>${c.studentName} (${c.studentId})</strong></div>
          <div><label>Logged At</label><strong>${c.submittedAt}</strong></div>
          <div><label>Classification</label><strong>${isBuilding ? 'Building Specific' : 'Campus Infrastructure'}</strong></div>
          <div><label>Location Detail</label><strong>${c.locationDetail || 'Campus Area'}</strong></div>
        </div>

        <div class="detail-desc-box">
          <label>Problem Description</label>
          <p>${c.description}</p>
        </div>

        ${c.photoUrl ? `
          <div class="detail-photo-box">
            <label>Field Attachment Photograph</label>
            <img src="${c.photoUrl}" alt="Issue Photo" />
          </div>
        ` : ''}

        <!-- Status History Timeline -->
        <div class="timeline-box">
          <label>Resolution Lifecycle</label>
          <div class="timeline-list">
            ${(c.statusHistory || []).map(h => `
              <div class="timeline-step">
                <span class="t-dot ${h.status === 'Resolved' ? 'resolved' : ''}"></span>
                <div class="t-content">
                  <div class="t-top"><strong>${h.status}</strong> <span>${h.at}</span></div>
                  <div class="t-by">Updated by ${h.by}</div>
                  ${h.notes ? `<div class="t-notes">"${h.notes}"</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    overlay.style.display = 'flex';
    const closeBtn = document.getElementById('closeCmpDetailBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => { overlay.style.display = 'none'; });
  }

  attachEvents() {
    // Navigation pills
    const navOverview = this.container.querySelector('#navTabOverview');
    const nav3D = this.container.querySelector('#navTab3D');
    const navComplaints = this.container.querySelector('#navTabComplaints');
    const btnGeneral = this.container.querySelector('#btnOpenGeneralReport');
    const btnGeneralInner = this.container.querySelector('#btnOpenGeneralReportInner');
    const heroGeneral = this.container.querySelector('#heroGeneralReportBtn');
    const hero3D = this.container.querySelector('#heroOpen3DBtn');
    const linkViewAll = this.container.querySelector('#linkViewAllComplaints');

    if (navOverview) navOverview.addEventListener('click', () => this.render('overview'));
    if (nav3D) nav3D.addEventListener('click', () => {
      if (this.onOpen3DBuilding) this.onOpen3DBuilding('CAMPUS');
    });
    if (navComplaints) navComplaints.addEventListener('click', () => this.render('complaints'));
    if (linkViewAll) linkViewAll.addEventListener('click', () => this.render('complaints'));

    if (hero3D) hero3D.addEventListener('click', () => {
      if (this.onOpen3DBuilding) this.onOpen3DBuilding('CAMPUS');
    });

    if (btnGeneral) btnGeneral.addEventListener('click', () => this.openGeneralComplaintModal());
    if (btnGeneralInner) btnGeneralInner.addEventListener('click', () => this.openGeneralComplaintModal());
    if (heroGeneral) heroGeneral.addEventListener('click', () => this.openGeneralComplaintModal());

    // Building Cards click
    this.container.querySelectorAll('.building-select-card').forEach(card => {
      card.addEventListener('click', () => {
        const bld = card.dataset.building;
        if (this.onOpen3DBuilding) this.onOpen3DBuilding(bld);
      });
    });

    // Complaint Item Cards click -> open details
    this.container.querySelectorAll('.complaint-item-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        this.openComplaintDetail(id);
      });
    });
  }
}
