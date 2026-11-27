// User management page: loads users from the API and handles edit/delete without reloading.
const page = document.querySelector('.user-admin-page');
const usersList = document.getElementById('users-list');
const usersLoading = document.getElementById('users-loading');
const userMessage = document.getElementById('user-message');

const currentUserId = page.dataset.currentUserId;
const isAdmin = page.dataset.currentUserRole === 'admin';
const ROLES = ['user', 'admin'];
const PAGE_SIZE = 10;
let currentPage = 1;

// Pagination controls are built here so the view template does not need to change.
const pager = document.createElement('nav');
pager.className = 'pagination';
pager.setAttribute('aria-label', 'User list pages');
const prevButton = document.createElement('button');
prevButton.type = 'button';
prevButton.className = 'btn-primary';
prevButton.textContent = 'Previous';
const pageStatus = document.createElement('span');
pageStatus.setAttribute('aria-live', 'polite');
const nextButton = document.createElement('button');
nextButton.type = 'button';
nextButton.className = 'btn-primary';
nextButton.textContent = 'Next';
pager.append(prevButton, ' ', pageStatus, ' ', nextButton);
pager.hidden = true;
usersList.after(pager);

const showMessage = (text, isError = false) => {
    userMessage.textContent = text;
    userMessage.className = isError ? 'auth-error' : '';
};

// Read a JSON error body if there is one; fall back to the HTTP status text.
const getErrorMessage = async (response) => {
    try {
        const data = await response.json();
        return data.error || response.statusText;
    } catch {
        return response.statusText;
    }
};

const createField = (labelText, name, value, userId) => {
    const group = document.createElement('div');
    group.className = 'form-group';

    const inputId = `${name}-${userId}`;
    const label = document.createElement('label');
    label.className = 'form-label';
    label.htmlFor = inputId;
    label.textContent = labelText;

    let input;
    if (name === 'role') {
        input = document.createElement('select');
        for (const role of ROLES) {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role;
            option.selected = role === value;
            input.append(option);
        }
    } else {
        input = document.createElement('input');
        input.type = name === 'email' ? 'email' : 'text';
        input.value = value;
        input.required = true;
    }

    input.className = 'form-input';
    input.id = inputId;
    input.name = name;

    group.append(label, input);
    return group;
};

const renderUser = (user) => {
    const card = document.createElement('article');
    card.className = 'user-card';
    card.dataset.userId = user._id;

    const heading = document.createElement('h3');
    heading.textContent = user.displayName;

    const details = document.createElement('p');
    details.textContent = `Username: ${user.username} | Email: ${user.email} | Role: ${user.role}`;

    const form = document.createElement('form');
    form.className = 'auth-form';
    form.append(
        createField('Display name', 'displayName', user.displayName, user._id),
        createField('Username', 'username', user.username, user._id),
        createField('Email', 'email', user.email, user._id)
    );

    if (isAdmin) {
        form.append(createField('Role', 'role', user.role, user._id));
    }

    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.className = 'btn-primary';
    saveButton.textContent = 'Save changes';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn-primary';
    deleteButton.textContent = 'Delete user';

    form.append(saveButton, deleteButton);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const updates = Object.fromEntries(new FormData(form));

        try {
            const response = await fetch(`/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                showMessage(`Update failed: ${await getErrorMessage(response)}`, true);
                return;
            }

            const updatedUser = await response.json();
            card.replaceWith(renderUser(updatedUser));
            showMessage(`Updated ${updatedUser.displayName}.`);
        } catch (error) {
            console.error(error);
            showMessage('Update failed: network error.', true);
        }
    });

    deleteButton.addEventListener('click', async () => {
        const isSelf = user._id === currentUserId;
        const confirmMessage = isSelf
            ? 'Delete your own account? You will be logged out.'
            : `Delete ${user.displayName}?`;

        if (!window.confirm(confirmMessage)) return;

        try {
            const response = await fetch(`/api/users/${user._id}`, { method: 'DELETE' });

            if (!response.ok) {
                showMessage(`Delete failed: ${await getErrorMessage(response)}`, true);
                return;
            }

            if (isSelf) {
                window.location.href = '/';
                return;
            }

            showMessage(`Deleted ${user.displayName}.`);
            // Reload so the page refills; step back if this emptied the last page.
            const isLastOnPage = usersList.querySelectorAll('.user-card').length === 1;
            loadUsers(isLastOnPage && currentPage > 1 ? currentPage - 1 : currentPage);
        } catch (error) {
            console.error(error);
            showMessage('Delete failed: network error.', true);
        }
    });

    card.append(heading, details, form, document.createElement('hr'));
    return card;
};

async function loadUsers(page = 1) {
    try {
        const params = new URLSearchParams({ page, limit: PAGE_SIZE });
        const response = await fetch(`/api/users?${params}`);

        if (!response.ok) {
            showMessage(`Could not load users: ${await getErrorMessage(response)}`, true);
            return;
        }

        const { data: users, pagination } = await response.json();
        currentPage = pagination.page;
        usersList.replaceChildren(...users.map(renderUser));

        if (users.length === 0) {
            usersList.textContent = 'No users found.';
        }

        pageStatus.textContent = `Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`;
        prevButton.disabled = !pagination.hasPreviousPage;
        nextButton.disabled = !pagination.hasNextPage;
        pager.hidden = pagination.totalPages <= 1;
    } catch (error) {
        console.error(error);
        showMessage('Could not load users: network error.', true);
    } finally {
        usersLoading.hidden = true;
    }
}

prevButton.addEventListener('click', () => loadUsers(currentPage - 1));
nextButton.addEventListener('click', () => loadUsers(currentPage + 1));

loadUsers();
