/**
 * AuthView.js - Dedicated Authentication Views for Student and Authority Portals
 * 
 * Features:
 * - Enterprise institutional authentication UI
 * - Crisp SVG iconography (zero raw emojis)
 * - Strict institutional account policies
 * - Client-side validation with clean feedback banners
 */

import { authManager } from '../auth/AuthManager.js';
import { Icons } from '../ui/icons.js';

export class AuthView {
  constructor(containerElement, onAuthSuccess, onBackToWelcome) {
    this.container = containerElement;
    this.onAuthSuccess = onAuthSuccess;
    this.onBackToWelcome = onBackToWelcome;
    this.portalType = 'student'; // 'student' | 'authority'
    this.authTab = 'login'; // for authority: 'login' | 'signup'
  }

  render(portalType = 'student') {
    this.portalType = portalType;
    this.authTab = 'login';
    this.renderView();
  }

  renderView() {
    this.container.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <!-- Back button -->
          <button class="back-link-btn" id="backToWelcomeBtn">
            ${Icons.arrowLeft('', 14)}
            <span>Back to Portal Selection</span>
          </button>

          ${this.portalType === 'student' ? this.renderStudentForm() : this.renderAuthorityForm()}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderStudentForm() {
    return `
      <div class="auth-header">
        <div class="auth-icon-badge student-badge">
          ${Icons.graduate('', 24)}
        </div>
        <h2 class="auth-title">Student Portal Login</h2>
        <p class="auth-sub">Enter your student credentials provisioned by the NIST college administration.</p>
      </div>

      <div id="authErrorBanner" class="auth-error-banner" style="display:none;"></div>

      <form class="auth-form" id="studentLoginForm">
        <div class="form-group">
          <label for="studentRegNo">Student Registration Number / Student ID</label>
          <div class="input-with-icon">
            <span class="input-icon">${Icons.idCard('', 16)}</span>
            <input type="text" id="studentRegNo" placeholder="Enter Registration Number (e.g. 2024NISTXXXX)" required autocomplete="username" />
          </div>
        </div>

        <div class="form-group">
          <label for="studentPassword">Account Password</label>
          <div class="input-with-icon">
            <span class="input-icon">${Icons.lock('', 16)}</span>
            <input type="password" id="studentPassword" placeholder="••••••••" required autocomplete="current-password" />
          </div>
        </div>

        <!-- Strict Instruction Callout -->
        <div class="auth-notice-box student-notice">
          <span class="notice-icon">${Icons.info('', 16)}</span>
          <div>
            <strong>Institutional Account Policy:</strong>
            Students cannot independently register or self-create accounts. All student access is provisioned by the campus physical plant and academic administration.
          </div>
        </div>

        <button type="submit" class="auth-submit-btn student-submit">
          <span>Authenticate & Open Dashboard</span>
          <span class="btn-arrow">${Icons.arrowRight('', 14)}</span>
        </button>
      </form>
    `;
  }

  renderAuthorityForm() {
    return `
      <div class="auth-header">
        <div class="auth-icon-badge auth-badge">
          ${Icons.shield('', 24)}
        </div>
        <h2 class="auth-title">Authority & Facilities Portal</h2>
        <p class="auth-sub">Administrative access for facilities management, work order dispatch, and campus monitoring.</p>
      </div>

      <!-- Login / Signup Tabs -->
      <div class="auth-tabs-row">
        <button class="auth-tab-btn ${this.authTab === 'login' ? 'active' : ''}" id="tabAuthLogin">
          Authority Login
        </button>
        <button class="auth-tab-btn ${this.authTab === 'signup' ? 'active' : ''}" id="tabAuthSignup">
          Authority Sign-up
        </button>
      </div>

      <div id="authErrorBanner" class="auth-error-banner" style="display:none;"></div>

      ${this.authTab === 'login' ? this.renderAuthorityLoginForm() : this.renderAuthoritySignupForm()}
    `;
  }

  renderAuthorityLoginForm() {
    return `
      <form class="auth-form" id="authorityLoginForm">
        <div class="form-group">
          <label for="authIdentifier">Official Email or Employee ID</label>
          <div class="input-with-icon">
            <span class="input-icon">${Icons.idCard('', 16)}</span>
            <input type="text" id="authIdentifier" placeholder="Official @nist.edu email or Employee ID" required autocomplete="username" />
          </div>
        </div>

        <div class="form-group">
          <label for="authPassword">Password</label>
          <div class="input-with-icon">
            <span class="input-icon">${Icons.lock('', 16)}</span>
            <input type="password" id="authPassword" placeholder="••••••••" required autocomplete="current-password" />
          </div>
        </div>

        <button type="submit" class="auth-submit-btn authority-submit">
          <span>Sign In to Facilities Dashboard</span>
          <span class="btn-arrow">${Icons.arrowRight('', 14)}</span>
        </button>
      </form>
    `;
  }

  renderAuthoritySignupForm() {
    return `
      <form class="auth-form" id="authoritySignupForm">
        <div class="form-group">
          <label for="authFullName">Full Name & Academic Title</label>
          <div class="input-with-icon">
            <span class="input-icon">${Icons.users('', 16)}</span>
            <input type="text" id="authFullName" placeholder="e.g. Prof. Ramesh Chandra" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="authEmail">Official University Email</label>
            <div class="input-with-icon">
              <span class="input-icon">${Icons.idCard('', 16)}</span>
              <input type="email" id="authEmail" placeholder="name@nist.edu" required />
            </div>
          </div>
          <div class="form-group">
            <label for="authEmpId">Employee ID</label>
            <div class="input-with-icon">
              <span class="input-icon">${Icons.shield('', 16)}</span>
              <input type="text" id="authEmpId" placeholder="e.g. EMP-ENG-08" required />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="authSignupPassword">Password</label>
            <div class="input-with-icon">
              <span class="input-icon">${Icons.lock('', 16)}</span>
              <input type="password" id="authSignupPassword" placeholder="Min. 6 chars" required />
            </div>
          </div>
          <div class="form-group">
            <label for="authConfirmPassword">Confirm Password</label>
            <div class="input-with-icon">
              <span class="input-icon">${Icons.lock('', 16)}</span>
              <input type="password" id="authConfirmPassword" placeholder="Repeat password" required />
            </div>
          </div>
        </div>

        <div class="form-group highlight-group">
          <label for="authInviteCode">
            <span>Administrator Invitation Code</span>
            <span class="code-badge">MANDATORY</span>
          </label>
          <div class="input-with-icon">
            <span class="input-icon">${Icons.key('', 16)}</span>
            <input type="password" id="authInviteCode" placeholder="Enter issued administrative security key" required autocomplete="off" />
          </div>
          <span class="input-hint">Restricted to authorized university personnel with an administrative invite key.</span>
        </div>

        <button type="submit" class="auth-submit-btn authority-submit">
          <span>Provision Authority Account</span>
          <span class="btn-arrow">${Icons.arrowRight('', 14)}</span>
        </button>
      </form>
    `;
  }

  showError(message) {
    const banner = this.container.querySelector('#authErrorBanner');
    if (banner) {
      banner.textContent = message;
      banner.style.display = 'block';
    }
  }

  hideError() {
    const banner = this.container.querySelector('#authErrorBanner');
    if (banner) banner.style.display = 'none';
  }

  attachEvents() {
    const backBtn = this.container.querySelector('#backToWelcomeBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.onBackToWelcome) this.onBackToWelcome();
      });
    }

    // Tabs for authority
    const tabLogin = this.container.querySelector('#tabAuthLogin');
    const tabSignup = this.container.querySelector('#tabAuthSignup');
    if (tabLogin && tabSignup) {
      tabLogin.addEventListener('click', () => {
        this.authTab = 'login';
        this.renderView();
      });
      tabSignup.addEventListener('click', () => {
        this.authTab = 'signup';
        this.renderView();
      });
    }

    // Student Login Submit
    const studentForm = this.container.querySelector('#studentLoginForm');
    if (studentForm) {
      studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        this.hideError();
        const regNo = document.getElementById('studentRegNo').value;
        const password = document.getElementById('studentPassword').value;

        try {
          const user = await authManager.loginStudent(regNo, password);
          if (this.onAuthSuccess) this.onAuthSuccess(user);
        } catch (err) {
          this.showError(err.message);
        }
      });
    }

    // Authority Login Submit
    const authLoginForm = this.container.querySelector('#authorityLoginForm');
    if (authLoginForm) {
      authLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        this.hideError();
        const identifier = document.getElementById('authIdentifier').value;
        const password = document.getElementById('authPassword').value;

        try {
          const user = await authManager.loginAuthority(identifier, password);
          if (this.onAuthSuccess) this.onAuthSuccess(user);
        } catch (err) {
          this.showError(err.message);
        }
      });
    }

    // Authority Signup Submit
    const authSignupForm = this.container.querySelector('#authoritySignupForm');
    if (authSignupForm) {
      authSignupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        this.hideError();

        const fullName = document.getElementById('authFullName').value;
        const email = document.getElementById('authEmail').value;
        const empId = document.getElementById('authEmpId').value;
        const password = document.getElementById('authSignupPassword').value;
        const confirmPassword = document.getElementById('authConfirmPassword').value;
        const inviteCode = document.getElementById('authInviteCode').value;

        try {
          const user = await authManager.registerAuthority({
            fullName,
            email,
            empId,
            password,
            confirmPassword,
            inviteCode
          });
          if (this.onAuthSuccess) this.onAuthSuccess(user);
        } catch (err) {
          this.showError(err.message);
        }
      });
    }
  }
}
