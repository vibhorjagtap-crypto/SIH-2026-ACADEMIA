/* ============================================================================
   SetuSkill — auth.js
   View routing, authentication (login/register for 3 roles), and the
   4-step profile setup wizard. Talks to backend.js (window.SS_DB) for all
   persistence and hands off to app.js (window.SS_APP.init) once a user
   lands on the dashboard.
   ============================================================================ */

(function () {
  "use strict";

  const DB = window.SS_DB;

  /* ------------------------------------------------------------------ */
  /* View routing                                                        */
  /* ------------------------------------------------------------------ */

  const VIEW_IDS = ["view-landing", "view-auth", "view-profile-setup", "view-app"];

  function showView(id) {
    VIEW_IDS.forEach((v) => {
      const el = document.getElementById(v);
      if (el) el.classList.toggle("active", v === id);
    });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    document.getElementById("appSidebar") && document.getElementById("appSidebar").classList.remove("is-open");
  }

  /* ------------------------------------------------------------------ */
  /* Toasts                                                              */
  /* ------------------------------------------------------------------ */

  function toast(message, type) {
    const root = document.getElementById("toastRoot");
    if (!root) return;
    const el = document.createElement("div");
    el.className = "toast" + (type ? " toast--" + type : "");
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  /* ------------------------------------------------------------------ */
  /* Auth card switching (inside #view-auth)                            */
  /* ------------------------------------------------------------------ */

  function showAuthCard(id) {
    document.querySelectorAll("[data-auth-card]").forEach((card) => {
      card.hidden = card.id !== id;
    });
  }

  function openAuth(cardId) {
    showView("view-auth");
    showAuthCard(cardId || "login");
  }

  /* ------------------------------------------------------------------ */
  /* Institute dropdowns                                                */
  /* ------------------------------------------------------------------ */

  function populateInstituteSelects() {
    const institutes = DB.Catalog.getInstitutes();
    ["studentInstituteSelect", "facultyInstituteSelect"].forEach((id) => {
      const select = document.getElementById(id);
      if (!select) return;
      institutes.forEach((inst) => {
        const opt = document.createElement("option");
        opt.value = inst.id;
        opt.textContent = inst.name;
        select.appendChild(opt);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Routing after login / registration / resumed session               */
  /* ------------------------------------------------------------------ */

  function route(user) {
    if (!user) { showView("view-landing"); return; }
    if (user.profileComplete) {
      enterApp(user);
    } else {
      enterProfileSetup(user);
    }
  }

  function updateTopbar(user) {
    const nameEl = document.getElementById("topbarName");
    const roleEl = document.getElementById("topbarRole");
    const avatarEl = document.getElementById("topbarAvatar");
    const greetEl = document.getElementById("dashGreetName");
    const displayName = user.role === "industry" ? (user.companyName || "Industry Partner") : [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
    if (nameEl) nameEl.textContent = displayName;
    if (roleEl) roleEl.textContent = user.role === "faculty" ? "Institute / Faculty" : user.role;
    if (avatarEl) avatarEl.textContent = (displayName || "?").trim().charAt(0).toUpperCase();
    if (greetEl) greetEl.textContent = user.role === "industry" ? displayName : (user.firstName || displayName);
  }

  function enterApp(user) {
    updateTopbar(user);
    showView("view-app");
    if (window.SS_APP && typeof window.SS_APP.init === "function") {
      window.SS_APP.init(user);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Login                                                               */
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
        toast("Email, password or role doesn't match our records.", "error");
        return;
      }
      DB.Session.set(user.id);
      DB.Activity.log(user.id, "login");
      toast("Welcome back, " + (user.firstName || user.companyName || "there") + "!", "success");
      form.reset();
      route(user);
    });

    // ---- Demo instant-login buttons ----
    function demoLogin(demoId) {
      const user = DB.Users.findById(demoId);
      if (!user) {
        toast("Demo account not found. Please refresh the page.", "error");
        return;
      }
      DB.Session.set(user.id);
      DB.Activity.log(user.id, "login");
      const name = user.firstName || user.companyName || "Demo User";
      toast("Instant login as " + name + " (" + user.role + ") 🚀", "success");
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
  /* Registration — shared helpers                                      */
  /* ------------------------------------------------------------------ */

  function formToObject(form, fileFieldNames) {
    const data = {};
    const fd = new FormData(form);
    fd.forEach((value, key) => {
      if (fileFieldNames && fileFieldNames.includes(key)) return; // handled separately
      if (key === "terms") return;
      data[key] = typeof value === "string" ? value.trim() : value;
    });
    (fileFieldNames || []).forEach((key) => {
      const input = form.querySelector('[name="' + key + '"]');
      if (input && input.files && input.files[0]) {
        data[key + "FileName"] = input.files[0].name;
      }
    });
    return data;
  }

  function registerUser(role, form, fileFieldNames) {
    const data = formToObject(form, fileFieldNames);
    const email = (data.email || data.businessEmail || "").toLowerCase();

    if (DB.Users.findByEmail(email, role)) {
      toast("An account with this email already exists for this role.", "error");
      return null;
    }

    const password = data.password;
    delete data.password;
    delete data.confirmPassword;

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
      const user = registerUser("student", form, ["idCard"]);
      if (!user) return;
      toast("Student account created. Let's set up your profile.", "success");
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
      const user = registerUser("faculty", form, ["idCard"]);
      if (!user) return;
      toast("Faculty account created. Let's set up your profile.", "success");
      form.reset();
      enterProfileSetup(user);
    });
  }

  function initRegisterIndustry() {
    const form = document.getElementById("registerIndustryForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = registerUser("industry", form, []);
      if (!user) return;
      toast("Industry account created. A few more details to go.", "success");
      form.reset();
      enterProfileSetup(user);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Profile setup wizard                                                */
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
          // Re-render both grids: freeing a skill from one set makes it
          // selectable again in the other.
          if (window.SS_RENDER_SKILL_GRIDS) window.SS_RENDER_SKILL_GRIDS();
          else renderSkillGrid(containerId, allSkills, selectedSet, otherSet, searchTerm);
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

    // Exposed so a skill toggled in one grid can refresh the other (a skill
    // removed from "have" must reappear as selectable in "learn", and vice versa).
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

  function resetSetupWizard(user) {
    setupState.step = 1;
    setupState.skillsHave = new Set(user.skillsHave || []);
    setupState.skillsLearn = new Set(user.skillsLearn || []);
    setupState.qualifications = [];

    const form = document.getElementById("profileSetupForm");
    if (form) form.reset();

    const preview = document.getElementById("photoPreview");
    if (preview) preview.innerHTML = "📷";

    const qualList = document.getElementById("qualificationsList");
    if (qualList) qualList.innerHTML = "";

    const tpoIdField = document.getElementById("tpoIdField");
    if (tpoIdField) tpoIdField.hidden = true;

    showRoleFieldsForStep4(user.role);
    if (window.SS_RENDER_SKILL_GRIDS) window.SS_RENDER_SKILL_GRIDS();
    updateSetupUI();
  }

  function enterProfileSetup(user) {
    resetSetupWizard(user);
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
        reader.onload = () => { preview.innerHTML = '<img src="' + reader.result + '" alt="Profile photo preview">'; };
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
        document.getElementById("studentDob").disabled = true;
      } else if (user.role === "faculty") {
        patch.facultyDepartment = form.facultyDepartment.value;
        patch.isTpo = !!(document.getElementById("tpoToggle") && document.getElementById("tpoToggle").checked);
        patch.tpoId = patch.isTpo ? form.tpoId.value : "";
      }

      const updated = DB.Users.update(user.id, patch);
      DB.Activity.log(user.id, "profile_setup_completed");
      toast("Profile set up. Welcome to your dashboard!", "success");
      enterApp(updated);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Logout & landing navigation                                        */
  /* ------------------------------------------------------------------ */

  function initLogout() {
    const btn = document.getElementById("logoutBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      DB.Session.clear();
      showView("view-landing");
      toast("You've been logged out.");
    });
  }

  function initGlobalNav() {
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
        const open = siteNav.classList.toggle("is-open");
        hamburgerBtn.setAttribute("aria-expanded", String(open));
      });
    }

    const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    const sidebar = document.getElementById("appSidebar");
    if (sidebarToggleBtn && sidebar) {
      sidebarToggleBtn.addEventListener("click", () => sidebar.classList.toggle("is-open"));
    }
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", () => {
    DB.seed();
    populateInstituteSelects();

    initGlobalNav();
    initLogin();
    initRegisterStudent();
    initRegisterFaculty();
    initRegisterIndustry();
    initProfileSetupWizard();
    initLogout();

    const existingUser = DB.Session.currentUser();
    if (existingUser) {
      route(existingUser);
    }
  });

  // Exposed for app.js (logout button lives in the app shell, but a
  // consistent single entry point keeps behaviour predictable).
  window.SS_AUTH = { showView, toast, enterApp, enterProfileSetup };
})();
