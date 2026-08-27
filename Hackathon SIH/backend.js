/* ============================================================================
   SetuSkill — backend.js
   Mock data layer. Static catalog content (institutes, skills, courses,
   events, articles, FAQs, quiz bank) is seeded into localStorage so the app
   genuinely reads/writes through a "database" layer instead of holding
   constants only in memory. Dynamic records (users, sessions, enrollments,
   assessment results, activity log) live in localStorage exclusively.
   ============================================================================ */

(function (global) {
  "use strict";

  const KEYS = {
    INSTITUTES: "ss_institutes",
    SKILLS: "ss_skills",
    COURSES: "ss_courses",
    EVENTS: "ss_events",
    ARTICLES: "ss_articles",
    FAQS: "ss_faqs",
    QUIZ_BANK: "ss_quiz_bank",
    USERS: "ss_users",
    SESSION: "ss_session",
    ENROLLMENTS: "ss_enrollments",
    ASSESSMENTS: "ss_assessments",
    ACTIVITY: "ss_activity",
    SEED_VERSION: "ss_seed_version"
  };

  // Bump this if the seed content below changes shape, so returning users
  // get the fresh catalog instead of a stale cached copy.
  const SEED_VERSION = "4";

  /* ------------------------------------------------------------------ */
  /* Seed content                                                       */
  /* ------------------------------------------------------------------ */

  const SEED_INSTITUTES = [
    { id: "inst-1", name: "National Institute of Technology, Rajgarh" },
    { id: "inst-2", name: "Deccan College of Engineering & Technology" },
    { id: "inst-3", name: "Yamuna Institute of Applied Sciences" },
    { id: "inst-4", name: "Konkan School of Business & IT" },
    { id: "inst-5", name: "Vindhya Polytechnic & Skill University" }
  ];

  // Demo accounts — seeded so instant-login buttons work out of the box.
  // Passwords are stored as mockHash values (btoa of the plain text).
  const DEMO_ACCOUNTS = [
    {
      id: "demo-student",
      role: "student",
      email: "student@demo.com",
      passwordHash: btoa(unescape(encodeURIComponent("student123"))),
      firstName: "Priya",
      middleName: "",
      lastName: "Sharma",
      contact: "9812345678",
      gender: "Female",
      state: "Maharashtra",
      city: "Pune",
      institute: "inst-2",
      studentId: "STU2024001",
      academicPercentage: 82.5,
      lastCourse: "B.Tech (CS)",
      branch: "Computer Science",
      currentYear: "3rd Year",
      dob: "2003-06-15",
      dobLocked: true,
      skillsHave: ["Python", "HTML/CSS", "JavaScript", "SQL", "Git & GitHub"],
      skillsLearn: ["React", "Machine Learning", "Cloud Computing (AWS)"],
      verifiedSkills: ["Python", "HTML/CSS"],
      qualifications: [],
      photo: null,
      profileComplete: true,
      createdAt: "2026-01-10T08:00:00.000Z"
    },
    {
      id: "demo-faculty",
      role: "faculty",
      email: "institute@demo.com",
      passwordHash: btoa(unescape(encodeURIComponent("faculty123"))),
      firstName: "Dr. Arjun",
      middleName: "",
      lastName: "Mehta",
      contact: "9823456789",
      gender: "Male",
      state: "Karnataka",
      city: "Bengaluru",
      institute: "inst-1",
      facultyId: "FAC2024007",
      registrationNumber: "REG-NIT-2019-007",
      lastCourse: "Ph.D. (Computer Science)",
      facultyDepartment: "Computer Science",
      isTpo: true,
      tpoId: "TPO-NIT-2024",
      skillsHave: ["Data Structures & Algorithms", "Machine Learning", "Python", "Java"],
      skillsLearn: ["Cloud Computing (AWS)", "DevOps"],
      verifiedSkills: ["Data Structures & Algorithms", "Python", "Java"],
      qualifications: [],
      photo: null,
      profileComplete: true,
      createdAt: "2025-07-01T09:00:00.000Z"
    },
    {
      id: "demo-industry",
      role: "industry",
      email: "industry@demo.com",
      passwordHash: btoa(unescape(encodeURIComponent("industry123"))),
      companyName: "TechBridge Solutions Pvt. Ltd.",
      businessEmail: "industry@demo.com",
      corporateId: "U72200MH2020PTC340012",
      sector: "Information Technology",
      skillsHave: ["React", "Node.js", "Python", "DevOps", "Kubernetes"],
      skillsLearn: [],
      verifiedSkills: [],
      qualifications: [],
      photo: null,
      profileComplete: true,
      createdAt: "2025-09-01T10:00:00.000Z"
    }
  ];

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

  const SEED_COURSES = [
    { id: "python", title: "Python Programming", description: "From syntax to scripting: build a solid foundation in one of the most in-demand languages.", duration: "6 weeks", rating: 4.7, level: "Beginner", provider: "SetuSkill Academy", icon: "🐍" },
    { id: "java", title: "Java Essentials", description: "Object-oriented programming fundamentals through hands-on Java projects.", duration: "8 weeks", rating: 4.5, level: "Beginner", provider: "NIT Rajgarh Online", icon: "☕" },
    { id: "cpp", title: "C++ for Problem Solving", description: "Master pointers, STL and competitive-programming techniques in C++.", duration: "7 weeks", rating: 4.6, level: "Intermediate", provider: "SetuSkill Academy", icon: "➕" },
    { id: "mysql", title: "Database Design with MySQL", description: "Model, query and optimise relational databases used across the industry.", duration: "5 weeks", rating: 4.4, level: "Beginner", provider: "Deccan CET Labs", icon: "🗄️" },
    { id: "htmlcss", title: "HTML/CSS for the Modern Web", description: "Build responsive, accessible web pages from the ground up.", duration: "4 weeks", rating: 4.6, level: "Beginner", provider: "SetuSkill Academy", icon: "🌐" },
    { id: "accounting", title: "Accounting Fundamentals", description: "Ledgers, balance sheets and financial statements for non-finance learners.", duration: "6 weeks", rating: 4.3, level: "Beginner", provider: "Konkan School of Business", icon: "📒" },
    { id: "blockchain", title: "Blockchain Foundations", description: "Understand distributed ledgers, smart contracts and real-world use cases.", duration: "5 weeks", rating: 4.2, level: "Intermediate", provider: "SetuSkill Academy", icon: "⛓️" },
    { id: "cybersecurity", title: "Cybersecurity Basics", description: "Threats, defences and best practices for securing systems and data.", duration: "6 weeks", rating: 4.5, level: "Intermediate", provider: "Yamuna Institute", icon: "🛡️" },
    { id: "digitalmarketing", title: "Digital Marketing Bootcamp", description: "SEO, social media and campaign analytics for modern brands.", duration: "4 weeks", rating: 4.4, level: "Beginner", provider: "Konkan School of Business", icon: "📣" },
    { id: "excel", title: "Excel for Data-Driven Decisions", description: "Formulas, pivot tables and dashboards for everyday analysis.", duration: "3 weeks", rating: 4.6, level: "Beginner", provider: "SetuSkill Academy", icon: "📊" }
  ];

  const SEED_EVENTS = [
    { id: "evt-1", title: "Industry Expert Talk: Careers in Cloud", type: "Talk", date: "2026-09-05", location: "NIT Rajgarh — Auditorium A", organizer: "NIT Rajgarh" },
    { id: "evt-2", title: "Resume & Interview Skills Workshop", type: "Workshop", date: "2026-09-10", location: "Deccan CET — Seminar Hall", organizer: "Deccan College of Engineering" },
    { id: "evt-3", title: "Placement Drive: Software Roles", type: "Placement Drive", date: "2026-09-18", location: "Yamuna Institute — Campus Ground", organizer: "Yamuna Institute" },
    { id: "evt-4", title: "Seminar: Data Privacy & Cyber Law", type: "Seminar", date: "2026-09-22", location: "Online — Live Stream", organizer: "Konkan School of Business" },
    { id: "evt-5", title: "Hands-on Workshop: Intro to Robotics", type: "Workshop", date: "2026-09-29", location: "Vindhya Polytechnic — Lab 3", organizer: "Vindhya Polytechnic" }
  ];

  const SEED_ARTICLES = [
    { id: "art-1", author: "NIT Rajgarh — Placement Cell", role: "Institute", content: "Our Q3 placement report is out: average package up 12% year-on-year, with the strongest demand in cloud and data roles.", likes: 84, comments: 12, timestamp: "2026-08-20" },
    { id: "art-2", author: "Konkan School of Business", role: "Institute", content: "Registrations are open for the Digital Marketing Bootcamp cohort starting next month — seats are limited to 40 learners.", likes: 46, comments: 5, timestamp: "2026-08-21" },
    { id: "art-3", author: "Deccan CET Careers Office", role: "Institute", content: "Reminder: upload your latest qualification documents before the September placement drive to be eligible for shortlisting.", likes: 31, comments: 3, timestamp: "2026-08-22" },
    { id: "art-4", author: "Yamuna Institute — TPO", role: "Institute", content: "Congratulations to the 18 students placed in this week's on-campus drive across cybersecurity and backend roles.", likes: 129, comments: 22, timestamp: "2026-08-24" },
    { id: "art-5", author: "Vindhya Polytechnic", role: "Institute", content: "New lab equipment for the Robotics & IoT track has arrived — hands-on sessions resume from Monday.", likes: 57, comments: 8, timestamp: "2026-08-25" },
    { id: "art-6", author: "SetuSkill Announcements", role: "Platform", content: "Assessment badges are now visible on your public skill profile — verified skills carry more weight with recruiters.", likes: 203, comments: 34, timestamp: "2026-08-26" }
  ];

  const SEED_FAQS = [
    { q: "How do I get a skill marked as 'verified'?", a: "Take the assessment for that skill under the Assessment tab. Scoring above the pass mark automatically adds a verified badge to your dashboard." },
    { q: "Can I change my role after registering?", a: "Roles are tied to how your account was created (Student, Institute/Faculty or Industry). Contact your institute admin if you registered under the wrong role." },
    { q: "Is my Aadhaar number stored securely?", a: "This prototype only accepts placeholder values for demonstration and does not collect or transmit real government ID numbers." },
    { q: "Can I edit my date of birth after profile setup?", a: "No — date of birth is locked once profile setup is completed, to keep academic records consistent." },
    { q: "How are courses different from assessments?", a: "Courses (Learn & Upskill) are for learning a skill step by step. Assessments are short tests you take once you're ready to get that skill verified." },
    { q: "Who can see my profile?", a: "Institutes you're affiliated with and industry recruiters browsing verified skills can see your public profile summary." },
    { q: "How do I find events near me?", a: "The Programmes & Events tab lists workshops, seminars and placement drives from institutes on the platform, most recent first." }
  ];

  /* Ten questions per core course, 4 options each. Written for this
     prototype — general knowledge checks, not sourced from any test bank. */
  const SEED_QUIZ_BANK = {
    python: [
      { q: "Which keyword defines a function in Python?", options: ["func", "def", "function", "lambda"], correct: 1 },
      { q: "What data type is the result of 7 / 2 in Python 3?", options: ["int", "float", "str", "complex"], correct: 1 },
      { q: "Which method adds an item to the end of a list?", options: ["push()", "append()", "add()", "insert()"], correct: 1 },
      { q: "What does 'len([1,2,3])' return?", options: ["2", "3", "4", "Error"], correct: 1 },
      { q: "Which symbol starts a single-line comment?", options: ["//", "#", "/*", "--"], correct: 1 },
      { q: "What is the output of 'type(5.0)'?", options: ["int", "float", "double", "number"], correct: 1 },
      { q: "Which of these is an immutable data type?", options: ["list", "dict", "tuple", "set"], correct: 2 },
      { q: "How do you open a file for reading in Python?", options: ["open('f','r')", "read('f')", "file.open('f')", "load('f')"], correct: 0 },
      { q: "What does 'pip' primarily manage?", options: ["Virtual environments", "Python packages", "File permissions", "Threads"], correct: 1 },
      { q: "Which loop is guaranteed to run at least once in Python?", options: ["for", "while", "None — Python has no do-while", "repeat"], correct: 2 }
    ],
    java: [
      { q: "Which keyword is used to inherit a class in Java?", options: ["implements", "extends", "inherits", "super"], correct: 1 },
      { q: "What is the default value of a boolean instance variable?", options: ["true", "false", "0", "null"], correct: 1 },
      { q: "Which method is the entry point of a Java application?", options: ["start()", "run()", "main()", "init()"], correct: 2 },
      { q: "Which collection does not allow duplicate elements?", options: ["ArrayList", "LinkedList", "Set", "Vector"], correct: 2 },
      { q: "What does the 'final' keyword do to a variable?", options: ["Makes it static", "Prevents reassignment", "Deletes it after use", "Makes it public"], correct: 1 },
      { q: "Which of these is not a Java access modifier?", options: ["private", "protected", "internal", "public"], correct: 2 },
      { q: "What is used to handle exceptions in Java?", options: ["try/catch", "if/else", "switch/case", "for/while"], correct: 0 },
      { q: "Which keyword creates an object in Java?", options: ["new", "create", "object", "make"], correct: 0 },
      { q: "What is the size of an 'int' in Java?", options: ["16-bit", "32-bit", "64-bit", "Platform dependent"], correct: 1 },
      { q: "Which interface must a class implement to be sorted with Collections.sort()?", options: ["Serializable", "Comparable", "Iterable", "Cloneable"], correct: 1 }
    ],
    cpp: [
      { q: "Which operator is used to allocate memory dynamically in C++?", options: ["malloc", "new", "alloc", "create"], correct: 1 },
      { q: "What does STL stand for?", options: ["Standard Type Library", "Standard Template Library", "System Type Layer", "Static Template List"], correct: 1 },
      { q: "Which symbol is used for pointers in C++?", options: ["&", "*", "#", "@"], correct: 1 },
      { q: "What is the default access specifier for a class?", options: ["public", "protected", "private", "internal"], correct: 2 },
      { q: "Which header is required for 'cout' and 'cin'?", options: ["<stdio.h>", "<iostream>", "<conio.h>", "<istream.h>"], correct: 1 },
      { q: "What does 'const' before a function parameter guarantee?", options: ["It is optional", "It cannot be modified inside the function", "It is a pointer", "It is static"], correct: 1 },
      { q: "Which concept allows a function name to behave differently based on arguments?", options: ["Inheritance", "Encapsulation", "Overloading", "Abstraction"], correct: 2 },
      { q: "What does a destructor do?", options: ["Creates an object", "Copies an object", "Cleans up when an object goes out of scope", "Compares two objects"], correct: 2 },
      { q: "Which container stores key-value pairs in the STL?", options: ["vector", "map", "stack", "queue"], correct: 1 },
      { q: "What is the time complexity of binary search on a sorted array?", options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"], correct: 2 }
    ],
    mysql: [
      { q: "Which SQL clause filters rows before grouping?", options: ["HAVING", "WHERE", "GROUP BY", "ORDER BY"], correct: 1 },
      { q: "Which command removes a table entirely, structure included?", options: ["DELETE", "TRUNCATE", "DROP", "REMOVE"], correct: 2 },
      { q: "Which key uniquely identifies each row in a table?", options: ["Foreign key", "Primary key", "Candidate key", "Index key"], correct: 1 },
      { q: "Which JOIN returns only matching rows from both tables?", options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], correct: 2 },
      { q: "Which SQL function counts non-null rows?", options: ["SUM()", "COUNT()", "TOTAL()", "ADD()"], correct: 1 },
      { q: "What does normalization primarily reduce?", options: ["Query speed", "Data redundancy", "Number of tables", "Index size"], correct: 1 },
      { q: "Which statement is used to modify existing data?", options: ["UPDATE", "ALTER", "MODIFY", "CHANGE"], correct: 0 },
      { q: "What does 'GROUP BY' do?", options: ["Sorts rows", "Filters duplicate columns", "Aggregates rows sharing a value", "Joins two tables"], correct: 2 },
      { q: "Which clause limits the number of rows returned?", options: ["TOP", "LIMIT", "ROWCOUNT", "FETCH ONLY"], correct: 1 },
      { q: "A foreign key in one table refers to which key in another?", options: ["Any column", "Primary key", "Index", "Alias"], correct: 1 }
    ],
    htmlcss: [
      { q: "Which tag is used to link an external stylesheet?", options: ["<style>", "<css>", "<link>", "<script>"], correct: 2 },
      { q: "Which CSS property controls text size?", options: ["text-style", "font-size", "text-size", "font-style"], correct: 1 },
      { q: "What does the CSS box model NOT include?", options: ["Margin", "Border", "Padding", "Position"], correct: 3 },
      { q: "Which HTML tag creates a hyperlink?", options: ["<link>", "<a>", "<href>", "<nav>"], correct: 1 },
      { q: "Which value makes a flex container lay out items in a column?", options: ["flex-direction: row", "flex-direction: column", "flex-wrap: wrap", "justify-content: column"], correct: 1 },
      { q: "Which attribute provides alternative text for an image?", options: ["title", "alt", "desc", "caption"], correct: 1 },
      { q: "Which selector targets an element with id 'main'?", options: [".main", "#main", "*main", "main{}"], correct: 1 },
      { q: "What unit scales relative to the root font size?", options: ["em", "px", "rem", "vh"], correct: 2 },
      { q: "Which property makes an element's position fixed to the viewport?", options: ["position: relative", "position: static", "position: fixed", "position: inherit"], correct: 2 },
      { q: "Which HTML5 tag is used for the main navigation menu?", options: ["<menu>", "<nav>", "<navigation>", "<links>"], correct: 1 }
    ],
    accounting: [
      { q: "What does the accounting equation state?", options: ["Assets = Liabilities − Equity", "Assets = Liabilities + Equity", "Equity = Assets + Liabilities", "Liabilities = Assets + Equity"], correct: 1 },
      { q: "Which statement shows a company's profitability over a period?", options: ["Balance Sheet", "Cash Flow Statement", "Income Statement", "Trial Balance"], correct: 2 },
      { q: "A debit entry to an asset account does what?", options: ["Decreases it", "Increases it", "Has no effect", "Closes the account"], correct: 1 },
      { q: "What is depreciation?", options: ["Increase in asset value", "Allocation of asset cost over its useful life", "A type of liability", "A tax refund"], correct: 1 },
      { q: "Which document records a transaction's original entry?", options: ["Ledger", "Journal", "Trial Balance", "Balance Sheet"], correct: 1 },
      { q: "What does 'accounts payable' represent?", options: ["Money owed to the business", "Money the business owes to others", "Cash in hand", "Owner's equity"], correct: 1 },
      { q: "Which principle says expenses should match related revenues?", options: ["Matching principle", "Cost principle", "Going concern", "Conservatism"], correct: 0 },
      { q: "What does GAAP stand for?", options: ["General Auditing & Accounting Practice", "Generally Accepted Accounting Principles", "Global Accounting Assurance Policy", "Government Approved Accounting Process"], correct: 1 },
      { q: "A trial balance is used to check that:", options: ["Profit is positive", "Debits equal credits", "Taxes are paid", "Assets exceed liabilities"], correct: 1 },
      { q: "Which of these is a current asset?", options: ["Building", "Inventory", "Long-term loan", "Goodwill"], correct: 1 }
    ],
    blockchain: [
      { q: "A blockchain is best described as a:", options: ["Centralized database", "Distributed, append-only ledger", "Type of firewall", "Cloud storage service"], correct: 1 },
      { q: "What links each block to the previous one?", options: ["A timestamp only", "A cryptographic hash", "An IP address", "A digital signature only"], correct: 1 },
      { q: "What is a smart contract?", options: ["A legal PDF", "Self-executing code on a blockchain", "A type of wallet", "A mining algorithm"], correct: 1 },
      { q: "Which consensus mechanism relies on computational work?", options: ["Proof of Stake", "Proof of Work", "Proof of Authority", "Delegated voting"], correct: 1 },
      { q: "What does 'decentralization' reduce reliance on?", options: ["Encryption", "A single central authority", "The internet", "Digital wallets"], correct: 1 },
      { q: "A cryptocurrency wallet primarily stores:", options: ["Coins directly", "Private and public keys", "Transaction fees", "Mining hardware"], correct: 1 },
      { q: "What is a 51% attack?", options: ["A phishing scam", "Majority control of network hash power to alter the chain", "A wallet hack", "A smart contract bug"], correct: 1 },
      { q: "Which of these is a public blockchain example?", options: ["A private company intranet", "Ethereum", "A local SQL server", "An internal HR system"], correct: 1 },
      { q: "What is 'gas' in the context of Ethereum?", options: ["A mining reward", "The fee paid for computation on the network", "A wallet type", "A consensus algorithm"], correct: 1 },
      { q: "What makes blockchain records tamper-evident?", options: ["Passwords", "Chained cryptographic hashes", "Firewalls", "Antivirus software"], correct: 1 }
    ],
    cybersecurity: [
      { q: "What does 'phishing' primarily attempt to steal?", options: ["Hardware", "Sensitive information via deception", "Bandwidth", "CPU cycles"], correct: 1 },
      { q: "What does a firewall do?", options: ["Encrypts files", "Filters network traffic based on rules", "Backs up data", "Scans for viruses only"], correct: 1 },
      { q: "What is two-factor authentication (2FA)?", options: ["Two passwords for one account", "A second independent verification step beyond a password", "Two separate accounts", "A backup email only"], correct: 1 },
      { q: "What is malware?", options: ["A hardware fault", "Malicious software designed to harm or exploit systems", "A weak password", "A network protocol"], correct: 1 },
      { q: "What does 'encryption' do to data?", options: ["Deletes it", "Converts it into unreadable form without the correct key", "Compresses it", "Backs it up"], correct: 1 },
      { q: "A 'strong' password is best described as:", options: ["Short and memorable", "Long, unique and unpredictable", "Reused across sites", "Based on your name"], correct: 1 },
      { q: "What is a DDoS attack aimed at?", options: ["Stealing passwords", "Overwhelming a system to make it unavailable", "Encrypting files for ransom", "Installing spyware"], correct: 1 },
      { q: "What does VPN stand for?", options: ["Virtual Personal Network", "Virtual Private Network", "Verified Public Node", "Virtual Protocol Network"], correct: 1 },
      { q: "What is 'social engineering' in security?", options: ["Building secure networks", "Manipulating people into revealing information", "A type of firewall", "Writing secure code"], correct: 1 },
      { q: "What is the purpose of regular software patching?", options: ["Improve graphics", "Fix known vulnerabilities", "Increase file size", "Change the UI"], correct: 1 }
    ],
    digitalmarketing: [
      { q: "What does SEO stand for?", options: ["Search Engine Optimization", "Site Engagement Overview", "Sales & Engagement Operations", "Search Engagement Output"], correct: 0 },
      { q: "What is a 'conversion rate'?", options: ["Number of page views", "Percentage of visitors completing a desired action", "Number of ads shown", "Website loading speed"], correct: 1 },
      { q: "Which metric measures email marketing engagement?", options: ["Open rate", "Server uptime", "Domain age", "Page weight"], correct: 0 },
      { q: "What does CTR stand for?", options: ["Cost to Reach", "Click-Through Rate", "Content Traffic Ratio", "Customer Trust Rating"], correct: 1 },
      { q: "What is 'organic reach'?", options: ["Paid ad views", "Unpaid visibility from content and search", "Email bounce rate", "Server response time"], correct: 1 },
      { q: "What is A/B testing used for?", options: ["Backing up a website", "Comparing two versions to see which performs better", "Encrypting user data", "Scheduling posts"], correct: 1 },
      { q: "What is a buyer persona?", options: ["A legal document", "A semi-fictional profile of an ideal customer", "A payment gateway", "A type of ad format"], correct: 1 },
      { q: "Which channel is 'influencer marketing' most associated with?", options: ["Print newspapers", "Social media", "Cold calling", "Billboard ads"], correct: 1 },
      { q: "What does 'bounce rate' measure?", options: ["Visitors who leave after viewing one page", "Number of shares", "Ad spend", "Email delivery rate"], correct: 0 },
      { q: "What is retargeting?", options: ["Deleting old ads", "Showing ads to users who previously visited your site", "Changing your target audience", "Refunding customers"], correct: 1 }
    ],
    excel: [
      { q: "Which function adds a range of numbers?", options: ["TOTAL()", "SUM()", "ADD()", "PLUS()"], correct: 1 },
      { q: "What does a Pivot Table help you do?", options: ["Format cells only", "Summarize and analyse large datasets", "Password-protect a file", "Insert images"], correct: 1 },
      { q: "Which symbol locks a cell reference when copying a formula?", options: ["#", "$", "%", "&"], correct: 1 },
      { q: "Which function looks up a value in a table by row?", options: ["VLOOKUP", "SORT", "COUNTIF", "TRIM"], correct: 0 },
      { q: "What does the COUNTIF function do?", options: ["Sums a range", "Counts cells meeting a condition", "Finds the average", "Removes duplicates"], correct: 1 },
      { q: "Which chart type best shows trends over time?", options: ["Pie chart", "Line chart", "Scatter plot only", "Donut chart"], correct: 1 },
      { q: "What does 'Freeze Panes' do?", options: ["Locks cell values permanently", "Keeps rows/columns visible while scrolling", "Protects the whole sheet", "Merges cells"], correct: 1 },
      { q: "Which function joins text from multiple cells?", options: ["MERGE()", "CONCATENATE()", "JOIN()", "COMBINE()"], correct: 1 },
      { q: "What is a conditional format used for?", options: ["Encrypting data", "Visually highlighting cells based on rules", "Sorting columns", "Creating macros"], correct: 1 },
      { q: "Which shortcut typically opens the Find & Replace dialog?", options: ["Ctrl+F", "Ctrl+P", "Ctrl+S", "Ctrl+Z"], correct: 0 }
    ]
  };

  /* ------------------------------------------------------------------ */
  /* Low-level storage helpers                                          */
  /* ------------------------------------------------------------------ */

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("SetuSkill: failed to read", key, e);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("SetuSkill: failed to write", key, e);
    }
  }

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  /* Mock-only obfuscation so plaintext passwords aren't sitting directly
     in localStorage. This is NOT real security — a real backend would
     hash + salt server-side. */
  function mockHash(str) {
    return btoa(unescape(encodeURIComponent(String(str))));
  }

  /* ------------------------------------------------------------------ */
  /* Seeding                                                             */
  /* ------------------------------------------------------------------ */

  function seed() {
    const currentVersion = localStorage.getItem(KEYS.SEED_VERSION);
    const needsReseed = currentVersion !== SEED_VERSION;

    if (needsReseed || !localStorage.getItem(KEYS.INSTITUTES)) writeJSON(KEYS.INSTITUTES, SEED_INSTITUTES);
    if (needsReseed || !localStorage.getItem(KEYS.SKILLS)) writeJSON(KEYS.SKILLS, SEED_SKILLS);
    if (needsReseed || !localStorage.getItem(KEYS.COURSES)) writeJSON(KEYS.COURSES, SEED_COURSES);
    if (needsReseed || !localStorage.getItem(KEYS.EVENTS)) writeJSON(KEYS.EVENTS, SEED_EVENTS);
    if (needsReseed || !localStorage.getItem(KEYS.ARTICLES)) writeJSON(KEYS.ARTICLES, SEED_ARTICLES);
    if (needsReseed || !localStorage.getItem(KEYS.FAQS)) writeJSON(KEYS.FAQS, SEED_FAQS);
    if (needsReseed || !localStorage.getItem(KEYS.QUIZ_BANK)) writeJSON(KEYS.QUIZ_BANK, SEED_QUIZ_BANK);

    // Always ensure demo accounts exist; merge them into the user list.
    if (needsReseed || !localStorage.getItem(KEYS.USERS)) {
      writeJSON(KEYS.USERS, DEMO_ACCOUNTS.slice());
    } else {
      // Merge: add any demo account not already present by id
      const existing = readJSON(KEYS.USERS, []);
      let changed = false;
      DEMO_ACCOUNTS.forEach((demo) => {
        if (!existing.find((u) => u.id === demo.id)) {
          existing.unshift(demo);
          changed = true;
        } else {
          // Overwrite to keep demo accounts fresh on version bump
          const idx = existing.findIndex((u) => u.id === demo.id);
          if (idx !== -1) { existing[idx] = demo; changed = true; }
        }
      });
      if (changed) writeJSON(KEYS.USERS, existing);
    }

    if (!localStorage.getItem(KEYS.ENROLLMENTS)) writeJSON(KEYS.ENROLLMENTS, {});
    if (!localStorage.getItem(KEYS.ASSESSMENTS)) writeJSON(KEYS.ASSESSMENTS, {});
    if (!localStorage.getItem(KEYS.ACTIVITY)) writeJSON(KEYS.ACTIVITY, {});

    localStorage.setItem(KEYS.SEED_VERSION, SEED_VERSION);
  }

  /* ------------------------------------------------------------------ */
  /* Catalog getters (read-only reference data)                         */
  /* ------------------------------------------------------------------ */

  const Catalog = {
    getInstitutes: () => readJSON(KEYS.INSTITUTES, SEED_INSTITUTES),
    getSkills: () => readJSON(KEYS.SKILLS, SEED_SKILLS),
    getCourses: () => readJSON(KEYS.COURSES, SEED_COURSES),
    getCourseById: (id) => Catalog.getCourses().find((c) => c.id === id) || null,
    getEvents: () => readJSON(KEYS.EVENTS, SEED_EVENTS),
    getArticles: () => readJSON(KEYS.ARTICLES, SEED_ARTICLES),
    getFaqs: () => readJSON(KEYS.FAQS, SEED_FAQS),
    getQuiz: (courseId) => readJSON(KEYS.QUIZ_BANK, SEED_QUIZ_BANK)[courseId] || []
  };

  /* ------------------------------------------------------------------ */
  /* Users & session                                                    */
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
  /* Enrollments (course progress)                                      */
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
        list.push({ courseId, progress: 0, joinedAt: new Date().toISOString() });
        all[userId] = list;
        writeJSON(KEYS.ENROLLMENTS, all);
        Activity.log(userId, "course_enrolled");
      }
      return list;
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
  /* Assessments (skill verification results)                          */
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
      list.push({
        courseId,
        skill: skillLabel,
        score: scorePct,
        passed,
        takenAt: new Date().toISOString()
      });
      all[userId] = list;
      writeJSON(KEYS.ASSESSMENTS, all);

      if (passed) {
        const user = Users.findById(userId);
        if (user && !user.verifiedSkills.includes(skillLabel)) {
          Users.update(userId, { verifiedSkills: user.verifiedSkills.concat(skillLabel) });
        }
      }
      Activity.log(userId, passed ? "assessment_passed" : "assessment_attempted");
      return list;
    }
  };

  /* ------------------------------------------------------------------ */
  /* Activity log (drives the dashboard heatmap)                        */
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
  /* Public API                                                          */
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
    Activity
  };
})(window);
