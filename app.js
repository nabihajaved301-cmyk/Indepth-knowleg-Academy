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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Remove any previous error message
    clearFormErrors(form);

    // Read form values
    const nameInput = document.getElementById("student-name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const gradeSelect = document.getElementById("grade");
    const subjectSelect = document.getElementById("subject");
    const reasonSelect = document.getElementById("registration-reason");
    const submitBtn = form.querySelector(".submit-btn-main");

    // Client-side Validation
    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const grade = gradeSelect ? gradeSelect.value : "";
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
      showFieldError(gradeSelect, "Please select an academic level / grade.");
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
