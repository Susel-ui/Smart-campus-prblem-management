/**
 * AuthManager.js - Role-Based Authentication & Session Guard
 * 
 * Handles:
 * - Student Login (Reg No + Password; no self-registration)
 * - Authority Login & Sign-up (requires admin invite key)
 * - Password verification via SHA-256
 * - Active session persistence & Role-Based Access Control (RBAC)
 */

import { campusData, hashPassword } from '../data/DataManager.js';

const SESSION_KEY = 'NIST_CAMPUS_USER_SESSION';

class AuthManager {
  constructor() {
    this.currentUser = this.loadSession();
  }

  loadSession() {
    try {
      const data = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveSession(user, remember = true) {
    this.currentUser = user;
    const json = JSON.stringify(user);
    sessionStorage.setItem(SESSION_KEY, json);
    if (remember) {
      localStorage.setItem(SESSION_KEY, json);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  isStudent() {
    return this.currentUser && (this.currentUser.role?.toUpperCase() === 'STUDENT');
  }

  isAuthority() {
    return this.currentUser && (this.currentUser.role?.toUpperCase() === 'AUTHORITY');
  }

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  async loginStudent(regNo, password) {
    if (!regNo || !password) {
      throw new Error("Please enter both Registration Number and Password.");
    }

    const cleanReg = regNo.trim().toUpperCase();
    const student = campusData.getStudentByRegNo(cleanReg);

    if (!student) {
      throw new Error("Student account not found. Only college authorities can provision student accounts.");
    }

    const statusNorm = (student.status || 'active').toLowerCase();
    if (statusNorm !== 'active') {
      throw new Error("Your account has been deactivated by the college administration. Please contact facilities administration.");
    }

    const hashedInput = await hashPassword(password);
    if (hashedInput !== student.passwordHash) {
      throw new Error("Invalid password. Please check your credentials.");
    }

    // Sanitize session object
    const sessionUser = {
      role: 'STUDENT',
      regNo: student.regNo,
      fullName: student.fullName,
      email: student.email,
      department: student.department,
      batch: student.batch
    };

    this.saveSession(sessionUser);
    return sessionUser;
  }

  async loginAuthority(identifier, password) {
    if (!identifier || !password) {
      throw new Error("Please enter your Official Email / Employee ID and Password.");
    }

    const authority = campusData.getAuthorityByEmailOrEmpId(identifier);
    if (!authority) {
      throw new Error("Authority account not found. Please verify your credentials or register with an administrator invitation code.");
    }

    const hashedInput = await hashPassword(password);
    if (hashedInput !== authority.passwordHash) {
      throw new Error("Incorrect password for authority account.");
    }

    const sessionUser = {
      role: 'AUTHORITY',
      id: authority.id,
      empId: authority.empId,
      fullName: authority.fullName,
      email: authority.email,
      title: authority.title
    };

    this.saveSession(sessionUser);
    return sessionUser;
  }

  async registerAuthority({ fullName, email, empId, password, confirmPassword, inviteCode }) {
    if (!fullName || !email || !empId || !password) {
      throw new Error("All fields are required for authority registration.");
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    const newAuth = await campusData.registerAuthority({
      fullName,
      email,
      empId,
      password,
      inviteCode
    });

    const sessionUser = {
      role: 'AUTHORITY',
      id: newAuth.id,
      empId: newAuth.empId,
      fullName: newAuth.fullName,
      email: newAuth.email,
      title: newAuth.title
    };

    this.saveSession(sessionUser);
    return sessionUser;
  }
}

export const authManager = new AuthManager();
