/**
 * INDEPTH KNOWLEDGE ACADEMY - MAIN CLIENT SCRIPT (app.js)
 * Purely Functional DOM Interaction, Event Listeners & Native Async Fetch Handling
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all interactive modules
  initMobileNavigation();
  initLeadConversionForm();
  initProgramQuickEnrollment();
  initTeacherNotesPortal();
  initSmoothScroll();
  initVideoThumbnailClick();
  initProgramCarousels();
  initProgramModal();
});

/**
 * 1. Mobile Navigation Drawer & ARIA Synchronization
 */
function initMobileNavigation() {
  const toggleBtn = document.querySelector(".mobile-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener("click", () => {
    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
    toggleBtn.setAttribute("aria-expanded", !isExpanded);
    navMenu.classList.toggle("is-active");
  });

  // Close menu when clicking outside or clicking a link
  document.addEventListener("click", (e) => {
    if (!toggleBtn.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains("is-active")) {
      navMenu.classList.remove("is-active");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  });

  navMenu.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-active");
      toggleBtn.setAttribute("aria-expanded", "false");
    });
  });
}

/**
 * 2. Unified Lead Conversion Form Handling with Native Async Fetch
 */
function initLeadConversionForm() {
  const form = document.getElementById("student-registration-form");
  const formWrapper = document.getElementById("form-wrapper");

  if (!form || !formWrapper) return;

  // Attach dynamic subject update on grade selection change
  const gradeSelect = document.getElementById("grade");
  if (gradeSelect) {
    gradeSelect.addEventListener("change", () => {
      updateFormSubjectOptions(gradeSelect.value);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Remove any previous error message
    clearFormErrors(form);

    // Read form values
    const nameInput = document.getElementById("student-name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const gradeSelectEl = document.getElementById("grade");
    const subjectSelect = document.getElementById("subject");
    const reasonSelect = document.getElementById("registration-reason");
    const submitBtn = form.querySelector(".submit-btn-main");

    // Client-side Validation
    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const grade = gradeSelectEl ? gradeSelectEl.value : "";
    const subject = subjectSelect ? subjectSelect.value : "";
    const reason = reasonSelect ? reasonSelect.value : "";

    if (!name || name.length < 2) {
      showFieldError(nameInput, "Please enter student's full name.");
      return;
    }

    if (!email || !isValidEmail(email)) {
      showFieldError(emailInput, "Please enter a valid email address.");
      return;
    }

    if (!phone || phone.length < 7) {
      showFieldError(phoneInput, "Please enter a valid phone or WhatsApp number.");
      return;
    }

    if (!grade) {
      showFieldError(gradeSelectEl, "Please select an academic level / grade.");
      return;
    }

    if (!subject) {
      showFieldError(subjectSelect, "Please select a subject focus.");
      return;
    }

    if (!reason) {
      showFieldError(reasonSelect, "Please select your reason for registration.");
      return;
    }

    // Toggle Loading State
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner" aria-hidden="true"></span> Processing Registration...`;

    try {
      const formData = new FormData(form);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Inject Success Thank You Card
        renderThankYouCard(formWrapper, form, name, grade, reason);
      } else {
        throw new Error(result.message || "Failed to process registration.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
      showFormAlert(form, `Registration failed: ${error.message || "Network error. Please try again."}`);
    }
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(inputElement, message) {
  if (!inputElement) return;
  inputElement.focus();
  inputElement.style.borderColor = "#ef4444";

  let errorEl = inputElement.parentElement.querySelector(".field-error-msg");
  if (!errorEl) {
    errorEl = document.createElement("span");
    errorEl.className = "field-error-msg";
    errorEl.style.color = "#ef4444";
    errorEl.style.fontSize = "0.8rem";
    errorEl.style.marginTop = "0.3rem";
    inputElement.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

function clearFormErrors(form) {
  form.querySelectorAll(".form-control").forEach((el) => {
    el.style.borderColor = "";
  });
  form.querySelectorAll(".field-error-msg").forEach((el) => el.remove());
  const alertEl = form.querySelector(".form-alert-msg");
  if (alertEl) alertEl.remove();
}

function showFormAlert(form, message) {
  const alertEl = document.createElement("div");
  alertEl.className = "form-alert-msg";
  alertEl.style.backgroundColor = "#fef2f2";
  alertEl.style.color = "#991b1b";
  alertEl.style.padding = "0.75rem";
  alertEl.style.borderRadius = "6px";
  alertEl.style.marginBottom = "1rem";
  alertEl.style.fontSize = "0.9rem";
  alertEl.textContent = message;
  form.insertBefore(alertEl, form.firstChild);
}

function renderThankYouCard(container, form, studentName, grade, reason) {
  form.style.display = "none";

  const card = document.createElement("div");
  card.className = "thank-you-card";
  card.id = "form-thankyou-card";
  card.innerHTML = `
    <div class="thank-you-icon" aria-hidden="true">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <h3>Registration Successful!</h3>
    <p>Thank you <strong>${escapeHTML(studentName)}</strong>! Your registration request for <strong>${escapeHTML(grade)}</strong> (${escapeHTML(reason)}) has been received.</p>
    <p style="font-size: 0.9rem; color: #666; margin-bottom: 1.5rem;">Our academic counselor will contact you via WhatsApp / Email shortly with your schedule & login credentials.</p>
    <button type="button" class="btn-primary" id="reset-reg-btn">Register Another Student</button>
  `;

  container.appendChild(card);

  document.getElementById("reset-reg-btn").addEventListener("click", () => {
    card.remove();
    form.reset();
    clearFormErrors(form);
    form.style.display = "block";
    const submitBtn = form.querySelector(".submit-btn-main");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Complete Registration`;
    }
  });
}

/**
 * 3. Quick Program Enrollment Action Shortcuts
 */
function initProgramQuickEnrollment() {
  document.querySelectorAll("[data-enroll-level]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetLevel = btn.getAttribute("data-enroll-level");
      const gradeSelect = document.getElementById("grade");
      const nameInput = document.getElementById("student-name");

      if (gradeSelect && targetLevel) {
        gradeSelect.value = targetLevel;
        // Populate subjects for this program immediately
        updateFormSubjectOptions(targetLevel);
      }

      if (nameInput) {
        setTimeout(() => nameInput.focus(), 400);
      }
    });
  });
}

/**
 * 4. Teacher Portal Notes Upload Functionality
 */
function initTeacherNotesPortal() {
  const uploadForm = document.getElementById("uploadNotesForm");
  if (!uploadForm) return;

  uploadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const titleInput = document.getElementById("notes-title");
    const gradeInput = document.getElementById("notes-grade");
    const subjectInput = document.getElementById("notes-subject");
    const fileInput = document.getElementById("teacher-file");

    const title = titleInput ? titleInput.value.trim() : "";
    const grade = gradeInput ? gradeInput.value : "";
    const subject = subjectInput ? subjectInput.value : "";
    const file = fileInput && fileInput.files ? fileInput.files[0] : null;

    if (!title || !grade || !subject || !file) {
      alert("Please fill in all fields and select a valid study notes file.");
      return;
    }

    const filename = file.name;
    const extension = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toUpperCase() || "PDF";
    const tableBody = document.getElementById("notes-list-body");

    if (!tableBody) return;

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${escapeHTML(grade)}</td>
      <td>${escapeHTML(subject)}</td>
      <td>${escapeHTML(title)}</td>
      <td><a href="#" class="download-link" onclick="alert('Downloading uploaded resource: ${escapeHTML(filename)}'); return false;">Download ${escapeHTML(extension)}</a></td>
    `;

    tableBody.insertBefore(newRow, tableBody.firstChild);
    uploadForm.reset();
    alert("🎉 Notes published successfully to the study resource repository!");
  });
}

/**
 * 5. Video Thumbnail Poster Click & Embed Mount Handler
 */
function initVideoThumbnailClick() {
  document.querySelectorAll(".video-wrapper[data-video-src]").forEach((wrapper) => {
    wrapper.addEventListener("click", () => {
      const videoSrc = wrapper.getAttribute("data-video-src");
      const videoTitle = wrapper.getAttribute("data-video-title") || "Lecture Video";

      if (!videoSrc) return;

      // Replace wrapper content with active iframe
      wrapper.innerHTML = `
        <iframe 
          src="${videoSrc}?autoplay=1" 
          title="${escapeHTML(videoTitle)}" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      `;
    });
  });
}

/**
 * 6. Smooth Scroll Handler
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

/**
 * Utility: XSS Protection HTML Escape
 */
function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, (tag) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[tag] || tag));
}

/**
 * 7. Interactive Program Subject Book Carousels
 */
function initProgramCarousels() {
  const carousels = document.querySelectorAll(".program-carousel");

  carousels.forEach((carousel) => {
    const slides = carousel.querySelectorAll(".carousel-slide");
    const dots = carousel.querySelectorAll(".carousel-dot");
    const prevBtn = carousel.querySelector(".carousel-prev");
    const nextBtn = carousel.querySelector(".carousel-next");

    if (slides.length <= 1) return;

    let currentIndex = 0;
    let autoPlayTimer = null;

    function goToSlide(index) {
      slides[currentIndex].classList.remove("active");
      if (dots[currentIndex]) dots[currentIndex].classList.remove("active");

      currentIndex = (index + slides.length) % slides.length;

      slides[currentIndex].classList.add("active");
      if (dots[currentIndex]) dots[currentIndex].classList.add("active");
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goToSlide(currentIndex - 1);
        resetAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goToSlide(currentIndex + 1);
        resetAutoPlay();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        goToSlide(idx);
        resetAutoPlay();
      });
    });

    function startAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, 4000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }

    carousel.addEventListener("mouseenter", () => clearInterval(autoPlayTimer));
    carousel.addEventListener("mouseleave", () => startAutoPlay());

    startAutoPlay();
  });
}

/**
 * 8. Comprehensive Program Details & Modal Popup Controller
 */
const PROGRAM_DETAILS_DATA = {
  "9th": {
    title: "Class 9th (SSC Part-I)",
    subtitle: "Select examination board to view subjects and syllabus books",
    options: [
      { id: "federal", label: "Federal Board", desc: "Federal Board of Intermediate and Secondary Education (FBISE)" },
      { id: "punjab", label: "Punjab Board", desc: "Punjab Boards of Intermediate and Secondary Education (BISE)" }
    ],
    subjects: {
      federal: [
        { name: "Physics", board: "Federal Board", image: "assets/images/physics.jpg", desc: "Core Physics fundamentals, physical quantities, mechanics, and numerical problem solving." },
        { name: "Chemistry", board: "Federal Board", image: "assets/images/chemistry.jpg", desc: "Atomic structure, chemical bonding, states of matter, and stoichiometry." },
        { name: "Biology", board: "Federal Board", image: "assets/images/Biology.jpg", desc: "Cell biology, biodiversity, enzymes, bioenergetics, and organ systems." },
        { name: "Computer Science", board: "Federal Board", image: "assets/images/computer science.jpg", desc: "Problem solving, algorithms, fundamentals of computers, and programming basics." }
      ],
      punjab: [
        { name: "Physics", board: "Punjab Board", image: "assets/images/10th-Physics.jpg", desc: "Punjab Textbook Board Physics syllabus with extensive past-paper solving workshops." },
        { name: "Chemistry", board: "Punjab Board", image: "assets/images/10th-chemistry.jpg", desc: "PTB Chemistry concepts, chemical equilibrium, and laboratory practical prep." },
        { name: "Biology", board: "Punjab Board", image: "assets/images/10th-Biology.jpg", desc: "Detailed biology diagrams, plant and animal organ systems per Punjab Board." },
        { name: "Computer Science", board: "Punjab Board", image: "assets/images/10th-computer science.jpg", desc: "Fundamentals of IT, logic development, and Punjab board exam prep." }
      ]
    }
  },
  "10th": {
    title: "Class 10th (SSC Part-II)",
    subtitle: "Select examination board to view subjects and syllabus books",
    options: [
      { id: "federal", label: "Federal Board", desc: "Federal Board 10th Examination Preparation" },
      { id: "punjab", label: "Punjab Board", desc: "Punjab Board 10th Examination Preparation" }
    ],
    subjects: {
      federal: [
        { name: "Physics", board: "Federal Board", image: "assets/images/10th-Physics.jpg", desc: "Simple harmonic motion, sound, geometrical optics, electrostatics, and electromagnetism." },
        { name: "Chemistry", board: "Federal Board", image: "assets/images/10th-chemistry.jpg", desc: "Chemical equilibrium, acids & bases, organic chemistry, and environmental chemistry." },
        { name: "Biology", board: "Federal Board", image: "assets/images/10th-Biology.jpg", desc: "Gaseous exchange, homeostasis, coordination & control, genetics, and biotechnology." },
        { name: "Computer Science", board: "Federal Board", image: "assets/images/10th-computer science.jpg", desc: "Programming in C language, logic gates, algorithms, and software concepts." }
      ],
      punjab: [
        { name: "Physics", board: "Punjab Board", image: "assets/images/physics.jpg", desc: "PTB Class 10 Physics theory, numerical mastery, and board past paper revision." },
        { name: "Chemistry", board: "Punjab Board", image: "assets/images/chemistry.jpg", desc: "Class 10 Chemistry Punjab Board reactions, chemical formulas, and test series." },
        { name: "Biology", board: "Punjab Board", image: "assets/images/Biology.jpg", desc: "Human organ systems, inheritance, genetics, and ecological balance per PTB." },
        { name: "Computer Science", board: "Punjab Board", image: "assets/images/computer science.jpg", desc: "PTB Computer Science matric exam prep, algorithms, and C language syntax." }
      ]
    }
  },
  "fsc1": {
    title: "FSc Part-I (HSSC Part 1 / Grade 11)",
    subtitle: "Select examination board to view subjects and syllabus books",
    options: [
      { id: "federal", label: "Federal Board", desc: "Federal Board HSSC-I Pre-Medical & Pre-Engineering Syllabus" },
      { id: "punjab", label: "Punjab Board", desc: "Punjab Board HSSC-I Pre-Medical & Pre-Engineering Syllabus" }
    ],
    subjects: {
      federal: [
        { name: "Physics", board: "Federal Board", image: "assets/images/11th-physics.jpg", desc: "Vectors & equilibrium, work & energy, rotational motion, fluid dynamics, and thermodynamics." },
        { name: "Chemistry", board: "Federal Board", image: "assets/images/11th-chemistry.jpg", desc: "Stoichiometry, atomic structure, gas laws, chemical bonding, and thermochemistry." },
        { name: "Biology", board: "Federal Board", image: "assets/images/11th-biology.jpg", desc: "Biological molecules, cell structure, plantae & animalia, and bioenergetics." },
        { name: "Computer Science", board: "Federal Board", image: "assets/images/11th-computer science.jpg", desc: "Information technology, computer architecture, networking, and security." }
      ],
      punjab: [
        { name: "Physics", board: "Punjab Board", image: "assets/images/11th-physics.jpg", desc: "Punjab Board FSc 1 Physics derivations, numericals, and objective test series." },
        { name: "Chemistry", board: "Punjab Board", image: "assets/images/11th-chemistry.jpg", desc: "Punjab Board FSc 1 Physical & inorganic chemistry foundational concepts." },
        { name: "Biology", board: "Punjab Board", image: "assets/images/11th-biology.jpg", desc: "FSc 1 Biology plant & animal physiology per Punjab Textbook Board." },
        { name: "Computer Science", board: "Punjab Board", image: "assets/images/11th-computer science.jpg", desc: "Computer hardware architecture, operating systems, and database systems." }
      ]
    }
  },
  "fsc2": {
    title: "FSc Part-II (HSSC Part 2 / Grade 12)",
    subtitle: "Select examination board to view subjects and syllabus books",
    options: [
      { id: "federal", label: "Federal Board", desc: "Federal Board HSSC-II Pre-Medical & Pre-Engineering Syllabus" },
      { id: "punjab", label: "Punjab Board", desc: "Punjab Board HSSC-II Pre-Medical & Pre-Engineering Syllabus" }
    ],
    subjects: {
      federal: [
        { name: "Physics", board: "Federal Board", image: "assets/images/12th-physics.jpg", desc: "Electrostatics, current electricity, electromagnetism, modern physics, and nuclear physics." },
        { name: "Chemistry", board: "Federal Board", image: "assets/images/12th-chemistry.jpg", desc: "Periods & groups, organic chemistry, reaction mechanisms, and biochemistry." },
        { name: "Biology", board: "Federal Board", image: "assets/images/12-biology.jpg", desc: "Respiration, circulation, nervous coordination, reproduction, evolution, and ecology." },
        { name: "Computer Science", board: "Federal Board", image: "assets/images/12-computer science.jpg", desc: "C Programming language / Object-oriented programming and database management." }
      ],
      punjab: [
        { name: "Physics", board: "Punjab Board", image: "assets/images/12th-physics.jpg", desc: "FSc 2 Physics Punjab Board exam numericals and past paper solutions." },
        { name: "Chemistry", board: "Punjab Board", image: "assets/images/12th-chemistry.jpg", desc: "FSc 2 Organic Chemistry reactions and synthesis mechanisms per PTB." },
        { name: "Biology", board: "Punjab Board", image: "assets/images/12-biology.jpg", desc: "FSc 2 Biology genetics, biotechnology, and ecosystem dynamics." },
        { name: "Computer Science", board: "Punjab Board", image: "assets/images/12-computer science.jpg", desc: "C programming, functions, arrays, pointers, and DB management system." }
      ]
    }
  },
  "cambridge": {
    title: "Cambridge International",
    subtitle: "Select Cambridge level to view offered subjects and book covers",
    options: [
      { id: "olevel", label: "O-Level", desc: "Cambridge O-Level / IGCSE Qualifications (CIE)" },
      { id: "alevel", label: "A-Level", desc: "Cambridge AS & A2 Level Qualifications (CIE)" }
    ],
    subjects: {
      olevel: [
        { name: "Physics (5054)", board: "O-Level", image: "assets/images/o-physic.jpg", desc: "General physics, thermal physics, waves, electricity, magnetism, and atomic physics." },
        { name: "Chemistry (5070)", board: "O-Level", image: "assets/images/o-chemistry.jpg", desc: "Stoichiometry, experimental chemistry, organic chemistry, and chemical energetics." },
        { name: "Biology (5090)", board: "O-Level", image: "assets/images/o-biology.jpg", desc: "Cell structure, enzymes, plant nutrition, human transport, and biotechnology." },
        { name: "Computer Science (2210)", board: "O-Level", image: "assets/images/o-computer science.jpg", desc: "Data representation, logic gates, pseudocode, algorithms, and computer systems." }
      ],
      alevel: [
        { name: "Physics (9702)", board: "A-Level", image: "assets/images/a-physics.jpg", desc: "AS & A2 Quantum physics, gravitational fields, waves, capacitance, and nuclear physics." },
        { name: "Chemistry (9701)", board: "A-Level", image: "assets/images/a-chemistry.jpg", desc: "Physical chemistry, transition elements, reaction kinetics, and organic synthesis." },
        { name: "Biology (9700)", board: "A-Level", image: "assets/images/a-biology.jpg", desc: "Biodiversity, gene technology, photosynthesis, respiration, homeostasis, and control." },
        { name: "Computer Science (9618)", board: "A-Level", image: "assets/images/a-computer science.jpg", desc: "OOP, abstract data types, system software, assembly language, and software engineering." }
      ]
    }
  },
  "edexcel": {
    title: "Edexcel Pearson Qualifications",
    subtitle: "Select Edexcel level option to view subjects and syllabus books",
    options: [
      { id: "igcse", label: "International GCSE (iGCSE)", desc: "Edexcel International GCSE Science & CS Modules" },
      { id: "ial", label: "International A-Level (IAL)", desc: "Edexcel International AS & A2 Level Modules" }
    ],
    subjects: {
      igcse: [
        { name: "Edexcel iGCSE Physics", board: "Edexcel iGCSE", image: "assets/images/a-physics.jpg", desc: "Forces & motion, electricity, waves, energy resources, and astrophysics." },
        { name: "Edexcel iGCSE Chemistry", board: "Edexcel iGCSE", image: "assets/images/o-chemistry.jpg", desc: "Principles of chemistry, inorganic chemistry, physical chemistry, and organic chemistry." },
        { name: "Edexcel iGCSE Biology", board: "Edexcel iGCSE", image: "assets/images/a-biology.jpg", desc: "Living organisms, structures & functions, reproduction, genetics, and ecology." },
        { name: "Edexcel iGCSE CS", board: "Edexcel iGCSE", image: "assets/images/a-computer science.jpg", desc: "Computational thinking, data representation, networks, and Python algorithm design." }
      ],
      ial: [
        { name: "Edexcel IAL Physics", board: "Edexcel IAL", image: "assets/images/a-physics.jpg", desc: "Mechanics, materials, waves, DC electricity, fields, particle physics, and astrophysics." },
        { name: "Edexcel IAL Chemistry", board: "Edexcel IAL", image: "assets/images/o-chemistry.jpg", desc: "Structure, bonding, main group chemistry, kinetics, organic mechanisms, and spectroscopy." },
        { name: "Edexcel IAL Biology", board: "Edexcel IAL", image: "assets/images/a-biology.jpg", desc: "Molecules, cells, genetics, health, biodiversity, physiology, ecosystems, and gene technology." },
        { name: "Edexcel IAL CS", board: "Edexcel IAL", image: "assets/images/a-computer science.jpg", desc: "Advanced data structures, algorithm efficiency, database design, and software architecture." }
      ]
    }
  },
  "uk_curriculum": {
    title: "UK National Curriculum",
    subtitle: "Select UK curriculum level to view subjects and syllabus books",
    options: [
      { id: "gcse", label: "GCSE (Key Stage 4)", desc: "UK National Curriculum GCSE Science Preparation" },
      { id: "alevel_uk", label: "A-Level (Key Stage 5)", desc: "UK National Curriculum Advanced Level Science Preparation" }
    ],
    subjects: {
      gcse: [
        { name: "GCSE Physics", board: "UK Curriculum (GCSE)", image: "assets/images/physics.jpg", desc: "AQA / OCR / Edexcel GCSE Physics topic coverage, equation practice, and practicals." },
        { name: "GCSE Chemistry", board: "UK Curriculum (GCSE)", image: "assets/images/chemistry.jpg", desc: "Atomic structure, quantitative chemistry, chemical changes, and organic chemistry." },
        { name: "GCSE Biology", board: "UK Curriculum (GCSE)", image: "assets/images/Biology.jpg", desc: "Cell biology, organisation, infection & response, bioenergetics, and ecology." },
        { name: "GCSE Computer Science", board: "UK Curriculum (GCSE)", image: "assets/images/computer science.jpg", desc: "Systems architecture, memory, networking, security, and Python programming." }
      ],
      alevel_uk: [
        { name: "UK A-Level Physics", board: "UK Curriculum (A-Level)", image: "assets/images/11th-physics.jpg", desc: "Advanced mechanics, thermal physics, electric fields, nuclear physics, and practical skills." },
        { name: "UK A-Level Chemistry", board: "UK Curriculum (A-Level)", image: "assets/images/11th-chemistry.jpg", desc: "Physical chemistry, inorganic trends, organic syntheses, NMR spectroscopy, and thermodynamics." },
        { name: "UK A-Level Biology", board: "UK Curriculum (A-Level)", image: "assets/images/a-biology.jpg", desc: "Biological molecules, cells, organisms exchange, genetics, and ecosystems." },
        { name: "UK A-Level Computer Science", board: "UK Curriculum (A-Level)", image: "assets/images/11th-computer science.jpg", desc: "Data structures, algorithms, OOP, database design, and software engineering." }
      ]
    }
  }
};

function initProgramModal() {
  const modal = document.getElementById("program-modal");
  if (!modal) return;

  const closeBtn = document.getElementById("modal-close-btn");
  const modalTitle = document.getElementById("modal-title");
  const modalSubtitle = document.getElementById("modal-subtitle");
  const stepSelection = document.getElementById("modal-step-selection");
  const optionsGrid = document.getElementById("modal-options-grid");
  const stepSubjects = document.getElementById("modal-step-subjects");
  const backBtn = document.getElementById("modal-back-btn");
  const selectedTag = document.getElementById("modal-selected-tag");
  const subjectsGrid = document.getElementById("modal-subjects-grid");

  let currentProgramKey = null;

  // Open modal on "View Details" click
  document.querySelectorAll(".view-details-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const programId = btn.getAttribute("data-program-id");
      if (programId && PROGRAM_DETAILS_DATA[programId]) {
        openModal(programId);
      }
    });
  });

  function openModal(programId) {
    currentProgramKey = programId;
    const data = PROGRAM_DETAILS_DATA[programId];

    modalTitle.textContent = data.title;
    modalSubtitle.textContent = data.subtitle;

    // Reset steps
    stepSubjects.classList.remove("active");
    stepSelection.classList.add("active");

    // Render Step 1 Option Cards
    optionsGrid.innerHTML = "";
    data.options.forEach((opt) => {
      const card = document.createElement("div");
      card.className = "option-select-card";
      card.innerHTML = `
        <div class="option-icon">${escapeHTML(opt.label.charAt(0))}</div>
        <h4 class="option-title">${escapeHTML(opt.label)}</h4>
        <p class="option-desc">${escapeHTML(opt.desc)}</p>
      `;
      card.addEventListener("click", () => {
        showSubjectsForOption(opt.id, opt.label);
      });
      optionsGrid.appendChild(card);
    });

    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function showSubjectsForOption(optionId, optionLabel) {
    const data = PROGRAM_DETAILS_DATA[currentProgramKey];
    if (!data || !data.subjects[optionId]) return;

    const subjectsList = data.subjects[optionId];
    selectedTag.textContent = optionLabel;

    subjectsGrid.innerHTML = "";
    subjectsList.forEach((sub) => {
      const card = document.createElement("div");
      card.className = "modal-subject-card";
      card.innerHTML = `
        <div class="modal-subject-img-box">
          <img src="${escapeHTML(sub.image)}" alt="${escapeHTML(sub.name)} Book Cover" loading="lazy">
          <span class="modal-board-badge">${escapeHTML(sub.board)}</span>
        </div>
        <div class="modal-subject-body">
          <h4 class="modal-subject-name">${escapeHTML(sub.name)}</h4>
          <span class="modal-board-name-tag">${escapeHTML(sub.board)}</span>
          <p class="modal-subject-desc">${escapeHTML(sub.desc)}</p>
          <button type="button" class="modal-subject-enroll-btn">Enroll in ${escapeHTML(sub.name)}</button>
        </div>
      `;

      const enrollBtn = card.querySelector(".modal-subject-enroll-btn");
      enrollBtn.addEventListener("click", () => {
        closeModal();
        // Pre-select grade & subject in registration form and scroll
        const gradeSelect = document.getElementById("grade");
        const nameInput = document.getElementById("student-name");
        const regSection = document.getElementById("register");

        // Map program modal key → form grade value
        const gradeValueMap = {
          "9th": "9th",
          "10th": "10th",
          "fsc1": "FSc Part-I",
          "fsc2": "FSc Part-II",
          "cambridge": "Cambridge",
          "edexcel": "Edexcel",
          "uk_curriculum": "UK Curriculum"
        };

        if (gradeSelect) {
          const targetGrade = gradeValueMap[currentProgramKey];
          if (targetGrade) {
            gradeSelect.value = targetGrade;
            // Populate subject options for this grade, then auto-select the clicked subject
            updateFormSubjectOptions(targetGrade, sub.name);
          }
        }

        if (regSection) {
          regSection.scrollIntoView({ behavior: "smooth" });
        }
        if (nameInput) {
          setTimeout(() => nameInput.focus(), 500);
        }
      });

      subjectsGrid.appendChild(card);
    });

    stepSelection.classList.remove("active");
    stepSubjects.classList.add("active");
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      stepSubjects.classList.remove("active");
      stepSelection.classList.add("active");
    });
  }

  function closeModal() {
    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-active")) {
      closeModal();
    }
  });
}

/**
 * 9. Dynamic Subject Dropdown Generator & Auto-Selection Helper
 */
const GRADE_SUBJECT_MAP = {
  "9th": [
    { value: "All Science Subjects Bundle (Class 9th)", label: "All Science Subjects Bundle (Class 9th)" },
    { value: "Physics Focus", label: "Physics Focus" },
    { value: "Chemistry Focus", label: "Chemistry Focus" },
    { value: "Biology Focus", label: "Biology Focus" },
    { value: "Computer Science Focus", label: "Computer Science Focus" },
    { value: "Mathematics Focus", label: "Mathematics Focus" }
  ],
  "10th": [
    { value: "All Science Subjects Bundle (Class 10th)", label: "All Science Subjects Bundle (Class 10th)" },
    { value: "Physics Focus", label: "Physics Focus" },
    { value: "Chemistry Focus", label: "Chemistry Focus" },
    { value: "Biology Focus", label: "Biology Focus" },
    { value: "Computer Science Focus", label: "Computer Science Focus" },
    { value: "Mathematics Focus", label: "Mathematics Focus" }
  ],
  "FSc Part-I": [
    { value: "All Science Subjects Bundle (FSc Part-I)", label: "All Science Subjects Bundle (FSc Part-I)" },
    { value: "Physics Focus", label: "Physics Focus" },
    { value: "Chemistry Focus", label: "Chemistry Focus" },
    { value: "Biology Focus", label: "Biology Focus" },
    { value: "Computer Science Focus", label: "Computer Science Focus" },
    { value: "Mathematics Focus", label: "Mathematics Focus" }
  ],
  "FSc Part-II": [
    { value: "All Science Subjects Bundle (FSc Part-II)", label: "All Science Subjects Bundle (FSc Part-II)" },
    { value: "Physics Focus", label: "Physics Focus" },
    { value: "Chemistry Focus", label: "Chemistry Focus" },
    { value: "Biology Focus", label: "Biology Focus" },
    { value: "Computer Science Focus", label: "Computer Science Focus" },
    { value: "Mathematics Focus", label: "Mathematics Focus" }
  ],
  "Cambridge": [
    { value: "All Cambridge Subjects Bundle", label: "All Cambridge Subjects Bundle" },
    { value: "Physics (5054)", label: "O-Level Physics (5054)" },
    { value: "Chemistry (5070)", label: "O-Level Chemistry (5070)" },
    { value: "Biology (5090)", label: "O-Level Biology (5090)" },
    { value: "Computer Science (2210)", label: "O-Level Computer Science (2210)" },
    { value: "Physics (9702)", label: "A-Level Physics (9702)" },
    { value: "Chemistry (9701)", label: "A-Level Chemistry (9701)" },
    { value: "Biology (9700)", label: "A-Level Biology (9700)" },
    { value: "Computer Science (9618)", label: "A-Level Computer Science (9618)" }
  ],
  "Edexcel": [
    { value: "All Edexcel Subjects Bundle", label: "All Edexcel Subjects Bundle" },
    { value: "Edexcel iGCSE Physics", label: "Edexcel iGCSE Physics" },
    { value: "Edexcel iGCSE Chemistry", label: "Edexcel iGCSE Chemistry" },
    { value: "Edexcel iGCSE Biology", label: "Edexcel iGCSE Biology" },
    { value: "Edexcel iGCSE CS", label: "Edexcel iGCSE Computer Science" },
    { value: "Edexcel IAL Physics", label: "Edexcel IAL Physics" },
    { value: "Edexcel IAL Chemistry", label: "Edexcel IAL Chemistry" },
    { value: "Edexcel IAL Biology", label: "Edexcel IAL Biology" },
    { value: "Edexcel IAL CS", label: "Edexcel IAL Computer Science" }
  ],
  "UK Curriculum": [
    { value: "All UK Curriculum Subjects Bundle", label: "All UK Curriculum Subjects Bundle" },
    { value: "GCSE Physics", label: "GCSE Physics (Key Stage 4)" },
    { value: "GCSE Chemistry", label: "GCSE Chemistry (Key Stage 4)" },
    { value: "GCSE Biology", label: "GCSE Biology (Key Stage 4)" },
    { value: "GCSE Computer Science", label: "GCSE Computer Science (Key Stage 4)" },
    { value: "UK A-Level Physics", label: "UK A-Level Physics (Key Stage 5)" },
    { value: "UK A-Level Chemistry", label: "UK A-Level Chemistry (Key Stage 5)" },
    { value: "UK A-Level Biology", label: "UK A-Level Biology (Key Stage 5)" },
    { value: "UK A-Level Computer Science", label: "UK A-Level Computer Science (Key Stage 5)" }
  ]
};

function updateFormSubjectOptions(selectedGrade, targetSubjectName = null) {
  const subjectSelect = document.getElementById("subject");
  if (!subjectSelect) return;

  const subjects = GRADE_SUBJECT_MAP[selectedGrade];
  subjectSelect.innerHTML = `<option value="" disabled>Choose subject focus</option>`;

  if (subjects && subjects.length > 0) {
    let selectedValue = "";
    subjects.forEach((subj) => {
      const option = document.createElement("option");
      option.value = subj.value;
      option.textContent = subj.label;
      subjectSelect.appendChild(option);

      // Check if targetSubjectName matches
      if (targetSubjectName) {
        const targetClean = targetSubjectName.toLowerCase();
        const valueClean = subj.value.toLowerCase();
        const labelClean = subj.label.toLowerCase();

        // Extract key words e.g. "physics", "5054", "igcse"
        if (valueClean.includes(targetClean) || labelClean.includes(targetClean) || targetClean.includes(valueClean)) {
          selectedValue = subj.value;
        } else if (targetClean.includes("physics") && (valueClean.includes("physics") || labelClean.includes("physics"))) {
          if (!selectedValue) selectedValue = subj.value;
        } else if (targetClean.includes("chemistry") && (valueClean.includes("chemistry") || labelClean.includes("chemistry"))) {
          if (!selectedValue) selectedValue = subj.value;
        } else if (targetClean.includes("biology") && (valueClean.includes("biology") || labelClean.includes("biology"))) {
          if (!selectedValue) selectedValue = subj.value;
        } else if ((targetClean.includes("computer") || targetClean.includes("cs")) && (valueClean.includes("computer") || valueClean.includes("cs") || labelClean.includes("computer"))) {
          if (!selectedValue) selectedValue = subj.value;
        }
      }
    });

    if (selectedValue) {
      subjectSelect.value = selectedValue;
    } else {
      // Default to first bundle option
      subjectSelect.value = subjects[0].value;
    }
  } else {
    // Default options if no specific grade selected yet
    const defaultSubjects = [
      "All Science Subjects Bundle",
      "Physics Focus",
      "Chemistry Focus",
      "Biology Focus",
      "Computer Science Focus",
      "Mathematics Focus"
    ];
    defaultSubjects.forEach((subj) => {
      const option = document.createElement("option");
      option.value = subj;
      option.textContent = subj;
      subjectSelect.appendChild(option);
    });
  }
}


