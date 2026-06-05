const navButtons = document.querySelectorAll('.nav-button[data-target]');
const pages = document.querySelectorAll('.page');
const selectPlanButtons = document.querySelectorAll('.select-plan');
const planCards = document.querySelectorAll('.plan-card');
const summaryPlan = document.getElementById('summary-plan');
const summaryPrice = document.getElementById('summary-price');
const registrationForm = document.getElementById('registration-form');

let selectedPlan = null;
let selectedPrice = '';

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

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
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
  };

  alert(`Thanks, ${user.name}! Your FreshFold registration is complete.\nPlan: ${user.plan} (${user.price})\nPickup: ${user.pickup}`);
  registrationForm.reset();
  selectedPlan = null;
  selectedPrice = '';
  updateSummary();
  showPage('pricing');
});

updateSummary();
