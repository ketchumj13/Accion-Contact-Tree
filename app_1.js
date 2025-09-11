// Initial contact data
const initialContacts = [
  {
    name: "Tarun Agarwal",
    role: "SVP Sales",
    city: "New Jersey", 
    email: "tarun.agarwal@accionlabs.com",
    phone: "",
    linkedin: "",
    calendar: "",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&h=320&fit=crop&crop=face",
    alt: "Portrait of Tarun Agarwal"
  },
  {
    name: "Jakob Ketchum", 
    role: "Sales Director",
    city: "Texas",
    email: "jakob.ketchum@accionlabs.com",
    phone: "",
    linkedin: "",
    calendar: "",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=320&h=320&fit=crop&crop=face",
    alt: "Portrait of Jakob Ketchum"
  }
];

// Application state
let contacts = [];
let isAuthenticated = false;
let editingIndex = -1;

// DOM elements
const mainPage = document.getElementById('main-page');
const adminPage = document.getElementById('admin-page');
const contactCardsContainer = document.getElementById('contact-cards');
const adminContactsContainer = document.getElementById('admin-contacts');
const copyToast = document.getElementById('copy-toast');
const tooltip = document.getElementById('tooltip');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  loadContacts();
  renderContactCards();
  setupEventListeners();
});

// Load contacts from localStorage or use initial data
function loadContacts() {
  const savedContacts = localStorage.getItem('accion-contacts');
  if (savedContacts) {
    contacts = JSON.parse(savedContacts);
  } else {
    contacts = [...initialContacts];
    saveContacts();
  }
}

// Save contacts to localStorage
function saveContacts() {
  localStorage.setItem('accion-contacts', JSON.stringify(contacts));
}

// Render contact cards on main page
function renderContactCards() {
  contactCardsContainer.innerHTML = '';
  
  contacts.forEach((contact, index) => {
    const card = createContactCard(contact, index);
    contactCardsContainer.appendChild(card);
  });
}

// Create a contact card element
function createContactCard(contact, index) {
  const card = document.createElement('div');
  card.className = 'contact-card';
  card.setAttribute('data-index', index);
  
  const defaultPhoto = `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=320&h=320&fit=crop&crop=face`;
  const photoUrl = contact.photo || defaultPhoto;
  
  // Create action buttons with proper disabled states and ARIA labels
  const phoneButton = createActionButton(
    '📞', 
    'Phone', 
    contact.phone, 
    `tel:${contact.phone}`,
    'Phone not available'
  );
  
  const linkedinButton = createActionButton(
    '💼', 
    'LinkedIn', 
    contact.linkedin, 
    contact.linkedin,
    'LinkedIn not available'
  );
  
  const calendarButton = createActionButton(
    '📅', 
    'Calendar', 
    contact.calendar, 
    contact.calendar,
    'Calendar not available'
  );
  
  card.innerHTML = `
    <div class="contact-header">
      <img src="${photoUrl}" alt="${contact.alt || `Portrait of ${contact.name}`}" class="contact-avatar">
      <div class="contact-info">
        <h3>${contact.name}</h3>
        <p class="contact-role">${contact.role} • ${contact.city}</p>
      </div>
    </div>
    <div class="contact-actions">
      <a href="mailto:${contact.email}" class="action-btn action-btn--primary" aria-label="Send email to ${contact.name}">
        📧 Email
      </a>
      ${phoneButton}
      ${linkedinButton}
      ${calendarButton}
      <button class="action-btn" onclick="copyEmailAction('${contact.email}')" aria-label="Copy ${contact.name}'s email to clipboard">
        📋 Copy Email
      </button>
    </div>
  `;
  
  return card;
}

// Create action button with proper disabled state handling
function createActionButton(icon, label, value, link, unavailableText) {
  const isAvailable = value && value.trim() !== '';
  
  if (isAvailable) {
    const target = link.startsWith('tel:') ? '' : ' target="_blank"';
    return `<a href="${link}" class="action-btn" aria-label="${label} - ${value}"${target}>
      ${icon} ${label}
    </a>`;
  } else {
    return `<button class="action-btn action-btn--unavailable" 
                    disabled 
                    aria-label="${unavailableText}"
                    onmouseenter="showTooltipHandler(event, '${unavailableText}')"
                    onmouseleave="hideTooltipHandler()">
      ${icon} ${label}
    </button>`;
  }
}

// Wrapper functions for tooltip events to ensure they're accessible globally
function showTooltipHandler(event, text) {
  showTooltip(event, text);
}

function hideTooltipHandler() {
  hideTooltip();
}

// Wrapper function for copy email action
function copyEmailAction(email) {
  copyEmail(email);
}

// Show tooltip for disabled buttons
function showTooltip(event, text) {
  if (!tooltip) return;
  
  const tooltipContent = tooltip.querySelector('.tooltip-content');
  tooltipContent.textContent = text;
  
  const rect = event.target.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top - 35}px`;
  tooltip.style.transform = 'translateX(-50%)';
  
  tooltip.classList.remove('hidden');
  tooltip.classList.add('show');
}

// Hide tooltip
function hideTooltip() {
  if (!tooltip) return;
  
  tooltip.classList.remove('show');
  setTimeout(() => {
    tooltip.classList.add('hidden');
  }, 150);
}

// Copy email to clipboard
async function copyEmail(email) {
  try {
    await navigator.clipboard.writeText(email);
    showToast('Email copied to clipboard!', 'success');
  } catch (err) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = email;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Email copied to clipboard!', 'success');
    } catch (fallbackErr) {
      showToast('Failed to copy email. Please try manually.', 'error');
      console.error('Copy failed:', fallbackErr);
    }
  }
}

// Show toast notification with type support
function showToast(message, type = 'success') {
  if (!copyToast) return;
  
  const content = copyToast.querySelector('.toast-content span');
  content.textContent = message;
  
  // Reset classes and set background based on type
  copyToast.className = 'toast';
  if (type === 'error') {
    copyToast.style.background = 'var(--color-error)';
  } else if (type === 'warning') {
    copyToast.style.background = 'var(--color-warning)';
  } else {
    copyToast.style.background = 'var(--color-success)';
  }
  
  copyToast.classList.remove('hidden');
  copyToast.classList.add('show');
  
  setTimeout(() => {
    copyToast.classList.remove('show');
    setTimeout(() => {
      copyToast.classList.add('hidden');
    }, 300);
  }, 3000);
}

// Setup event listeners
function setupEventListeners() {
  // Admin link - Fixed to properly handle admin access
  const adminLink = document.getElementById('admin-link');
  if (adminLink) {
    adminLink.addEventListener('click', (e) => {
      e.preventDefault();
      showAdminPage();
    });
  }
  
  // Back to main
  const backToMain = document.getElementById('back-to-main');
  if (backToMain) {
    backToMain.addEventListener('click', () => {
      showMainPage();
    });
  }
  
  // Admin authentication
  const adminAuth = document.getElementById('admin-auth');
  if (adminAuth) {
    adminAuth.addEventListener('submit', handleAdminAuth);
  }
  
  // Add contact button
  const addContactBtn = document.getElementById('add-contact-btn');
  if (addContactBtn) {
    addContactBtn.addEventListener('click', () => {
      showContactForm();
    });
  }
  
  // Contact form
  const contactFormElement = document.getElementById('contact-form-element');
  if (contactFormElement) {
    contactFormElement.addEventListener('submit', handleContactForm);
  }
  
  const cancelForm = document.getElementById('cancel-form');
  if (cancelForm) {
    cancelForm.addEventListener('click', hideContactForm);
  }
  
  // Hide tooltip on scroll or click outside
  document.addEventListener('scroll', hideTooltip);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.action-btn--unavailable')) {
      hideTooltip();
    }
  });
}

// Show admin page
function showAdminPage() {
  if (!mainPage || !adminPage) return;
  
  mainPage.classList.add('hidden');
  adminPage.classList.remove('hidden');
  
  const authForm = document.getElementById('auth-form');
  const adminPanel = document.getElementById('admin-panel');
  
  if (!isAuthenticated) {
    if (authForm) authForm.classList.remove('hidden');
    if (adminPanel) adminPanel.classList.add('hidden');
  } else {
    if (authForm) authForm.classList.add('hidden');
    if (adminPanel) adminPanel.classList.remove('hidden');
    renderAdminContacts();
  }
}

// Show main page
function showMainPage() {
  if (!mainPage || !adminPage) return;
  
  adminPage.classList.add('hidden');
  mainPage.classList.remove('hidden');
  renderContactCards();
}

// Handle admin authentication
function handleAdminAuth(e) {
  e.preventDefault();
  
  const passwordInput = document.getElementById('admin-password');
  if (!passwordInput) return;
  
  const password = passwordInput.value;
  
  if (password === 'admin123') {
    isAuthenticated = true;
    
    const authForm = document.getElementById('auth-form');
    const adminPanel = document.getElementById('admin-panel');
    
    if (authForm) authForm.classList.add('hidden');
    if (adminPanel) adminPanel.classList.remove('hidden');
    
    renderAdminContacts();
    passwordInput.value = '';
    showToast('Successfully logged in as admin!', 'success');
  } else {
    showToast('Invalid password. Please try again.', 'error');
    passwordInput.focus();
  }
}

// Render admin contacts
function renderAdminContacts() {
  if (!adminContactsContainer) return;
  
  adminContactsContainer.innerHTML = '';
  
  if (contacts.length === 0) {
    adminContactsContainer.innerHTML = `
      <div class="card">
        <div class="card__body" style="text-align: center; padding: var(--space-32);">
          <p style="color: var(--color-text-secondary); font-style: italic;">No contacts found. Add your first contact above.</p>
        </div>
      </div>
    `;
    return;
  }
  
  contacts.forEach((contact, index) => {
    const card = createAdminContactCard(contact, index);
    adminContactsContainer.appendChild(card);
  });
}

// Create admin contact card
function createAdminContactCard(contact, index) {
  const card = document.createElement('div');
  card.className = 'admin-contact-card';
  
  const getFieldDisplay = (value, fieldName) => {
    return value && value.trim() !== '' 
      ? `<p><strong>${fieldName}:</strong> ${value}</p>`
      : `<p class="field-empty"><strong>${fieldName}:</strong> Not provided</p>`;
  };
  
  card.innerHTML = `
    <div class="admin-contact-header">
      <div class="admin-contact-info">
        <h4>${contact.name}</h4>
        <div class="admin-contact-details">
          <p><strong>Role:</strong> ${contact.role} • ${contact.city}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          ${getFieldDisplay(contact.phone, 'Phone')}
          ${getFieldDisplay(contact.linkedin, 'LinkedIn')}
          ${getFieldDisplay(contact.calendar, 'Calendar')}
          ${getFieldDisplay(contact.photo, 'Photo URL')}
        </div>
      </div>
      <div class="admin-contact-actions">
        <button class="btn btn--small btn--secondary" onclick="editContact(${index})" aria-label="Edit ${contact.name}">Edit</button>
        <button class="btn btn--small btn--outline" onclick="deleteContact(${index})" aria-label="Delete ${contact.name}">Delete</button>
      </div>
    </div>
  `;
  
  return card;
}

// Show contact form
function showContactForm(contact = null, index = -1) {
  const form = document.getElementById('contact-form');
  const title = document.getElementById('form-title');
  
  if (!form || !title) return;
  
  editingIndex = index;
  
  if (contact) {
    title.textContent = `Edit Contact - ${contact.name}`;
    document.getElementById('contact-name').value = contact.name || '';
    document.getElementById('contact-role').value = contact.role || '';
    document.getElementById('contact-city').value = contact.city || '';
    document.getElementById('contact-email').value = contact.email || '';
    document.getElementById('contact-phone').value = contact.phone || '';
    document.getElementById('contact-linkedin').value = contact.linkedin || '';
    document.getElementById('contact-calendar').value = contact.calendar || '';
    document.getElementById('contact-photo').value = contact.photo || '';
  } else {
    title.textContent = 'Add New Contact';
    const formElement = document.getElementById('contact-form-element');
    if (formElement) formElement.reset();
  }
  
  form.classList.remove('hidden');
  const nameInput = document.getElementById('contact-name');
  if (nameInput) nameInput.focus();
}

// Hide contact form
function hideContactForm() {
  const form = document.getElementById('contact-form');
  const formElement = document.getElementById('contact-form-element');
  
  if (form) form.classList.add('hidden');
  if (formElement) formElement.reset();
  editingIndex = -1;
}

// Handle contact form submission
function handleContactForm(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('contact-name').value.trim(),
    role: document.getElementById('contact-role').value.trim(),
    city: document.getElementById('contact-city').value.trim(),
    email: document.getElementById('contact-email').value.trim(),
    phone: document.getElementById('contact-phone').value.trim(),
    linkedin: document.getElementById('contact-linkedin').value.trim(),
    calendar: document.getElementById('contact-calendar').value.trim(),
    photo: document.getElementById('contact-photo').value.trim(),
    alt: `Portrait of ${document.getElementById('contact-name').value.trim()}`
  };
  
  // Validate required fields
  if (!formData.name || !formData.role || !formData.city || !formData.email) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    showToast('Please enter a valid email address.', 'error');
    const emailInput = document.getElementById('contact-email');
    if (emailInput) emailInput.focus();
    return;
  }
  
  // Validate URLs if provided
  const urlFields = ['linkedin', 'calendar', 'photo'];
  for (const field of urlFields) {
    if (formData[field] && !isValidUrl(formData[field])) {
      showToast(`Please enter a valid URL for ${field}.`, 'error');
      const fieldInput = document.getElementById(`contact-${field}`);
      if (fieldInput) fieldInput.focus();
      return;
    }
  }
  
  try {
    if (editingIndex >= 0) {
      // Edit existing contact
      contacts[editingIndex] = formData;
      showToast('Contact updated successfully!', 'success');
    } else {
      // Add new contact
      contacts.push(formData);
      showToast('Contact added successfully!', 'success');
    }
    
    saveContacts();
    renderAdminContacts();
    hideContactForm();
  } catch (error) {
    showToast('Failed to save contact. Please try again.', 'error');
    console.error('Save failed:', error);
  }
}

// Validate URL format
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Edit contact
function editContact(index) {
  const contact = contacts[index];
  showContactForm(contact, index);
}

// Delete contact
function deleteContact(index) {
  const contact = contacts[index];
  
  if (confirm(`Are you sure you want to delete ${contact.name}?\n\nThis action cannot be undone.`)) {
    try {
      contacts.splice(index, 1);
      saveContacts();
      renderAdminContacts();
      showToast(`${contact.name} has been deleted.`, 'success');
    } catch (error) {
      showToast('Failed to delete contact. Please try again.', 'error');
      console.error('Delete failed:', error);
    }
  }
}

// Handle keyboard navigation and shortcuts
document.addEventListener('keydown', function(e) {
  // Escape key handling
  if (e.key === 'Escape') {
    const contactForm = document.getElementById('contact-form');
    
    if (!adminPage.classList.contains('hidden')) {
      if (contactForm && !contactForm.classList.contains('hidden')) {
        hideContactForm();
      } else if (isAuthenticated) {
        if (confirm('Are you sure you want to return to the main page?')) {
          showMainPage();
        }
      }
    }
    hideTooltip();
  }
  
  // Quick admin access with Ctrl+A
  if (e.ctrlKey && e.key === 'a' && !e.target.matches('input, textarea')) {
    e.preventDefault();
    showAdminPage();
  }
});

// Handle window resize for responsive design
window.addEventListener('resize', function() {
  // Hide tooltip on resize to prevent positioning issues
  hideTooltip();
  
  // Force re-render if needed for responsive adjustments
  if (mainPage && !mainPage.classList.contains('hidden')) {
    renderContactCards();
  }
});

// Handle online/offline status
window.addEventListener('online', () => {
  showToast('Connection restored!', 'success');
});

window.addEventListener('offline', () => {
  showToast('You are now offline. Some features may not work.', 'warning');
});

// Initialize service worker for offline functionality if available
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log('Contact Hub application loaded successfully');
  });
}