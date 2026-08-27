/* ============================================================================
   SetuSkill — app.js
   Exposes window.SS_APP = { init(user) }
   Called by auth.js every time a user reaches the dashboard.
   ============================================================================ */

(function (global) {
  "use strict";

  /* ─── guard: make sure backend is loaded ─────────────────────────── */
  var DB = global.SS_DB;
  if (!DB) {
    console.error("SetuSkill app.js: SS_DB is not available. Check script load order.");
    return;
  }

  /* ─── tiny helpers ───────────────────────────────────────────────── */

  function toast(msg, type) {
    if (global.SS_AUTH && typeof global.SS_AUTH.toast === "function") {
      global.SS_AUTH.toast(msg, type);
    }
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  /* ─── navigation (wired once) ────────────────────────────────────── */

  var navInited = false;
  function initNavigation() {
    if (navInited) return;
    navInited = true;

    document.querySelectorAll(".app-nav__item[data-section]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.dataset.section;
        document.querySelectorAll(".app-nav__item[data-section]").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        document.querySelectorAll(".app-section[data-app-section]").forEach(function (s) {
          s.classList.toggle("is-active", s.dataset.appSection === target);
        });
        var sidebar = document.getElementById("appSidebar");
        if (sidebar) sidebar.classList.remove("is-open");
      });
    });

    var searchInput = document.getElementById("globalSearchInput");
    if (searchInput) {
      searchInput.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        var term = searchInput.value.trim().toLowerCase();
        if (!term) return;
        var learnBtn = document.querySelector('.app-nav__item[data-section="learn"]');
        if (learnBtn) learnBtn.click();
        document.querySelectorAll(".course-card").forEach(function (card) {
          card.style.display = card.textContent.toLowerCase().includes(term) ? "" : "none";
        });
        searchInput.value = "";
      });
    }
  }

  /* ─── assessment quiz nav (wired once) ───────────────────────────── */

  var quizNavInited = false;
  function initAssessmentNav() {
    if (quizNavInited) return;
    quizNavInited = true;

    var prevBtn = document.getElementById("quizPrevBtn");
    var nextBtn = document.getElementById("quizNextBtn");
    var submitBtn = document.getElementById("quizSubmitBtn");

    if (prevBtn) prevBtn.addEventListener("click", function () {
      if (quizState.current > 0) { quizState.current--; renderQuizQuestion(); }
    });
    if (nextBtn) nextBtn.addEventListener("click", function () {
      if (quizState.current < quizState.questions.length - 1) { quizState.current++; renderQuizQuestion(); }
    });
    if (submitBtn) submitBtn.addEventListener("click", submitQuiz);
  }

  /* ─── dashboard ──────────────────────────────────────────────────── */

  function renderDashboard(user) {
    var enrollments = DB.Enrollments.forUser(user.id);
    var verified    = user.verifiedSkills || [];
    var have        = user.skillsHave || [];

    var coursesJoined   = enrollments.length;
    var verifiedCount   = verified.length;
    var unverifiedCount = Math.max(0, have.length - verifiedCount);
    var avgProgress     = enrollments.length
      ? Math.round(enrollments.reduce(function (s, e) { return s + (e.progress || 0); }, 0) / enrollments.length)
      : 0;

    /* stat cards */
    if (user.role === "faculty") {
      var lbl = document.querySelector("#statCoursesJoined + *") ||
                (document.getElementById("statCoursesJoined") && document.getElementById("statCoursesJoined").previousElementSibling);
      /* find the label above the value */
      var card = document.getElementById("statCoursesJoined");
      if (card && card.previousElementSibling) card.previousElementSibling.textContent = "Cohort size";
      setText("statCoursesJoined", "—");
    } else if (user.role === "industry") {
      var card2 = document.getElementById("statCoursesJoined");
      if (card2 && card2.previousElementSibling) card2.previousElementSibling.textContent = "Skills tracked";
      setText("statCoursesJoined", have.length || "—");
    } else {
      setText("statCoursesJoined", coursesJoined);
    }
    setText("statVerifiedSkills",   verifiedCount);
    setText("statUnverifiedSkills", unverifiedCount);
    setText("statOverallCompletion", avgProgress + "%");

    /* course progress list */
    var progressList = document.getElementById("courseProgressList");
    if (progressList) {
      if (!enrollments.length) {
        progressList.innerHTML = '<p class="hint" style="text-align:center;padding:1rem 0;">No courses joined yet — head to <strong>Learn &amp; Upskill</strong> to start.</p>';
      } else {
        progressList.innerHTML = "";
        enrollments.slice(0, 5).forEach(function (enroll) {
          var course = DB.Catalog.getCourseById(enroll.courseId);
          if (!course) return;
          var pct = enroll.progress || 0;
          var div = document.createElement("div");
          div.className = "progress-item";
          div.innerHTML = '<div class="progress-item__top"><strong>' + (course.icon || "📘") + " " + course.title + '</strong><span>' + pct + '%</span></div>'
            + '<div class="progress-bar"><div class="progress-bar__fill" style="width:' + pct + '%"></div></div>';
          progressList.appendChild(div);
        });
      }
    }

    /* skill badges */
    var badgeList = document.getElementById("skillBadgeList");
    if (badgeList) {
      badgeList.innerHTML = "";
      var all = [];
      verified.forEach(function (s) { if (!all.includes(s)) all.push(s); });
      have.forEach(function (s) { if (!all.includes(s)) all.push(s); });
      all = all.slice(0, 18);
      if (!all.length) {
        badgeList.innerHTML = '<p class="hint">No skills added yet.</p>';
      } else {
        all.forEach(function (skill) {
          var isV = verified.includes(skill);
          var b = document.createElement("span");
          b.className = "badge " + (isV ? "badge--verified" : "badge--unverified");
          b.textContent = (isV ? "✓ " : "") + skill;
          badgeList.appendChild(b);
        });
      }
    }

    renderHeatmap(user);
  }

  function renderHeatmap(user) {
    var heatmap = document.getElementById("activityHeatmap");
    if (!heatmap) return;
    heatmap.innerHTML = "";

    var activity = DB.Activity.forUser(user.id);
    var actMap = {};
    activity.forEach(function (e) { actMap[e.date] = e.count || 1; });

    var WEEKS = 12;
    var today = new Date();
    var start = new Date(today);
    start.setDate(today.getDate() - WEEKS * 7 + 1);

    for (var w = 0; w < WEEKS; w++) {
      for (var d = 0; d < 7; d++) {
        var dt = new Date(start);
        dt.setDate(start.getDate() + w * 7 + d);
        var ds = dt.toISOString().slice(0, 10);
        var cnt = actMap[ds] || 0;
        var level = cnt >= 6 ? 4 : cnt >= 4 ? 3 : cnt >= 2 ? 2 : cnt >= 1 ? 1 : 0;
        var cell = document.createElement("span");
        cell.className = "heat-cell heat-" + level;
        cell.title = ds + ": " + cnt + " action" + (cnt !== 1 ? "s" : "");
        heatmap.appendChild(cell);
      }
    }
  }

  /* ─── events ─────────────────────────────────────────────────────── */

  function renderEvents() {
    var list = document.getElementById("eventsList");
    if (!list) return;
    list.innerHTML = "";
    var events = DB.Catalog.getEvents();
    if (!events.length) {
      list.innerHTML = '<p class="hint" style="text-align:center;padding:2rem 0;">No upcoming events.</p>';
      return;
    }
    events.forEach(function (evt) {
      var d = new Date(evt.date);
      var day = isNaN(d.getTime()) ? "?" : String(d.getDate()).padStart(2, "0");
      var mon = isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN", { month: "short" }).toUpperCase();
      var card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML = '<div class="event-card__date"><strong>' + day + '</strong><span>' + mon + '</span></div>'
        + '<div class="event-card__body"><h4>' + evt.title + '</h4>'
        + '<div class="event-card__meta"><span>📍 ' + evt.location + '</span><span>🏷 ' + evt.type + '</span><span>🏛 ' + evt.organizer + '</span></div></div>';
      list.appendChild(card);
    });
  }

  /* ─── learn & upskill ────────────────────────────────────────────── */

  function renderCourses(user) {
    var grid = document.getElementById("courseGrid");
    if (!grid) return;
    grid.innerHTML = "";
    var courses = DB.Catalog.getCourses();
    var enrollments = DB.Enrollments.forUser(user.id);

    courses.forEach(function (course) {
      var enroll = enrollments.find(function (e) { return e.courseId === course.id; });
      var isEnrolled = !!enroll;
      var progress = enroll ? (enroll.progress || 0) : 0;
      var lvlClass = "level-" + (course.level || "beginner").toLowerCase().replace(/\s+/g, "");

      var card = document.createElement("div");
      card.className = "course-card";

      var progHTML = isEnrolled
        ? '<div class="progress-bar" style="margin-top:.3rem"><div class="progress-bar__fill" style="width:' + progress + '%"></div></div>'
          + '<div style="font-size:.75rem;color:var(--color-text-faint);margin-top:.2rem">' + progress + '% complete</div>'
        : "";

      var ctaHTML = isEnrolled
        ? '<button class="btn btn--outline" style="width:100%" data-progress-course="' + course.id + '" data-progress="' + progress + '">+ Update Progress (20%)</button>'
        : '<button class="btn btn--primary" style="width:100%" data-enroll-course="' + course.id + '">Enroll Now</button>';

      card.innerHTML = '<div class="course-card__top"><span style="font-size:2rem">' + (course.icon || "📘") + '</span>'
        + '<span class="course-card__level ' + lvlClass + '">' + course.level + '</span></div>'
        + '<h4>' + course.title + '</h4><p>' + course.description + '</p>' + progHTML
        + '<div class="course-card__meta"><span>⏱ ' + course.duration + '</span><span class="course-card__rating">★ ' + course.rating + '</span></div>'
        + '<div class="course-card__cta">' + ctaHTML + '</div>';
      grid.appendChild(card);
    });

    grid.querySelectorAll("[data-enroll-course]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        DB.Enrollments.enroll(user.id, btn.dataset.enrollCourse);
        toast("Enrolled! Track progress on your dashboard.", "success");
        renderCourses(user);
        renderDashboard(user);
      });
    });

    grid.querySelectorAll("[data-progress-course]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = Math.min(100, (parseInt(btn.dataset.progress, 10) || 0) + 20);
        DB.Enrollments.setProgress(user.id, btn.dataset.progressCourse, next);
        toast("Progress updated to " + next + "%!", "success");
        renderCourses(user);
        renderDashboard(user);
      });
    });
  }

  /* ─── landing course strip (pre-login) ───────────────────────────── */

  function renderLandingCourseStrip() {
    var strip = document.getElementById("landingCourseStrip");
    if (!strip) return;
    strip.innerHTML = "";
    DB.Catalog.getCourses().forEach(function (course) {
      var lvlClass = "level-" + (course.level || "beginner").toLowerCase().replace(/\s+/g, "");
      var card = document.createElement("div");
      card.className = "course-card";
      card.innerHTML = '<div class="course-card__top"><span style="font-size:2rem">' + (course.icon || "📘") + '</span>'
        + '<span class="course-card__level ' + lvlClass + '">' + course.level + '</span></div>'
        + '<h4>' + course.title + '</h4><p>' + course.description + '</p>'
        + '<div class="course-card__meta"><span>⏱ ' + course.duration + '</span><span class="course-card__rating">★ ' + course.rating + '</span></div>';
      strip.appendChild(card);
    });
  }

  /* ─── assessment ─────────────────────────────────────────────────── */

  var quizState = { questions: [], answers: [], current: 0, courseId: null, skillLabel: null, userId: null };

  function renderAssessmentPicker(user) {
    var picker = document.getElementById("assessmentPicker");
    if (!picker) return;
    picker.innerHTML = "";
    DB.Catalog.getCourses().forEach(function (course) {
      var card = document.createElement("div");
      card.className = "assessment-card";
      var btn = document.createElement("button");
      btn.className = "btn btn--primary";
      btn.style.cssText = "margin-top:.5rem;width:100%";
      btn.textContent = "Start test";
      card.innerHTML = '<div style="font-size:1.4rem">' + (course.icon || "📘") + '</div><h4>' + course.title + '</h4><span>' + course.duration + " · " + course.level + '</span>';
      card.appendChild(btn);
      picker.appendChild(card);
      btn.addEventListener("click", function () { startQuiz(user, course); });
    });
  }

  function startQuiz(user, course) {
    var questions = DB.Catalog.getQuiz(course.id);
    if (!questions || !questions.length) { toast("No quiz available for this course yet.", "error"); return; }
    quizState = { questions: questions, answers: new Array(questions.length).fill(null), current: 0, courseId: course.id, skillLabel: course.title, userId: user.id };
    setText("quizSkillTitle", course.title + " — Assessment");
    var picker = document.getElementById("assessmentPicker");
    var result = document.getElementById("assessmentResult");
    var quiz   = document.getElementById("assessmentQuiz");
    if (picker) picker.hidden = true;
    if (result) result.hidden = true;
    if (quiz)   quiz.hidden   = false;
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    var q     = quizState.questions[quizState.current];
    var total = quizState.questions.length;
    var cur   = quizState.current;
    var pct   = Math.round(((cur + 1) / total) * 100);

    var bar = document.getElementById("quizProgressBar");
    if (bar) bar.style.width = pct + "%";
    setText("quizProgressLabel", "Question " + (cur + 1) + " of " + total);

    var body = document.getElementById("quizBody");
    if (!body) return;
    body.innerHTML = "";

    var qEl = document.createElement("p");
    qEl.className = "quiz-question";
    qEl.textContent = q.q;
    body.appendChild(qEl);

    q.options.forEach(function (opt, idx) {
      var lbl = document.createElement("label");
      lbl.className = "quiz-option" + (quizState.answers[cur] === idx ? " is-selected" : "");
      var radio = document.createElement("input");
      radio.type = "radio"; radio.name = "quiz-opt"; radio.value = idx; radio.checked = quizState.answers[cur] === idx;
      radio.style.accentColor = "var(--color-primary)";
      (function (i, label) {
        radio.addEventListener("change", function () {
          quizState.answers[cur] = i;
          body.querySelectorAll(".quiz-option").forEach(function (o) { o.classList.remove("is-selected"); });
          label.classList.add("is-selected");
        });
      })(idx, lbl);
      lbl.appendChild(radio);
      lbl.appendChild(document.createTextNode(" " + opt));
      body.appendChild(lbl);
    });

    var prev   = document.getElementById("quizPrevBtn");
    var next   = document.getElementById("quizNextBtn");
    var submit = document.getElementById("quizSubmitBtn");
    if (prev)   prev.disabled = cur === 0;
    if (next)   next.hidden   = cur === total - 1;
    if (submit) submit.hidden = cur !== total - 1;
  }

  function submitQuiz() {
    var questions  = quizState.questions;
    var answers    = quizState.answers;
    var correct    = 0;
    questions.forEach(function (q, i) { if (answers[i] === q.correct) correct++; });
    var scorePct = Math.round((correct / questions.length) * 100);
    var passed   = scorePct >= 60;

    DB.Assessments.record(quizState.userId, quizState.courseId, quizState.skillLabel, scorePct, passed);

    var quiz   = document.getElementById("assessmentQuiz");
    var picker = document.getElementById("assessmentPicker");
    var result = document.getElementById("assessmentResult");
    if (quiz)   quiz.hidden   = true;
    if (picker) picker.hidden = false;

    if (result) {
      result.hidden = false;
      result.style.background   = passed ? "var(--color-success-light)" : "var(--color-danger-light)";
      result.style.borderColor  = passed ? "rgba(23,130,79,.25)"       : "rgba(189,60,48,.25)";
      result.innerHTML = '<h3 style="color:' + (passed ? "var(--color-success)" : "var(--color-danger)") + '">'
        + (passed ? "🎉 Passed!" : "❌ Not quite.") + '</h3>'
        + '<p><strong>' + correct + '</strong> of <strong>' + questions.length + '</strong> correct — score: <strong>' + scorePct + '%</strong></p>'
        + (passed ? '<p>A verified badge for <strong>' + quizState.skillLabel + '</strong> has been added to your profile.</p>'
                  : '<p>You need ≥60% to earn a verified badge. Review and try again.</p>')
        + '<button class="btn btn--primary" id="retryQuizBtn" style="margin-top:1rem">Try another assessment</button>';
      var retryBtn = document.getElementById("retryQuizBtn");
      if (retryBtn) retryBtn.addEventListener("click", function () { result.hidden = true; });
    }

    toast(passed ? "Assessment passed! Badge earned 🎉" : "Not quite — review and try again.", passed ? "success" : "error");

    var user = DB.Session.currentUser();
    if (user) { renderDashboard(user); renderAssessmentPicker(user); }
  }

  /* ─── articles ───────────────────────────────────────────────────── */

  function renderArticles() {
    var feed = document.getElementById("articlesFeed");
    if (!feed) return;
    feed.innerHTML = "";
    var articles = DB.Catalog.getArticles();
    if (!articles.length) { feed.innerHTML = '<p class="hint" style="text-align:center;padding:2rem 0;">No articles yet.</p>'; return; }
    articles.forEach(function (art) {
      var initials = art.author.split(" ").map(function (w) { return w[0] || ""; }).slice(0, 2).join("").toUpperCase();
      var card = document.createElement("div");
      card.className = "article-card";
      card.innerHTML = '<div class="article-card__author"><div class="avatar" style="background:var(--color-primary)">' + initials + '</div>'
        + '<div><strong>' + art.author + '</strong><span>' + art.role + " · " + fmtDate(art.timestamp) + '</span></div></div>'
        + '<p>' + art.content + '</p>'
        + '<div class="article-card__meta"><span>👍 ' + art.likes + ' likes</span><span>💬 ' + art.comments + ' comments</span></div>';
      feed.appendChild(card);
    });
  }

  /* ─── help / faq ─────────────────────────────────────────────────── */

  function renderHelp() {
    var faqList = document.getElementById("faqList");
    if (!faqList) return;
    faqList.innerHTML = "";
    DB.Catalog.getFaqs().forEach(function (faq) {
      var item = document.createElement("div");
      item.className = "faq-item";
      var qBtn = document.createElement("button");
      qBtn.type = "button"; qBtn.className = "faq-item__q";
      qBtn.innerHTML = '<span>' + faq.q + '</span><span class="faq-chevron" style="transition:transform .2s ease;display:inline-block">▾</span>';
      var aDiv = document.createElement("div");
      aDiv.className = "faq-item__a"; aDiv.textContent = faq.a;
      item.appendChild(qBtn); item.appendChild(aDiv);
      faqList.appendChild(item);
      qBtn.addEventListener("click", function () {
        var open = item.classList.toggle("is-open");
        var ch = qBtn.querySelector(".faq-chevron");
        if (ch) ch.style.transform = open ? "rotate(180deg)" : "";
      });
    });
  }

  /* ─── role tweaks ────────────────────────────────────────────────── */

  function adaptForRole(user) {
    var subEl = document.querySelector('[data-app-section="dashboard"] .section-heading p');
    if (!subEl) return;
    if (user.role === "faculty")       subEl.textContent = "Track your cohort's skill progress and upcoming placement drives.";
    else if (user.role === "industry") subEl.textContent = "Explore verified talent and check skill availability in your region.";
    else                               subEl.textContent = "Here's where your skill map stands today.";
  }

  /* ─── public init ────────────────────────────────────────────────── */

  function init(user) {
    if (!user) { console.warn("SS_APP.init called without a user"); return; }

    /* render all panels */
    renderDashboard(user);
    renderEvents();
    renderCourses(user);
    renderAssessmentPicker(user);
    renderArticles();
    renderHelp();
    adaptForRole(user);

    /* wire one-time listeners */
    initNavigation();
    initAssessmentNav();

    /* reset to dashboard tab */
    document.querySelectorAll(".app-nav__item[data-section]").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.section === "dashboard");
    });
    document.querySelectorAll(".app-section[data-app-section]").forEach(function (s) {
      s.classList.toggle("is-active", s.dataset.appSection === "dashboard");
    });
  }

  /* ─── populate landing strip once DOM is ready ───────────────────── */

  document.addEventListener("DOMContentLoaded", function () {
    renderLandingCourseStrip();
  });

  /* ─── expose ─────────────────────────────────────────────────────── */

  global.SS_APP = { init: init };

})(window);
