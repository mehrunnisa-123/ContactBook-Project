/* main.js — Contact Book main page */

let allContacts = [];
let currentFilter = 'all';
let currentCategory = 'all';
let isListView = false;
let deleteTarget = null;

const grid = document.getElementById('contactsGrid');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const emptyMsg = document.getElementById('emptyMessage');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const totalCount = document.getElementById('totalCount');
const favCount = document.getElementById('favCount');
const deleteModal = document.getElementById('deleteModal');
const deleteContactName = document.getElementById('deleteContactName');

// Check URL for favorites filter
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('filter') === 'favorites') {
  currentFilter = 'favorites';
  document.getElementById('pageTitle').textContent = 'Favorites';
  document.getElementById('favLink').classList.add('active');
  document.querySelector('.nav-item.active:not(#favLink)')?.classList.remove('active');
}

// Init
async function loadContacts() {
  showLoading(true);
  try {
    const data = await ContactsAPI.getAll();
    allContacts = data.data || [];
    updateStats();
    renderContacts();
  } catch (err) {
    showToast('Failed to load contacts. Is the server running?', 'error');
    showLoading(false);
  }
}

function updateStats() {
  totalCount.textContent = allContacts.length;
  favCount.textContent = allContacts.filter(c => c.isFavorite).length;
}

function showLoading(show) {
  loadingState.style.display = show ? 'flex' : 'none';
}

function renderContacts(contacts) {
  let list = contacts ?? getFilteredContacts();
  showLoading(false);

  // Remove old cards
  Array.from(grid.querySelectorAll('.contact-card')).forEach(c => c.remove());

  if (list.length === 0) {
    emptyState.style.display = 'flex';
    emptyMsg.textContent = searchInput.value
      ? 'No contacts match your search.'
      : currentFilter === 'favorites'
        ? 'No favorite contacts yet. Star some!'
        : 'Start building your contact book.';
    return;
  }

  emptyState.style.display = 'none';

  list.forEach((contact, i) => {
    const card = buildCard(contact);
    card.style.animationDelay = `${i * 40}ms`;
    grid.appendChild(card);
  });
}

function getFilteredContacts() {
  let list = [...allContacts];
  if (currentFilter === 'favorites') list = list.filter(c => c.isFavorite);
  if (currentCategory !== 'all') list = list.filter(c => c.category === currentCategory);
  const q = searchInput.value.trim().toLowerCase();
  if (q) {
    list = list.filter(c =>
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.company || '').toLowerCase().includes(q)
    );
  }
  return list;
}

function buildCard(contact) {
  const initials = getInitials(contact.firstName, contact.lastName);
  const avClass = getAvatarClass(contact.firstName + contact.lastName);
  const favActive = contact.isFavorite ? 'active' : '';

  const card = document.createElement('div');
  card.className = 'contact-card';
  card.dataset.id = contact.id;

  card.innerHTML = `
    <div class="card-header">
      <div class="avatar ${avClass}">${initials}</div>
      <div class="card-info">
        <div class="card-name">${escHtml(contact.firstName)} ${escHtml(contact.lastName)}</div>
        <div class="card-company">${contact.company ? escHtml(contact.company) : '&nbsp;'}</div>
      </div>
      <button class="card-fav ${favActive}" data-id="${contact.id}" title="Toggle favorite">
        <svg viewBox="0 0 24 24" fill="${contact.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    </div>
    <div class="card-details">
      <div class="card-detail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        <span><a href="mailto:${escAttr(contact.email)}">${escHtml(contact.email)}</a></span>
      </div>
      <div class="card-detail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.9a19.79 19.79 0 01-3-8.63A2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.52a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z"/>
        </svg>
        <span>${escHtml(contact.phone)}</span>
      </div>
    </div>
    <div class="card-footer">
      <span class="card-badge badge-${contact.category}">${contact.category}</span>
      <div class="card-actions">
        <a href="form.html?id=${contact.id}" class="card-action card-action--edit" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </a>
        <button class="card-action card-action--delete" data-id="${contact.id}" data-name="${escAttr(contact.firstName + ' ' + contact.lastName)}" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>`;

  // Favorite toggle
  card.querySelector('.card-fav').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(contact.id, card);
  });

  // Delete button
  card.querySelector('.card-action--delete').addEventListener('click', (e) => {
    e.stopPropagation();
    openDeleteModal(contact.id, contact.firstName + ' ' + contact.lastName);
  });

  return card;
}

async function toggleFavorite(id, card) {
  try {
    await ContactsAPI.toggleFavorite(id);
    const c = allContacts.find(x => x.id === id);
    if (c) c.isFavorite = !c.isFavorite;
    updateStats();
    const btn = card.querySelector('.card-fav');
    const svg = btn.querySelector('svg');
    const isFav = btn.classList.toggle('active');
    svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
    // If in favorites view and unfavorited, remove card
    if (currentFilter === 'favorites' && !isFav) {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      card.style.transition = 'all 0.3s ease';
      setTimeout(() => { card.remove(); checkEmpty(); }, 300);
    }
    showToast(isFav ? 'Added to favorites ⭐' : 'Removed from favorites', 'info');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openDeleteModal(id, name) {
  deleteTarget = id;
  deleteContactName.textContent = name;
  deleteModal.style.display = 'flex';
}

function closeDeleteModal() {
  deleteModal.style.display = 'none';
  deleteTarget = null;
}

async function deleteContact() {
  if (!deleteTarget) return;
  const btn = document.getElementById('confirmDelete');
  btn.textContent = 'Deleting…';
  btn.disabled = true;

  try {
    await ContactsAPI.delete(deleteTarget);
    allContacts = allContacts.filter(c => c.id !== deleteTarget);
    updateStats();
    // Animate card out
    const card = grid.querySelector(`[data-id="${deleteTarget}"]`);
    if (card) {
      card.style.transition = 'all 0.3s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.85)';
      setTimeout(() => { card.remove(); checkEmpty(); }, 300);
    }
    closeDeleteModal();
    showToast('Contact deleted successfully.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.textContent = 'Delete';
    btn.disabled = false;
  }
}

function checkEmpty() {
  if (!grid.querySelector('.contact-card')) {
    emptyState.style.display = 'flex';
  }
}

// Search
let searchTimer;
searchInput.addEventListener('input', () => {
  const q = searchInput.value;
  searchClear.style.display = q ? 'block' : 'none';
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => renderContacts(), 250);
});
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.style.display = 'none';
  renderContacts();
});

// Category filter
document.querySelectorAll('.filter-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat;
    renderContacts();
  });
});

// View toggle
document.getElementById('gridBtn').addEventListener('click', () => {
  isListView = false;
  grid.classList.remove('list-view');
  document.getElementById('gridBtn').classList.add('active');
  document.getElementById('listBtn').classList.remove('active');
});
document.getElementById('listBtn').addEventListener('click', () => {
  isListView = true;
  grid.classList.add('list-view');
  document.getElementById('listBtn').classList.add('active');
  document.getElementById('gridBtn').classList.remove('active');
});

// Modal buttons
document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
document.getElementById('confirmDelete').addEventListener('click', deleteContact);
deleteModal.addEventListener('click', (e) => { if (e.target === deleteModal) closeDeleteModal(); });

// Utility
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(str) {
  return String(str).replace(/"/g,'&quot;');
}

// Load on init
loadContacts();
