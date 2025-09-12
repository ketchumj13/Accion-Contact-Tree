// Initial contact data
const initialContacts = [
	{
		name: "Tarun Agarwal",
		role: "SVP Sales",
		city: "New Jersey", 
		email: "tarun.agarwal@accionlabs.com",
		phone: "",
		twitter: "",
		github: "",
		linkedin: "https://www.linkedin.com/in/itarunagarwal/",
		calendar: "",
		photo: "Tarun_Headshot.jpg",
		alt: "Portrait of Tarun Agarwal"
	},
	{
		name: "Jakob Ketchum", 
		role: "Sales Director",
		city: "Texas",
		email: "jakob.ketchum@accionlabs.com",
		phone: "",
		twitter: "",
		github: "",
		linkedin: "https://www.linkedin.com/in/jakob-ketchum-6742303b/",
		calendar: "",
		photo: "Jakob_Headshot.jpg",
		alt: "Portrait of Jakob Ketchum"
	},
	{
		name: "Sanket Shah",
		role: "Senior Solution Architect",
		city: "Pune, India",
		email: "sanket.shah@accionlabs.com",
		phone: "",
		twitter: "",
		github: "",
		linkedin: "https://www.linkedin.com/in/sankettshah/",
		calendar: "",
		photo: "Sanket_Headshot.jpg",
		alt: "Portrait of Sanket Shah"
	}
];

// Application state
let contacts = [];
let isAuthenticated = false;
let editingIndex = -1;
let baseSnapshot = null; // store base version when opening edit to support 3-way merge

// DOM elements
const mainPage = document.getElementById('main-page');
const adminPage = document.getElementById('admin-page');
const contactCardsContainer = document.getElementById('contact-cards');
const adminContactsContainer = document.getElementById('admin-contacts');
const copyToast = document.getElementById('copy-toast');
const tooltip = document.getElementById('tooltip');

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
	await loadContacts();
	renderContactCards();
	setupEventListeners();
});

// Load contacts from localStorage or use initial data
// Load contacts from localStorage, then try to fetch contacts.json from site, then fallback to initial data
async function loadContacts() {
	const savedContacts = localStorage.getItem('accion-contacts');
	if (savedContacts) {
		try {
			contacts = JSON.parse(savedContacts);
			return;
		} catch (e) {
			console.error('Failed to parse saved contacts, falling back to other sources', e);
		}
	}

	// Try to fetch contacts.json served with the site (for global edits committed to the repo)
	try {
		const resp = await fetch('contacts.json', { cache: 'no-store' });
		if (resp.ok) {
			const data = await resp.json();
			if (Array.isArray(data) && data.length > 0) {
				contacts = data;
				// populate localStorage so current browser also has the latest copy
				saveContacts();
				return;
			}
		}
	} catch (err) {
		// ignore fetch errors (file may not exist), fall back to initial contacts
		console.warn('Could not fetch contacts.json from site root:', err);
	}

	// Fallback to initial contacts
	contacts = [...initialContacts];
	saveContacts();
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
	// Use image icons for actions when available
	const phoneButton = createActionButton(
		'<img src="Phone_Icon.png" alt="phone icon" class="action-icon">',
		'Phone',
		contact.phone,
		`tel:${contact.phone}`,
		'Phone not available'
	);

	const linkedinButton = createActionButton(
		'<img src="LinkedIn_Icon.png" alt="LinkedIn icon" class="action-icon">',
		'LinkedIn',
		contact.linkedin,
		contact.linkedin,
		'LinkedIn not available'
	);

	const twitterButton = createActionButton(
		'<img src="X_Twitter_Icon.png" alt="Twitter icon" class="action-icon">',
		'Twitter',
		contact.twitter,
		contact.twitter,
		'Twitter not available'
	);

	const githubButton = createActionButton(
		'<img src="Github_Icon.png" alt="GitHub icon" class="action-icon">',
		'GitHub',
		contact.github,
		contact.github,
		'GitHub not available'
	);

	const calendarButton = createActionButton(
		'<img src="Calendar_Icon.png" alt="calendar icon" class="action-icon">',
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
			<a href="mailto:${contact.email}" class="action-btn" aria-label="Send email to ${contact.name}">
				<img src="Outlook_Icon.png" alt="Email icon" class="action-icon"> Email
			</a>
	${phoneButton}
	${linkedinButton}
	${twitterButton}
	${githubButton}
	${calendarButton}
		</div>
	`;
  
	return card;
}

// Create action button with proper disabled state handling
function createActionButton(icon, label, value, link, unavailableText) {
	const isAvailable = value && value.trim() !== '';

	if (!isAvailable) {
		// Return empty string to hide actions with no associated data
		return '';
	}

	const target = link.startsWith('tel:') ? '' : ' target="_blank"';
	return `<a href="${link}" class="action-btn" aria-label="${label} - ${value}"${target}>
			${icon} ${label}
		</a>`;
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

	// Export / Import
	const exportBtn = document.getElementById('export-btn');
	if (exportBtn) exportBtn.addEventListener('click', exportContacts);

	const importInput = document.getElementById('import-file-input');
	if (importInput) importInput.addEventListener('change', handleImportFile);

	const saveGithubBtn = document.getElementById('save-github-btn');
	if (saveGithubBtn) saveGithubBtn.addEventListener('click', saveToGitHubPrompt);
  
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
  
		if (password === 'accionmicrosoft25') {
			isAuthenticated = true;
    
			const authForm = document.getElementById('auth-form');
			// ...existing code for successful authentication...
		}
	}
