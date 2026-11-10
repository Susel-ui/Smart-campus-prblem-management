/**
 * WelcomeView.js - Initial Landing Page for Smart Campus Maintenance System
 * 
 * Features:
 * - Institutional branding: NIST University Smart Campus Maintenance and Intelligence System
 * - Dual entry portals: Student Portal vs Authority Portal
 * - Direct 3D BIM spatial interface launch
 * - High-clarity credential testing reference
 */

import { Icons } from '../ui/icons.js';

export class WelcomeView {
  constructor(containerElement, onSelectPortal) {
    this.container = containerElement;
    this.onSelectPortal = onSelectPortal;
  }

  render() {
    this.container.innerHTML = `
      <div class="welcome-screen">
        <div class="welcome-ambient-grid"></div>
        <div class="welcome-container">
          <!-- Institutional Header -->
          <header class="welcome-header">
            <div class="welcome-badge">
              <span class="pulse-dot"></span>
              <span class="inst-pill">${Icons.building('', 13)} NIST UNIVERSITY BERHAMPUR • CAMPUS DIGITAL TWIN</span>
            </div>
            <h1 class="welcome-title">Smart Campus Maintenance & Intelligence System</h1>
            <p class="welcome-subtitle">
              Unified spatial digital infrastructure connecting students, faculty, and estate administration
              for interactive 3D incident logging, automated ticket dispatch, and campus energy telemetry.
            </p>
          </header>

          <!-- Dual Portal Selection Cards -->
          <div class="portals-grid">
            <!-- Student Portal Card -->
            <div class="portal-card student-card" id="studentPortalBtn" role="button" tabindex="0">
              <div class="portal-icon-wrapper student-icon">
                ${Icons.graduate('portal-main-svg', 30)}
              </div>
              <div class="portal-content">
                <span class="portal-tag">STUDENT ACCESS</span>
                <h2 class="portal-heading">Student Portal</h2>
                <p class="portal-desc">
                  Explore academic blocks in 3D, inspect classrooms and facilities, and submit maintenance tickets with automated spatial geolocation.
                </p>
                <ul class="portal-features">
                  <li><span class="feature-check">${Icons.check('', 13)}</span> Interactive 3D Building & Floor Navigation</li>
                  <li><span class="feature-check">${Icons.check('', 13)}</span> Spatial Room & Asset Problem Reporting</li>
                  <li><span class="feature-check">${Icons.check('', 13)}</span> General Campus Issue Filing with Photo Upload</li>
                  <li><span class="feature-check">${Icons.check('', 13)}</span> Live Resolution Tracking in "My Complaints"</li>
                </ul>
              </div>
              <button class="portal-btn student-btn" tabindex="-1">
                <span>Enter Student Portal</span>
                <span class="btn-arrow">${Icons.arrowRight('', 14)}</span>
              </button>
            </div>

            <!-- Authority Portal Card -->
            <div class="portal-card authority-card" id="authorityPortalBtn" role="button" tabindex="0">
              <div class="portal-icon-wrapper authority-icon">
                ${Icons.shield('portal-main-svg', 30)}
              </div>
              <div class="portal-content">
                <span class="portal-tag auth-tag">FACILITIES & ESTATE ADMINISTRATION</span>
                <h2 class="portal-heading">Authority Portal</h2>
                <p class="portal-desc">
                  Administrative oversight for facility management: review active complaints, navigate to 3D problem sites, provision student accounts, and monitor campus power loads.
                </p>
                <ul class="portal-features">
                  <li><span class="feature-check">${Icons.check('', 13)}</span> 3D Spatial Localization of Reported Issues</li>
                  <li><span class="feature-check">${Icons.check('', 13)}</span> Lifecycle Management (Submitted → Review → Resolved)</li>
                  <li><span class="feature-check">${Icons.check('', 13)}</span> Student Account Provisioning & Activation</li>
                  <li><span class="feature-check">${Icons.check('', 13)}</span> Live Substation Electricity Telemetry</li>
                </ul>
              </div>
              <button class="portal-btn authority-btn" tabindex="-1">
                <span>Enter Authority Portal</span>
                <span class="btn-arrow">${Icons.arrowRight('', 14)}</span>
              </button>
            </div>
          </div>

          <!-- Direct 3D Model Access Bar -->
          <div class="direct-3d-banner" id="direct3DViewBtn" style="cursor:pointer;" role="button" tabindex="0">
            <div class="direct-3d-left">
              <div class="direct-3d-icon-box">
                ${Icons.building('', 22)}
              </div>
              <div class="direct-3d-content">
                <div class="direct-3d-meta-row">
                  <span class="direct-3d-badge">SPATIAL DIGITAL TWIN</span>
                  <span class="direct-3d-submeta">LHC • Atrium • Galleria</span>
                </div>
                <h3>Launch 3D Campus Digital Twin Directly</h3>
                <p>Inspect all three campus buildings with full 360° orbital freedom, floor isolation, restroom directory, and exploded structural view.</p>
              </div>
            </div>
            <button class="direct-3d-action-btn" tabindex="-1">
              <span>Explore 3D Campus</span>
              ${Icons.arrowRight('', 14)}
            </button>
          </div>

          <!-- Authentic Institutional Footer & Security Compliance -->
          <footer class="welcome-footer-bar">
            <div class="footer-top-row">
              <div class="footer-security-notice">
                <span class="shield-badge">${Icons.shield('', 14)} RESTRICTED ACCESS • NIST INTRANET</span>
                <p>Authorized access only. All actions, diagnostic requests, and maintenance logs are encrypted and audited by University Network & Estate Services.</p>
              </div>
              <div class="footer-helpdesk-info">
                <span class="footer-lbl">Facilities & Estate Directorate</span>
                <span class="footer-contact">Internal Support: facilities@nist.edu • Extension 4201 / 4202</span>
              </div>
            </div>
            <div class="footer-bottom-row">
              <span class="footer-copy">© 2026 National Institute of Science and Technology (Autonomous), Berhampur. All rights reserved.</span>
              <div class="footer-status-pill">
                <span class="status-indicator-dot"></span>
                <span>Campus Infrastructure Network • Online</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const studentBtn = this.container.querySelector('#studentPortalBtn');
    if (studentBtn) {
      studentBtn.addEventListener('click', () => {
        if (this.onSelectPortal) this.onSelectPortal('student');
      });
      studentBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (this.onSelectPortal) this.onSelectPortal('student');
        }
      });
    }

    const authorityBtn = this.container.querySelector('#authorityPortalBtn');
    if (authorityBtn) {
      authorityBtn.addEventListener('click', () => {
        if (this.onSelectPortal) this.onSelectPortal('authority');
      });
      authorityBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (this.onSelectPortal) this.onSelectPortal('authority');
        }
      });
    }

    const direct3DBtn = this.container.querySelector('#direct3DViewBtn');
    if (direct3DBtn) {
      direct3DBtn.addEventListener('click', () => {
        if (this.onSelectPortal) this.onSelectPortal('3d');
      });
      direct3DBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (this.onSelectPortal) this.onSelectPortal('3d');
        }
      });
    }
  }
}
