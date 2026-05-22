/* form.js — Add / Edit Contact */

const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('id');
const isEdit = !!editId;

// Update page meta
if (isEdit) {
  document.title = 'ContactBook — Edit Contact';
  document.getElementById('formTitle').textContent = 'Edit Contact';
  document.getElementById('formSubtitle').textContent = 'Update the details for this contact.';
  document.querySelector('.nav-item--add').textContent = '';
  document.querySelector('.nav-item--add').innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg> Edit Contact`;
  document.getElementById('submitText').textContent = 'Update Contact';
}

// Fields
const fields = {
  firstName: document.getElementById('firstName'),
  lastName: document.getElementById('lastName'),
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
  company: document.getElementById('company'),
  address: document.getElementById('address'),
  notes: document.getElementById('notes'),
  category: document.getElementById('category'),
  isFavorite: document.getElementById('isFavorite')
};
const errors = {
  firstName: document.getElementById('firstNameError'),
  lastName: document.getElementById('lastNameError'),
  email: document.getElementById('emailError'),
  phone: document.getElementById('phoneError')
};

// Avatar preview
function updateAvatar() {
  const first = fields.firstName.value.trim();
  const last = fields.lastName.value.trim();
  const initials = getInitials(first, last);
  const avClass = getAvatarClass((first + last) || 'x');
  const preview = document.getElementById('avatarPreview');
  preview.textContent = '';
  const span = document.createElement('span');
  span.id = 'avatarInitials';
  span.textContent = initials || '?';
  preview.appendChild(span);
  preview.className = `avatar-preview avatar ${avClass}`;
}

fields.firstName.addEventListener('input', () => { updateAvatar(); clearError('firstName'); });
fields.lastName.addEventListener('input', () => { updateAvatar(); clearError('lastName'); });
fields.email.addEventListener('input', () => clearError('email'));
fields.phone.addEventListener('input', () => clearError('phone'));

function clearError(field) {
  errors[field].textContent = '';
  fields[field].classList.remove('error');
}

function setError(field, msg) {
  errors[field].textContent = msg;
  fields[field].classList.add('error');
  fields[field].focus();
}

// Validation
function validate() {
  let valid = true;

  const firstName = fields.firstName.value.trim();
  if (!firstName) {
    setError('firstName', 'First name is required.'); valid = false;
  } else if (firstName.length > 50) {
    setError('firstName', 'Cannot exceed 50 characters.'); valid = false;
  }

  const lastName = fields.lastName.value.trim();
  if (!lastName) {
    setError('lastName', 'Last name is required.'); valid = false;
  } else if (lastName.length > 50) {
    setError('lastName', 'Cannot exceed 50 characters.'); valid = false;
  }

  const email = fields.email.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    setError('email', 'Email address is required.'); valid = false;
  } else if (!emailRegex.test(email)) {
    setError('email', 'Please enter a valid email address.'); valid = false;
  }

  const phone = fields.phone.value.trim();
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
  if (!phone) {
    setError('phone', 'Phone number is required.'); valid = false;
  } else if (!phoneRegex.test(phone)) {
    setError('phone', 'Please enter a valid phone number.'); valid = false;
  }

  return valid;
}

// Build DTO
function getFormData() {
  return {
    firstName: fields.firstName.value.trim(),
    lastName: fields.lastName.value.trim(),
    email: fields.email.value.trim(),
    phone: fields.phone.value.trim(),
    company: fields.company.value.trim() || null,
    address: fields.address.value.trim() || null,
    notes: fields.notes.value.trim() || null,
    category: fields.category.value,
    isFavorite: fields.isFavorite.checked
  };
}

// Load existing contact for edit
async function loadContact() {
  if (!isEdit) return;
  try {
    const data = await ContactsAPI.getById(editId);
    const c = data.data;
    fields.firstName.value = c.firstName;
    fields.lastName.value = c.lastName;
    fields.email.value = c.email;
    fields.phone.value = c.phone;
    fields.company.value = c.company || '';
    fields.address.value = c.address || '';
    fields.notes.value = c.notes || '';
    fields.category.value = c.category;
    fields.isFavorite.checked = c.isFavorite;
    updateAvatar();
  } catch (err) {
    showToast('Failed to load contact details.', 'error');
    setTimeout(() => window.location.href = 'index.html', 1500);
  }
}

// Submit
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const spinner = document.getElementById('btnSpinner');

  submitText.style.display = 'none';
  spinner.style.display = 'block';
  submitBtn.disabled = true;

  const dto = getFormData();

  try {
    if (isEdit) {
      await ContactsAPI.update(editId, dto);
      showToast('Contact updated successfully!', 'success');
    } else {
      await ContactsAPI.create(dto);
      showToast('Contact created successfully!', 'success');
    }
    setTimeout(() => window.location.href = 'index.html', 900);
  } catch (err) {
    showToast(err.message || 'Something went wrong.', 'error');
    submitText.style.display = 'inline';
    spinner.style.display = 'none';
    submitBtn.disabled = false;
  }
});

// Reset
document.getElementById('resetBtn').addEventListener('click', () => {
  document.getElementById('contactForm').reset();
  Object.values(errors).forEach(el => el.textContent = '');
  Object.values(fields).forEach(el => el.classList?.remove('error'));
  updateAvatar();
});

// Init
updateAvatar();
loadContact();
