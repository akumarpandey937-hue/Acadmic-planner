let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAdmin()) return;
  bindAdminNav();
  loadDashboard();
});

function bindAdminNav() {
  document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
      document.getElementById(`section-${section}`)?.classList.remove('hidden');
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const titles = { dashboard: 'Admin Dashboard', users: 'User Management', reports: 'Reports', notifications: 'Send Notifications', 'ai-credits': 'AI Credits' };
      document.getElementById('adminTitle').textContent = titles[section] || section;

      const loaders = { dashboard: loadDashboard, users: loadUsers, reports: loadReports };
      loaders[section]?.();
    });
  });

  document.getElementById('notifForm')?.addEventListener('submit', handleSendNotification);
  document.getElementById('creditsForm')?.addEventListener('submit', handleCredits);
}

async function loadDashboard() {
  try {
    const res = await api.get('/admin/analytics');
    const d = res.data;
    document.getElementById('totalUsers').textContent = d.totalUsers;
    document.getElementById('activeUsers').textContent = d.activeUsers;
    document.getElementById('totalSessions').textContent = d.totalSessions;
    document.getElementById('avgCGPA').textContent = d.averageCGPA;

    document.getElementById('recentUsers').innerHTML = (d.recentUsers || []).map(u => `
      <div class="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-glass)] mb-2">
        <div><div class="font-medium">${u.name}</div><div class="text-xs text-[var(--text-muted)]">${u.email}</div></div>
        <span class="text-xs text-[var(--text-muted)]">${Utils.formatDate(u.createdAt)}</span>
      </div>`).join('') || '<p class="text-[var(--text-muted)]">No recent users</p>';
  } catch (err) { Utils.toast(err.message, 'error'); }
}

async function loadUsers() {
  try {
    const res = await api.get('/admin/users?limit=100');
    allUsers = res.data || [];
    renderUsers(allUsers);
  } catch (err) { Utils.toast(err.message, 'error'); }
}

function renderUsers(users) {
  document.getElementById('usersBody').innerHTML = users.map(u => `
    <tr>
      <td>${Utils.escapeHtml(u.name)}</td>
      <td>${u.email}</td>
      <td>${u.college || '-'}</td>
      <td>${u.branch || '-'}</td>
      <td>${u.xp || 0}</td>
      <td><span class="badge ${u.isActive ? 'badge-success' : 'badge-warning'}">${u.isActive ? 'Active' : 'Inactive'}</span></td>
      <td>
        ${u.role !== 'admin' ? `<button onclick="deleteUser('${u._id}')" class="text-red-400 text-sm hover:underline">Deactivate</button>` : '-'}
      </td>
    </tr>`).join('');
}

function filterUsers() {
  const q = document.getElementById('userSearch').value.toLowerCase();
  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.college || '').toLowerCase().includes(q)
  );
  renderUsers(filtered);
}

async function deleteUser(id) {
  if (!confirm('Deactivate this user?')) return;
  try {
    await api.delete(`/admin/users/${id}`);
    Utils.toast('User deactivated', 'success');
    loadUsers();
  } catch (err) { Utils.toast(err.message, 'error'); }
}

async function loadReports() {
  try {
    const res = await api.get('/admin/reports');
    document.getElementById('reportsList').innerHTML = (res.data || []).map(r => `
      <div class="p-4 rounded-lg bg-[var(--bg-glass)]">
        <div class="flex justify-between items-start mb-2">
          <div>
            <span class="badge badge-primary text-xs mr-2">${r.type}</span>
            <span class="font-medium">${Utils.escapeHtml(r.subject)}</span>
          </div>
          <span class="badge ${r.status === 'pending' ? 'badge-warning' : 'badge-success'}">${r.status}</span>
        </div>
        <p class="text-sm text-[var(--text-secondary)] mb-2">${Utils.escapeHtml(r.message)}</p>
        <div class="text-xs text-[var(--text-muted)] mb-3">
          From: ${r.user?.name || 'Unknown'} (${r.user?.email || ''}) • ${Utils.formatDate(r.createdAt)}
        </div>
        ${r.status === 'pending' ? `
          <div class="flex gap-2">
            <button onclick="updateReport('${r._id}', 'resolved')" class="btn btn-primary text-xs py-1 px-3">Resolve</button>
            <button onclick="updateReport('${r._id}', 'dismissed')" class="btn btn-secondary text-xs py-1 px-3">Dismiss</button>
          </div>` : ''}
      </div>`).join('') || '<p class="text-[var(--text-muted)]">No reports</p>';
  } catch (err) { Utils.toast(err.message, 'error'); }
}

async function updateReport(id, status) {
  try {
    await api.put(`/admin/reports/${id}`, { status });
    Utils.toast('Report updated', 'success');
    loadReports();
  } catch (err) { Utils.toast(err.message, 'error'); }
}

async function handleSendNotification(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    await api.post('/admin/notifications', {
      title: fd.get('title'),
      message: fd.get('message'),
      type: fd.get('type'),
      isGlobal: fd.get('isGlobal') === 'on'
    });
    Utils.toast('Notification sent!', 'success');
    e.target.reset();
  } catch (err) { Utils.toast(err.message, 'error'); }
}

async function handleCredits(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await api.post('/admin/ai-credits', {
      userId: fd.get('userId'),
      credits: parseInt(fd.get('credits')),
      action: fd.get('action')
    });
    Utils.toast(`Credits updated: ${res.data.aiCredits}`, 'success');
    e.target.reset();
  } catch (err) { Utils.toast(err.message, 'error'); }
}
