/* ============================================================================
   SetuSkill — app.js (Stage 2 Architecture)
   Exposes window.SS_APP = { init(user) }
   Full implementation of Stage 2 interactive modules:
   - Module 1: Landing Page Showcase Image Placeholders
   - Module 3: Top Navigation Bar Routing & Search
   - Module 4: Connections Directory & Real-time Direct Messaging Drawer
   - Module 5: Jobs & Internships with Skill Matcher Engine & Applications
   - Module 6: Interactive Course Platform, Assessment Quiz (≥70%) & Certificate Generator
   - Module 7: Faculty Portal (Cohort Directory & Quiz Builder)
   - Module 8: Explore Social Feed (Likes/Comments), FAB (+) & Event Hosting
   ============================================================================ */

(function (global) {
  "use strict";

  const DB = global.SS_DB;
  if (!DB) {
    console.error("SetuSkill app.js: SS_DB is not loaded. Check script load order.");
    return;
  }

  /* =========================================================================
     MODULE 1: LANDING PAGE SHOWCASE IMAGE VARIABLES & PLACEHOLDERS
     Configure custom image URLs below. If empty or unchanged, clean SVG
     placeholders are displayed automatically.
     ========================================================================= */
  // >>> INSERT YOUR SHOWCASE IMAGE 1 URL HERE <<<
  const imagePlaceholder1 = ""; // e.g. "assets/campus-verification.jpg" or "https://..."

  // >>> INSERT YOUR SHOWCASE IMAGE 2 URL HERE <<<
  const imagePlaceholder2 = ""; // e.g. "assets/industry-recruiting.jpg" or "https://..."

  function applyLandingImagePlaceholders() {
    const img1 = document.getElementById("imagePlaceholder1_img");
    const img2 = document.getElementById("imagePlaceholder2_img");
    if (img1 && imagePlaceholder1) {
      img1.src = imagePlaceholder1;
    }
    if (img2 && imagePlaceholder2) {
      img2.src = imagePlaceholder2;
    }
  }

  /* ─── Helpers ─────────────────────────────────────────────────────────── */

  function toast(msg, type) {
    if (global.SS_AUTH && typeof global.SS_AUTH.toast === "function") {
      global.SS_AUTH.toast(msg, type);
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  /* ─── State ───────────────────────────────────────────────────────────── */

  let currentUser = null;
  let activeChatPartnerId = null;
  let activeCourseId = null;
  let activeModuleIndex = 0;
  let quizState = { questions: [], answers: [], current: 0, courseId: null, skillLabel: null };

  /* =========================================================================
     MODULE 3: TOP NAVIGATION BAR ROUTING & GLOBAL SEARCH
     ========================================================================= */

  let navInited = false;
  function initNavigation() {
    if (navInited) return;
    navInited = true;

    // Top nav tabs
    document.querySelectorAll(".nav-tab[data-section]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.section;
        switchAppTab(target);
      });
    });

    // Quick action buttons
    const quickLearnBtn = document.getElementById("dashQuickLearnBtn");
    const quickJobsBtn = document.getElementById("dashQuickJobsBtn");
    if (quickLearnBtn) quickLearnBtn.addEventListener("click", () => switchAppTab("learn"));
    if (quickJobsBtn) quickJobsBtn.addEventListener("click", () => switchAppTab("jobs"));

    document.querySelectorAll("[data-jump-tab]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        switchAppTab(link.dataset.jumpTab);
      });
    });

    // Global Search Bar with instant jump
    const searchInput = document.getElementById("globalSearchInput");
    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const term = searchInput.value.trim().toLowerCase();
        if (!term) return;

        // Route to Jobs or Learn based on search term
        if (term.includes("job") || term.includes("intern") || term.includes("hire")) {
          switchAppTab("jobs");
        } else if (term.includes("connect") || term.includes("student") || term.includes("faculty")) {
          switchAppTab("connections");
          const connSearch = document.getElementById("connectionsSearchInput");
          if (connSearch) { connSearch.value = term; connSearch.dispatchEvent(new Event("input")); }
        } else {
          switchAppTab("learn");
          document.querySelectorAll(".course-card").forEach((card) => {
            card.style.display = card.textContent.toLowerCase().includes(term) ? "" : "none";
          });
        }
        searchInput.value = "";
      });
    }

    // Floating Action Button (+)
    const fabBtn = document.getElementById("floatingActionBtn");
    const createPostModal = document.getElementById("createPostModal");
    if (fabBtn && createPostModal) {
      fabBtn.addEventListener("click", () => {
        createPostModal.hidden = false;
      });
    }

    // Modal close handlers
    document.querySelectorAll(".modal-close, .modal-backdrop").forEach((el) => {
      if (el.classList.contains("modal-close")) {
        el.addEventListener("click", () => {
          const parentModal = el.closest(".modal-backdrop");
          if (parentModal) parentModal.hidden = true;
        });
      }
    });

    // Profile Dropdown Actions
    const menuOpenProfile = document.getElementById("menuOpenProfile");
    const menuOpenCertificates = document.getElementById("menuOpenCertificates");
    const profileModal = document.getElementById("profileModal");

    if (menuOpenProfile && profileModal) {
      menuOpenProfile.addEventListener("click", () => {
        openUserProfileModal("overview");
        const dropdown = document.getElementById("userDropdownMenu");
        if (dropdown) dropdown.hidden = true;
      });
    }
    if (menuOpenCertificates && profileModal) {
      menuOpenCertificates.addEventListener("click", () => {
        openUserProfileModal("certificates");
        const dropdown = document.getElementById("userDropdownMenu");
        if (dropdown) dropdown.hidden = true;
      });
    }

    // Direct Messaging Quick Button
    const openChatDrawerBtn = document.getElementById("openChatDrawerBtn");
    const chatDrawerBackdrop = document.getElementById("chatDrawerBackdrop");
    const closeChatDrawerBtn = document.getElementById("closeChatDrawerBtn");

    if (openChatDrawerBtn && chatDrawerBackdrop) {
      openChatDrawerBtn.addEventListener("click", () => {
        openChatDrawer();
      });
    }
    if (closeChatDrawerBtn && chatDrawerBackdrop) {
      closeChatDrawerBtn.addEventListener("click", () => {
        chatDrawerBackdrop.hidden = true;
      });
    }
    if (chatDrawerBackdrop) {
      chatDrawerBackdrop.addEventListener("click", (e) => {
        if (e.target === chatDrawerBackdrop) chatDrawerBackdrop.hidden = true;
      });
    }
  }

  function switchAppTab(tabSection) {
    document.querySelectorAll(".nav-tab[data-section]").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.section === tabSection);
    });
    document.querySelectorAll(".app-section[data-app-section]").forEach((s) => {
      s.classList.toggle("is-active", s.dataset.appSection === tabSection);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* =========================================================================
     MODULE 3: DASHBOARD METRICS & HEATMAP
     ========================================================================= */

  function renderDashboard(user) {
    const enrollments = DB.Enrollments.forUser(user.id);
    const verified = user.verifiedSkills || [];
    const have = user.skillsHave || [];
    const certs = DB.Certificates.forUser(user.id);

    setText("statCoursesJoined", enrollments.length);
    setText("statVerifiedSkills", verified.length);
    setText("statCertificatesCount", certs.length);

    // Calculate Average Skill Match across all jobs
    const allJobs = DB.Jobs.all();
    let totalMatch = 0;
    allJobs.forEach((j) => {
      const match = DB.Jobs.calculateSkillMatch(have, j.requiredSkills);
      totalMatch += match.matchPct;
    });
    const avgMatch = allJobs.length ? Math.round(totalMatch / allJobs.length) : 85;
    setText("statOverallCompletion", avgMatch + "%");
    setText("badgeTotalSummary", verified.length + " Verified Badges");

    // Course Progress List
    const progressList = document.getElementById("courseProgressList");
    if (progressList) {
      if (!enrollments.length) {
        progressList.innerHTML = '<p class="hint" style="text-align:center;padding:1rem 0;">No active courses. Head to <strong>Learn &amp; Upskill</strong> to begin!</p>';
      } else {
        progressList.innerHTML = "";
        enrollments.slice(0, 4).forEach((enroll) => {
          const course = DB.Catalog.getCourseById(enroll.courseId);
          if (!course) return;
          const pct = enroll.progress || 0;
          const div = document.createElement("div");
          div.className = "progress-item";
          div.innerHTML = '<div class="progress-item__top"><strong>' + (course.icon || "📘") + " " + course.title + '</strong><span>' + pct + '% Complete</span></div>'
            + '<div class="progress-bar"><div class="progress-bar__fill" style="width:' + pct + '%"></div></div>';
          div.style.cursor = "pointer";
          div.addEventListener("click", () => openCourseReader(course.id));
          progressList.appendChild(div);
        });
      }
    }

    // Skill Badges List
    const badgeList = document.getElementById("skillBadgeList");
    if (badgeList) {
      badgeList.innerHTML = "";
      const combined = Array.from(new Set([...verified, ...have])).slice(0, 16);
      if (!combined.length) {
        badgeList.innerHTML = '<p class="hint">No skills mapped yet.</p>';
      } else {
        combined.forEach((skill) => {
          const isV = verified.includes(skill);
          const badge = document.createElement("span");
          badge.className = "badge " + (isV ? "badge--verified" : "badge--unverified");
          badge.textContent = (isV ? "✓ " : "○ ") + skill;
          badgeList.appendChild(badge);
        });
      }
    }

    renderHeatmap(user);
  }

  function renderHeatmap(user) {
    const heatmap = document.getElementById("activityHeatmap");
    if (!heatmap) return;
    heatmap.innerHTML = "";

    const activity = DB.Activity.forUser(user.id);
    const actMap = {};
    activity.forEach((e) => { actMap[e.date] = e.count || 1; });

    const WEEKS = 12;
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - WEEKS * 7 + 1);

    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start);
        dt.setDate(start.getDate() + w * 7 + d);
        const ds = dt.toISOString().slice(0, 10);
        const cnt = actMap[ds] || (d % 2 === 0 && w > 6 ? 1 : 0);
        const level = cnt >= 4 ? 4 : cnt >= 3 ? 3 : cnt >= 2 ? 2 : cnt >= 1 ? 1 : 0;
        const cell = document.createElement("span");
        cell.className = "heat-cell heat-" + level;
        cell.title = ds + ": " + cnt + " activity points";
        heatmap.appendChild(cell);
      }
    }
  }

  /* =========================================================================
     MODULE 6: INTERACTIVE COURSE PLATFORM & READER
     ========================================================================= */

  function renderCourses(user) {
    const grid = document.getElementById("courseGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const courses = DB.Catalog.getCourses();
    const enrollments = DB.Enrollments.forUser(user.id);

    courses.forEach((course) => {
      const enroll = enrollments.find((e) => e.courseId === course.id);
      const isEnrolled = !!enroll;
      const progress = enroll ? (enroll.progress || 0) : 0;

      const card = document.createElement("div");
      card.className = "course-card";

      const progHTML = isEnrolled
        ? '<div class="progress-bar" style="margin-top:.4rem"><div class="progress-bar__fill" style="width:' + progress + '%"></div></div>'
        + '<div style="font-size:.78rem;color:var(--color-text-muted);margin-top:.25rem;font-weight:600">' + progress + '% Completed · ' + (enroll.completedModules ? enroll.completedModules.length : 0) + '/3 Modules</div>'
        : '<div style="font-size:.78rem;color:var(--color-text-faint);margin-top:.25rem">3 Interactive Modules &amp; Verified Exam</div>';

      const actionBtnText = isEnrolled ? (progress >= 100 ? "Review Modules &amp; Retake Exam" : "Continue Learning →") : "Enroll &amp; Start Learning";

      card.innerHTML = '<div class="course-card__top">'
        + '<span style="font-size:2.2rem">' + (course.icon || "📘") + '</span>'
        + '<span class="badge badge--primary">' + course.level + '</span>'
        + '</div>'
        + '<h4>' + course.title + '</h4>'
        + '<p>' + course.description + '</p>'
        + progHTML
        + '<div class="course-card__meta">'
        + '<span>⏱ ' + course.duration + '</span>'
        + '<span class="course-card__rating">★ ' + course.rating + '</span>'
        + '</div>'
        + '<button class="btn btn--primary btn--block" data-open-course="' + course.id + '">' + actionBtnText + '</button>';

      grid.appendChild(card);
    });

    grid.querySelectorAll("[data-open-course]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const courseId = btn.dataset.openCourse;
        DB.Enrollments.enroll(user.id, courseId);
        openCourseReader(courseId);
      });
    });
  }

  function openCourseReader(courseId) {
    const course = DB.Catalog.getCourseById(courseId);
    if (!course) return;

    activeCourseId = courseId;
    activeModuleIndex = 0;

    const modal = document.getElementById("courseLessonModal");
    if (!modal) return;

    setText("modalCourseTitle", course.title);
    setText("modalCourseProvider", course.provider + " · " + course.duration);
    setText("modalCourseIcon", course.icon || "📘");

    renderCourseModulesNav(course);
    renderActiveModuleContent(course);

    modal.hidden = false;
  }

  function renderCourseModulesNav(course) {
    const nav = document.getElementById("courseModulesNav");
    if (!nav) return;
    nav.innerHTML = "";

    const enrollments = DB.Enrollments.forUser(currentUser.id);
    const enroll = enrollments.find((e) => e.courseId === course.id);
    const completed = (enroll && enroll.completedModules) ? enroll.completedModules : [];

    const modules = course.modules || [
      { id: "mod-1", title: "Module 1: Foundations & Core Concepts", summary: "Syntax, environment setup, and foundational principles." },
      { id: "mod-2", title: "Module 2: Advanced Techniques & Applications", summary: "Data structures, algorithms, and modular design." },
      { id: "mod-3", title: "Module 3: Real-World Systems & Best Practices", summary: "Integration, optimization, and assessment readiness." }
    ];

    modules.forEach((mod, idx) => {
      const isDone = completed.includes(mod.id);
      const isActive = idx === activeModuleIndex;

      const btn = document.createElement("button");
      btn.className = "mod-nav-btn" + (isActive ? " is-active" : "") + (isDone ? " is-done" : "");
      btn.innerHTML = '<strong>' + (isDone ? "✓ " : (idx + 1) + ". ") + mod.title + '</strong><small>' + (mod.summary || "Interactive Module") + '</small>';
      btn.addEventListener("click", () => {
        activeModuleIndex = idx;
        renderCourseModulesNav(course);
        renderActiveModuleContent(course);
      });
      nav.appendChild(btn);
    });
  }

  function renderActiveModuleContent(course) {
    const contentArea = document.getElementById("moduleContentArea");
    if (!contentArea) return;

    const modules = course.modules || [];
    const mod = modules[activeModuleIndex] || {
      title: "Module " + (activeModuleIndex + 1),
      content: "### Learning Objectives\nReview the core technical concepts and complete the checkpoints to earn your verified credential."
    };

    // Simple markdown to HTML parser for module content
    let htmlContent = mod.content || "";
    htmlContent = htmlContent.replace(/### (.*)/g, "<h3>$1</h3>");
    htmlContent = htmlContent.replace(/## (.*)/g, "<h2>$1</h2>");
    htmlContent = htmlContent.replace(/```(.*?)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>");
    htmlContent = htmlContent.replace(/`([^`]+)`/g, "<code>$1</code>");
    htmlContent = htmlContent.replace(/\n\n/g, "<p></p>");

    contentArea.innerHTML = '<h2>' + mod.title + '</h2>' + htmlContent;

    const prevBtn = document.getElementById("prevLessonBtn");
    const nextBtn = document.getElementById("completeLessonBtn");
    const assessBtn = document.getElementById("takeAssessmentBtn");

    if (prevBtn) {
      prevBtn.disabled = activeModuleIndex === 0;
      prevBtn.onclick = () => {
        if (activeModuleIndex > 0) {
          activeModuleIndex--;
          renderCourseModulesNav(course);
          renderActiveModuleContent(course);
        }
      };
    }

    if (nextBtn) {
      nextBtn.textContent = activeModuleIndex === modules.length - 1 ? "✓ Mark Course Completed" : "✓ Complete Lesson (+33%)";
      nextBtn.onclick = () => {
        DB.Enrollments.completeModule(currentUser.id, course.id, mod.id);
        toast("Module completed! Progress updated.", "success");
        if (activeModuleIndex < modules.length - 1) {
          activeModuleIndex++;
          renderCourseModulesNav(course);
          renderActiveModuleContent(course);
        } else {
          renderCourseModulesNav(course);
        }
        renderDashboard(currentUser);
        renderCourses(currentUser);
      };
    }

    if (assessBtn) {
      assessBtn.hidden = false;
      assessBtn.onclick = () => {
        const modal = document.getElementById("courseLessonModal");
        if (modal) modal.hidden = true;
        startQuiz(currentUser, course);
      };
    }
  }

  /* =========================================================================
     MODULE 6: ASSESSMENT QUIZ & CERTIFICATE GENERATOR (≥70% PASS)
     ========================================================================= */

  function startQuiz(user, course) {
    const questions = DB.Catalog.getQuiz(course.id);
    if (!questions || !questions.length) {
      toast("No assessment questions configured for this track yet.", "error");
      return;
    }

    quizState = {
      questions: questions,
      answers: new Array(questions.length).fill(null),
      current: 0,
      courseId: course.id,
      skillLabel: course.title
    };

    setText("quizSkillTitle", course.title + " — Skill Assessment");
    const modal = document.getElementById("assessmentModal");
    const result = document.getElementById("assessmentResult");
    if (result) result.hidden = true;
    if (modal) modal.hidden = false;

    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const q = quizState.questions[quizState.current];
    const total = quizState.questions.length;
    const cur = quizState.current;
    const pct = Math.round(((cur + 1) / total) * 100);

    const bar = document.getElementById("quizProgressBar");
    if (bar) bar.style.width = pct + "%";
    setText("quizProgressLabel", "Question " + (cur + 1) + " of " + total + " · Pass criteria: 70%");

    const body = document.getElementById("quizBody");
    if (!body) return;
    body.innerHTML = "";

    const qEl = document.createElement("p");
    qEl.className = "quiz-question";
    qEl.textContent = (cur + 1) + ". " + q.q;
    body.appendChild(qEl);

    q.options.forEach((opt, idx) => {
      const lbl = document.createElement("label");
      lbl.className = "quiz-option" + (quizState.answers[cur] === idx ? " is-selected" : "");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "quiz_choice";
      radio.value = idx;
      radio.checked = quizState.answers[cur] === idx;
      radio.addEventListener("change", () => {
        quizState.answers[cur] = idx;
        body.querySelectorAll(".quiz-option").forEach((o) => o.classList.remove("is-selected"));
        lbl.classList.add("is-selected");
      });
      lbl.appendChild(radio);
      lbl.appendChild(document.createTextNode(" " + opt));
      body.appendChild(lbl);
    });

    const prev = document.getElementById("quizPrevBtn");
    const next = document.getElementById("quizNextBtn");
    const submit = document.getElementById("quizSubmitBtn");

    if (prev) {
      prev.disabled = cur === 0;
      prev.onclick = () => { if (quizState.current > 0) { quizState.current--; renderQuizQuestion(); } };
    }
    if (next) {
      next.hidden = cur === total - 1;
      next.onclick = () => { if (quizState.current < total - 1) { quizState.current++; renderQuizQuestion(); } };
    }
    if (submit) {
      submit.hidden = cur !== total - 1;
      submit.onclick = submitQuiz;
    }
  }

  function submitQuiz() {
    const questions = quizState.questions;
    const answers = quizState.answers;
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });

    const scorePct = Math.round((correct / questions.length) * 100);
    // Requirement: Pass score threshold is 70%
    const passed = scorePct >= 70;

    const record = DB.Assessments.record(currentUser.id, quizState.courseId, quizState.skillLabel, scorePct, passed);

    const body = document.getElementById("quizBody");
    const nav = document.querySelector(".assessment-quiz__nav");
    const result = document.getElementById("assessmentResult");

    if (body) body.style.display = "none";
    if (nav) nav.style.display = "none";

    if (result) {
      result.hidden = false;
      result.style.background = passed ? "var(--color-success-light)" : "var(--color-danger-light)";
      result.style.borderColor = passed ? "rgba(23,130,79,0.3)" : "rgba(189,60,48,0.3)";

      result.innerHTML = '<h3 style="color:' + (passed ? "var(--color-success)" : "var(--color-danger)") + '">'
        + (passed ? "🎉 Congratulations! Exam Passed!" : "❌ Assessment Not Passed") + '</h3>'
        + '<p>You scored <strong>' + scorePct + '%</strong> (' + correct + ' of ' + questions.length + ' correct). Passing threshold: <strong>70%</strong>.</p>'
        + (passed
          ? '<p>Your accredited <strong>Verified Skill Badge</strong> and <strong>Certificate of Completion</strong> have been issued!</p>'
          + '<div style="display:flex;gap:10px;justify-content:center;margin-top:1.2rem;">'
          + '<button class="btn btn--success" id="viewIssuedCertBtn">📜 View Certificate</button>'
          + '<button class="btn btn--outline" id="closeQuizDoneBtn">Close</button>'
          + '</div>'
          : '<p>Review the course modules and retake when ready.</p>'
          + '<button class="btn btn--primary" id="closeQuizDoneBtn" style="margin-top:1rem;">Back to Courses</button>');

      const closeDone = document.getElementById("closeQuizDoneBtn");
      if (closeDone) {
        closeDone.addEventListener("click", () => {
          document.getElementById("assessmentModal").hidden = true;
          if (body) body.style.display = "block";
          if (nav) nav.style.display = "flex";
        });
      }

      const viewCertBtn = document.getElementById("viewIssuedCertBtn");
      if (viewCertBtn) {
        viewCertBtn.addEventListener("click", () => {
          document.getElementById("assessmentModal").hidden = true;
          const userCerts = DB.Certificates.forUser(currentUser.id);
          const cert = userCerts.find((c) => c.courseId === quizState.courseId) || userCerts[userCerts.length - 1];
          if (cert) openCertificateModal(cert);
        });
      }
    }

    toast(passed ? "Skill Verified! Certificate Issued 🎉" : "Score below 70%. Please review course modules.", passed ? "success" : "error");
    renderDashboard(currentUser);
  }

  function openCertificateModal(cert) {
    const modal = document.getElementById("certificateModal");
    if (!modal) return;

    setText("certStudentName", cert.userName);
    setText("certCourseTitle", cert.courseTitle);
    setText("certScore", cert.score + "% (Accredited)");
    setText("certIssueDate", fmtDate(cert.issuedDate));
    setText("certVerificationId", cert.verificationId);

    const printBtn = document.getElementById("printCertBtn");
    if (printBtn) {
      printBtn.onclick = () => window.print();
    }

    const viewInProfBtn = document.getElementById("viewCertInProfileBtn");
    if (viewInProfBtn) {
      viewInProfBtn.onclick = () => {
        modal.hidden = true;
        openUserProfileModal("certificates");
      };
    }

    modal.hidden = false;
  }

  /* =========================================================================
     MODULE 5: JOBS & INTERNSHIPS WITH SKILL MATCHER ENGINE
     ========================================================================= */

  let currentJobsSubTab = "all";

  function initJobsTab(user) {
    document.querySelectorAll(".jobs-sub-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".jobs-sub-tab").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        currentJobsSubTab = btn.dataset.jobsSub;
        renderJobs(user);
      });
    });
  }

  function renderJobs(user) {
    const container = document.getElementById("jobsContainer");
    if (!container) return;
    container.innerHTML = "";

    const allJobs = DB.Jobs.all();
    const userApplications = DB.JobApplications.forUser(user.id);
    const userSkills = user.skillsHave || [];

    setText("jobsCountAll", allJobs.length);
    setText("jobsCountApplied", userApplications.length);
    const acceptedCount = userApplications.filter((a) => a.status === "Accepted Proposal").length;
    setText("jobsCountAccepted", acceptedCount);

    if (currentJobsSubTab === "all") {
      allJobs.forEach((job) => {
        const match = DB.Jobs.calculateSkillMatch(userSkills, job.requiredSkills);
        const matchClass = match.matchPct >= 75 ? "match-high" : match.matchPct >= 40 ? "match-medium" : "match-low";
        const hasApplied = userApplications.some((a) => a.jobId === job.id);

        const card = document.createElement("div");
        card.className = "job-card";

        const skillsHTML = job.requiredSkills.map((req) => {
          const isMatched = match.matchedSkills.includes(req);
          return '<span class="skill-chip-req ' + (isMatched ? "matched" : "missing") + '">'
            + (isMatched ? "✓ " : "") + req + '</span>';
        }).join("");

        const applyBtnHTML = hasApplied
          ? '<button class="btn btn--outline" disabled>✓ Applied</button>'
          : '<button class="btn btn--primary" data-apply-job="' + job.id + '">⚡ Apply with Profile</button>';

        card.innerHTML = '<div class="job-card__header">'
          + '<div>'
          + '<h3 class="job-card__title">' + job.title + '</h3>'
          + '<div class="job-card__company">🏢 ' + job.companyName + ' · ' + (job.employeeCount || "Industry") + '</div>'
          + '</div>'
          + '<span class="skill-match-pill ' + matchClass + '">' + match.matchPct + '% Skill Match</span>'
          + '</div>'
          + '<div class="job-card__meta">'
          + '<span>📍 ' + job.location + '</span>'
          + '<span>🏷 ' + job.type + '</span>'
          + '<span>🕒 Posted ' + fmtDate(job.postedDate) + '</span>'
          + '</div>'
          + '<p class="job-card__desc">' + job.description + '</p>'
          + '<div class="job-skills-breakdown">'
          + '<span class="job-skills-label">Required Skill Alignment</span>'
          + '<div class="job-skills-chips">' + skillsHTML + '</div>'
          + '</div>'
          + '<div class="job-card__footer">'
          + '<span class="job-stipend">💰 ' + job.stipend + '</span>'
          + applyBtnHTML
          + '</div>';

        container.appendChild(card);
      });

      container.querySelectorAll("[data-apply-job]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const jobId = btn.dataset.applyJob;
          const res = DB.JobApplications.apply(user.id, jobId, "Applied via SetuSkill Verified Ledger");
          if (res.success) {
            toast("Application submitted successfully! 🚀", "success");
            renderJobs(user);
          } else {
            toast(res.message, "error");
          }
        });
      });
    } else if (currentJobsSubTab === "applied") {
      if (!userApplications.length) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;background:#fff;border-radius:12px;border:1px solid #e2e8f0;"><h3>No applications yet</h3><p>Explore All Jobs to apply with your verified skills.</p></div>';
        return;
      }
      userApplications.forEach((app) => {
        const job = DB.Catalog.getJobById(app.jobId);
        if (!job) return;

        const card = document.createElement("div");
        card.className = "job-card";
        card.innerHTML = '<div class="job-card__header">'
          + '<div><h3 class="job-card__title">' + job.title + '</h3><div class="job-card__company">' + job.companyName + '</div></div>'
          + '<span class="badge ' + (app.status === "Accepted Proposal" ? "badge--verified" : "badge--primary") + '">' + app.status + '</span>'
          + '</div>'
          + '<p>' + job.description + '</p>'
          + '<div class="job-card__footer">'
          + '<small>Submitted: ' + fmtDate(app.appliedDate) + '</small>'
          + '<button class="btn btn--outline" data-open-chat-recruiter="' + job.companyName + '">💬 Contact Recruiter</button>'
          + '</div>';
        container.appendChild(card);
      });
    } else if (currentJobsSubTab === "accepted") {
      const accepted = userApplications.filter((a) => a.status === "Accepted Proposal");
      if (!accepted.length) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;background:#fff;border-radius:12px;border:1px solid #e2e8f0;"><h3>No accepted proposals yet</h3><p>Recruiter interview invites and offers will appear here.</p></div>';
        return;
      }
      accepted.forEach((app) => {
        const job = DB.Catalog.getJobById(app.jobId);
        if (!job) return;

        const card = document.createElement("div");
        card.className = "job-card";
        card.style.border = "2px solid var(--color-success)";
        card.innerHTML = '<div class="job-card__header">'
          + '<div><h3 class="job-card__title">🎉 ' + job.title + ' (Accepted Offer)</h3><div class="job-card__company">' + job.companyName + '</div></div>'
          + '<span class="badge badge--verified">✓ Offer Accepted</span>'
          + '</div>'
          + '<p><strong>Onboarding Note:</strong> ' + (app.note || "Selected for Technical Interview round. Check direct messages.") + '</p>'
          + '<div class="job-card__footer">'
          + '<span class="job-stipend">' + job.stipend + '</span>'
          + '<button class="btn btn--success" data-open-chat-recruiter="' + job.companyName + '">💬 Open Direct Chat</button>'
          + '</div>';
        container.appendChild(card);
      });
    }
  }

  /* =========================================================================
     MODULE 4: CONNECTIONS DIRECTORY & DIRECT MESSAGING DRAWER
     ========================================================================= */

  function renderConnections(user) {
    const grid = document.getElementById("connectionsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const allUsers = DB.Users.all().filter((u) => u.id !== user.id);
    const searchVal = (document.getElementById("connectionsSearchInput")?.value || "").toLowerCase();
    const activeRoleFilter = document.querySelector("#connectionsRoleFilters .pill.is-active")?.dataset.roleFilter || "all";

    const filtered = allUsers.filter((u) => {
      const matchesRole = activeRoleFilter === "all" || u.role === activeRoleFilter;
      const name = (u.fullName || u.companyName || "").toLowerCase();
      const inst = (u.institute || "").toLowerCase();
      const skills = (u.skillsHave || []).join(" ").toLowerCase();
      const matchesSearch = !searchVal || name.includes(searchVal) || inst.includes(searchVal) || skills.includes(searchVal);
      return matchesRole && matchesSearch;
    });

    if (!filtered.length) {
      grid.innerHTML = '<p class="hint" style="grid-column:1/-1;text-align:center;padding:2rem;">No matching profiles found.</p>';
      return;
    }

    filtered.forEach((targetUser) => {
      const status = DB.Connections.getStatus(user.id, targetUser.id);
      const name = targetUser.fullName || targetUser.companyName || targetUser.email;
      const initial = name.charAt(0).toUpperCase();
      const inst = DB.Catalog.getInstituteById(targetUser.institute);
      const sub = inst ? inst.name : (targetUser.role === "industry" ? targetUser.sector : "Pune Campus");

      const card = document.createElement("div");
      card.className = "connection-card";

      const btnText = status === "Connected" ? "✓ Connected" : status === "Pending" ? "⏳ Pending" : "+ Connect";
      const btnClass = status === "Connected" ? "btn--success" : status === "Pending" ? "btn--outline" : "btn--primary";

      card.innerHTML = '<div class="connection-card__top">'
        + '<div class="avatar">' + initial + '</div>'
        + '<div class="connection-card__meta">'
        + '<h4 class="connection-card__name">' + name + '</h4>'
        + '<div class="connection-card__headline">' + (targetUser.headline || sub) + '</div>'
        + '<span class="badge badge--outline">' + (targetUser.role === "faculty" ? "Faculty Mentor" : targetUser.role === "industry" ? "Industry" : "Student") + '</span>'
        + '</div>'
        + '</div>'
        + '<div class="badge-list">'
        + (targetUser.skillsHave || []).slice(0, 3).map((s) => '<span class="badge badge--primary">' + s + '</span>').join("")
        + '</div>'
        + '<div class="connection-card__actions">'
        + '<button class="btn ' + btnClass + ' btn--block" data-toggle-connect="' + targetUser.id + '">' + btnText + '</button>'
        + '<button class="btn btn--outline" data-open-chat-user="' + targetUser.id + '">💬 Chat</button>'
        + '</div>';

      grid.appendChild(card);
    });

    grid.querySelectorAll("[data-toggle-connect]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.toggleConnect;
        const nextStatus = DB.Connections.toggleConnect(user.id, targetId);
        toast("Connection updated: " + nextStatus, "success");
        renderConnections(user);
      });
    });

    grid.querySelectorAll("[data-open-chat-user]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.openChatUser;
        openChatDrawer(targetId);
      });
    });
  }

  function initConnectionsFilters() {
    const searchInput = document.getElementById("connectionsSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => renderConnections(currentUser));
    }
    document.querySelectorAll("#connectionsRoleFilters .pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("#connectionsRoleFilters .pill").forEach((p) => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        renderConnections(currentUser);
      });
    });
  }

  /* Direct Messaging Drawer System */
  function openChatDrawer(targetUserId) {
    const backdrop = document.getElementById("chatDrawerBackdrop");
    if (!backdrop) return;

    const allUsers = DB.Users.all().filter((u) => u.id !== currentUser.id);
    activeChatPartnerId = targetUserId || (allUsers[0] ? allUsers[0].id : null);

    renderChatContactsList(allUsers);
    renderActiveChatThread();

    backdrop.hidden = false;
  }

  function renderChatContactsList(allUsers) {
    const list = document.getElementById("chatContactsList");
    if (!list) return;
    list.innerHTML = "";

    allUsers.forEach((u) => {
      const name = u.fullName || u.companyName || u.email;
      const initial = name.charAt(0).toUpperCase();
      const isActive = u.id === activeChatPartnerId;

      const item = document.createElement("div");
      item.className = "chat-contact-item" + (isActive ? " is-active" : "");
      item.innerHTML = '<div class="avatar avatar--sm">' + initial + '</div>'
        + '<div class="chat-contact-info"><strong>' + name + '</strong><small>' + (u.role === "faculty" ? "Faculty" : u.role === "industry" ? "Recruiter" : "Student") + '</small></div>';

      item.addEventListener("click", () => {
        activeChatPartnerId = u.id;
        renderChatContactsList(allUsers);
        renderActiveChatThread();
      });

      list.appendChild(item);
    });
  }

  function renderActiveChatThread() {
    if (!activeChatPartnerId) return;
    const partner = DB.Users.findById(activeChatPartnerId);
    if (!partner) return;

    const name = partner.fullName || partner.companyName || "Member";
    setText("chatPartnerName", name);
    setText("chatPartnerRole", partner.role === "faculty" ? "Faculty · PICT Pune" : partner.role === "industry" ? "Recruiter" : "Student Peer");
    setText("chatPartnerAvatar", name.charAt(0).toUpperCase());

    const container = document.getElementById("chatMessagesContainer");
    if (!container) return;
    container.innerHTML = "";

    const thread = DB.Messages.getThread(currentUser.id, partner.id);
    if (!thread.length) {
      container.innerHTML = '<p class="hint" style="text-align:center;margin-top:2rem;">Start a new conversation with ' + name + '.</p>';
    } else {
      thread.forEach((msg) => {
        const isMe = msg.senderId === currentUser.id;
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble " + (isMe ? "chat-bubble--out" : "chat-bubble--in");
        bubble.innerHTML = msg.text + '<span class="chat-bubble__time">' + fmtDate(msg.timestamp) + '</span>';
        container.appendChild(bubble);
      });
      container.scrollTop = container.scrollHeight;
    }
  }

  function initChatInputForm() {
    const form = document.getElementById("chatInputForm");
    const input = document.getElementById("chatTextInput");
    if (!form || !input) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || !activeChatPartnerId) return;

      DB.Messages.send(currentUser.id, currentUser.fullName || "Student", activeChatPartnerId, text);
      input.value = "";
      renderActiveChatThread();

      // Mock instant reply for demo realism
      setTimeout(() => {
        const partner = DB.Users.findById(activeChatPartnerId);
        if (partner && activeChatPartnerId === partner.id) {
          const reply = partner.role === "faculty"
            ? "Thank you for the update! Keep advancing your verified project badges."
            : partner.role === "industry"
              ? "We reviewed your skill match percentage. We will schedule a technical screening soon."
              : "Great collaborating with you on SetuSkill!";
          DB.Messages.send(partner.id, partner.fullName || "Peer", currentUser.id, reply);
          renderActiveChatThread();
        }
      }, 1400);
    });
  }

  /* =========================================================================
     MODULE 8: EXPLORE TAB (SOCIAL FEED, LIKES, COMMENTS, FAB & EVENTS)
     ========================================================================= */

  function renderExplorePosts() {
    const feed = document.getElementById("postsFeed");
    if (!feed) return;
    feed.innerHTML = "";

    const posts = DB.Posts.all();
    posts.forEach((post) => {
      const isLiked = (post.likedBy || []).includes(currentUser.id);
      const card = document.createElement("div");
      card.className = "post-card";

      const commentsHTML = (post.comments || []).map((c) => {
        return '<div class="post-comment-item">'
          + '<div class="post-comment-header"><strong>' + c.author + ' (' + c.role + ')</strong><small>' + fmtDate(c.timestamp) + '</small></div>'
          + '<div>' + c.text + '</div>'
          + '</div>';
      }).join("");

      card.innerHTML = '<div class="post-card__header">'
        + '<div class="post-card__author">'
        + '<div class="avatar avatar--sm">' + (post.authorAvatar || "U") + '</div>'
        + '<div><strong>' + post.author + '</strong><span>' + post.authorRole + ' · ' + fmtDate(post.timestamp) + ' · 📍 ' + post.location + '</span></div>'
        + '</div>'
        + '</div>'
        + '<h3>' + post.title + '</h3>'
        + '<p>' + post.content + '</p>'
        + '<div class="post-card__actions">'
        + '<button class="post-action-btn ' + (isLiked ? "is-liked" : "") + '" data-like-post="' + post.id + '">👍 ' + (post.likes || 0) + ' Likes</button>'
        + '<button class="post-action-btn" data-toggle-comments="' + post.id + '">💬 ' + (post.comments ? post.comments.length : 0) + ' Comments</button>'
        + '</div>'
        + '<div class="post-comments-wrap" id="comments-wrap-' + post.id + '">'
        + commentsHTML
        + '<form class="comment-input-form" data-comment-form="' + post.id + '">'
        + '<input type="text" placeholder="Add a public comment..." required>'
        + '<button type="submit" class="btn btn--primary">Post</button>'
        + '</form>'
        + '</div>';

      feed.appendChild(card);
    });

    feed.querySelectorAll("[data-like-post]").forEach((btn) => {
      btn.addEventListener("click", () => {
        DB.Posts.toggleLike(btn.dataset.likePost, currentUser.id);
        renderExplorePosts();
      });
    });

    feed.querySelectorAll("[data-comment-form]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("input");
        const val = input.value.trim();
        if (!val) return;
        DB.Posts.addComment(form.dataset.commentForm, currentUser, val);
        input.value = "";
        toast("Comment added!", "success");
        renderExplorePosts();
      });
    });
  }

  function initCreatePostAndEventForms() {
    const postForm = document.getElementById("createPostForm");
    const openPostBtn = document.getElementById("openCreatePostBtn");
    const postModal = document.getElementById("createPostModal");

    if (openPostBtn && postModal) {
      openPostBtn.addEventListener("click", () => { postModal.hidden = false; });
    }

    if (postForm) {
      postForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = postForm.postTitle.value.trim();
        const content = postForm.postContent.value.trim();
        const loc = postForm.postLocation.value.trim();
        DB.Posts.create(currentUser, title, content, loc);
        postForm.reset();
        if (postModal) postModal.hidden = true;
        toast("Update posted to community feed! 🚀", "success");
        renderExplorePosts();
      });
    }

    // Host Event Modal
    const eventForm = document.getElementById("hostEventForm");
    const openEventBtn = document.getElementById("openHostEventBtn");
    const eventModal = document.getElementById("hostEventModal");

    if (openEventBtn && eventModal) {
      openEventBtn.addEventListener("click", () => { eventModal.hidden = false; });
    }

    if (eventForm) {
      eventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        DB.Events.create(currentUser, {
          title: eventForm.eventTitle.value.trim(),
          type: eventForm.eventType.value,
          date: eventForm.eventDate.value,
          location: eventForm.eventLocation.value.trim(),
          description: eventForm.eventDescription.value.trim()
        });
        eventForm.reset();
        if (eventModal) eventModal.hidden = true;
        toast("Event published to community calendar!", "success");
        renderEvents();
      });
    }
  }

  function renderEvents() {
    const list = document.getElementById("eventsList");
    if (!list) return;
    list.innerHTML = "";

    const events = DB.Events.all();
    events.forEach((evt) => {
      const d = new Date(evt.date);
      const day = isNaN(d.getTime()) ? "?" : String(d.getDate()).padStart(2, "0");
      const mon = isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN", { month: "short" }).toUpperCase();

      const card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML = '<div class="event-card__date"><strong>' + day + '</strong><span>' + mon + '</span></div>'
        + '<div class="event-card__body">'
        + '<h4>' + evt.title + '</h4>'
        + '<p style="margin:0 0 .4rem;font-size:.88rem;">' + (evt.description || "") + '</p>'
        + '<div class="event-card__meta">'
        + '<span>📍 ' + evt.location + '</span>'
        + '<span>🏷 ' + evt.type + '</span>'
        + '<span>🏛 Organized by ' + evt.organizer + '</span>'
        + '</div>'
        + '</div>';
      list.appendChild(card);
    });
  }

  /* =========================================================================
     MODULE 7: FACULTY PORTAL (COHORT DIRECTORY & ASSESSMENT BUILDER)
     ========================================================================= */

  function initFacultyPortal(user) {
    const menuOpenFaculty = document.getElementById("menuOpenFacultyPortal");
    const quizModal = document.getElementById("facultyQuizModal");
    const quizForm = document.getElementById("facultyQuizForm");

    if (menuOpenFaculty && quizModal) {
      menuOpenFaculty.addEventListener("click", () => {
        quizModal.hidden = false;
        const dropdown = document.getElementById("userDropdownMenu");
        if (dropdown) dropdown.hidden = true;
      });
    }

    if (quizForm) {
      quizForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const courseId = quizForm.courseId.value;
        const qText = quizForm.questionText.value.trim();
        const opts = [
          quizForm.optionA.value.trim(),
          quizForm.optionB.value.trim(),
          quizForm.optionC.value.trim(),
          quizForm.optionD.value.trim()
        ];
        const correct = parseInt(quizForm.correctOption.value, 10);

        DB.QuizBank.addQuestion(courseId, { q: qText, options: opts, correct: correct });
        quizForm.reset();
        if (quizModal) quizModal.hidden = true;
        toast("Assessment question published to global student pool! 🎓", "success");
      });
    }
  }

  /* =========================================================================
     USER PROFILE MODAL & CERTIFICATES GALLERY
     ========================================================================= */

  function openUserProfileModal(activeTab) {
    const modal = document.getElementById("profileModal");
    if (!modal) return;

    const user = currentUser;
    const displayName = user.fullName || user.companyName || user.email;
    setText("profileModalName", displayName);
    setText("profileModalHeadline", user.headline || "Accredited SetuSkill Member");
    setText("profileModalRole", user.role === "faculty" ? "Faculty Mentor" : user.role === "industry" ? "Industry Partner" : "Student");

    const inst = DB.Catalog.getInstituteById(user.institute);
    setText("profileModalCollege", inst ? inst.name : "Pune Engineering Campus");
    setText("profileModalBranch", (user.branch || "Computer Science") + " · " + (user.currentYear || "3rd Year"));

    // Populate Verified Skills
    const vList = document.getElementById("profileVerifiedSkillsList");
    if (vList) {
      vList.innerHTML = "";
      (user.verifiedSkills || []).forEach((s) => {
        const b = document.createElement("span");
        b.className = "badge badge--verified";
        b.textContent = "✓ " + s;
        vList.appendChild(b);
      });
    }

    // Populate Target Skills
    const lList = document.getElementById("profileLearnSkillsList");
    if (lList) {
      lList.innerHTML = "";
      (user.skillsLearn || []).forEach((s) => {
        const b = document.createElement("span");
        b.className = "badge badge--primary";
        b.textContent = "+ " + s;
        lList.appendChild(b);
      });
    }

    // Populate Certificates Gallery
    const certs = DB.Certificates.forUser(user.id);
    setText("profileCertCount", certs.length);
    const certGallery = document.getElementById("profileCertificatesGallery");
    if (certGallery) {
      certGallery.innerHTML = "";
      if (!certs.length) {
        certGallery.innerHTML = '<p class="hint" style="grid-column:1/-1;text-align:center;padding:2rem;">No certificates earned yet. Pass a skill assessment (≥70%) to generate authenticated certificates.</p>';
      } else {
        certs.forEach((c) => {
          const card = document.createElement("div");
          card.className = "cert-gallery-card";
          card.innerHTML = '<strong>' + c.courseTitle + '</strong>'
            + '<small>Score: ' + c.score + '% · ' + fmtDate(c.issuedDate) + '</small>'
            + '<code style="font-size:.72rem;">' + c.verificationId + '</code>'
            + '<button class="btn btn--outline btn--block" data-view-cert="' + c.id + '">View &amp; Print Certificate</button>';
          card.querySelector("[data-view-cert]").addEventListener("click", () => {
            modal.hidden = true;
            openCertificateModal(c);
          });
          certGallery.appendChild(card);
        });
      }
    }

    // Switch Tab
    document.querySelectorAll(".profile-tab").forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.ptab === (activeTab || "overview"));
    });
    document.querySelectorAll(".ptab-content").forEach((c) => {
      c.hidden = c.id !== "ptab-" + (activeTab || "overview");
    });

    document.querySelectorAll(".profile-tab").forEach((tab) => {
      tab.onclick = () => {
        document.querySelectorAll(".profile-tab").forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        document.querySelectorAll(".ptab-content").forEach((c) => {
          c.hidden = c.id !== "ptab-" + tab.dataset.ptab;
        });
      };
    });

    modal.hidden = false;
  }

  /* ─── Help / FAQ Accordion ─────────────────────────────────────────────── */

  function renderHelp() {
    const faqList = document.getElementById("faqList");
    if (!faqList) return;
    faqList.innerHTML = "";

    DB.Catalog.getFaqs().forEach((faq) => {
      const item = document.createElement("div");
      item.className = "faq-item";
      const qBtn = document.createElement("button");
      qBtn.type = "button";
      qBtn.className = "faq-item__q";
      qBtn.innerHTML = '<span>' + faq.q + '</span><span class="faq-chevron">▾</span>';

      const aDiv = document.createElement("div");
      aDiv.className = "faq-item__a";
      aDiv.textContent = faq.a;

      item.appendChild(qBtn);
      item.appendChild(aDiv);
      faqList.appendChild(item);

      qBtn.addEventListener("click", () => {
        item.classList.toggle("is-open");
      });
    });
  }

  /* ─── Public Initialization ────────────────────────────────────────────── */

  function init(user) {
    if (!user) return;
    currentUser = user;

    initNavigation();
    initJobsTab(user);
    initConnectionsFilters();
    initChatInputForm();
    initCreatePostAndEventForms();
    initFacultyPortal(user);

    renderDashboard(user);
    renderCourses(user);
    renderJobs(user);
    renderConnections(user);
    renderExplorePosts();
    renderEvents();
    renderHelp();

    // Default to dashboard tab
    switchAppTab("dashboard");
  }

  // Pre-login landing page initialization
  document.addEventListener("DOMContentLoaded", () => {
    applyLandingImagePlaceholders();
    const strip = document.getElementById("landingCourseStrip");
    if (strip) {
      strip.innerHTML = "";
      DB.Catalog.getCourses().forEach((course) => {
        const card = document.createElement("div");
        card.className = "course-card";
        card.innerHTML = '<div class="course-card__top"><span style="font-size:2rem">' + (course.icon || "📘") + '</span>'
          + '<span class="badge badge--primary">' + course.level + '</span></div>'
          + '<h4>' + course.title + '</h4><p>' + course.description + '</p>'
          + '<div class="course-card__meta"><span>⏱ ' + course.duration + '</span><span class="course-card__rating">★ ' + course.rating + '</span></div>';
        strip.appendChild(card);
      });
    }
  });

  global.SS_APP = { init };

})(window);
