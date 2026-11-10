/**
 * AuthorityDashboard.js - Authority Portal Interface
 * 
 * Features:
 * - Enterprise facilities administration interface
 * - Crisp vector iconography (zero emoji placeholders)
 * - Sub-navigation tabs:
 *   1. Maintenance Tickets Management (with status workflow: Submitted -> Under Review -> Resolved)
 *   2. Student Accounts Management (provision, edit, toggle active/inactive)
 *   3. Electricity Consumption Monitoring (24h load curve, building breakdown, annual billing)
 *   4. 3D Campus Digital Twin
 * - "Locate in 3D Model" camera navigation for reported building issues
 * - Real-time synchronization via DataManager
 */

import { campusData } from '../data/DataManager.js';
import { authManager } from '../auth/AuthManager.js';
import { Icons } from '../ui/icons.js';
import { Campus2DMap } from '../ui/Campus2DMap.js';

export class AuthorityDashboard {
  constructor(containerElement, onLocateIn3D, onOpen3DCampus) {
    this.container = containerElement;
    this.onLocateIn3D = onLocateIn3D;
    this.onOpen3DCampus = onOpen3DCampus;
    this.activeTab = 'map2d'; // 'map2d' | 'complaints' | 'students' | 'electricity'
    this.campus2DMap = null;
    this.complaintFilter = {
      status: 'ALL',
      type: 'ALL',
      building: 'ALL',
      search: ''
    };
    this.studentSearch = '';
    this.selectedComplaintForDetail = null;
    this.editingStudent = null;

    // Listen for live updates
    this.unsubscribeData = campusData.subscribe((type) => {
      if (this.activeTab === 'map2d' && this.campus2DMap) {
        this.campus2DMap.refreshMap();
      } else if (type === 'complaint' || type === 'student') {
        this.renderSubTabContent();
      }
    });
  }

  render(subTab = 'complaints') {
    this.activeTab = subTab;
    const user = authManager.getCurrentUser();
    if (!user) return;

    this.container.innerHTML = `
      <div class="authority-dashboard">
        <!-- Top Authority Header & Navigation Bar -->
        <header class="auth-dash-header">
          <div class="auth-profile-section">
            <div class="auth-avatar">${user.fullName ? user.fullName.charAt(0) : 'A'}</div>
            <div class="auth-profile-details">
              <div class="auth-name-row">
                <h2 class="auth-name">${user.fullName}</h2>
                <span class="auth-role-pill">Facilities & Estate Administration</span>
              </div>
              <div class="auth-sub-meta">
                <span>${Icons.shield('', 13)} ${user.employeeId || 'EMP-2026'}</span>
                <span class="dot">•</span>
                <span>${Icons.idCard('', 13)} ${user.email}</span>
                <span class="dot">•</span>
                <span>${Icons.building('', 13)} NIST Physical Plant & Campus Services</span>
              </div>
            </div>
          </div>

          <!-- Authority Navigation Tabs -->
          <nav class="auth-nav-tabs">
            <button class="auth-nav-btn ${this.activeTab === 'map2d' ? 'active' : ''}" data-tab="map2d">
              <span class="btn-icon">${Icons.map('', 15)}</span>
              <span>2D Campus Overview</span>
              <span class="badge-count" id="activeMapIssuesCount">0</span>
            </button>

            <button class="auth-nav-btn ${this.activeTab === 'complaints' ? 'active' : ''}" data-tab="complaints">
              <span class="btn-icon">${Icons.clipboard('', 15)}</span>
              <span>Maintenance Tickets</span>
              <span class="badge-count" id="pendingComplaintsCount">0</span>
            </button>

            <button class="auth-nav-btn ${this.activeTab === 'students' ? 'active' : ''}" data-tab="students">
              <span class="btn-icon">${Icons.users('', 15)}</span>
              <span>Student Accounts</span>
            </button>

            <button class="auth-nav-btn ${this.activeTab === 'electricity' ? 'active' : ''}" data-tab="electricity">
              <span class="btn-icon">${Icons.power('', 15)}</span>
              <span>Electricity Telemetry</span>
            </button>

            <button class="auth-nav-btn 3d-twin-btn" id="btnOpen3DCampusTwin">
              <span class="btn-icon">${Icons.building('', 15)}</span>
              <span>3D Campus Twin</span>
            </button>
          </nav>
        </header>

        <!-- Dynamic Main Content Area -->
        <main class="auth-dash-main" id="authTabContentSlot">
          <!-- Populated by renderSubTabContent() -->
        </main>

        <!-- Ticket Review & Status Update Modal -->
        <div class="auth-modal-overlay" id="ticketDetailModal" style="display:none;">
          <div class="auth-modal-card large-modal" id="ticketDetailModalSlot"></div>
        </div>

        <!-- Add / Edit Student Account Modal -->
        <div class="auth-modal-overlay" id="studentAccountModal" style="display:none;">
          <div class="auth-modal-card" id="studentAccountModalSlot"></div>
        </div>
      </div>
    `;

    this.attachHeaderEvents();
    this.renderSubTabContent();
  }

  attachHeaderEvents() {
    this.container.querySelectorAll('.auth-nav-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.auth-nav-btn[data-tab]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        this.renderSubTabContent();
      });
    });

    const btn3D = this.container.querySelector('#btnOpen3DCampusTwin');
    if (btn3D) {
      btn3D.addEventListener('click', () => {
        if (this.onOpen3DCampus) this.onOpen3DCampus();
      });
    }

    // Modal background click to close
    const ticketModal = this.container.querySelector('#ticketDetailModal');
    if (ticketModal) {
      ticketModal.addEventListener('click', (e) => {
        if (e.target === ticketModal) this.closeTicketModal();
      });
    }

    const studentModal = this.container.querySelector('#studentAccountModal');
    if (studentModal) {
      studentModal.addEventListener('click', (e) => {
        if (e.target === studentModal) this.closeStudentModal();
      });
    }
  }

  renderSubTabContent() {
    const slot = this.container.querySelector('#authTabContentSlot');
    if (!slot) return;

    // Update pending count in tabs
    const all = campusData.getComplaints();
    const activePending = all.filter(c => c.status !== 'Resolved').length;
    const badge = this.container.querySelector('#pendingComplaintsCount');
    if (badge) badge.textContent = activePending;
    const mapBadge = this.container.querySelector('#activeMapIssuesCount');
    if (mapBadge) mapBadge.textContent = activePending;

    if (this.activeTab === 'map2d') {
      if (this.campus2DMap) {
        this.campus2DMap.destroy();
      }
      this.campus2DMap = new Campus2DMap(slot, (complaint) => {
        if (this.onLocateIn3D) this.onLocateIn3D(complaint);
      });
      this.campus2DMap.render();
    } else if (this.activeTab === 'complaints') {
      slot.innerHTML = this.renderComplaintsSection();
      this.attachComplaintsEvents();
    } else if (this.activeTab === 'students') {
      slot.innerHTML = this.renderStudentsSection();
      this.attachStudentsEvents();
    } else if (this.activeTab === 'electricity') {
      slot.innerHTML = this.renderElectricitySection();
      this.attachElectricityEvents();
      this.renderElectricityCharts();
    }
  }

  /* ========================================================================
     1. COMPLAINTS MANAGEMENT TAB
     ======================================================================== */

  renderComplaintsSection() {
    const allComplaints = campusData.getComplaints();
    const total = allComplaints.length;
    const buildingCount = allComplaints.filter(c => c.type === 'BUILDING').length;
    const generalCount = allComplaints.filter(c => c.type === 'GENERAL').length;
    const submittedCount = allComplaints.filter(c => c.status === 'Submitted').length;
    const reviewCount = allComplaints.filter(c => c.status === 'Under Review').length;
    const resolvedCount = allComplaints.filter(c => c.status === 'Resolved').length;

    // Filter list
    let filtered = allComplaints.filter(c => {
      if (this.complaintFilter.status !== 'ALL' && c.status !== this.complaintFilter.status) return false;
      if (this.complaintFilter.type !== 'ALL' && c.type !== this.complaintFilter.type) return false;
      if (this.complaintFilter.building !== 'ALL' && c.building !== this.complaintFilter.building) return false;
      if (this.complaintFilter.search.trim()) {
        const query = this.complaintFilter.search.toLowerCase();
        const text = `${c.id} ${c.studentName} ${c.studentId} ${c.category} ${c.title || ''} ${c.description} ${c.building || ''} ${c.room || ''}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });

    return `
      <div class="auth-section complaints-mgmt-section">
        <!-- Metric Summary Cards -->
        <div class="auth-stats-grid">
          <div class="auth-stat-card total-card">
            <div class="stat-icon-wrap">${Icons.clipboard('', 20)}</div>
            <div class="stat-meta">
              <span class="stat-number">${total}</span>
              <span class="stat-label">Total Logged Tickets</span>
            </div>
          </div>

          <div class="auth-stat-card yellow-card">
            <div class="stat-icon-wrap">${Icons.alert('', 20)}</div>
            <div class="stat-meta">
              <span class="stat-number">${submittedCount}</span>
              <span class="stat-label">Pending Triage</span>
            </div>
          </div>

          <div class="auth-stat-card blue-card">
            <div class="stat-icon-wrap">${Icons.target('', 20)}</div>
            <div class="stat-meta">
              <span class="stat-number">${reviewCount}</span>
              <span class="stat-label">Under Investigation</span>
            </div>
          </div>

          <div class="auth-stat-card green-card">
            <div class="stat-icon-wrap">${Icons.check('', 20)}</div>
            <div class="stat-meta">
              <span class="stat-number">${resolvedCount}</span>
              <span class="stat-label">Resolved & Signed-Off</span>
            </div>
          </div>

          <div class="auth-stat-card purple-card">
            <div class="stat-icon-wrap">${Icons.building('', 20)}</div>
            <div class="stat-meta">
              <span class="stat-number">${buildingCount} / ${generalCount}</span>
              <span class="stat-label">Building / Grounds Split</span>
            </div>
          </div>
        </div>

        <!-- Filter & Search Controls Bar -->
        <div class="complaints-controls-bar">
          <div class="search-input-wrap">
            <span class="search-icon">${Icons.search('', 15)}</span>
            <input type="text" id="complaintsSearchInput" placeholder="Search ticket code, student, classroom, keywords..." value="${this.complaintFilter.search}" />
          </div>

          <div class="filter-dropdowns-group">
            <div class="filter-group">
              <label>Status:</label>
              <select id="filterStatusSelect" class="filter-select">
                <option value="ALL" ${this.complaintFilter.status === 'ALL' ? 'selected' : ''}>All Statuses</option>
                <option value="Submitted" ${this.complaintFilter.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                <option value="Under Review" ${this.complaintFilter.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                <option value="Resolved" ${this.complaintFilter.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Classification:</label>
              <select id="filterTypeSelect" class="filter-select">
                <option value="ALL" ${this.complaintFilter.type === 'ALL' ? 'selected' : ''}>All Types</option>
                <option value="BUILDING" ${this.complaintFilter.type === 'BUILDING' ? 'selected' : ''}>Building Specific</option>
                <option value="GENERAL" ${this.complaintFilter.type === 'GENERAL' ? 'selected' : ''}>Campus Grounds</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Building:</label>
              <select id="filterBuildingSelect" class="filter-select">
                <option value="ALL" ${this.complaintFilter.building === 'ALL' ? 'selected' : ''}>All Complexes</option>
                <option value="LHC" ${this.complaintFilter.building === 'LHC' ? 'selected' : ''}>LHC Academic Wing</option>
                <option value="ATR" ${this.complaintFilter.building === 'ATR' ? 'selected' : ''}>Atrium Complex</option>
                <option value="GAL" ${this.complaintFilter.building === 'GAL' ? 'selected' : ''}>Galleria Complex</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Complaints Table View -->
        <div class="complaints-table-container">
          ${filtered.length === 0 ? `
            <div class="empty-table-state">
              <div class="empty-icon-circle">${Icons.clipboard('', 24)}</div>
              <h3>No Maintenance Tickets Match Filter</h3>
              <p>Adjust your search criteria or filter options above.</p>
            </div>
          ` : `
            <table class="tickets-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Student Info</th>
                  <th>Issue & Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Photo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(c => this.renderTicketTableRow(c)).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `;
  }

  renderTicketTableRow(c) {
    const isBuilding = c.type === 'BUILDING';
    const locationDisplay = isBuilding
      ? `${c.building} • ${c.floor ? `Floor ${c.floor}` : ''} • Room ${c.room || '-'}`
      : `${c.area || 'Campus Wide'}`;

    const statusBadgeClass = c.status === 'Resolved' ? 'badge-resolved' : (c.status === 'Under Review' ? 'badge-review' : 'badge-submitted');
    const priorityBadgeClass = c.priority === 'High' ? 'priority-high' : (c.priority === 'Medium' ? 'priority-med' : 'priority-low');

    return `
      <tr class="ticket-row" data-id="${c.id}">
        <td>
          <span class="ticket-code">${c.id}</span>
          <span class="ticket-date">${new Date(c.timestamp).toLocaleDateString()}</span>
        </td>
        <td>
          <div class="student-cell">
            <strong>${c.studentName || 'Student'}</strong>
            <span class="sub-text">${c.studentId || '-'}</span>
          </div>
        </td>
        <td>
          <div class="issue-cell">
            <span class="issue-title-text">${c.title || c.category}</span>
            <span class="issue-category-tag">${c.category}</span>
            <p class="issue-desc-snip">${c.description.length > 70 ? c.description.slice(0, 70) + '...' : c.description}</p>
          </div>
        </td>
        <td>
          <div class="location-cell">
            <span class="bld-tag ${c.building ? `tag-${c.building.toLowerCase()}` : 'tag-general'}">${c.building || 'General'}</span>
            <span class="location-text">${locationDisplay}</span>
          </div>
        </td>
        <td>
          <span class="priority-pill ${priorityBadgeClass}">${c.priority || 'Normal'}</span>
        </td>
        <td>
          <span class="status-pill ${statusBadgeClass}">
            <span class="status-indicator-dot"></span>
            <span>${c.status}</span>
          </span>
        </td>
        <td>
          ${c.photoUrl ? `
            <div class="thumb-preview-wrap" data-img="${c.photoUrl}" title="Click to view image">
              <img src="${c.photoUrl}" alt="Issue photo" class="table-thumb" />
            </div>
          ` : '<span class="no-photo-dash">—</span>'}
        </td>
        <td>
          <div class="table-action-btns">
            <button class="tbl-action-btn review-btn" data-action="review" data-id="${c.id}" title="Inspect full ticket details and update status">
              ${Icons.eye('', 13)}
              <span>Review</span>
            </button>
            <button class="tbl-action-btn locate-2d-btn" data-action="locate-2d" data-id="${c.id}" title="Inspect on 2D Campus Maintenance Map">
              ${Icons.map('', 13)}
              <span>2D Map</span>
            </button>
            ${isBuilding ? `
              <button class="tbl-action-btn locate-btn" data-action="locate" data-id="${c.id}" title="Locate in 3D Campus Digital Twin">
                ${Icons.target('', 13)}
                <span>3D Locate</span>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }

  attachComplaintsEvents() {
    const searchInput = this.container.querySelector('#complaintsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.complaintFilter.search = e.target.value;
        this.renderSubTabContent();
      });
    }

    const statusSel = this.container.querySelector('#filterStatusSelect');
    if (statusSel) {
      statusSel.addEventListener('change', (e) => {
        this.complaintFilter.status = e.target.value;
        this.renderSubTabContent();
      });
    }

    const typeSel = this.container.querySelector('#filterTypeSelect');
    if (typeSel) {
      typeSel.addEventListener('change', (e) => {
        this.complaintFilter.type = e.target.value;
        this.renderSubTabContent();
      });
    }

    const bldSel = this.container.querySelector('#filterBuildingSelect');
    if (bldSel) {
      bldSel.addEventListener('change', (e) => {
        this.complaintFilter.building = e.target.value;
        this.renderSubTabContent();
      });
    }

    // Table action buttons
    this.container.querySelectorAll('.tbl-action-btn[data-action="review"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openTicketModal(btn.dataset.id);
      });
    });

    this.container.querySelectorAll('.tbl-action-btn[data-action="locate-2d"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ticketId = btn.dataset.id;
        const complaint = campusData.getComplaintById(ticketId);
        if (complaint) {
          this.activeTab = 'map2d';
          this.render('map2d');
          if (complaint.building) {
            this.campus2DMap.selectedBuilding = complaint.building;
            const fNum = parseInt(complaint.floor || complaint.floorNumber);
            if (!isNaN(fNum) && fNum > 0) {
              this.campus2DMap.selectedFloor = fNum;
            }
            this.campus2DMap.currentLevel = 2;
            this.campus2DMap.refreshMap();
          }
          this.campus2DMap.openTicketModal(complaint.id);
        }
      });
    });

    this.container.querySelectorAll('.tbl-action-btn[data-action="locate"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ticketId = btn.dataset.id;
        const complaint = campusData.getComplaintById(ticketId);
        if (complaint && this.onLocateIn3D) {
          this.onLocateIn3D(complaint);
        }
      });
    });

    // Thumbnail click to preview
    this.container.querySelectorAll('.thumb-preview-wrap').forEach(wrap => {
      wrap.addEventListener('click', () => {
        const img = wrap.dataset.img;
        if (img) window.open(img, '_blank');
      });
    });
  }

  openTicketModal(ticketId) {
    const complaint = campusData.getComplaintById(ticketId);
    if (!complaint) return;
    this.selectedComplaintForDetail = complaint;

    const modal = this.container.querySelector('#ticketDetailModal');
    const slot = this.container.querySelector('#ticketDetailModalSlot');
    if (!modal || !slot) return;

    const isBuilding = complaint.type === 'BUILDING';
    const locationDisplay = isBuilding
      ? `${complaint.buildingName || complaint.building} • Floor ${complaint.floor || '-'} • Room ${complaint.room || '-'}`
      : `${complaint.area || 'General Campus'} (Campus Facility)`;

    slot.innerHTML = `
      <div class="ticket-modal-content">
        <div class="modal-hdr">
          <div class="ticket-hdr-left">
            <span class="ticket-modal-code">${complaint.id}</span>
            <span class="ticket-status-pill badge-${complaint.status.toLowerCase().replace(' ', '-')}">
              <span class="status-indicator-dot"></span>
              <span>${complaint.status}</span>
            </span>
          </div>
          <button class="modal-close-icon" id="closeTicketModalBtn" aria-label="Close modal">
            ${Icons.close('', 16)}
          </button>
        </div>

        <div class="modal-scroll-body">
          <div class="ticket-meta-header">
            <h2 class="ticket-detail-title">${complaint.title || complaint.category}</h2>
            <div class="ticket-meta-badges">
              <span class="meta-tag">${Icons.users('', 13)} ${complaint.studentName} (${complaint.studentId})</span>
              <span class="meta-tag">${Icons.building('', 13)} ${locationDisplay}</span>
              <span class="meta-tag">${Icons.dashboard('', 13)} ${new Date(complaint.timestamp).toLocaleString()}</span>
              <span class="meta-tag priority-tag-${complaint.priority.toLowerCase()}">${Icons.power('', 13)} Priority: ${complaint.priority}</span>
            </div>
          </div>

          <div class="ticket-detail-grid">
            <!-- Left Column: Details & Photo -->
            <div class="ticket-col-info">
              <div class="detail-box">
                <span class="detail-heading">Student Problem Description</span>
                <p class="detail-description-text">${complaint.description}</p>
              </div>

              ${complaint.equipment ? `
                <div class="detail-box">
                  <span class="detail-heading">Affected Equipment / Fixture</span>
                  <p class="detail-fixture-val">${Icons.target('', 13)} ${complaint.equipment}</p>
                </div>
              ` : ''}

              ${complaint.photoUrl ? `
                <div class="detail-box photo-box">
                  <span class="detail-heading">Attached Photographic Proof</span>
                  <div class="ticket-photo-wrapper">
                    <img src="${complaint.photoUrl}" alt="Complaint photograph" class="modal-full-photo" />
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Right Column: Administrative Workflow & Status Updater -->
            <div class="ticket-col-status">
              <div class="status-workflow-card">
                <h3 class="workflow-heading">Administrative Action & Triage</h3>
                <p class="workflow-desc">Advance ticket lifecycle state and post resolution remarks for student review.</p>

                <form id="updateTicketStatusForm">
                  <div class="form-group">
                    <label for="ticketNewStatus">Lifecycle State:</label>
                    <select id="ticketNewStatus" class="workflow-select">
                      <option value="Submitted" ${complaint.status === 'Submitted' ? 'selected' : ''}>Submitted (Awaiting Triage)</option>
                      <option value="Under Review" ${complaint.status === 'Under Review' ? 'selected' : ''}>Under Review (Technician Dispatched)</option>
                      <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved (Work Completed & Verified)</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="ticketResolutionRemarks">Authority Notes / Resolution Remarks:</label>
                    <textarea id="ticketResolutionRemarks" rows="4" placeholder="Enter notes (e.g., Electrician assigned, ballasts replaced, operational test passed)..." class="workflow-textarea">${complaint.resolutionRemarks || ''}</textarea>
                  </div>

                  <div class="workflow-actions-row">
                    <button type="submit" class="save-status-btn">
                      <span>Update Ticket Status</span>
                      <span class="btn-arrow">${Icons.arrowRight('', 14)}</span>
                    </button>
                    <button type="button" class="locate-2d-btn" id="btnModalLocate2D">
                      ${Icons.map('', 14)}
                      <span>2D Map</span>
                    </button>
                    ${isBuilding ? `
                      <button type="button" class="locate-3d-btn" id="btnModalLocate3D">
                        ${Icons.target('', 14)}
                        <span>3D Model</span>
                      </button>
                    ` : ''}
                  </div>
                </form>
              </div>

              <!-- Ticket Audit Trail -->
              <div class="ticket-audit-card">
                <h4 class="audit-heading">Audit Trail</h4>
                <ul class="audit-list">
                  <li><strong>Ticket Created:</strong> ${new Date(complaint.timestamp).toLocaleString()}</li>
                  <li><strong>Reported By:</strong> ${complaint.studentName} (${complaint.studentId})</li>
                  <li><strong>Department:</strong> ${complaint.department || 'NIST Academic Dept'}</li>
                  <li><strong>Category:</strong> ${complaint.category}</li>
                  ${complaint.resolvedAt ? `<li><strong>Resolved On:</strong> ${new Date(complaint.resolvedAt).toLocaleString()} by ${complaint.resolvedBy || 'Authority'}</li>` : ''}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    // Events inside modal
    const closeBtn = slot.querySelector('#closeTicketModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeTicketModal());

    const locate2DBtn = slot.querySelector('#btnModalLocate2D');
    if (locate2DBtn) {
      locate2DBtn.addEventListener('click', () => {
        this.closeTicketModal();
        this.activeTab = 'map2d';
        this.render('map2d');
        if (complaint.building) {
          this.campus2DMap.selectedBuilding = complaint.building;
          const fNum = parseInt(complaint.floor || complaint.floorNumber);
          if (!isNaN(fNum) && fNum > 0) {
            this.campus2DMap.selectedFloor = fNum;
          }
          this.campus2DMap.currentLevel = 2;
          this.campus2DMap.refreshMap();
        }
        this.campus2DMap.openTicketModal(complaint.id);
      });
    }

    const locateBtn = slot.querySelector('#btnModalLocate3D');
    if (locateBtn && isBuilding) {
      locateBtn.addEventListener('click', () => {
        this.closeTicketModal();
        if (this.onLocateIn3D) this.onLocateIn3D(complaint);
      });
    }

    const form = slot.querySelector('#updateTicketStatusForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newStatus = slot.querySelector('#ticketNewStatus').value;
        const remarks = slot.querySelector('#ticketResolutionRemarks').value;
        const currentUser = authManager.getCurrentUser();

        campusData.updateComplaintStatus(complaint.id, newStatus, remarks, currentUser.fullName);
        this.closeTicketModal();
        this.renderSubTabContent();
      });
    }
  }

  closeTicketModal() {
    const modal = this.container.querySelector('#ticketDetailModal');
    if (modal) modal.style.display = 'none';
    this.selectedComplaintForDetail = null;
  }

  /* ========================================================================
     2. STUDENT ACCOUNT MANAGEMENT TAB
     ======================================================================== */

  renderStudentsSection() {
    const students = campusData.getStudents();
    const total = students.length;
    const active = students.filter(s => s.status === 'ACTIVE').length;
    const inactive = students.filter(s => s.status !== 'ACTIVE').length;

    let filtered = students.filter(s => {
      if (!this.studentSearch.trim()) return true;
      const q = this.studentSearch.toLowerCase();
      return `${s.fullName} ${s.regNo} ${s.email} ${s.department} ${s.batch}`.toLowerCase().includes(q);
    });

    return `
      <div class="auth-section students-mgmt-section">
        <!-- Institutional Policy Callout Banner -->
        <div class="policy-callout-banner">
          <div class="policy-icon">${Icons.shield('', 20)}</div>
          <div class="policy-text">
            <strong>Institutional Access Control Policy:</strong>
            Students cannot independently register or self-create credentials. Only authorized campus administrators may provision student accounts, allocate departmental roles, and manage access privileges.
          </div>
        </div>

        <!-- Student Metrics & Action Header -->
        <div class="students-header-bar">
          <div class="students-meta-counts">
            <span class="s-count-chip"><strong>${total}</strong> Total Registered</span>
            <span class="s-count-chip active-chip"><strong>${active}</strong> Active</span>
            <span class="s-count-chip inactive-chip"><strong>${inactive}</strong> Deactivated</span>
          </div>

          <div class="students-action-wrap">
            <div class="search-input-wrap">
              <span class="search-icon">${Icons.search('', 15)}</span>
              <input type="text" id="studentSearchInput" placeholder="Filter student name, reg no, department..." value="${this.studentSearch}" />
            </div>

            <button class="add-student-btn" id="btnAddStudent">
              <span class="btn-icon">${Icons.plus('', 15)}</span>
              <span>Provision Student Account</span>
            </button>
          </div>
        </div>

        <!-- Students Table -->
        <div class="students-table-container">
          <table class="students-table">
            <thead>
              <tr>
                <th>Registration No / ID</th>
                <th>Full Name</th>
                <th>Official Email</th>
                <th>Department</th>
                <th>Batch</th>
                <th>Account Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(s => `
                <tr class="student-row ${s.status !== 'ACTIVE' ? 'row-inactive' : ''}">
                  <td><span class="reg-pill">${s.regNo}</span></td>
                  <td><strong>${s.fullName}</strong></td>
                  <td>${s.email}</td>
                  <td><span class="dept-badge">${s.department}</span></td>
                  <td>${s.batch || '2024-2028'}</td>
                  <td>
                    <span class="user-status-pill ${s.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}">
                      <span class="status-indicator-dot"></span>
                      <span>${s.status === 'ACTIVE' ? 'Active' : 'Deactivated'}</span>
                    </span>
                  </td>
                  <td><span class="sub-text">${s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'System Seed'}</span></td>
                  <td>
                    <div class="user-actions-row">
                      <button class="usr-btn toggle-status-btn" data-action="toggle" data-reg="${s.regNo}" title="${s.status === 'ACTIVE' ? 'Deactivate account' : 'Activate account'}">
                        ${s.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button class="usr-btn edit-usr-btn" data-action="edit" data-reg="${s.regNo}" title="Edit student details">
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  attachStudentsEvents() {
    const searchInput = this.container.querySelector('#studentSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.studentSearch = e.target.value;
        this.renderSubTabContent();
      });
    }

    const addBtn = this.container.querySelector('#btnAddStudent');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.openStudentModal(null);
      });
    }

    this.container.querySelectorAll('.usr-btn[data-action="toggle"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const regNo = btn.dataset.reg;
        campusData.toggleStudentStatus(regNo);
        this.renderSubTabContent();
      });
    });

    this.container.querySelectorAll('.usr-btn[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const regNo = btn.dataset.reg;
        const student = campusData.getStudentByRegNo(regNo);
        if (student) this.openStudentModal(student);
      });
    });
  }

  openStudentModal(student = null) {
    this.editingStudent = student;
    const modal = this.container.querySelector('#studentAccountModal');
    const slot = this.container.querySelector('#studentAccountModalSlot');
    if (!modal || !slot) return;

    const isEdit = !!student;

    slot.innerHTML = `
      <div class="student-form-modal">
        <div class="modal-hdr">
          <div class="student-modal-title-wrap">
            <span class="modal-badge">${Icons.users('', 14)} STUDENT PROVISIONING</span>
            <h3>${isEdit ? `Edit Student: ${student.regNo}` : 'Provision New Student Account'}</h3>
          </div>
          <button class="modal-close-icon" id="closeStudentModalBtn" aria-label="Close modal">
            ${Icons.close('', 16)}
          </button>
        </div>

        <form id="studentAccountForm" class="student-mgmt-form">
          <div id="studentFormError" class="auth-error-banner" style="display:none;"></div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="sfFullName">Full Name *</label>
              <input type="text" id="sfFullName" value="${isEdit ? student.fullName : ''}" required placeholder="e.g. Aditi Mohapatra" />
            </div>

            <div class="form-group flex-1">
              <label for="sfRegNo">Registration Number / Student ID *</label>
              <input type="text" id="sfRegNo" value="${isEdit ? student.regNo : ''}" ${isEdit ? 'disabled' : 'required'} placeholder="e.g. 2024NIST1005" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="sfEmail">College Email *</label>
              <input type="email" id="sfEmail" value="${isEdit ? student.email : ''}" required placeholder="e.g. aditi.m@nist.edu" />
            </div>

            <div class="form-group flex-1">
              <label for="sfDepartment">Department *</label>
              <select id="sfDepartment" required>
                <option value="Computer Science & Engineering" ${isEdit && student.department.includes('Computer Science') ? 'selected' : ''}>Computer Science & Engineering</option>
                <option value="Electronics & Communication Engineering" ${isEdit && student.department.includes('Electronics') ? 'selected' : ''}>Electronics & Communication Engineering</option>
                <option value="Electrical & Electronics Engineering" ${isEdit && student.department.includes('Electrical') ? 'selected' : ''}>Electrical & Electronics Engineering</option>
                <option value="Mechanical Engineering" ${isEdit && student.department.includes('Mechanical') ? 'selected' : ''}>Mechanical Engineering</option>
                <option value="Civil Engineering" ${isEdit && student.department.includes('Civil') ? 'selected' : ''}>Civil Engineering</option>
                <option value="Information Technology" ${isEdit && student.department.includes('Information Technology') ? 'selected' : ''}>Information Technology</option>
                <option value="MBA - School of Management" ${isEdit && student.department.includes('MBA') ? 'selected' : ''}>MBA - School of Management</option>
                <option value="MCA - Computer Applications" ${isEdit && student.department.includes('MCA') ? 'selected' : ''}>MCA - Computer Applications</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="sfBatch">Batch / Academic Year *</label>
              <input type="text" id="sfBatch" value="${isEdit ? (student.batch || '2024-2028') : '2024-2028'}" required placeholder="e.g. 2024-2028" />
            </div>

            <div class="form-group flex-1">
              <label for="sfPassword">${isEdit ? 'Reset Password (leave blank to keep existing)' : 'Initial Password *'}</label>
              <input type="password" id="sfPassword" ${isEdit ? '' : 'required'} placeholder="••••••••" />
            </div>
          </div>

          <div class="student-form-footer">
            <button type="button" class="btn-cancel" id="cancelStudentFormBtn">Cancel</button>
            <button type="submit" class="btn-save-student">
              <span>${isEdit ? 'Save Changes' : 'Provision Student Account'}</span>
              <span class="btn-arrow">${Icons.arrowRight('', 14)}</span>
            </button>
          </div>
        </form>
      </div>
    `;

    modal.style.display = 'flex';

    const closeBtn = slot.querySelector('#closeStudentModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeStudentModal());

    const cancelBtn = slot.querySelector('#cancelStudentFormBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeStudentModal());

    const form = slot.querySelector('#studentAccountForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errBanner = slot.querySelector('#studentFormError');
        errBanner.style.display = 'none';

        const fullName = slot.querySelector('#sfFullName').value.trim();
        const regNo = isEdit ? student.regNo : slot.querySelector('#sfRegNo').value.trim();
        const email = slot.querySelector('#sfEmail').value.trim();
        const department = slot.querySelector('#sfDepartment').value;
        const batch = slot.querySelector('#sfBatch').value.trim();
        const password = slot.querySelector('#sfPassword').value;

        if (!fullName || !regNo || !email) {
          errBanner.textContent = 'Please fill in all required fields.';
          errBanner.style.display = 'block';
          return;
        }

        if (isEdit) {
          campusData.updateStudent(regNo, {
            fullName,
            email,
            department,
            batch,
            ...(password ? { password } : {})
          });
        } else {
          if (!password) {
            errBanner.textContent = 'Initial password is required for new student.';
            errBanner.style.display = 'block';
            return;
          }
          const success = campusData.addStudent({
            regNo,
            fullName,
            email,
            department,
            batch,
            password
          });
          if (!success) {
            errBanner.textContent = `A student with Registration No "${regNo}" already exists.`;
            errBanner.style.display = 'block';
            return;
          }
        }

        this.closeStudentModal();
        this.renderSubTabContent();
      });
    }
  }

  closeStudentModal() {
    const modal = this.container.querySelector('#studentAccountModal');
    if (modal) modal.style.display = 'none';
    this.editingStudent = null;
  }

  /* ========================================================================
     3. ELECTRICITY CONSUMPTION MONITORING TAB
     ======================================================================== */

  renderElectricitySection() {
    const summary = campusData.getElectricitySummary();

    return `
      <div class="auth-section electricity-telemetry-section">
        <!-- Ready For IoT & ML Callout Banner -->
        <div class="telemetry-banner">
          <div class="telemetry-badge-pulse">
            <span class="live-pulse"></span>
            LIVE SUBSTATION TELEMETRY • CAMPUS SMART GRID
          </div>
          <div class="telemetry-banner-text">
            <strong>Campus Smart Grid Telemetry:</strong>
            Real-time energy consumption telemetry monitored across NIST University sub-stations, transformers, and building distribution panels. Ingesting 11kV busbar meters and building feeder sensors.
          </div>
        </div>

        <!-- 5 Telemetry Summary KPI Cards -->
        <div class="telemetry-kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon-box orange-box">${Icons.power('', 20)}</div>
            <div class="kpi-body">
              <span class="kpi-value">${summary.totalConsumptionKWh.toLocaleString()} kWh</span>
              <span class="kpi-label">Cumulative Energy</span>
              <span class="kpi-trend positive">+3.2% vs baseline</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-box blue-box">${Icons.dashboard('', 20)}</div>
            <div class="kpi-body">
              <span class="kpi-value">${summary.todayConsumptionKWh.toLocaleString()} kWh</span>
              <span class="kpi-label">Today's Demand (24h)</span>
              <span class="kpi-trend">Diurnal Peak at 14:30</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-box green-box">${Icons.layers('', 20)}</div>
            <div class="kpi-body">
              <span class="kpi-value">${summary.monthConsumptionMWh} MWh</span>
              <span class="kpi-label">Current Month Billing</span>
              <span class="kpi-trend positive">Under Budget by 4.5%</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-box red-box">${Icons.target('', 20)}</div>
            <div class="kpi-body">
              <span class="kpi-value">${summary.peakLoadKW} kW</span>
              <span class="kpi-label">Peak Demand Load</span>
              <span class="kpi-trend warning">HVAC & Lab Supercomputing</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-box purple-box">${Icons.shield('', 20)}</div>
            <div class="kpi-body">
              <span class="kpi-value">${summary.powerFactor} PF</span>
              <span class="kpi-label">Average Power Factor</span>
              <span class="kpi-trend good">Capacitor Bank Optimal</span>
            </div>
          </div>
        </div>

        <!-- Charts Layout Grid -->
        <div class="telemetry-charts-grid">
          <!-- Chart 1: 24h Hourly Load Curve -->
          <div class="chart-card span-2">
            <div class="chart-header">
              <div class="chart-title-group">
                <span class="chart-tag">DIURNAL DEMAND</span>
                <h3 class="chart-title">24-Hour Campus Hourly Load Curve (kW)</h3>
                <p class="chart-sub">Hourly electrical demand showing baseline nighttime load, morning classroom surge, and afternoon laboratory peak.</p>
              </div>
              <div class="chart-live-indicator">
                <span class="pulse-green"></span>
                <span>Sub-station 11kV Feed</span>
              </div>
            </div>
            <div class="canvas-chart-wrapper">
              <canvas id="hourlyLoadCanvas" height="280"></canvas>
            </div>
          </div>

          <!-- Chart 2: Building-Wise Load Breakdown -->
          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title-group">
                <span class="chart-tag">FACILITY SHARE</span>
                <h3 class="chart-title">Complex Load Distribution</h3>
                <p class="chart-sub">Energy distribution across the 3 academic complexes.</p>
              </div>
            </div>
            <div class="canvas-chart-wrapper donut-wrap">
              <canvas id="buildingShareCanvas" height="280"></canvas>
            </div>
            <div class="building-legend-list">
              <div class="bld-leg-item">
                <span class="leg-color leg-atrium"></span>
                <span class="leg-name">Atrium Building (Cineplex, NBS, Chiller):</span>
                <span class="leg-val">44% (213.5 MWh)</span>
              </div>
              <div class="bld-leg-item">
                <span class="leg-color leg-lhc"></span>
                <span class="leg-name">Lecture Hall Complex (5 Floors, AC Halls):</span>
                <span class="leg-val">34% (165.0 MWh)</span>
              </div>
              <div class="bld-leg-item">
                <span class="leg-color leg-galleria"></span>
                <span class="leg-name">Galleria Complex (HPC Supercomputer, Aud):</span>
                <span class="leg-val">22% (106.7 MWh)</span>
              </div>
            </div>
          </div>

          <!-- Chart 3: 12-Month Historical Energy Trends -->
          <div class="chart-card span-3">
            <div class="chart-header">
              <div class="chart-title-group">
                <span class="chart-tag">ANNUAL TELEMETRY</span>
                <h3 class="chart-title">12-Month Campus Energy Consumption History (MWh)</h3>
                <p class="chart-sub">Historical trend highlighting examination semester peaks (March-May, Oct-Nov) and summer vacation drops (June-July).</p>
              </div>
            </div>
            <div class="canvas-chart-wrapper">
              <canvas id="monthlyTrendCanvas" height="240"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachElectricityEvents() {
    window.addEventListener('resize', () => {
      if (this.activeTab === 'electricity') {
        this.renderElectricityCharts();
      }
    });
  }

  renderElectricityCharts() {
    const data = campusData.getElectricityData();
    this.drawHourlyLoadCurve(data.hourlyLoadCurve);
    this.drawBuildingShare(data.buildingDistribution);
    this.drawMonthlyTrends(data.monthlyTrends);
  }

  drawHourlyLoadCurve(hourly) {
    const canvas = this.container.querySelector('#hourlyLoadCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth || 700;
    const height = 280;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    const padLeft = 60;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 40;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const maxVal = 950;
    const minVal = 0;

    // Draw gridlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';

    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const yVal = Math.round(minVal + ((maxVal - minVal) / ySteps) * i);
      const y = padTop + chartH - (i / ySteps) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.fillText(`${yVal} kW`, 10, y + 4);
    }

    // Points
    const points = hourly.map((item, idx) => {
      const x = padLeft + (idx / (hourly.length - 1)) * chartW;
      const y = padTop + chartH - ((item.kw - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, hour: item.hour, kw: item.kw };
    });

    // Draw Gradient Area under curve
    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.01)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padTop + chartH);
    for (let i = 0; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Line
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < points.length; i++) {
      if (i === 0) ctx.moveTo(points[i].x, points[i].y);
      else ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Draw Dots & X Labels
    points.forEach((pt, i) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (i % 3 === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(pt.hour, pt.x - 14, height - 12);
      }
    });

    // Mark Peak Load
    const peak = points.reduce((prev, curr) => (curr.kw > prev.kw ? curr : prev), points[0]);
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(peak.x, peak.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`Peak: ${peak.kw} kW (14:30)`, peak.x - 45, peak.y - 12);
  }

  drawBuildingShare(dist) {
    const canvas = this.container.querySelector('#buildingShareCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth || 320;
    const height = 280;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2 - 10;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.58;

    const colors = {
      'Atrium Building': '#38bdf8',
      'Lecture Hall Complex': '#10b981',
      'Galleria Building': '#fb923c'
    };

    let startAngle = -Math.PI / 2;

    dist.forEach(slice => {
      const sliceAngle = (slice.percentage / 100) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[slice.building] || '#818cf8';
      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Center Text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('100%', centerX, centerY - 2);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Campus Load', centerX, centerY + 16);
    ctx.textAlign = 'start';
  }

  drawMonthlyTrends(monthly) {
    const canvas = this.container.querySelector('#monthlyTrendCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth || 700;
    const height = 240;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    const padLeft = 60;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 40;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const maxVal = 500;
    const minVal = 0;

    // Y Axis Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';

    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const yVal = Math.round(minVal + ((maxVal - minVal) / ySteps) * i);
      const y = padTop + chartH - (i / ySteps) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.fillText(`${yVal} MWh`, 10, y + 4);
    }

    // Bars
    const barWidth = Math.max(14, (chartW / monthly.length) * 0.55);
    const gap = chartW / monthly.length;

    monthly.forEach((m, idx) => {
      const x = padLeft + idx * gap + (gap - barWidth) / 2;
      const barH = ((m.mwh - minVal) / (maxVal - minVal)) * chartH;
      const y = padTop + chartH - barH;

      const isVacation = m.month === 'Jun' || m.month === 'Jul';
      const isPeak = m.mwh >= 420;

      const barGrad = ctx.createLinearGradient(0, y, 0, y + barH);
      if (isPeak) {
        barGrad.addColorStop(0, '#f43f5e');
        barGrad.addColorStop(1, '#be123c');
      } else if (isVacation) {
        barGrad.addColorStop(0, '#10b981');
        barGrad.addColorStop(1, '#047857');
      } else {
        barGrad.addColorStop(0, '#38bdf8');
        barGrad.addColorStop(1, '#0284c7');
      }

      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]) : ctx.rect(x, y, barWidth, barH);
      ctx.fill();

      // Month Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(m.month, x + (barWidth / 2) - 10, height - 14);

      // Value Label on top of bar
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${m.mwh}`, x + (barWidth / 2) - 11, y - 6);
    });
  }

  destroy() {
    if (this.unsubscribeData) this.unsubscribeData();
  }
}
