# SetuSkill — Academia–Industry Skill Mapping & Career Gateway

> **Smart India Hackathon Prototype (Stage 2)**  
> Built with pure **HTML5, CSS3, and Vanilla JavaScript (ES6+)**. No heavy build frameworks or node bundlers required.

---

## 📖 Table of Contents
1. [Overview & Stage 2 Architecture](#overview--stage-2-architecture)
2. [Module Guide & Features](#module-guide--features)
3. [Landing Page Image Placeholders Guide](#landing-page-image-placeholders-guide)
4. [Firebase Web SDK (v9 / v10) Integration Guide](#firebase-web-sdk-v9--v10-integration-guide)
5. [Migrating from `localStorage` to Cloud Firestore](#migrating-from-localstorage-to-cloud-firestore)
6. [Demo Accounts for Evaluation](#demo-accounts-for-evaluation)

---

## Overview & Stage 2 Architecture

SetuSkill is a national skill mapping and verification portal designed to bridge the gap between engineering colleges, students, and industry recruiters.

### Technology Stack
- **Structure:** Semantic HTML5 SPA
- **Styling:** Modern Vanilla CSS3 Design System with CSS Variables, Flexbox, CSS Grid, Glassmorphism, and responsive media queries.
- **Logic:** Vanilla JavaScript (ES6+ modular closures)
- **Persistence Layer:** `localStorage` local database fallback (mirrors relational/document schemas with instant seeding).

---

## Module Guide & Features

| Module | Feature Area | Description |
|---|---|---|
| **Module 1** | **Landing Page Showcases** | Dedicated visual showcase containers with clean comment tags and JS variables. |
| **Module 2** | **Refactored Registration** | Single `"Your Name"` field, 5-option *"Last Passed Course"* dropdown, 15 Pune Engineering Colleges, and real-time **Password Strength Meter**. |
| **Module 3** | **Top Navigation Bar Layout** | Fixed top navigation header (Coursera/LinkedIn inspired) with 7 primary tabs, live search, notifications, and profile dropdown. |
| **Module 4** | **Connections & Direct Messaging** | Searchable peer/faculty/recruiter directory with toggleable Connect status and real-time Direct Messaging drawer. |
| **Module 5** | **Jobs & Skill Matcher** | Percentage matching algorithm `((Matched Skills / Required Skills) * 100)` with visual badges, 1-click apply, applied jobs, and accepted offers. |
| **Module 6** | **Courses, Quizzes & Certificates** | Multi-module interactive lesson reader (Python, Web Dev, C++ DSA), ≥70% score assessment requirement, and printable **Certificate of Completion** with unique verification IDs. |
| **Module 7** | **Faculty Portal** | College & Department-filtered student cohort directory, direct messaging, and custom MCQ assessment builder. |
| **Module 8** | **Explore Feed & Community Events** | Social feed with likes and comment threads, Floating Action Button (`+`) for posting updates, and community event hosting. |
| **Module 9** | **Documentation & Firebase Setup** | Step-by-step instructions for asset injection and Firebase/Firestore integration. |

---

## Landing Page Image Placeholders Guide

The landing page reserves dedicated visual containers for 2 showcase images. You can insert your images using either JavaScript variables or direct HTML attributes.

### Option A: Via JavaScript Variables (Recommended)
Open [`app.js`](file:///Users/vibhorsandipjagtap/vscode/Hackathon%20SIH/SIH-2026-ACADEMIA/Hackathon%20SIH/app.js) and update the top configuration variables:

```javascript
// =========================================================================
// MODULE 1: LANDING PAGE SHOWCASE IMAGE VARIABLES & PLACEHOLDERS
// Configure custom image URLs below. If empty, clean SVG placeholders display.
// =========================================================================

// >>> INSERT YOUR SHOWCASE IMAGE 1 URL HERE <<<
const imagePlaceholder1 = "assets/showcase-campus.jpg"; // or https://your-cdn.com/image1.jpg

// >>> INSERT YOUR SHOWCASE IMAGE 2 URL HERE <<<
const imagePlaceholder2 = "assets/showcase-industry.jpg"; // or https://your-cdn.com/image2.jpg
```

### Option B: Via HTML Direct `src` Attributes
Open [`index.html`](file:///Users/vibhorsandipjagtap/vscode/Hackathon%20SIH/SIH-2026-ACADEMIA/Hackathon%20SIH/index.html) around lines 60–90:

```html
<!-- Showcase Image 1 Container -->
<div class="showcase-card" id="showcaseContainer1">
  <div class="showcase-card__media">
    <img id="imagePlaceholder1_img" src="assets/showcase-1.jpg" alt="Campus Verification" class="showcase-img">
  </div>
</div>

<!-- Showcase Image 2 Container -->
<div class="showcase-card" id="showcaseContainer2">
  <div class="showcase-card__media">
    <img id="imagePlaceholder2_img" src="assets/showcase-2.jpg" alt="Industry Hiring" class="showcase-img">
  </div>
</div>
```

---

## Firebase Web SDK (v9 / v10) Integration Guide

SetuSkill is architected to seamlessly transition from `localStorage` mock persistence to live Firebase Authentication and Cloud Firestore database.

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** and name it `SetuSkill-Portal`.
3. In Project Overview, click **Web (</>)** to register a web application.
4. Copy your `firebaseConfig` credentials object.

### Step 2: Include Firebase SDKs in `index.html`
Add Firebase SDK scripts before `backend.js` in [`index.html`](file:///Users/vibhorsandipjagtap/vscode/Hackathon%20SIH/SIH-2026-ACADEMIA/Hackathon%20SIH/index.html):

```html
<!-- Firebase App (Modular SDK v10 via CDN) -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  window.FB_AUTH = getAuth(app);
  window.FB_DB = getFirestore(app);
  console.log("Firebase initialized successfully on SetuSkill!");
</script>
```

---

## Migrating from `localStorage` to Cloud Firestore

### 1. User Registration & Profile Storage

#### `localStorage` Implementation (Current):
```javascript
function createUser(userData) {
  const list = JSON.parse(localStorage.getItem("ss_users") || "[]");
  list.push(userData);
  localStorage.setItem("ss_users", JSON.stringify(list));
  return userData;
}
```

#### Firestore `setDoc` Implementation (Firebase):
```javascript
import { doc, setDoc } from "firebase/firestore";

async function createUserInFirestore(user) {
  const db = window.FB_DB;
  // Save user document into 'users' collection using UID as document ID
  await setDoc(doc(db, "users", user.id), {
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    institute: user.institute,
    branch: user.branch || "",
    currentYear: user.currentYear || "",
    skillsHave: user.skillsHave || [],
    skillsLearn: user.skillsLearn || [],
    verifiedSkills: user.verifiedSkills || [],
    createdAt: new Date().toISOString()
  });
}
```

---

### 2. Fetching User Data

#### `localStorage` Implementation (Current):
```javascript
function getUserById(userId) {
  const list = JSON.parse(localStorage.getItem("ss_users") || "[]");
  return list.find((u) => u.id === userId) || null;
}
```

#### Firestore `getDoc` Implementation (Firebase):
```javascript
import { doc, getDoc } from "firebase/firestore";

async function getUserFromFirestore(userId) {
  const db = window.FB_DB;
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    console.warn("No such user document found!");
    return null;
  }
}
```

---

### 3. Storing Issued Certificates

#### Firestore `setDoc` Collection Example:
```javascript
import { doc, setDoc } from "firebase/firestore";

async function saveCertificateToFirestore(cert) {
  const db = window.FB_DB;
  await setDoc(doc(db, "certificates", cert.verificationId), {
    userId: cert.userId,
    userName: cert.userName,
    courseTitle: cert.courseTitle,
    score: cert.score,
    issuedDate: cert.issuedDate,
    verificationId: cert.verificationId,
    status: "Verified"
  });
}
```

---

## Demo Accounts for Evaluation

Instant login buttons are available on the login page for zero-setup evaluation:

| Role | Demo Email | Password | Pre-loaded Context |
|---|---|---|---|
| **🎓 Student** | `student@demo.com` | `student123` | Priya Sharma, COEP Technological University, Computer Science (3rd Year), Verified in Python, HTML/CSS, JS. |
| **🏛️ Faculty** | `institute@demo.com` | `faculty123` | Dr. Arjun Mehta, PICT Pune, Computer Science Department & TPO. |
| **🏢 Industry** | `industry@demo.com` | `industry123` | TechBridge Solutions Pvt. Ltd., Baner, Pune. |

---

## 15 Pune Engineering Colleges Supported

1. **COEP Technological University** (Shivajinagar)
2. **Vishwakarma Institute of Technology (VIT)** (Bibwewadi)
3. **Pune Institute of Computer Technology (PICT)** (Dhankawadi)
4. **MIT World Peace University (MIT-WPU)** (Kothrud)
5. **Pimpri Chinchwad College of Engineering (PCCOE)** (Akurdi)
6. **AISSMS College of Engineering** (Near RTO)
7. **Cummins College of Engineering for Women** (Karve Nagar)
8. **D.Y. Patil College of Engineering** (Akurdi)
9. **D.Y. Patil Institute of Technology** (Pimpri)
10. **Bharati Vidyapeeth College of Engineering (BVCOE)** (Katraj)
11. **Marathwada Mitra Mandal's College of Engineering (MMCOE)** (Karve Nagar)
12. **Sinhgad College of Engineering** (Vadgaon BK)
13. **JSPM Rajarshi Shahu College of Engineering** (Tathawade)
14. **Progressive Education Society's Modern College of Engineering** (Shivajinagar)
15. **Trinity College of Engineering and Research** (Pisoli)

---

*SetuSkill is developed for the Smart India Hackathon (SIH) — Academia-Industry Collaboration Theme.*
