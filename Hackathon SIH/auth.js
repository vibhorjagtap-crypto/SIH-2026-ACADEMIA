/* ============================================================================
   SetuSkill — auth.js (Stage 2 Architecture)
   Handles view routing, password strength evaluation, institute dropdowns,
   registration with combined name fields, login, onboarding wizard, and topbar syncing.
   ============================================================================ */

(function () {
  "use strict";

  const DB = window.SS_DB;

  /* ------------------------------------------------------------------ */
  /* View Routing                                                       */
  /* ------------------------------------------------------------------ */

  const VIEW_IDS = ["view-landing", "view-auth", "view-profile-setup", "view-app"];

  function showView(id) {
    VIEW_IDS.forEach((v) => {
      const el = document.getElementById(v);
      if (el) el.classList.toggle("active", v === id);
    });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  /* ------------------------------------------------------------------ */
  /* Toast Notifications                                                */
  /* ------------------------------------------------------------------ */

  function toast(message, type) {
    const root = document.getElementById("toastRoot");
    if (!root) return;
    const el = document.createElement("div");
    el.className = "toast" + (type ? " toast--" + type : "");
    el.innerHTML = "<span>" + message + "</span>";
    root.appendChild(el);
    setTimeout(() => el.remove(), 3400);
  }

  /* ------------------------------------------------------------------ */
  /* Auth Card Switching                                                */
  /* ------------------------------------------------------------------ */

  function showAuthCard(id) {
    document.querySelectorAll("[data-auth-card]").forEach((card) => {
      card.hidden = card.id !== id;
    });
  }

  function openAuth(cardId) {
    showView("view-auth");
    showAuthCard(cardId || "auth-login");
  }

  /* ------------------------------------------------------------------ */
  /* Module 2: Populate 15 Pune Engineering Colleges                    */
  /* ------------------------------------------------------------------ */

  function populateInstituteSelects() {
    const institutes = DB.Catalog.getInstitutes();
    ["studentInstituteSelect", "facultyInstituteSelect"].forEach((id) => {
      const select = document.getElementById(id);
      if (!select) return;
      // Clear existing options except placeholder
      select.innerHTML = '<option value="">Select Pune Engineering College</option>';
      institutes.forEach((inst) => {
        const opt = document.createElement("option");
        opt.value = inst.id;
        opt.textContent = inst.name + " (" + (inst.location || "Pune") + ")";
        select.appendChild(opt);
      });
    });

    // Populate landing page Pune colleges showcase grid
    const landingGrid = document.getElementById("landingCollegesGrid");
    if (landingGrid) {
      landingGrid.innerHTML = "";
      institutes.forEach((inst) => {
        const card = document.createElement("div");
        card.className = "college-pill-card";
        card.innerHTML = '<span class="college-pill-card__icon">🏛️</span>'
          + '<div><strong>' + inst.name + '</strong><span>' + (inst.location || "Pune, Maharashtra") + '</span></div>';
        landingGrid.appendChild(card);
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Module 2: Interactive Password Strength Meter                      */
  /* ------------------------------------------------------------------ */

  function evaluatePasswordStrength(password) {
    const checks = {
      length: password.length >= 6,
      caseMix: /[A-Z]/.test(password) && /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };
    let score = 0;
    if (checks.length) score++;
    if (checks.caseMix) score++;
    if (checks.hasNumber) score++;
    if (checks.hasSpecial) score++;

    let level = "none";
    let label = "Strength: None";
    if (password.length > 0) {
      if (score <= 2) { level = "weak"; label = "Strength: Weak ⚠️"; }
      else if (score === 3) { level = "medium"; label = "Strength: Medium ⚡"; }
      else if (score >= 4) { level = "strong"; label = "Strength: Strong ✅"; }
    }

    return { score, level, label, checks };
  }

  function setupPasswordMeter(inputId, fillId, labelId, rulePrefix) {
    const input = document.getElementById(inputId);
    const fill = document.getElementById(fillId);
    const label = document.getElementById(labelId);
    if (!input || !fill || !label) return;

    input.addEventListener("input", () => {
      const val = input.value;
      const res = evaluatePasswordStrength(val);

      fill.className = "pw-meter__fill";
      if (res.level === "weak") fill.classList.add("is-weak");
      else if (res.level === "medium") fill.classList.add("is-medium");
      else if (res.level === "strong") fill.classList.add("is-strong");

      label.textContent = res.label;

      const ruleLen = document.getElementById("rule-" + rulePrefix + "-len");
      const ruleCase = document.getElementById("rule-" + rulePrefix + "-case");
      const ruleNum = document.getElementById("rule-" + rulePrefix + "-num");
      const ruleSpec = document.getElementById("rule-" + rulePrefix + "-special");

      if (ruleLen) ruleLen.className = res.checks.length ? "valid" : "";
      if (ruleLen) ruleLen.textContent = (res.checks.length ? "✓" : "✕") + " Min 6 characters";

      if (ruleCase) ruleCase.className = res.checks.caseMix ? "valid" : "";
      if (ruleCase) ruleCase.textContent = (res.checks.caseMix ? "✓" : "✕") + " Uppercase & lowercase";

      if (ruleNum) ruleNum.className = res.checks.hasNumber ? "valid" : "";
      if (ruleNum) ruleNum.textContent = (res.checks.hasNumber ? "✓" : "✕") + " At least 1 number";

      if (ruleSpec) ruleSpec.className = res.checks.hasSpecial ? "valid" : "";
      if (ruleSpec) ruleSpec.textContent = (res.checks.hasSpecial ? "✓" : "✕") + " Special char (!@#$%^&*)";
    });
  }

  function initPasswordMeters() {
    setupPasswordMeter("studentPassword", "studentPwFill", "studentPwLabel", "stu");
    setupPasswordMeter("facultyPassword", "facultyPwFill", "facultyPwLabel", "fac");
  }

  /* ------------------------------------------------------------------ */
  /* Topbar & User Menu Synchronization                                */
  /* ------------------------------------------------------------------ */

  function updateTopbar(user) {
    const nameEl = document.getElementById("topbarName");
    const roleEl = document.getElementById("topbarRole");
    const avatarEl = document.getElementById("topbarAvatar");
    const greetEl = document.getElementById("dashGreetName");
    const dropdownName = document.getElementById("dropdownFullName");
    const dropdownSub = document.getElementById("dropdownSub");
    const facultyPortalBtn = document.getElementById("menuOpenFacultyPortal");

    const displayName = user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.companyName || user.email;
    const initial = displayName.trim().charAt(0).toUpperCase();

    if (nameEl) nameEl.textContent = displayName;
    if (roleEl) roleEl.textContent = user.role === "faculty" ? "Faculty Mentor" : user.role === "industry" ? "Industry Partner" : "Engineering Student";
    if (avatarEl) avatarEl.textContent = initial;
    if (greetEl) greetEl.textContent = displayName.split(" ")[0] || displayName;
    if (dropdownName) dropdownName.textContent = displayName;

    const institute = DB.Catalog.getInstituteById(user.institute);
    if (dropdownSub) dropdownSub.textContent = institute ? institute.name : (user.role === "industry" ? user.sector : "SetuSkill Member");

    if (facultyPortalBtn) {
      facultyPortalBtn.hidden = user.role !== "faculty";
    }
  }

  function enterApp(user) {
    updateTopbar(user);
    showView("view-app");
    if (window.SS_APP && typeof window.SS_APP.init === "function") {
      window.SS_APP.init(user);
    }
  }

  function route(user) {
    if (!user) {
      showView("view-landing");
      return;
    }
    if (user.profileComplete) {
      enterApp(user);
    } else {
      enterProfileSetup(user);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Login Implementation                                               */
  /* ------------------------------------------------------------------ */

  function initLogin() {
    const segmented = document.getElementById("loginRoleSegmented");
    if (segmented) {
      segmented.dataset.selectedRole = "student";
      segmented.querySelectorAll(".segmented__btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          segmented.querySelectorAll(".segmented__btn").forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          segmented.dataset.selectedRole = btn.dataset.role;
        });
      });
    }

    const form = document.getElementById("loginForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const role = segmented ? segmented.dataset.selectedRole : "student";
      const email = form.email.value.trim();
      const password = form.password.value;

      const user = DB.Users.findByEmail(email, role);
      if (!user || user.passwordHash !== DB.mockHash(password)) {
        toast("Email, password or role does not match our records.", "error");
        return;
      }
      DB.Session.set(user.id);
      DB.Activity.log(user.id, "login");
      const name = user.fullName || user.firstName || user.companyName || "there";
      toast("Welcome back, " + name + "! 🚀", "success");
      form.reset();
      route(user);
    });

    // Demo Instant Login Handlers
    function demoLogin(demoId) {
      const user = DB.Users.findById(demoId);
      if (!user) {
        toast("Demo account not found. Resetting seeds...", "error");
        DB.seed();
        return;
      }
      DB.Session.set(user.id);
      DB.Activity.log(user.id, "login");
      const name = user.fullName || user.companyName || "Demo User";
      toast("Instant login as " + name + " (" + user.role + ") 🎓", "success");
      form.reset();
      route(user);
    }

    const demoStudentBtn = document.getElementById("demoLoginStudent");
    const demoFacultyBtn = document.getElementById("demoLoginFaculty");
    const demoIndustryBtn = document.getElementById("demoLoginIndustry");
    if (demoStudentBtn) demoStudentBtn.addEventListener("click", () => demoLogin("demo-student"));
    if (demoFacultyBtn) demoFacultyBtn.addEventListener("click", () => demoLogin("demo-faculty"));
    if (demoIndustryBtn) demoIndustryBtn.addEventListener("click", () => demoLogin("demo-industry"));
  }

  /* ------------------------------------------------------------------ */
  /* Module 2: Registration Handlers with Combined Name Field           */
  /* ------------------------------------------------------------------ */

  function formToObject(form) {
    const data = {};
    const fd = new FormData(form);
    fd.forEach((value, key) => {
      if (key === "terms") return;
      data[key] = typeof value === "string" ? value.trim() : value;
    });
    return data;
  }

  function registerUser(role, form) {
    const data = formToObject(form);
    const email = (data.email || data.businessEmail || "").toLowerCase();

    if (DB.Users.findByEmail(email, role)) {
      toast("An account with this email already exists for this role.", "error");
      return null;
    }

    const password = data.password;
    delete data.password;
    delete data.confirmPassword;

    // Parse Combined Name Field
    if (data.fullName) {
      const parts = data.fullName.trim().split(/\s+/);
      data.firstName = parts[0] || "";
      data.lastName = parts.slice(1).join(" ") || "";
    }

    const user = DB.Users.create(
      Object.assign({}, data, {
        role: role,
        email: email,
        passwordHash: DB.mockHash(password)
      })
    );
    DB.Session.set(user.id);
    return user;
  }

  function initRegisterStudent() {
    const form = document.getElementById("registerStudentForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (form.password.value !== form.confirmPassword.value) {
        toast("Passwords do not match.", "error");
        return;
      }
      if (form.password.value.length < 6) {
        toast("Password must be at least 6 characters.", "error");
        return;
      }
      const user = registerUser("student", form);
      if (!user) return;
      toast("Student account registered! Let's set up your profile.", "success");
      form.reset();
      enterProfileSetup(user);
    });
  }

  function initRegisterFaculty() {
    const form = document.getElementById("registerFacultyForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (form.password.value !== form.confirmPassword.value) {
        toast("Passwords do not match.", "error");
        return;
      }
      const user = registerUser("faculty", form);
      if (!user) return;
      toast("Faculty account created! Completing profile...", "success");
      form.reset();
      enterProfileSetup(user);
    });
  }

  function initRegisterIndustry() {
    const form = document.getElementById("registerIndustryForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = registerUser("industry", form);
      if (!user) return;
      toast("Industry account created! Welcome to SetuSkill.", "success");
      form.reset();
      enterProfileSetup(user);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Profile Setup Wizard                                                */
  /* ------------------------------------------------------------------ */

  const setupState = {
    step: 1,
    totalSteps: 4,
    skillsHave: new Set(),
    skillsLearn: new Set(),
    qualifications: []
  };

  function renderSkillGrid(containerId, allSkills, selectedSet, otherSet, searchTerm) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    const term = (searchTerm || "").toLowerCase();

    allSkills
      .filter((skill) => !otherSet.has(skill))
      .filter((skill) => skill.toLowerCase().includes(term))
      .forEach((skill) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "skill-chip" + (selectedSet.has(skill) ? " is-selected" : "");
        chip.textContent = skill;
        chip.addEventListener("click", () => {
          if (selectedSet.has(skill)) selectedSet.delete(skill);
          else selectedSet.add(skill);
          if (window.SS_RENDER_SKILL_GRIDS) window.SS_RENDER_SKILL_GRIDS();
        });
        container.appendChild(chip);
      });

    if (!container.children.length) {
      const empty = document.createElement("p");
      empty.className = "hint";
      empty.textContent = "No matching skills.";
      container.appendChild(empty);
    }
  }

  function initSkillGrids() {
    const allSkills = DB.Catalog.getSkills();
    const haveSearch = document.getElementById("skillsHaveSearch");
    const learnSearch = document.getElementById("skillsLearnSearch");

    if (haveSearch) haveSearch.addEventListener("input", () => renderSkillGrid("skillsHaveGrid", allSkills, setupState.skillsHave, setupState.skillsLearn, haveSearch.value));
    if (learnSearch) learnSearch.addEventListener("input", () => renderSkillGrid("skillsLearnGrid", allSkills, setupState.skillsLearn, setupState.skillsHave, learnSearch.value));

    window.SS_RENDER_SKILL_GRIDS = function () {
      renderSkillGrid("skillsHaveGrid", allSkills, setupState.skillsHave, setupState.skillsLearn, haveSearch ? haveSearch.value : "");
      renderSkillGrid("skillsLearnGrid", allSkills, setupState.skillsLearn, setupState.skillsHave, learnSearch ? learnSearch.value : "");
    };
    window.SS_RENDER_SKILL_GRIDS();
  }

  function updateSetupUI() {
    const progressBar = document.getElementById("setupProgressBar");
    if (progressBar) progressBar.style.width = Math.round((setupState.step / setupState.totalSteps) * 100) + "%";

    document.querySelectorAll(".setup-step").forEach((stepEl) => {
      stepEl.classList.toggle("is-active", Number(stepEl.dataset.setupStep) === setupState.step);
    });

    document.querySelectorAll("#setupSteps li").forEach((li) => {
      const n = Number(li.dataset.step);
      li.classList.toggle("is-active", n === setupState.step);
      li.classList.toggle("is-done", n < setupState.step);
    });

    const backBtn = document.getElementById("setupBackBtn");
    const nextBtn = document.getElementById("setupNextBtn");
    const finishBtn = document.getElementById("setupFinishBtn");
    if (backBtn) backBtn.disabled = setupState.step === 1;
    if (nextBtn) nextBtn.hidden = setupState.step === setupState.totalSteps;
    if (finishBtn) finishBtn.hidden = setupState.step !== setupState.totalSteps;
  }

  function showRoleFieldsForStep4(role) {
    const studentFields = document.getElementById("setupStudentFields");
    const facultyFields = document.getElementById("setupFacultyFields");
    const industryFields = document.getElementById("setupIndustryFields");
    if (studentFields) studentFields.hidden = role !== "student";
    if (facultyFields) facultyFields.hidden = role !== "faculty";
    if (industryFields) industryFields.hidden = role !== "industry";
  }

  function enterProfileSetup(user) {
    setupState.step = 1;
    setupState.skillsHave = new Set(user.skillsHave || []);
    setupState.skillsLearn = new Set(user.skillsLearn || []);
    setupState.qualifications = [];

    const headlineInput = document.getElementById("setupHeadline");
    if (headlineInput && user.headline) headlineInput.value = user.headline;

    showRoleFieldsForStep4(user.role);
    if (window.SS_RENDER_SKILL_GRIDS) window.SS_RENDER_SKILL_GRIDS();
    updateSetupUI();
    showView("view-profile-setup");
  }

  function initProfileSetupWizard() {
    initSkillGrids();

    const nextBtn = document.getElementById("setupNextBtn");
    const backBtn = document.getElementById("setupBackBtn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (setupState.step < setupState.totalSteps) {
          setupState.step += 1;
          updateSetupUI();
        }
      });
    }
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (setupState.step > 1) {
          setupState.step -= 1;
          updateSetupUI();
        }
      });
    }

    const photoInput = document.getElementById("photoInput");
    if (photoInput) {
      photoInput.addEventListener("change", () => {
        const file = photoInput.files && photoInput.files[0];
        const preview = document.getElementById("photoPreview");
        if (!file || !preview) return;
        const reader = new FileReader();
        reader.onload = () => { preview.innerHTML = '<img src="' + reader.result + '" alt="Profile photo">'; };
        reader.readAsDataURL(file);
      });
    }

    const qualInput = document.querySelector('#profileSetupForm [name="qualifications"]');
    if (qualInput) {
      qualInput.addEventListener("change", () => {
        setupState.qualifications = Array.from(qualInput.files || []).map((f) => f.name);
        const list = document.getElementById("qualificationsList");
        if (!list) return;
        list.innerHTML = setupState.qualifications.length
          ? "<ul>" + setupState.qualifications.map((n) => "<li>📄 " + n + "</li>").join("") + "</ul>"
          : "";
      });
    }

    const tpoToggle = document.getElementById("tpoToggle");
    if (tpoToggle) {
      tpoToggle.addEventListener("change", () => {
        const field = document.getElementById("tpoIdField");
        if (field) field.hidden = !tpoToggle.checked;
      });
    }

    const form = document.getElementById("profileSetupForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = DB.Session.currentUser();
      if (!user) { showView("view-landing"); return; }

      const patch = {
        headline: document.getElementById("setupHeadline") ? document.getElementById("setupHeadline").value.trim() : "",
        skillsHave: Array.from(setupState.skillsHave),
        skillsLearn: Array.from(setupState.skillsLearn),
        qualifications: setupState.qualifications.slice(),
        profileComplete: true
      };

      if (user.role === "student") {
        patch.branch = form.branch.value;
        patch.currentYear = form.currentYear.value;
        patch.dob = document.getElementById("studentDob").value;
        patch.dobLocked = true;
      } else if (user.role === "faculty") {
        patch.facultyDepartment = form.facultyDepartment.value;
        patch.isTpo = !!(document.getElementById("tpoToggle") && document.getElementById("tpoToggle").checked);
        patch.tpoId = patch.isTpo ? form.tpoId.value : "";
      }

      const updated = DB.Users.update(user.id, patch);
      DB.Activity.log(user.id, "profile_setup_completed");
      toast("Profile verified & saved! Welcome to SetuSkill.", "success");
      enterApp(updated);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Global Navigation & User Menu Listeners                             */
  /* ------------------------------------------------------------------ */

  function initGlobalListeners() {
    // Auth modals / triggers
    document.querySelectorAll('[data-open-auth]').forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        openAuth(el.dataset.openAuth === "role-select" ? "auth-role-select" : "auth-login");
      });
    });

    document.querySelectorAll('[data-switch-auth]').forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const target = el.dataset.switchAuth;
        showAuthCard(target === "role-select" ? "auth-role-select" : target === "login" ? "auth-login" : target);
      });
    });

    document.querySelectorAll('[data-select-role]').forEach((el) => {
      el.addEventListener("click", () => {
        showAuthCard("auth-register-" + el.dataset.selectRole);
      });
    });

    document.querySelectorAll('[data-nav="landing"]').forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        showView("view-landing");
      });
    });

    const closeBtn = document.getElementById("authCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", () => showView("view-landing"));

    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const siteNav = document.querySelector(".site-nav");
    if (hamburgerBtn && siteNav) {
      hamburgerBtn.addEventListener("click", () => {
        siteNav.classList.toggle("is-open");
      });
    }

    // Top Nav User Dropdown Toggle
    const userAvatarBtn = document.getElementById("userAvatarBtn");
    const userDropdownMenu = document.getElementById("userDropdownMenu");
    if (userAvatarBtn && userDropdownMenu) {
      userAvatarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdownMenu.hidden = !userDropdownMenu.hidden;
      });
      document.addEventListener("click", (e) => {
        if (!userDropdownMenu.hidden && !e.target.closest("#userMenuWrap")) {
          userDropdownMenu.hidden = true;
        }
      });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        DB.Session.clear();
        showView("view-landing");
        toast("You have signed out.");
        if (userDropdownMenu) userDropdownMenu.hidden = true;
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                               */
  /* ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", () => {
    DB.seed();
    populateInstituteSelects();
    initPasswordMeters();
    initGlobalListeners();
    initLogin();
    initRegisterStudent();
    initRegisterFaculty();
    initRegisterIndustry();
    initProfileSetupWizard();

    const existingUser = DB.Session.currentUser();
    if (existingUser) {
      route(existingUser);
    }
  });

  window.SS_AUTH = { showView, toast, enterApp, enterProfileSetup, updateTopbar };
})();
