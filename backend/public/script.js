// BetterGS Admin Panel JavaScript

let currentUser = null;
let currentActivity = null;
let users = [];
let activities = [];
let currentDatabase = 'staging';
let availableDatabases = ['default', 'staging'];

// API Base URL
const API_BASE = '/api';

// DOM Elements
const usersTableBody = document.getElementById('usersTableBody');
const activitiesContainer = document.getElementById('activitiesContainer');
const alertContainer = document.getElementById('alertContainer');
const loading = document.getElementById('loading');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadDatabaseInfo();
    loadUsers();
    showSection('users');
});

// Utility Functions
function showLoading(show = true) {
    loading.classList.toggle('d-none', !show);
}

function showAlert(message, type = 'success') {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    alertContainer.innerHTML = alertHtml;
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.remove('d-none');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[href="#${sectionName}"]`).classList.add('active');
    
    // Load data based on section
    if (sectionName === 'activities') {
        loadActivities();
        updateCurrentDatabaseIndicator();
    } else if (sectionName === 'database') {
        loadDatabaseInfo();
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// User Management Functions
async function loadUsers() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/users`);
        const data = await response.json();
        
        if (data.success) {
            users = data.users;
            renderUsers();
            showAlert(`${users.length} users loaded successfully`);
        } else {
            showAlert('Failed to load users: ' + data.error, 'danger');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Error loading users: ' + error.message, 'danger');
    }
    showLoading(false);
}

function renderUsers() {
    if (users.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="fas fa-users fa-3x mb-3 d-block opacity-50"></i>
                    No users found
                </td>
            </tr>
        `;
        return;
    }

    usersTableBody.innerHTML = users.map(user => {
        const role = user.customClaims?.role || 'user';
        const isVerified = user.emailVerified;
        const isDisabled = user.disabled;
        
        return `
            <tr>
                <td>
                    <div class="user-avatar">
                        ${getInitials(user.displayName)}
                    </div>
                </td>
                <td>
                    <div class="fw-semibold">${user.displayName}</div>
                    <small class="text-muted">${user.uid.substring(0, 8)}...</small>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge role-${role}">
                        <i class="fas fa-${role === 'admin' ? 'crown' : 'user'} me-1"></i>
                        ${role}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${isDisabled ? 'status-disabled' : isVerified ? 'status-verified' : 'status-unverified'}">
                        <i class="fas fa-${isDisabled ? 'ban' : isVerified ? 'check' : 'exclamation'} me-1"></i>
                        ${isDisabled ? 'Disabled' : isVerified ? 'Verified' : 'Unverified'}
                    </span>
                </td>
                <td>
                    <small class="text-muted">${formatDate(user.lastSignInTime)}</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showRoleModal('${user.uid}', '${user.displayName}', '${role}')">
                        <i class="fas fa-edit me-1"></i>Change Role
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function showRoleModal(uid, displayName, currentRole) {
    currentUser = { uid, displayName, role: currentRole };
    document.getElementById('roleUserName').textContent = displayName;
    document.getElementById('roleSelect').value = currentRole;
    
    const modal = new bootstrap.Modal(document.getElementById('roleModal'));
    modal.show();
}

async function updateUserRole() {
    if (!currentUser) return;
    
    const newRole = document.getElementById('roleSelect').value;
    const modal = bootstrap.Modal.getInstance(document.getElementById('roleModal'));
    
    try {
        const response = await fetch(`${API_BASE}/users/${currentUser.uid}/role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(`User role updated to ${newRole} successfully`);
            modal.hide();
            loadUsers(); // Reload users to reflect changes
        } else {
            showAlert('Failed to update user role: ' + data.error, 'danger');
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        showAlert('Error updating user role: ' + error.message, 'danger');
    }
}

// Activity Management Functions
async function loadActivities() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/activities`);
        const data = await response.json();
        
        if (data.success) {
            activities = data.activities;
            currentDatabase = data.database || currentDatabase;
            renderActivities();
            updateCurrentDatabaseIndicator();
            showAlert(`${activities.length} activities loaded successfully from ${currentDatabase} database`);
        } else {
            showAlert('Failed to load activities: ' + data.error, 'danger');
        }
    } catch (error) {
        console.error('Error loading activities:', error);
        showAlert('Error loading activities: ' + error.message, 'danger');
    }
    showLoading(false);
}

function renderActivities() {
    if (activities.length === 0) {
        activitiesContainer.innerHTML = `
            <div class="col-12">
                <div class="text-center text-muted py-5">
                    <i class="fas fa-running fa-4x mb-3 opacity-50"></i>
                    <h5>No activities found</h5>
                    <p>Create your first activity to get started</p>
                </div>
            </div>
        `;
        return;
    }

    activitiesContainer.innerHTML = activities.map(activity => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card activity-card h-100">
                <div class="position-relative">
                    <img src="${activity.imageUrl}" class="activity-image w-100" alt="${activity.title}">
                    <div class="activity-status ${activity.isActive ? 'active' : 'inactive'}"></div>
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="text-center mb-3">
                        <i class="fas fa-${getActivityIcon(activity.icon)} activity-icon"></i>
                    </div>
                    <h6 class="activity-title">${activity.title}</h6>
                    <p class="activity-description flex-grow-1">${activity.description || 'No description'}</p>
                    <div class="mt-auto">
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-primary flex-fill" onclick="editActivity('${activity.id}')">
                                <i class="fas fa-edit me-1"></i>Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteActivity('${activity.id}', '${activity.title}')">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                        </div>
                        <small class="text-muted d-block mt-2">
                            <i class="fas fa-clock me-1"></i>
                            Created: ${formatDate(activity.createdAt?.seconds ? new Date(activity.createdAt.seconds * 1000) : activity.createdAt)}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getActivityIcon(icon) {
    const iconMap = {
        'add': 'plus',
        'bicycle': 'bicycle',
        'walk': 'walking',
        'fitness': 'dumbbell',
        'basketball': 'basketball-ball',
        'football': 'football-ball',
        'tennis': 'table-tennis',
        'swimming': 'swimmer',
        'book': 'book',
        'musical-notes': 'music',
        'code': 'code',
        'brush': 'paint-brush'
    };
    return iconMap[icon] || 'plus';
}

function showCreateActivityModal() {
    currentActivity = null;
    document.getElementById('activityModalTitle').textContent = 'Create Activity';
    document.getElementById('saveActivityText').textContent = 'Create Activity';
    
    // Reset form
    document.getElementById('activityForm').reset();
    document.getElementById('activityIsActive').checked = true;
    
    const modal = new bootstrap.Modal(document.getElementById('activityModal'));
    modal.show();
}

function editActivity(id) {
    currentActivity = activities.find(a => a.id === id);
    if (!currentActivity) return;
    
    document.getElementById('activityModalTitle').textContent = 'Edit Activity';
    document.getElementById('saveActivityText').textContent = 'Update Activity';
    
    // Populate form
    document.getElementById('activityTitle').value = currentActivity.title;
    document.getElementById('activityDescription').value = currentActivity.description || '';
    document.getElementById('activityIcon').value = currentActivity.icon || 'add';
    document.getElementById('activityImageUrl').value = currentActivity.imageUrl || '';
    document.getElementById('activityIsActive').checked = currentActivity.isActive !== false;
    
    const modal = new bootstrap.Modal(document.getElementById('activityModal'));
    modal.show();
}

async function saveActivity() {
    const title = document.getElementById('activityTitle').value.trim();
    const description = document.getElementById('activityDescription').value.trim();
    const icon = document.getElementById('activityIcon').value;
    const imageUrl = document.getElementById('activityImageUrl').value.trim();
    const isActive = document.getElementById('activityIsActive').checked;
    
    if (!title) {
        showAlert('Title is required', 'danger');
        return;
    }
    
    const activityData = {
        title,
        description,
        icon,
        imageUrl: imageUrl || 'https://picsum.photos/700/400',
        isActive
    };
    
    try {
        let response;
        if (currentActivity) {
            // Update existing activity
            response = await fetch(`${API_BASE}/activities/${currentActivity.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(activityData)
            });
        } else {
            // Create new activity
            response = await fetch(`${API_BASE}/activities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(activityData)
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(`Activity ${currentActivity ? 'updated' : 'created'} successfully`);
            const modal = bootstrap.Modal.getInstance(document.getElementById('activityModal'));
            modal.hide();
            loadActivities(); // Reload activities
        } else {
            showAlert(`Failed to ${currentActivity ? 'update' : 'create'} activity: ` + data.error, 'danger');
        }
    } catch (error) {
        console.error('Error saving activity:', error);
        showAlert('Error saving activity: ' + error.message, 'danger');
    }
}

async function deleteActivity(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/activities/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Activity deleted successfully');
            loadActivities(); // Reload activities
        } else {
            showAlert('Failed to delete activity: ' + data.error, 'danger');
        }
    } catch (error) {
        console.error('Error deleting activity:', error);
        showAlert('Error deleting activity: ' + error.message, 'danger');
    }
}

// Database Management Functions
async function loadDatabaseInfo() {
    try {
        const response = await fetch(`${API_BASE}/database/current`);
        const data = await response.json();
        
        if (data.success) {
            currentDatabase = data.currentDatabase;
            availableDatabases = data.availableDatabases;
            updateDatabaseDisplay();
            updateDatabaseSelectors();
            updateCurrentDatabaseIndicator();
        } else {
            showAlert('Failed to load database info: ' + data.error, 'danger');
        }
    } catch (error) {
        console.error('Error loading database info:', error);
        showAlert('Error loading database info: ' + error.message, 'danger');
    }
}

function updateDatabaseDisplay() {
    const currentDbDisplay = document.getElementById('currentDatabaseDisplay');
    const availableDbsList = document.getElementById('availableDatabasesList');
    
    if (currentDbDisplay) {
        currentDbDisplay.textContent = currentDatabase;
    }
    
    if (availableDbsList) {
        availableDbsList.innerHTML = availableDatabases.map(db => 
            `<span class="badge bg-${db === currentDatabase ? 'primary' : 'secondary'} me-1">${db}</span>`
        ).join('');
    }
}

function updateDatabaseSelectors() {
    const selectors = ['databaseSelector', 'fromDatabaseSelector', 'toDatabaseSelector'];
    
    selectors.forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        if (selector) {
            selector.innerHTML = availableDatabases.map(db => 
                `<option value="${db}" ${db === currentDatabase ? 'selected' : ''}>${db}</option>`
            ).join('');
        }
    });
}

function updateCurrentDatabaseIndicator() {
    const indicator = document.getElementById('currentDatabaseIndicator');
    if (indicator) {
        indicator.textContent = currentDatabase;
    }
}

async function switchDatabase() {
    const selectedDatabase = document.getElementById('databaseSelector').value;
    
    if (!selectedDatabase) {
        showAlert('Please select a database', 'danger');
        return;
    }
    
    if (selectedDatabase === currentDatabase) {
        showAlert('Already using the selected database', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/database/switch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ database: selectedDatabase })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentDatabase = data.currentDatabase;
            updateDatabaseDisplay();
            updateCurrentDatabaseIndicator();
            showAlert(`Successfully switched to ${selectedDatabase} database`);
            
            // Reload activities if on activities page
            if (!document.getElementById('activities').classList.contains('d-none')) {
                loadActivities();
            }
        } else {
            showAlert('Failed to switch database: ' + data.error, 'danger');
        }
    } catch (error) {
        console.error('Error switching database:', error);
        showAlert('Error switching database: ' + error.message, 'danger');
    }
}

async function copyActivities() {
    const fromDatabase = document.getElementById('fromDatabaseSelector').value;
    const toDatabase = document.getElementById('toDatabaseSelector').value;
    
    if (!fromDatabase || !toDatabase) {
        showAlert('Please select both source and target databases', 'danger');
        return;
    }
    
    if (fromDatabase === toDatabase) {
        showAlert('Source and target databases must be different', 'danger');
        return;
    }
    
    if (!confirm(`Are you sure you want to copy all activities from ${fromDatabase} to ${toDatabase}? This will overwrite existing activities with the same IDs.`)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/database/copy-activities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                fromDatabase, 
                toDatabase 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(`Successfully copied ${data.copiedCount} activities from ${fromDatabase} to ${toDatabase}`);
            
            // Reload activities if current database is the target
            if (currentDatabase === toDatabase && !document.getElementById('activities').classList.contains('d-none')) {
                loadActivities();
            }
        } else {
            showAlert('Failed to copy activities: ' + data.error, 'danger');
        }
    } catch (error) {
        console.error('Error copying activities:', error);
        showAlert('Error copying activities: ' + error.message, 'danger');
    }
    
    showLoading(false);
}
