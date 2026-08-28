/* ============================================================================
   SetuSkill — backend.js (Stage 2 Architecture)
   Mock data & storage layer with full localStorage persistence.
   Manages catalog data, users, sessions, enrollments, interactive course modules,
   assessments, certificates, jobs/internships, connections, direct messages,
   social feed posts & community events.
   ============================================================================ */

(function (global) {
  "use strict";

  const KEYS = {
    INSTITUTES: "ss_institutes",
    SKILLS: "ss_skills",
    COURSES: "ss_courses",
    EVENTS: "ss_events",
    ARTICLES: "ss_articles",
    POSTS: "ss_posts",
    FAQS: "ss_faqs",
    QUIZ_BANK: "ss_quiz_bank",
    USERS: "ss_users",
    SESSION: "ss_session",
    ENROLLMENTS: "ss_enrollments",
    ASSESSMENTS: "ss_assessments",
    CERTIFICATES: "ss_certificates",
    JOBS: "ss_jobs",
    JOB_APPLICATIONS: "ss_job_applications",
    CONNECTIONS: "ss_connections",
    MESSAGES: "ss_messages",
    ACTIVITY: "ss_activity",
    SEED_VERSION: "ss_seed_version"
  };

  // Bump seed version for Stage 2 release
  const SEED_VERSION = "stage2_v1.0";

  /* ------------------------------------------------------------------ */
  /* 15 Engineering Colleges in Pune (Module 2 Requirement)              */
  /* ------------------------------------------------------------------ */
  const SEED_INSTITUTES = [
    { id: "inst-pune-1", name: "COEP Technological University", location: "Shivajinagar, Pune" },
    { id: "inst-pune-2", name: "Vishwakarma Institute of Technology (VIT)", location: "Bibwewadi, Pune" },
    { id: "inst-pune-3", name: "Pune Institute of Computer Technology (PICT)", location: "Dhankawadi, Pune" },
    { id: "inst-pune-4", name: "MIT World Peace University (MIT-WPU)", location: "Kothrud, Pune" },
    { id: "inst-pune-5", name: "Pimpri Chinchwad College of Engineering (PCCOE)", location: "Akurdi, Pune" },
    { id: "inst-pune-6", name: "AISSMS College of Engineering", location: "Near RTO, Pune" },
    { id: "inst-pune-7", name: "Cummins College of Engineering for Women", location: "Karve Nagar, Pune" },
    { id: "inst-pune-8", name: "D.Y. Patil College of Engineering (Akurdi)", location: "Akurdi, Pune" },
    { id: "inst-pune-9", name: "D.Y. Patil Institute of Technology (Pimpri)", location: "Pimpri, Pune" },
    { id: "inst-pune-10", name: "Bharati Vidyapeeth College of Engineering (BVCOE)", location: "Katraj, Pune" },
    { id: "inst-pune-11", name: "Marathwada Mitra Mandal's College of Engineering (MMCOE)", location: "Karve Nagar, Pune" },
    { id: "inst-pune-12", name: "Sinhgad College of Engineering (Vadgaon)", location: "Vadgaon BK, Pune" },
    { id: "inst-pune-13", name: "JSPM Rajarshi Shahu College of Engineering", location: "Tathawade, Pune" },
    { id: "inst-pune-14", name: "Progressive Education Society's Modern College of Engineering", location: "Shivajinagar, Pune" },
    { id: "inst-pune-15", name: "Trinity College of Engineering and Research", location: "Pisoli, Pune" }
  ];

  /* ------------------------------------------------------------------ */
  /* Seed Users & Demo Accounts                                         */
  /* ------------------------------------------------------------------ */
  const DEMO_ACCOUNTS = [
    {
      id: "demo-student",
      role: "student",
      email: "student@demo.com",
      passwordHash: btoa(unescape(encodeURIComponent("student123"))),
      fullName: "Priya Sharma",
      firstName: "Priya",
      lastName: "Sharma",
      contact: "9812345678",
      gender: "Female",
      state: "Maharashtra",
      city: "Pune",
      institute: "inst-pune-1",
      studentId: "COEP2024CS082",
      academicPercentage: 86.4,
      lastCourse: "Bachelor's Degree",
      branch: "Computer Science",
      currentYear: "3rd Year",
      dob: "2003-06-15",
      dobLocked: true,
      headline: "Aspiring Full Stack Engineer & Cloud Enthusiast | COEP Tech '27",
      bio: "Passionate about building scalable web applications, open source contributions, and deep tech problem solving.",
      skillsHave: ["Python", "HTML/CSS", "JavaScript", "SQL", "Git & GitHub", "React", "Data Structures & Algorithms"],
      skillsLearn: ["Cloud Computing (AWS)", "DevOps", "Docker", "Machine Learning"],
      verifiedSkills: ["Python", "HTML/CSS", "JavaScript"],
      qualifications: ["12th_HSC_Certificate.pdf", "Python_Foundations_Badge.pdf"],
      photo: null,
      profileComplete: true,
      createdAt: "2026-01-10T08:00:00.000Z"
    },
    {
      id: "demo-faculty",
      role: "faculty",
      email: "institute@demo.com",
      passwordHash: btoa(unescape(encodeURIComponent("faculty123"))),
      fullName: "Dr. Arjun Mehta",
      firstName: "Dr. Arjun",
      lastName: "Mehta",
      contact: "9823456789",
      gender: "Male",
      state: "Maharashtra",
      city: "Pune",
      institute: "inst-pune-3",
      facultyId: "PICT-FAC-2021",
      registrationNumber: "REG-PICT-10982",
      lastCourse: "Bachelor's Degree",
      facultyDepartment: "Computer Science",
      isTpo: true,
      tpoId: "TPO-PICT-2026",
      headline: "Professor & Training & Placement Officer | PICT Pune",
      bio: "Guiding students toward industry excellence, organizing technical hackathons, and bridging academia with tier-1 recruiters.",
      skillsHave: ["Data Structures & Algorithms", "Machine Learning", "Python", "Java", "Cloud Computing (AWS)"],
      skillsLearn: ["DevOps", "Cybersecurity"],
      verifiedSkills: ["Data Structures & Algorithms", "Python", "Java"],
      qualifications: ["PhD_Computer_Science.pdf"],
      photo: null,
      profileComplete: true,
      createdAt: "2025-07-01T09:00:00.000Z"
    },
    {
      id: "demo-industry",
      role: "industry",
      email: "industry@demo.com",
      passwordHash: btoa(unescape(encodeURIComponent("industry123"))),
      fullName: "TechBridge Solutions Pvt. Ltd.",
      companyName: "TechBridge Solutions Pvt. Ltd.",
      businessEmail: "industry@demo.com",
      corporateId: "U72200MH2020PTC340012",
      sector: "Information Technology",
      contact: "9834567890",
      city: "Pune",
      state: "Maharashtra",
      employeeCount: "450+",
      headline: "Next-Gen Software & Cloud Transformation Partner",
      bio: "Accelerating digital enterprise transformation. Hiring top engineering talent across Pune universities.",
      skillsHave: ["React", "Node.js", "Python", "DevOps", "Kubernetes", "Cloud Computing (AWS)"],
      skillsLearn: [],
      verifiedSkills: [],
      qualifications: [],
      photo: null,
      profileComplete: true,
      createdAt: "2025-09-01T10:00:00.000Z"
    },
    // Additional Community Profiles for Connections & Faculty Directory
    {
      id: "user-stu-2",
      role: "student",
      email: "rohit.kulkarni@vit.edu",
      passwordHash: btoa(unescape(encodeURIComponent("student123"))),
      fullName: "Rohit Kulkarni",
      firstName: "Rohit",
      lastName: "Kulkarni",
      contact: "9876543210",
      gender: "Male",
      state: "Maharashtra",
      city: "Pune",
      institute: "inst-pune-2",
      studentId: "VIT2024IT104",
      academicPercentage: 88.2,
      lastCourse: "12th Standard",
      branch: "Information Technology",
      currentYear: "3rd Year",
      headline: "AI / ML Researcher & Competitive Programmer | VIT Pune",
      skillsHave: ["Python", "C++", "Data Structures & Algorithms", "Machine Learning", "SQL"],
      skillsLearn: ["Deep Learning", "Cloud Computing (AWS)"],
      verifiedSkills: ["C++", "Data Structures & Algorithms", "Python"],
      profileComplete: true,
      createdAt: "2026-01-15T10:00:00.000Z"
    },
    {
      id: "user-stu-3",
      role: "student",
      email: "ananya.deshmukh@pict.edu",
      passwordHash: btoa(unescape(encodeURIComponent("student123"))),
      fullName: "Ananya Deshmukh",
      firstName: "Ananya",
      lastName: "Deshmukh",
      contact: "9876501234",
      gender: "Female",
      state: "Maharashtra",
      city: "Pune",
      institute: "inst-pune-3",
      studentId: "PICT2023CS045",
      academicPercentage: 91.5,
      lastCourse: "Bachelor's Degree",
      branch: "Computer Science",
      currentYear: "4th Year",
      headline: "Backend Specialist & Cloud Architect Intern | PICT Pune",
      skillsHave: ["Java", "SQL", "MySQL", "Cloud Computing (AWS)", "Docker", "Git & GitHub"],
      skillsLearn: ["Kubernetes", "Rust"],
      verifiedSkills: ["Java", "SQL", "MySQL"],
      profileComplete: true,
      createdAt: "2026-01-18T11:00:00.000Z"
    },
    {
      id: "user-stu-4",
      role: "student",
      email: "tanmay.joshi@pccoe.edu",
      passwordHash: btoa(unescape(encodeURIComponent("student123"))),
      fullName: "Tanmay Joshi",
      firstName: "Tanmay",
      lastName: "Joshi",
      contact: "9876512399",
      gender: "Male",
      state: "Maharashtra",
      city: "Pune",
      institute: "inst-pune-5",
      studentId: "PCCOE2024ENTC019",
      academicPercentage: 79.8,
      lastCourse: "Diploma",
      branch: "Electronics",
      currentYear: "2nd Year",
      headline: "IoT Enthusiast & Robotics Engineer | PCCOE Pune",
      skillsHave: ["C", "C++", "IoT", "Robotics", "Embedded Systems"],
      skillsLearn: ["Python", "Data Structures & Algorithms"],
      verifiedSkills: ["C", "IoT"],
      profileComplete: true,
      createdAt: "2026-02-01T08:30:00.000Z"
    },
    {
      id: "user-stu-5",
      role: "student",
      email: "neha.patil@pict.edu",
      passwordHash: btoa(unescape(encodeURIComponent("student123"))),
      fullName: "Neha Patil",
      firstName: "Neha",
      lastName: "Patil",
      contact: "9876599887",
      gender: "Female",
      state: "Maharashtra",
      city: "Pune",
      institute: "inst-pune-3",
      studentId: "PICT2024CS112",
      academicPercentage: 84.0,
      lastCourse: "12th Standard",
      branch: "Computer Science",
      currentYear: "2nd Year",
      headline: "Frontend Web Developer | React & UI/UX Enthusiast",
      skillsHave: ["HTML/CSS", "JavaScript", "React", "UI/UX Design", "Git & GitHub"],
      skillsLearn: ["TypeScript", "Node.js"],
      verifiedSkills: ["HTML/CSS", "JavaScript"],
      profileComplete: true,
      createdAt: "2026-02-10T12:00:00.000Z"
    },
    {
      id: "user-fac-2",
      role: "faculty",
      email: "smita.kulkarni@coep.ac.in",
      passwordHash: btoa(unescape(encodeURIComponent("faculty123"))),
      fullName: "Prof. Smita Kulkarni",
      firstName: "Smita",
      lastName: "Kulkarni",
      contact: "9822334455",
      gender: "Female",
      state: "Maharashtra",
      city: "Pune",
      institute: "inst-pune-1",
      facultyId: "COEP-FAC-102",
      registrationNumber: "REG-COEP-4421",
      lastCourse: "Bachelor's Degree",
      facultyDepartment: "Computer Science",
      isTpo: false,
      headline: "Associate Professor (CS & Data Systems) | COEP Tech",
      skillsHave: ["Python", "SQL", "Data Analytics", "Data Structures & Algorithms"],
      skillsLearn: ["Cloud Computing (Azure)"],
      verifiedSkills: ["Python", "Data Structures & Algorithms"],
      profileComplete: true,
      createdAt: "2025-08-10T09:00:00.000Z"
    },
    {
      id: "user-ind-2",
      role: "industry",
      email: "recruiter@persistent.com",
      passwordHash: btoa(unescape(encodeURIComponent("industry123"))),
      fullName: "Persistent Systems Ltd.",
      companyName: "Persistent Systems Ltd.",
      businessEmail: "recruiter@persistent.com",
      corporateId: "L72300PN1990PLC056696",
      sector: "Information Technology",
      contact: "020-67030000",
      city: "Pune",
      state: "Maharashtra",
      employeeCount: "23,000+",
      headline: "Global Digital Engineering and Enterprise Modernization Leader",
      skillsHave: ["Java", "Cloud Computing (AWS)", "React", "DevOps", "Python"],
      skillsLearn: [],
      verifiedSkills: [],
      profileComplete: true,
      createdAt: "2025-10-01T10:00:00.000Z"
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Master Skills Catalog                                              */
  /* ------------------------------------------------------------------ */
  const SEED_SKILLS = [
    "C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust",
    "Kotlin", "Swift", "PHP", "R Programming", "MATLAB", "SQL", "MySQL",
    "PostgreSQL", "MongoDB", "HTML/CSS", "React", "Node.js", "Django",
    "Flutter", "Android Development", "iOS Development",
    "Data Structures & Algorithms", "Operating Systems", "Computer Networks",
    "Cybersecurity", "Cloud Computing (AWS)", "Cloud Computing (Azure)",
    "DevOps", "Docker", "Kubernetes", "Blockchain", "Machine Learning",
    "Deep Learning", "Data Science", "Data Analytics", "Data Visualization",
    "Excel", "Power BI", "Tableau", "Git & GitHub", "UI/UX Design",
    "Digital Marketing", "SEO", "Content Writing", "Graphic Design",
    "Video Editing", "Accounting", "Financial Analysis", "Taxation",
    "Business Analytics", "Project Management", "Supply Chain Management",
    "Human Resource Management", "Salesforce", "Robotics", "IoT",
    "3D Printing & CAD", "Embedded Systems", "Communication Skills",
    "Public Speaking", "Entrepreneurship"
  ];

  /* ------------------------------------------------------------------ */
  /* Interactive Courses with Detailed Modules (Module 6 Requirement)  */
  /* ------------------------------------------------------------------ */
  const SEED_COURSES = [
    {
      id: "python",
      title: "Python Programming",
      description: "From core syntax to object-oriented programming, data structures, and script automation with real-world mini projects.",
      duration: "6 weeks",
      rating: 4.8,
      level: "Beginner",
      provider: "SetuSkill Academy",
      icon: "🐍",
      modules: [
        {
          id: "py-mod-1",
          title: "Module 1: Syntax, Variables & Control Flow",
          summary: "Master data types, conditional statements, list comprehensions, and iteration constructs in Python 3.12.",
          content: `### 1.1 Python Core Philosophy & Environment Setup
Python is a dynamically typed, interpreted language emphasizing code readability with significant whitespace indentation.

\`\`\`python
# Dynamic Variable Assignment
student_name = "Priya Sharma"
enrolled_credits = 24
gpa = 8.64
is_verified = True

print(f"Learner: {student_name} | GPA: {gpa}")
\`\`\`

### 1.2 Control Flow & Pythonic Loops
Use \`if-elif-else\` blocks alongside iterable loops and list comprehensions for concise, idiomatic execution:

\`\`\`python
scores = [82, 94, 67, 88, 91]
distinction_students = [score for score in scores if score >= 75]
print("Distinction scores:", distinction_students)
\`\`\`

### 1.3 Key Checkpoint
- Python lists are mutable ordered collections.
- Tuples \`(1, 2)\` are immutable and hashable.
- Dictionaries use hash tables for O(1) average lookup.`
        },
        {
          id: "py-mod-2",
          title: "Module 2: Functions, Data Structures & Modules",
          summary: "Define reusable functions, lambda expressions, dictionary manipulations, and file I/O operations.",
          content: `### 2.1 First-Class Functions & Default Arguments
In Python, functions can be assigned to variables, passed as arguments, and returned from other functions:

\`\`\`python
def calculate_skill_match(user_skills, required_skills):
    matched = set(user_skills) & set(required_skills)
    match_pct = round((len(matched) / len(required_skills)) * 100, 1)
    return match_pct, list(matched)

skills_have = ["Python", "SQL", "Git"]
required = ["Python", "SQL", "Docker", "AWS"]
pct, matches = calculate_skill_match(skills_have, required)
print(f"Skill Match: {pct}% | Common: {matches}")
\`\`\`

### 2.2 Exception Handling & Safe File Operations
Always use the context manager \`with\` statement for robust file stream cleanup:

\`\`\`python
try:
    with open("skills_ledger.txt", "w", encoding="utf-8") as f:
        f.write("Verified Skill ID: PY-2026-01\\n")
except IOError as err:
    print(f"File write error: {err}")
\`\`\``
        },
        {
          id: "py-mod-3",
          title: "Module 3: Object-Oriented Architecture & Practical Scripting",
          summary: "Construct classes, inheritance hierarchies, custom decorators, and REST API consumers.",
          content: `### 3.1 Object-Oriented Programming (OOP)
Encapsulate student and curriculum entities using clean classes with dunder methods:

\`\`\`python
class VerifiedStudent:
    def __init__(self, name, college, roll_no):
        self.name = name
        self.college = college
        self.roll_no = roll_no
        self._skills = []

    def add_verified_badge(self, badge_name):
        if badge_name not in self._skills:
            self._skills.append(badge_name)

    def __repr__(self):
        return f"<Student {self.name} ({self.college}) - {len(self._skills)} Badges>"

student = VerifiedStudent("Priya", "COEP Tech", "CS082")
student.add_verified_badge("Python")
print(student)
\`\`\`

### 3.2 Skill Assessment Readiness
You have completed all 3 modules! Click **Take Skill Assessment** to earn your verified badge and digital certificate.`
        }
      ]
    },
    {
      id: "htmlcss",
      title: "Web Development (HTML/CSS/JS)",
      description: "Modern frontend architecture: semantic HTML5, Flexbox & CSS Grid, Vanilla JavaScript DOM operations, and responsive web design.",
      duration: "6 weeks",
      rating: 4.9,
      level: "Beginner",
      provider: "SetuSkill Academy",
      icon: "🌐",
      modules: [
        {
          id: "web-mod-1",
          title: "Module 1: Semantic HTML5 & Accessible Document Trees",
          summary: "Structure clean, accessible web pages using semantic tags, metadata, forms, and ARIA landmarks.",
          content: `### 1.1 Document Architecture
Semantic tags convey role and meaning to assistive technology, search engines, and browsers:

\`\`\`html
<header class="navbar">
  <nav aria-label="Main navigation">
    <a href="#learn" class="nav-link">Learn</a>
    <a href="#jobs" class="nav-link">Jobs</a>
  </nav>
</header>
<main>
  <article class="course-summary">
    <h1>Web Development Mastery</h1>
  </article>
</main>
\`\`\`

### 1.2 Form Validation & Accessible Inputs
Use dedicated input types (\`email\`, \`tel\`, \`number\`) and explicit \`<label for="">\` relationships for maximum accessibility.`
        },
        {
          id: "web-mod-2",
          title: "Module 2: Modern CSS3 (Variables, Flexbox & Grid)",
          summary: "Master design tokens with CSS custom properties, responsive layouts, glassmorphism, and transition effects.",
          content: `### 2.1 CSS Variables & Design Tokens
\`\`\`css
:root {
  --color-primary: #123a63;
  --color-accent: #de6d1f;
  --color-surface: #ffffff;
  --shadow-card: 0 4px 20px rgba(18, 58, 99, 0.08);
}

.card {
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  border-radius: 12px;
  transition: transform 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
}
\`\`\`

### 2.2 Two-Dimensional Grid Systems
\`\`\`css
.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}
\`\`\``
        },
        {
          id: "web-mod-3",
          title: "Module 3: Vanilla JavaScript (ES6+), Event Delegation & Storage",
          summary: "Build dynamic Single Page Applications using event bubbling, async fetch, and localStorage persistence.",
          content: `### 3.1 Clean Event Delegation & DOM Rendering
Avoid attaching hundred listeners by listening on a common parent container:

\`\`\`javascript
const container = document.querySelector("#jobListingsingsingsings");
container.addEventListener("click", (event) => {
  const applyBtn = event.target.closest("[data-apply-id]");
  if (!applyBtn) return;
  const jobId = applyBtn.dataset.applyId;
  applyForJob(jobId);
});
\`\`\`

### 3.2 Persistent State Storage
\`\`\`javascript
function saveUserSkill(skillName) {
  const current = JSON.parse(localStorage.getItem("user_skills") || "[]");
  if (!current.includes(skillName)) {
    current.push(skillName);
    localStorage.setItem("user_skills", JSON.stringify(current));
  }
}
\`\`\``
        }
      ]
    },
    {
      id: "cpp",
      title: "Data Structures in C++",
      description: "Master pointers, memory management, STL containers, linked lists, binary search trees, and asymptotic algorithmic analysis in C++20.",
      duration: "7 weeks",
      rating: 4.8,
      level: "Intermediate",
      provider: "SetuSkill Academy",
      icon: "⚡",
      modules: [
        {
          id: "cpp-mod-1",
          title: "Module 1: Pointers, References & Dynamic Memory",
          summary: "Understand memory addresses, raw and smart pointers (\`std::unique_ptr\`), and the stack vs heap.",
          content: `### 1.1 Pointer Arithmetic & Memory Allocation
In C++, dynamic memory is allocated on the heap via \`new\` and must be freed with \`delete\` to prevent leaks:

\`\`\`cpp
#include <iostream>
#include <memory>

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

int main() {
    // Smart Pointer (RAII Memory Management)
    std::unique_ptr<Node> head = std::make_unique<Node>(100);
    std::cout << "Root node value: " << head->data << std::endl;
    return 0;
}
\`\`\``
        },
        {
          id: "cpp-mod-2",
          title: "Module 2: Linear Data Structures (Lists, Stacks & Queues)",
          summary: "Implement singly & doubly linked lists, stack evaluation algorithms, and ring buffers from scratch.",
          content: `### 2.1 Singly Linked List Implementation
\`\`\`cpp
class LinkedList {
private:
    Node* head;
public:
    LinkedList() : head(nullptr) {}
    void insertFront(int val) {
        Node* newNode = new Node(val);
        newNode->next = head;
        head = newNode;
    }
};
\`\`\`

### 2.2 Time & Space Complexity Analysis
- Stack Push / Pop: \`O(1)\` time
- Linked List search: \`O(n)\` time
- Queue enqueue / dequeue: \`O(1)\` time`
        },
        {
          id: "cpp-mod-3",
          title: "Module 3: Non-Linear Structures & Graph Traversals",
          summary: "Binary Search Trees (BST), AVL balance conditions, Breadth-First Search (BFS), and Dijkstra's Shortest Path.",
          content: `### 3.1 Binary Search Tree Property
For any node \`N\`, all nodes in the left subtree have values \`< N.val\`, and all in the right have values \`> N.val\`.

\`\`\`cpp
bool searchBST(Node* root, int key) {
    if (root == nullptr) return false;
    if (root->data == key) return true;
    if (key < root->data) return searchBST(root->left, key);
    return searchBST(root->right, key);
}
\`\`\`

### 3.2 Assessment Ready
You are now ready to take the Data Structures in C++ verification exam!`
        }
      ]
    },
    { id: "java", title: "Java Essentials", description: "Object-oriented programming fundamentals, Collections framework, and multi-threading through hands-on Java 21 projects.", duration: "8 weeks", rating: 4.6, level: "Beginner", provider: "PICT Labs Online", icon: "☕" },
    { id: "mysql", title: "Database Design with MySQL", description: "Model, query, and optimize relational databases, indexing, stored procedures, and 3NF normalization.", duration: "5 weeks", rating: 4.5, level: "Beginner", provider: "COEP Tech Labs", icon: "🗄️" },
    { id: "accounting", title: "Accounting Fundamentals", description: "Ledgers, balance sheets, and financial statements for tech managers and non-finance founders.", duration: "6 weeks", rating: 4.3, level: "Beginner", provider: "MIT-WPU Management School", icon: "📒" },
    { id: "blockchain", title: "Blockchain Foundations", description: "Understand distributed ledgers, cryptographic proofs, Solidity smart contracts, and Web3 use cases.", duration: "5 weeks", rating: 4.4, level: "Intermediate", provider: "SetuSkill Academy", icon: "⛓️" },
    { id: "cybersecurity", title: "Cybersecurity Basics", description: "Threat vectors, network defense, penetration testing foundations, and OWASP Top 10 security guidelines.", duration: "6 weeks", rating: 4.7, level: "Intermediate", provider: "VIT Cyber Cell", icon: "🛡️" },
    { id: "digitalmarketing", title: "Digital Marketing Bootcamp", description: "Technical SEO, SEM analytics, growth loops, and social media campaign optimization.", duration: "4 weeks", rating: 4.4, level: "Beginner", provider: "Modern College Innovation Hub", icon: "📣" },
    { id: "excel", title: "Excel & Power BI for Analytics", description: "Advanced formulas, pivot tables, DAX queries, and executive dashboards for everyday business intelligence.", duration: "4 weeks", rating: 4.7, level: "Beginner", provider: "SetuSkill Academy", icon: "📊" }
  ];

  /* ------------------------------------------------------------------ */
  /* Seed Jobs & Internships with Required Skills (Module 5)            */
  /* ------------------------------------------------------------------ */
  const SEED_JOBS = [
    {
      id: "job-1",
      title: "Software Development Engineer Intern",
      companyName: "TechBridge Solutions Pvt. Ltd.",
      location: "Baner, Pune (Hybrid)",
      employeeCount: "450+ employees",
      type: "Internship",
      stipend: "₹25,000 / month",
      description: "Join our core engineering team to build scalable microservices and customer-facing web platforms. Great mentorship and PPO opportunity upon performance review.",
      requiredSkills: ["Python", "JavaScript", "HTML/CSS", "Git & GitHub", "SQL"],
      postedDate: "2026-08-20",
      openings: 5
    },
    {
      id: "job-2",
      title: "Full Stack Web Developer (React + Node.js)",
      companyName: "Persistent Systems Ltd.",
      location: "Hinjawadi Phase 1, Pune",
      employeeCount: "23,000+ employees",
      type: "Full-Time Graduate",
      stipend: "₹6.5 - ₹9.0 LPA",
      description: "Looking for proactive engineers skilled in modern JavaScript/TypeScript, React SPAs, and RESTful microservices. Direct collaboration with Fortune 500 enterprise clients.",
      requiredSkills: ["React", "JavaScript", "HTML/CSS", "Node.js", "SQL", "Git & GitHub"],
      postedDate: "2026-08-22",
      openings: 12
    },
    {
      id: "job-3",
      title: "Data Analyst & Business Intelligence Trainee",
      companyName: "Tata Technologies",
      location: "Hinjawadi, Pune",
      employeeCount: "11,000+ employees",
      type: "Internship",
      stipend: "₹22,000 / month",
      description: "Analyze real-time manufacturing telemetry datasets, write complex SQL queries, and construct interactive dashboards using Excel and Power BI.",
      requiredSkills: ["Python", "SQL", "Excel", "Data Analytics", "Power BI"],
      postedDate: "2026-08-23",
      openings: 4
    },
    {
      id: "job-4",
      title: "Cloud & DevOps Engineering Intern",
      companyName: "Zensar Technologies",
      location: "Kharadi, Pune (On-site)",
      employeeCount: "10,000+ employees",
      type: "Internship",
      stipend: "₹28,000 / month",
      description: "Help automate CI/CD release pipelines, manage containerized deployments with Docker and Kubernetes, and monitor AWS cloud infrastructure.",
      requiredSkills: ["Cloud Computing (AWS)", "Docker", "Git & GitHub", "DevOps", "Python"],
      postedDate: "2026-08-24",
      openings: 3
    },
    {
      id: "job-5",
      title: "C++ Systems & Algorithm Specialist",
      companyName: "Bajaj Finserv Health",
      location: "Viman Nagar, Pune",
      employeeCount: "4,500+ employees",
      type: "Full-Time",
      stipend: "₹8.0 - ₹12.0 LPA",
      description: "Design high-performance backend routing and transaction engines. Requires strong command of C++20, STL, memory optimization, and multithreading.",
      requiredSkills: ["C++", "Data Structures & Algorithms", "SQL", "Git & GitHub"],
      postedDate: "2026-08-25",
      openings: 6
    },
    {
      id: "job-6",
      title: "Embedded Systems & IoT Developer",
      companyName: "KPIT Technologies",
      location: "Hinjawadi Phase 3, Pune",
      employeeCount: "8,500+ employees",
      type: "Internship",
      stipend: "₹20,000 / month",
      description: "Work on automotive middleware, microcontroller interfacing, CAN bus telemetry, and embedded C/C++ firmware applications.",
      requiredSkills: ["C", "C++", "Embedded Systems", "IoT", "Robotics"],
      postedDate: "2026-08-26",
      openings: 4
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Seed Events & Social Feed (Modules 7 & 8)                          */
  /* ------------------------------------------------------------------ */
  const SEED_EVENTS = [
    { id: "evt-1", title: "Pune Tech Conclave 2026: AI in Cloud Computing", type: "Conference", date: "2026-09-08", location: "COEP Tech — Main Auditorium", organizer: "COEP Technological University", attendees: 340, description: "Keynote talks by Silicon Valley CTOs and live panel discussions on edge intelligence and cloud scalability." },
    { id: "evt-2", title: "PICT Annual Hackathon: Academia to Industry", type: "Hackathon", date: "2026-09-15", location: "PICT Pune — Computing Center", organizer: "PICT TPO Cell", attendees: 520, description: "36-hour coding challenge solving national infrastructure and skill-mapping problem statements." },
    { id: "evt-3", title: "Resume & Technical Interview Masterclass", type: "Workshop", date: "2026-09-20", location: "VIT Pune — Seminar Hall 2", organizer: "Vishwakarma Institute of Technology", attendees: 180, description: "Hands-on resume reviews, live mock coding interviews, and HR communication strategies." },
    { id: "evt-4", title: "TechBridge On-Campus Hiring Drive 2026", type: "Placement Drive", date: "2026-09-28", location: "PCCOE Akurdi — Campus Hub", organizer: "TechBridge Solutions", attendees: 260, description: "Exclusive hiring drive for 2026 & 2027 batch engineers with immediate offer letters for SDE & DevOps roles." }
  ];

  const SEED_POSTS = [
    {
      id: "post-1",
      author: "Dr. Arjun Mehta",
      authorRole: "Faculty & TPO · PICT Pune",
      authorAvatar: "AM",
      authorId: "demo-faculty",
      title: "PICT Q3 Placement Milestone: 94% Placement in Cloud & SDE Roles",
      content: "Thrilled to share our latest placement statistics! Over 380 students have been placed with tier-1 technology partners. A strong focus on verified hands-on skills in Python, Java, and DSA is giving our students a clear edge in hiring rounds.",
      likes: 142,
      likedBy: ["demo-student"],
      comments: [
        { id: "c-1", author: "Priya Sharma", role: "Student", text: "Proud to see PICT leading the way! The verified skill badges on SetuSkill helped tremendously.", timestamp: "2026-08-25T14:30:00.000Z" }
      ],
      timestamp: "2026-08-25T10:00:00.000Z",
      location: "Pune, India"
    },
    {
      id: "post-2",
      author: "TechBridge Solutions Pvt. Ltd.",
      authorRole: "Industry Partner",
      authorAvatar: "TB",
      authorId: "demo-industry",
      title: "Hiring 20+ Engineering Interns Across Pune Campuses",
      content: "We're expanding our Pune R&D center! Looking for students with proven foundations in Web Development (HTML/CSS/JS/React), Python scripting, and Git. Check out the Jobs tab to apply directly with your verified SetuSkill profile.",
      likes: 98,
      likedBy: [],
      comments: [
        { id: "c-2", author: "Rohit Kulkarni", role: "Student", text: "Just submitted my application with 100% skill match! Looking forward to the review.", timestamp: "2026-08-26T16:00:00.000Z" }
      ],
      timestamp: "2026-08-26T09:15:00.000Z",
      location: "Baner, Pune"
    },
    {
      id: "post-3",
      author: "COEP Technological University",
      authorRole: "Institute",
      authorAvatar: "CU",
      authorId: "inst-pune-1",
      title: "SetuSkill National Ledger Integration Complete",
      content: "COEP Tech has officially synced all 2026 batch academic courses with the SetuSkill verification pipeline. Students can now directly take skill assessments and showcase authenticated certificates to recruiters.",
      likes: 215,
      likedBy: ["demo-student", "demo-faculty"],
      comments: [],
      timestamp: "2026-08-27T11:00:00.000Z",
      location: "Shivajinagar, Pune"
    }
  ];

  const SEED_FAQS = [
    { q: "How do I earn a verified skill badge and certificate?", a: "Complete the interactive course modules under the Learn & Upskill tab, then take the 10-question skill assessment. Scoring ≥70% instantly awards a verified badge and generates a tamper-evident Certificate of Completion with a unique Verification ID." },
    { q: "How does the Job Skill Matcher work?", a: "The skill match algorithm computes % Match = (Matching Skills ÷ Required Skills) × 100 based on the skills in your verified profile compared against each company's job requirements." },
    { q: "How do I connect and chat with mentors and peers?", a: "Visit the Connections tab to browse students, faculty, and industry leaders. Click 'Connect'. Once connected, open the Direct Messaging drawer to start a real-time conversation." },
    { q: "Can teachers upload custom assessments?", a: "Yes! Faculty members have a dedicated 'Upload Assessment' tool to build multiple-choice questions that are immediately added to the global student assessment pool." },
    { q: "Where do I find my earned certificates?", a: "All certificates you achieve by scoring ≥70% on assessments are permanently archived under your Profile Modal -> Certificates tab, with instant print and verification capabilities." }
  ];

  /* ------------------------------------------------------------------ */
  /* Quiz Bank (10 Questions per track, ≥70% pass threshold)            */
  /* ------------------------------------------------------------------ */
  const SEED_QUIZ_BANK = {
    python: [
      { q: "Which keyword defines a function in Python?", options: ["func", "def", "function", "lambda"], correct: 1 },
      { q: "What data type is the result of 7 / 2 in Python 3?", options: ["int", "float", "str", "complex"], correct: 1 },
      { q: "Which method adds an item to the end of a list?", options: ["push()", "append()", "add()", "insert()"], correct: 1 },
      { q: "What does 'len([1,2,3,4])' return?", options: ["3", "4", "5", "Error"], correct: 1 },
      { q: "Which symbol starts a single-line comment in Python?", options: ["//", "#", "/*", "--"], correct: 1 },
      { q: "What is the output of 'type(5.0)'?", options: ["int", "float", "double", "number"], correct: 1 },
      { q: "Which of these is an immutable data type?", options: ["list", "dict", "tuple", "set"], correct: 2 },
      { q: "How do you open a file for reading in Python?", options: ["open('file.txt','r')", "read('file.txt')", "file.open('file.txt')", "load('file.txt')"], correct: 0 },
      { q: "What does 'pip' primarily manage in Python?", options: ["Virtual environments", "Python packages", "File permissions", "Threads"], correct: 1 },
      { q: "Which built-in module is used to work with JSON data?", options: ["fetch", "xml", "json", "serialize"], correct: 2 }
    ],
    htmlcss: [
      { q: "Which HTML5 tag is used for the main navigation links?", options: ["<menu>", "<nav>", "<navigation>", "<links>"], correct: 1 },
      { q: "Which CSS property controls text font size?", options: ["text-style", "font-size", "text-size", "font-style"], correct: 1 },
      { q: "What does the standard CSS box model NOT include?", options: ["Margin", "Border", "Padding", "Position"], correct: 3 },
      { q: "Which HTML attribute provides alternative text for accessibility?", options: ["title", "alt", "desc", "caption"], correct: 1 },
      { q: "Which CSS flexbox property stacks items vertically?", options: ["flex-direction: row", "flex-direction: column", "flex-wrap: wrap", "justify-content: column"], correct: 1 },
      { q: "Which selector targets an element with ID 'header' in CSS?", options: [".header", "#header", "*header", "header{}"], correct: 1 },
      { q: "What CSS unit scales relative to the root <html> element font size?", options: ["em", "px", "rem", "vh"], correct: 2 },
      { q: "Which method attaches an event listener in JavaScript?", options: ["elem.attach()", "elem.addEventListener()", "elem.listen()", "elem.on()"], correct: 1 },
      { q: "How do you parse a JSON string into a JavaScript object?", options: ["JSON.stringify()", "JSON.parse()", "JSON.toObject()", "JSON.decode()"], correct: 1 },
      { q: "Which storage mechanism persists data without expiry in the browser?", options: ["sessionStorage", "localStorage", "cookie", "indexedRAM"], correct: 1 }
    ],
    cpp: [
      { q: "Which operator allocates memory dynamically in C++?", options: ["malloc", "new", "alloc", "create"], correct: 1 },
      { q: "What does STL stand for in C++?", options: ["Standard Type Library", "Standard Template Library", "System Type Layer", "Static Template List"], correct: 1 },
      { q: "Which symbol denotes a pointer variable in C++?", options: ["&", "*", "#", "@"], correct: 1 },
      { q: "What is the default access specifier in a C++ class?", options: ["public", "protected", "private", "internal"], correct: 2 },
      { q: "Which header file is required for std::cout and std::cin?", options: ["<stdio.h>", "<iostream>", "<conio.h>", "<istream.h>"], correct: 1 },
      { q: "What does 'const' before a function parameter guarantee?", options: ["It is optional", "It cannot be modified inside the function", "It is static", "It is global"], correct: 1 },
      { q: "What is the time complexity of searching a balanced Binary Search Tree?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correct: 2 },
      { q: "What does a destructor method in C++ do?", options: ["Creates an object", "Cleans up resources when an object goes out of scope", "Copies an object", "Initializes variables"], correct: 1 },
      { q: "Which STL container implements a Last-In-First-Out (LIFO) structure?", options: ["std::vector", "std::queue", "std::stack", "std::deque"], correct: 2 },
      { q: "What is the time complexity of binary search on a sorted array?", options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"], correct: 2 }
    ],
    java: [
      { q: "Which keyword is used to inherit a class in Java?", options: ["implements", "extends", "inherits", "super"], correct: 1 },
      { q: "What is the entry point method of a Java application?", options: ["start()", "run()", "main()", "init()"], correct: 2 },
      { q: "Which collection interface does not allow duplicate elements?", options: ["List", "Queue", "Set", "Vector"], correct: 2 },
      { q: "What does the 'final' keyword do to a variable?", options: ["Makes it static", "Prevents reassignment", "Deletes it after use", "Makes it private"], correct: 1 },
      { q: "What block handles exceptions in Java?", options: ["try / catch", "if / else", "switch / case", "for / while"], correct: 0 },
      { q: "Which keyword creates a new object in Java?", options: ["new", "create", "instantiate", "alloc"], correct: 0 },
      { q: "What is the size of an 'int' primitive in Java?", options: ["16-bit", "32-bit", "64-bit", "Platform dependent"], correct: 1 },
      { q: "Which Java package contains standard data structures like ArrayList?", options: ["java.lang", "java.io", "java.util", "java.net"], correct: 2 },
      { q: "What is garbage collection in Java?", options: ["Manual memory free", "Automatic memory reclamation of unused objects", "A type of virus", "Disk cleanup tool"], correct: 1 },
      { q: "Which modifier makes a member accessible only within its own class?", options: ["public", "protected", "private", "default"], correct: 2 }
    ],
    mysql: [
      { q: "Which SQL clause filters rows before aggregation?", options: ["HAVING", "WHERE", "GROUP BY", "ORDER BY"], correct: 1 },
      { q: "Which command completely deletes a table and its structure?", options: ["DELETE", "TRUNCATE", "DROP", "REMOVE"], correct: 2 },
      { q: "Which constraint uniquely identifies every record in a table?", options: ["FOREIGN KEY", "PRIMARY KEY", "CHECK", "INDEX"], correct: 1 },
      { q: "Which JOIN returns only matching rows from both tables?", options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], correct: 2 },
      { q: "Which aggregate function counts non-null records?", options: ["SUM()", "COUNT()", "TOTAL()", "ADD()"], correct: 1 },
      { q: "What does relational normalization primarily reduce?", options: ["Query speed", "Data redundancy", "Number of tables", "Index size"], correct: 1 },
      { q: "Which statement modifies existing records in a table?", options: ["UPDATE", "ALTER", "MODIFY", "CHANGE"], correct: 0 },
      { q: "Which SQL clause groups rows sharing a common attribute value?", options: ["ORDER BY", "FILTER BY", "GROUP BY", "SUMMARIZE"], correct: 2 },
      { q: "Which clause restricts the number of returned rows in MySQL?", options: ["TOP", "LIMIT", "ROWCOUNT", "FETCH ONLY"], correct: 1 },
      { q: "A foreign key in a child table references which key in a parent table?", options: ["Any column", "Primary Key", "Index", "Alias"], correct: 1 }
    ],
    cybersecurity: [
      { q: "What does 'phishing' primarily attempt to obtain?", options: ["Hardware access", "Sensitive credentials via deceptive communication", "Network bandwidth", "CPU cycles"], correct: 1 },
      { q: "What is the primary role of a network firewall?", options: ["File compression", "Filtering network traffic according to security rules", "Data recovery", "Antivirus scanning only"], correct: 1 },
      { q: "What is Two-Factor Authentication (2FA)?", options: ["Two passwords for one account", "An independent secondary verification factor", "Two separate user accounts", "A security email only"], correct: 1 },
      { q: "What does symmetric encryption utilize?", options: ["Two different keys", "A single shared secret key for encryption & decryption", "No keys", "Public key infrastructure only"], correct: 1 },
      { q: "What is a DDoS attack designed to accomplish?", options: ["Steal password hashes", "Overwhelm services to render them unavailable", "Encrypt files for ransom", "Install spyware"], correct: 1 },
      { q: "What does HTTPS encrypt between browser and server?", options: ["Only passwords", "The entire HTTP payload & transport channel using TLS", "Only URLs", "Nothing"], correct: 1 },
      { q: "What is 'SQL Injection'?", options: ["Database optimization", "Attacking applications by injecting malicious SQL statements", "Hardware repair", "Data backup"], correct: 1 },
      { q: "What is the purpose of cryptographic hashing?", options: ["Reversible compression", "One-way deterministic fixed-size fingerprint of data", "Speed up downloads", "Encrypt photos"], correct: 1 },
      { q: "What is Cross-Site Scripting (XSS)?", options: ["Database crash", "Injecting malicious client scripts into trusted web pages", "Server hardware failure", "DNS lookup error"], correct: 1 },
      { q: "Why is prompt software patch management essential?", options: ["Increases disk size", "Remediates known vulnerabilities before exploitation", "Changes user UI", "Cleans cache"], correct: 1 }
    ]
  };

  /* ------------------------------------------------------------------ */
  /* Low-Level Storage Helpers                                          */
  /* ------------------------------------------------------------------ */

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("SetuSkill DB read error:", key, e);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("SetuSkill DB write error:", key, e);
    }
  }

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function mockHash(str) {
    return btoa(unescape(encodeURIComponent(String(str))));
  }

  /* ------------------------------------------------------------------ */
  /* Database Seeding                                                   */
  /* ------------------------------------------------------------------ */

  function seed() {
    const currentVersion = localStorage.getItem(KEYS.SEED_VERSION);
    const needsReseed = currentVersion !== SEED_VERSION;

    if (needsReseed || !localStorage.getItem(KEYS.INSTITUTES)) writeJSON(KEYS.INSTITUTES, SEED_INSTITUTES);
    if (needsReseed || !localStorage.getItem(KEYS.SKILLS)) writeJSON(KEYS.SKILLS, SEED_SKILLS);
    if (needsReseed || !localStorage.getItem(KEYS.COURSES)) writeJSON(KEYS.COURSES, SEED_COURSES);
    if (needsReseed || !localStorage.getItem(KEYS.JOBS)) writeJSON(KEYS.JOBS, SEED_JOBS);
    if (needsReseed || !localStorage.getItem(KEYS.EVENTS)) writeJSON(KEYS.EVENTS, SEED_EVENTS);
    if (needsReseed || !localStorage.getItem(KEYS.POSTS)) writeJSON(KEYS.POSTS, SEED_POSTS);
    if (needsReseed || !localStorage.getItem(KEYS.FAQS)) writeJSON(KEYS.FAQS, SEED_FAQS);
    if (needsReseed || !localStorage.getItem(KEYS.QUIZ_BANK)) writeJSON(KEYS.QUIZ_BANK, SEED_QUIZ_BANK);

    // Merge / Overwrite Demo Accounts
    if (needsReseed || !localStorage.getItem(KEYS.USERS)) {
      writeJSON(KEYS.USERS, DEMO_ACCOUNTS.slice());
    } else {
      const existing = readJSON(KEYS.USERS, []);
      let changed = false;
      DEMO_ACCOUNTS.forEach((demo) => {
        const idx = existing.findIndex((u) => u.id === demo.id);
        if (idx === -1) {
          existing.unshift(demo);
          changed = true;
        } else {
          // Merge to keep fresh schema
          existing[idx] = Object.assign({}, demo, existing[idx]);
          changed = true;
        }
      });
      if (changed) writeJSON(KEYS.USERS, existing);
    }

    if (!localStorage.getItem(KEYS.ENROLLMENTS)) writeJSON(KEYS.ENROLLMENTS, {});
    if (!localStorage.getItem(KEYS.ASSESSMENTS)) writeJSON(KEYS.ASSESSMENTS, {});
    if (!localStorage.getItem(KEYS.CERTIFICATES)) writeJSON(KEYS.CERTIFICATES, {});
    if (!localStorage.getItem(KEYS.JOB_APPLICATIONS)) writeJSON(KEYS.JOB_APPLICATIONS, {});
    if (!localStorage.getItem(KEYS.CONNECTIONS)) writeJSON(KEYS.CONNECTIONS, {});
    if (!localStorage.getItem(KEYS.MESSAGES)) writeJSON(KEYS.MESSAGES, {});
    if (!localStorage.getItem(KEYS.ACTIVITY)) writeJSON(KEYS.ACTIVITY, {});

    // Seed default connections & applications for demo student if empty
    const applications = readJSON(KEYS.JOB_APPLICATIONS, {});
    if (!applications["demo-student"] || !applications["demo-student"].length) {
      applications["demo-student"] = [
        {
          jobId: "job-1",
          appliedDate: "2026-08-22T10:00:00.000Z",
          status: "Under Review",
          note: "Applied with 100% Skill Match"
        },
        {
          jobId: "job-2",
          appliedDate: "2026-08-24T14:30:00.000Z",
          status: "Accepted Proposal",
          note: "Selected for Technical Interview round"
        }
      ];
      writeJSON(KEYS.JOB_APPLICATIONS, applications);
    }

    const connections = readJSON(KEYS.CONNECTIONS, {});
    if (!connections["demo-student"]) {
      connections["demo-student"] = {
        "demo-faculty": "Connected",
        "user-stu-2": "Connected",
        "demo-industry": "Pending",
        "user-stu-3": "Connect"
      };
      writeJSON(KEYS.CONNECTIONS, connections);
    }

    const messages = readJSON(KEYS.MESSAGES, {});
    const pairKey1 = ["demo-student", "demo-faculty"].sort().join("_");
    if (!messages[pairKey1]) {
      messages[pairKey1] = [
        {
          id: "m-1",
          senderId: "demo-faculty",
          senderName: "Dr. Arjun Mehta",
          text: "Hello Priya, congratulations on completing the Python and Web Dev tracks with high scores!",
          timestamp: "2026-08-26T10:15:00.000Z"
        },
        {
          id: "m-2",
          senderId: "demo-student",
          senderName: "Priya Sharma",
          text: "Thank you Dr. Mehta! I am currently applying for the TechBridge SDE Internship.",
          timestamp: "2026-08-26T10:20:00.000Z"
        },
        {
          id: "m-3",
          senderId: "demo-faculty",
          senderName: "Dr. Arjun Mehta",
          text: "Excellent. I will endorse your verified profile to their recruiting team.",
          timestamp: "2026-08-26T10:22:00.000Z"
        }
      ];
      writeJSON(KEYS.MESSAGES, messages);
    }

    localStorage.setItem(KEYS.SEED_VERSION, SEED_VERSION);
  }

  /* ------------------------------------------------------------------ */
  /* Catalog Services                                                   */
  /* ------------------------------------------------------------------ */

  const Catalog = {
    getInstitutes: () => readJSON(KEYS.INSTITUTES, SEED_INSTITUTES),
    getInstituteById: (id) => Catalog.getInstitutes().find((i) => i.id === id) || null,
    getSkills: () => readJSON(KEYS.SKILLS, SEED_SKILLS),
    getCourses: () => readJSON(KEYS.COURSES, SEED_COURSES),
    getCourseById: (id) => Catalog.getCourses().find((c) => c.id === id) || null,
    getJobs: () => readJSON(KEYS.JOBS, SEED_JOBS),
    getJobById: (id) => Catalog.getJobs().find((j) => j.id === id) || null,
    getEvents: () => readJSON(KEYS.EVENTS, SEED_EVENTS),
    getPosts: () => readJSON(KEYS.POSTS, SEED_POSTS),
    getFaqs: () => readJSON(KEYS.FAQS, SEED_FAQS),
    getQuiz: (courseId) => {
      const bank = readJSON(KEYS.QUIZ_BANK, SEED_QUIZ_BANK);
      return bank[courseId] || [];
    }
  };

  /* ------------------------------------------------------------------ */
  /* Users & Session                                                    */
  /* ------------------------------------------------------------------ */

  const Users = {
    all: () => readJSON(KEYS.USERS, []),
    save: (list) => writeJSON(KEYS.USERS, list),
    findByEmail: (email, role) => {
      const list = Users.all();
      const target = String(email).trim().toLowerCase();
      return list.find((u) => u.email.toLowerCase() === target && (!role || u.role === role)) || null;
    },
    findById: (id) => Users.all().find((u) => u.id === id) || null,
    create: (userData) => {
      const list = Users.all();
      const user = Object.assign(
        {
          id: uid("user"),
          createdAt: new Date().toISOString(),
          profileComplete: false,
          skillsHave: [],
          skillsLearn: [],
          verifiedSkills: [],
          qualifications: [],
          photo: null,
          dobLocked: false
        },
        userData
      );
      list.push(user);
      Users.save(list);
      Activity.log(user.id, "account_created");
      return user;
    },
    update: (id, patch) => {
      const list = Users.all();
      const idx = list.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      list[idx] = Object.assign({}, list[idx], patch);
      Users.save(list);
      return list[idx];
    },
    getStudentsByInstituteAndDept: (instituteId, department) => {
      const all = Users.all();
      return all.filter((u) => {
        if (u.role !== "student") return false;
        const matchInst = !instituteId || u.institute === instituteId;
        const matchDept = !department || (u.branch && u.branch.toLowerCase().includes(department.toLowerCase()));
        return matchInst && matchDept;
      });
    }
  };

  const Session = {
    set: (userId) => writeJSON(KEYS.SESSION, { userId, since: new Date().toISOString() }),
    get: () => readJSON(KEYS.SESSION, null),
    clear: () => localStorage.removeItem(KEYS.SESSION),
    currentUser: () => {
      const s = Session.get();
      if (!s) return null;
      return Users.findById(s.userId);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Enrollments & Interactive Module Progress (Module 6)               */
  /* ------------------------------------------------------------------ */

  const Enrollments = {
    all: () => readJSON(KEYS.ENROLLMENTS, {}),
    forUser: (userId) => {
      const all = Enrollments.all();
      return all[userId] || [];
    },
    enroll: (userId, courseId) => {
      const all = Enrollments.all();
      const list = all[userId] || [];
      if (!list.find((e) => e.courseId === courseId)) {
        list.push({
          courseId,
          progress: 0,
          completedModules: [],
          joinedAt: new Date().toISOString()
        });
        all[userId] = list;
        writeJSON(KEYS.ENROLLMENTS, all);
        Activity.log(userId, "course_enrolled");
      }
      return list;
    },
    completeModule: (userId, courseId, moduleId) => {
      const all = Enrollments.all();
      const list = all[userId] || [];
      let entry = list.find((e) => e.courseId === courseId);
      if (!entry) {
        entry = { courseId, progress: 0, completedModules: [], joinedAt: new Date().toISOString() };
        list.push(entry);
      }
      if (!entry.completedModules) entry.completedModules = [];
      if (!entry.completedModules.includes(moduleId)) {
        entry.completedModules.push(moduleId);
      }
      const course = Catalog.getCourseById(courseId);
      const totalMods = (course && course.modules && course.modules.length) ? course.modules.length : 3;
      entry.progress = Math.min(100, Math.round((entry.completedModules.length / totalMods) * 100));
      all[userId] = list;
      writeJSON(KEYS.ENROLLMENTS, all);
      Activity.log(userId, "lesson_completed");
      return entry;
    },
    setProgress: (userId, courseId, progress) => {
      const all = Enrollments.all();
      const list = all[userId] || [];
      const entry = list.find((e) => e.courseId === courseId);
      if (entry) {
        entry.progress = Math.max(0, Math.min(100, progress));
        all[userId] = list;
        writeJSON(KEYS.ENROLLMENTS, all);
        Activity.log(userId, "progress_update");
      }
      return list;
    }
  };

  /* ------------------------------------------------------------------ */
  /* Assessments & Certificate Generator (Module 6)                     */
  /* ------------------------------------------------------------------ */

  const Assessments = {
    all: () => readJSON(KEYS.ASSESSMENTS, {}),
    forUser: (userId) => {
      const all = Assessments.all();
      return all[userId] || [];
    },
    record: (userId, courseId, skillLabel, scorePct, passed) => {
      const all = Assessments.all();
      const list = all[userId] || [];
      const record = {
        id: uid("assess"),
        courseId,
        skill: skillLabel,
        score: scorePct,
        passed,
        takenAt: new Date().toISOString()
      };
      list.push(record);
      all[userId] = list;
      writeJSON(KEYS.ASSESSMENTS, all);

      if (passed) {
        const user = Users.findById(userId);
        if (user) {
          const currentSkills = user.verifiedSkills || [];
          if (!currentSkills.includes(skillLabel)) {
            Users.update(userId, { verifiedSkills: currentSkills.concat(skillLabel) });
          }
          // Issue and save Certificate
          Certificates.issue(user, courseId, skillLabel, scorePct);
        }
      }
      Activity.log(userId, passed ? "assessment_passed" : "assessment_attempted");
      return record;
    }
  };

  const Certificates = {
    all: () => readJSON(KEYS.CERTIFICATES, {}),
    forUser: (userId) => {
      const all = Certificates.all();
      return all[userId] || [];
    },
    issue: (user, courseId, courseTitle, scorePct) => {
      const all = Certificates.all();
      const list = all[user.id] || [];
      const verificationId = "SS-CERT-" + new Date().getFullYear() + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const cert = {
        id: uid("cert"),
        verificationId,
        userId: user.id,
        userName: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || "Certified Learner",
        courseId,
        courseTitle,
        score: scorePct,
        issuedDate: new Date().toISOString(),
        issuer: "SetuSkill National Skill Ledger & Industry Council",
        status: "Verified & Authenticated"
      };
      // Prevent duplicate certificates for same course
      const existingIdx = list.findIndex((c) => c.courseId === courseId);
      if (existingIdx !== -1) {
        list[existingIdx] = cert;
      } else {
        list.push(cert);
      }
      all[user.id] = list;
      writeJSON(KEYS.CERTIFICATES, all);
      Activity.log(user.id, "certificate_issued");
      return cert;
    },
    getById: (certId) => {
      const all = Certificates.all();
      for (const uidKey in all) {
        const found = all[uidKey].find((c) => c.id === certId || c.verificationId === certId);
        if (found) return found;
      }
      return null;
    }
  };

  /* ------------------------------------------------------------------ */
  /* Jobs, Internships & Skill Match Engine (Module 5)                  */
  /* ------------------------------------------------------------------ */

  const Jobs = {
    all: () => readJSON(KEYS.JOBS, SEED_JOBS),
    save: (list) => writeJSON(KEYS.JOBS, list),
    calculateSkillMatch: (userSkills, jobRequiredSkills) => {
      if (!jobRequiredSkills || !jobRequiredSkills.length) return { matchPct: 100, matchedSkills: [], missingSkills: [] };
      const userSet = new Set((userSkills || []).map((s) => s.trim().toLowerCase()));
      const matched = [];
      const missing = [];
      jobRequiredSkills.forEach((req) => {
        if (userSet.has(req.trim().toLowerCase())) {
          matched.push(req);
        } else {
          missing.push(req);
        }
      });
      const matchPct = Math.round((matched.length / jobRequiredSkills.length) * 100);
      return { matchPct, matchedSkills: matched, missingSkills: missing };
    }
  };

  const JobApplications = {
    all: () => readJSON(KEYS.JOB_APPLICATIONS, {}),
    forUser: (userId) => {
      const all = JobApplications.all();
      return all[userId] || [];
    },
    apply: (userId, jobId, note) => {
      const all = JobApplications.all();
      const list = all[userId] || [];
      if (list.find((a) => a.jobId === jobId)) {
        return { success: false, message: "You have already applied for this role." };
      }
      const newApp = {
        id: uid("app"),
        jobId,
        appliedDate: new Date().toISOString(),
        status: "Under Review",
        note: note || "Application submitted via SetuSkill Verified Profile"
      };
      list.push(newApp);
      all[userId] = list;
      writeJSON(KEYS.JOB_APPLICATIONS, all);
      Activity.log(userId, "job_application_submitted");
      return { success: true, application: newApp };
    }
  };

  /* ------------------------------------------------------------------ */
  /* Connections & Direct Messaging (Module 4)                          */
  /* ------------------------------------------------------------------ */

  const Connections = {
    all: () => readJSON(KEYS.CONNECTIONS, {}),
    forUser: (userId) => {
      const all = Connections.all();
      return all[userId] || {};
    },
    getStatus: (userId, targetUserId) => {
      const userConns = Connections.forUser(userId);
      return userConns[targetUserId] || "Connect";
    },
    toggleConnect: (userId, targetUserId) => {
      const all = Connections.all();
      if (!all[userId]) all[userId] = {};
      const current = all[userId][targetUserId] || "Connect";
      let next = "Pending";
      if (current === "Connect") next = "Pending";
      else if (current === "Pending") next = "Connected";
      else if (current === "Connected") next = "Connect";

      all[userId][targetUserId] = next;
      writeJSON(KEYS.CONNECTIONS, all);
      Activity.log(userId, "connection_updated");
      return next;
    }
  };

  const Messages = {
    all: () => readJSON(KEYS.MESSAGES, {}),
    getConversationKey: (userA, userB) => [userA, userB].sort().join("_"),
    getThread: (userA, userB) => {
      const all = Messages.all();
      const key = Messages.getConversationKey(userA, userB);
      return all[key] || [];
    },
    send: (senderId, senderName, receiverId, text) => {
      const all = Messages.all();
      const key = Messages.getConversationKey(senderId, receiverId);
      const thread = all[key] || [];
      const msg = {
        id: uid("msg"),
        senderId,
        senderName,
        receiverId,
        text: String(text).trim(),
        timestamp: new Date().toISOString()
      };
      thread.push(msg);
      all[key] = thread;
      writeJSON(KEYS.MESSAGES, all);
      Activity.log(senderId, "message_sent");
      return msg;
    }
  };

  /* ------------------------------------------------------------------ */
  /* Social Feed (Explore) & Events Management (Module 8)               */
  /* ------------------------------------------------------------------ */

  const Posts = {
    all: () => readJSON(KEYS.POSTS, SEED_POSTS),
    save: (list) => writeJSON(KEYS.POSTS, list),
    create: (authorUser, title, content, location) => {
      const list = Posts.all();
      const name = authorUser.fullName || [authorUser.firstName, authorUser.lastName].filter(Boolean).join(" ") || authorUser.companyName || "Member";
      const initials = name.split(" ").map((w) => w[0] || "").slice(0, 2).join("").toUpperCase();
      const post = {
        id: uid("post"),
        author: name,
        authorRole: authorUser.role === "faculty" ? "Faculty" : authorUser.role === "industry" ? "Industry Partner" : "Student",
        authorAvatar: initials,
        authorId: authorUser.id,
        title: title || "Community Update",
        content,
        likes: 0,
        likedBy: [],
        comments: [],
        timestamp: new Date().toISOString(),
        location: location || (authorUser.city ? authorUser.city + ", India" : "Pune, India")
      };
      list.unshift(post);
      Posts.save(list);
      Activity.log(authorUser.id, "post_created");
      return post;
    },
    toggleLike: (postId, userId) => {
      const list = Posts.all();
      const post = list.find((p) => p.id === postId);
      if (!post) return null;
      if (!post.likedBy) post.likedBy = [];
      const idx = post.likedBy.indexOf(userId);
      if (idx === -1) {
        post.likedBy.push(userId);
        post.likes = (post.likes || 0) + 1;
      } else {
        post.likedBy.splice(idx, 1);
        post.likes = Math.max(0, (post.likes || 1) - 1);
      }
      Posts.save(list);
      return post;
    },
    addComment: (postId, authorUser, text) => {
      const list = Posts.all();
      const post = list.find((p) => p.id === postId);
      if (!post) return null;
      if (!post.comments) post.comments = [];
      const name = authorUser.fullName || [authorUser.firstName, authorUser.lastName].filter(Boolean).join(" ") || authorUser.companyName || "Member";
      const comment = {
        id: uid("com"),
        author: name,
        role: authorUser.role === "faculty" ? "Faculty" : authorUser.role === "industry" ? "Industry" : "Student",
        text: String(text).trim(),
        timestamp: new Date().toISOString()
      };
      post.comments.push(comment);
      Posts.save(list);
      Activity.log(authorUser.id, "comment_added");
      return comment;
    }
  };

  const Events = {
    all: () => readJSON(KEYS.EVENTS, SEED_EVENTS),
    save: (list) => writeJSON(KEYS.EVENTS, list),
    create: (authorUser, eventData) => {
      const list = Events.all();
      const organizer = authorUser.companyName || authorUser.fullName || "Community Host";
      const newEvent = Object.assign(
        {
          id: uid("evt"),
          organizer,
          attendees: 1,
          createdAt: new Date().toISOString()
        },
        eventData
      );
      list.unshift(newEvent);
      Events.save(list);
      Activity.log(authorUser.id, "event_hosted");
      return newEvent;
    }
  };

  /* ------------------------------------------------------------------ */
  /* Quiz Bank (Faculty Upload Assessment - Module 7)                   */
  /* ------------------------------------------------------------------ */

  const QuizBank = {
    all: () => readJSON(KEYS.QUIZ_BANK, SEED_QUIZ_BANK),
    addQuestion: (courseId, questionObj) => {
      const bank = QuizBank.all();
      if (!bank[courseId]) bank[courseId] = [];
      bank[courseId].push(questionObj);
      writeJSON(KEYS.QUIZ_BANK, bank);
      return bank[courseId];
    }
  };

  /* ------------------------------------------------------------------ */
  /* Activity Log                                                       */
  /* ------------------------------------------------------------------ */

  const Activity = {
    all: () => readJSON(KEYS.ACTIVITY, {}),
    log: (userId, type) => {
      if (!userId) return;
      const all = Activity.all();
      const list = all[userId] || [];
      const today = new Date().toISOString().slice(0, 10);
      const todayEntry = list.find((e) => e.date === today);
      if (todayEntry) {
        todayEntry.count += 1;
      } else {
        list.push({ date: today, count: 1, type });
      }
      all[userId] = list;
      writeJSON(KEYS.ACTIVITY, all);
    },
    forUser: (userId) => {
      const all = Activity.all();
      return all[userId] || [];
    }
  };

  /* ------------------------------------------------------------------ */
  /* Public Global API                                                  */
  /* ------------------------------------------------------------------ */

  global.SS_DB = {
    seed,
    uid,
    mockHash,
    Catalog,
    Users,
    Session,
    Enrollments,
    Assessments,
    Certificates,
    Jobs,
    JobApplications,
    Connections,
    Messages,
    Posts,
    Events,
    QuizBank,
    Activity
  };
})(window);
