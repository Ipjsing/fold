const navButtons = document.querySelectorAll('.nav-button[data-target]');
const pages = document.querySelectorAll('.page');
const selectPlanButtons = document.querySelectorAll('.select-plan');
const planCards = document.querySelectorAll('.plan-card');
const summaryPlan = document.getElementById('summary-plan');
const summaryPrice = document.getElementById('summary-price');
const registrationForm = document.getElementById('registration-form');
const adminSubmissions = document.getElementById('admin-submissions');
const clearSubmissionsBtn = document.getElementById('clear-submissions');
const adminLoginForm = document.getElementById('admin-login-form');
const adminPasswordInput = document.getElementById('admin-password');
const adminLoginError = document.getElementById('admin-login-error');
const adminContent = document.getElementById('admin-content');
const adminLogin = document.getElementById('admin-login');

const SUBMISSION_STORAGE_KEY = 'freshfold_pickup_requests';
const ADMIN_PASSWORD = 'FreshFoldAdmin2026';

let selectedPlan = null;
let selectedPrice = '';
let isAdminAuthenticated = false;

function showPage(target) {
  pages.forEach((page) => {
    page.classList.toggle('active', page.id === target);
  });
  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === target);
  });
}

function updateSummary() {
  summaryPlan.textContent = selectedPlan || 'No plan selected yet';
  summaryPrice.textContent = selectedPrice ? `Price: ${selectedPrice}` : '';
}

function choosePlan(plan, price) {
  selectedPlan = plan;
  selectedPrice = price;
  updateSummary();
  showPage('register');
}

function openAdminDashboard() {
  isAdminAuthenticated = false;

  if (adminLoginError) {
    adminLoginError.textContent = '';
  }

  if (adminPasswordInput) {
    adminPasswordInput.value = '';
  }

  updateAdminView();
  showPage('admin');
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.target === 'admin') {
      openAdminDashboard();
      return;
    }

    showPage(button.dataset.target);
  });
});

selectPlanButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    choosePlan(button.dataset.plan, button.dataset.price);
  });
});

planCards.forEach((card) => {
  const button = card.querySelector('.select-plan');
  if (!button) return;

  card.addEventListener('click', () => {
    choosePlan(button.dataset.plan, button.dataset.price);
  });
});

registrationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!selectedPlan) {
    alert('Please select a plan from the Pricing page before completing registration.');
    showPage('pricing');
    return;
  }

  const formData = new FormData(registrationForm);
  const user = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    pickup: formData.get('pickup'),
    notes: formData.get('notes'),
    plan: selectedPlan,
    price: selectedPrice,
    createdAt: Date.now(),
  };

  const submissions = loadSubmissions();
  submissions.push(user);
  saveSubmissions(submissions);
  renderSubmissions();

  alert(`Thanks, ${user.name}! Your FreshFold registration is complete.\nPlan: ${user.plan} (${user.price})\nPickup: ${user.pickup}`);
  registrationForm.reset();
  selectedPlan = null;
  selectedPrice = '';
  updateSummary();
  showPage('pricing');
});

function loadSubmissions() {
  const stored = localStorage.getItem(SUBMISSION_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveSubmissions(submissions) {
  localStorage.setItem(SUBMISSION_STORAGE_KEY, JSON.stringify(submissions));
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function renderSubmissionDetail(submission) {
  return `
    <article class="submission-card">
      <strong>${submission.name}</strong>
      <p><strong>Plan:</strong> ${submission.plan} (${submission.price})</p>
      <p><strong>Pickup window:</strong> ${submission.pickup}</p>
      <p><strong>Address:</strong> ${submission.address}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Phone:</strong> ${submission.phone}</p>
      <p><strong>Notes:</strong> ${submission.notes || 'None'}</p>
      <span>${formatDate(submission.createdAt)}</span>
    </article>
  `;
}

function renderSubmissions() {
  const submissions = loadSubmissions();

  if (adminSubmissions) {
    adminSubmissions.innerHTML = submissions.length
      ? submissions.map(renderSubmissionDetail).join('')
      : '<p class="empty-state">No pickup requests have been submitted yet.</p>';
  }
}

function updateAdminView() {
  if (adminContent && adminLogin) {
    adminContent.classList.toggle('hidden', !isAdminAuthenticated);
    adminLogin.classList.toggle('hidden', isAdminAuthenticated);
  }

  if (clearSubmissionsBtn) {
    clearSubmissionsBtn.disabled = !isAdminAuthenticated;
  }
}

if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const password = adminPasswordInput.value.trim();
    if (password === ADMIN_PASSWORD) {
      isAdminAuthenticated = true;
      adminLoginError.textContent = '';
      adminPasswordInput.value = '';
      updateAdminView();
      renderSubmissions();
      showPage('admin');
      return;
    }

    adminLoginError.textContent = 'Incorrect password. Please try again.';
  });
}

if (clearSubmissionsBtn) {
  clearSubmissionsBtn.addEventListener('click', () => {
    if (!confirm('Clear all pickup requests? This cannot be undone.')) return;
    localStorage.removeItem(SUBMISSION_STORAGE_KEY);
    renderSubmissions();
  });
}

renderSubmissions();
updateAdminView();
updateSummary();
