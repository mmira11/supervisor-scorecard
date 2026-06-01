// -- Default supervisors --
const defaultSupervisors = [
    { id: 1, name: 'John', zone: 'T1-DL', safety: 0, quality: 0, attendance: 100, notes: '', onLeave: false },
    { id: 2, name: 'Michael', zone: 'F1', safety: 0, quality: 0, attendance: 100, notes: '', onLeave: false },
    { id: 3, name: 'Miguel', zone: 'F2-3', safety: 0, quality: 0, attendance: 100, notes: '', onLeave: false },
    { id: 4, name: 'Sarah', zone: 'F4', safety: 0, quality: 0, attendance: 100, notes: '', onLeave: false },
    { id: 5, name: 'Sally', zone: 'F3', safety: 0, quality: 0, attendance: 100, notes: 'Baby bonding — returns July 1', onLeave: true },
];

// -- State --
let supervisors = JSON.parse(localStorage.getItem('supervisors')) || defaultSupervisors;
let history = JSON.parse(localStorage.getItem('history')) || [];
let nextId = JSON.parse(localStorage.getItem('nextId')) || 6;

// -- Elements --
const tbody = document.getElementById('supervisor-rows');
const weekLabel = document.getElementById('week-label');
const saveBtn = document.getElementById('save-btn');
const historyBtn = document.getElementById('history-btn');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const addBtn = document.getElementById('add-btn');
const newName = document.getElementById('new-name');
const newZone = document.getElementById('new-zone');

// -- Get current week string --
function getWeekLabel() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

weekLabel.textContent = 'Week of ' + getWeekLabel();

// -- Badge color logic --
function safetyBadge(val) {
    const n = parseInt(val);
    if (n === 0) return 'badge green';
    return 'badge red';
}

function qualityBadge(val) {
    const n = parseInt(val);
    if (n <= 3) return 'badge green';
    if (n <= 5) return 'badge yellow';
    return 'badge red';
}

function attendanceBadge(val) {
    const n = parseFloat(val);
    if (n >= 95) return 'badge green';
    if (n >= 90) return 'badge yellow';
    return 'badge red';
}

// -- Save state --
function saveState() {
    localStorage.setItem('supervisors', JSON.stringify(supervisors));
    localStorage.setItem('history', JSON.stringify(history));
    localStorage.setItem('nextId', JSON.stringify(nextId));
}

// -- Render table --
function render() {
    tbody.innerHTML = '';
    supervisors.forEach(sup => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sup.name}${sup.onLeave ? ' <span class="badge-leave">On Leave</span>' : ''}</td>
            <td>${sup.zone}</td>
            <td><span class="${safetyBadge(sup.safety)} editable" contenteditable="true" data-id="${sup.id}" data-field="safety">${sup.safety}</span></td>
            <td><span class="${qualityBadge(sup.quality)} editable" contenteditable="true" data-id="${sup.id}" data-field="quality">${sup.quality}</span></td>
            <td><span class="${attendanceBadge(sup.attendance)} editable" contenteditable="true" data-id="${sup.id}" data-field="attendance">${sup.attendance}%</span></td>
            <td><span class="editable notes" contenteditable="true" data-id="${sup.id}" data-field="notes">${sup.notes}</span></td>
            <td><button class="delete-btn" data-id="${sup.id}">✕</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Editable cell events
    document.querySelectorAll('.editable').forEach(cell => {
        cell.addEventListener('blur', (e) => {
            const id = parseInt(e.target.dataset.id);
            const field = e.target.dataset.field;
            let value = e.target.textContent.replace('%', '').trim();
            const sup = supervisors.find(s => s.id === id);
            if (sup) {
                sup[field] = isNaN(value) ? value : parseFloat(value);
                saveState();
                render();
            }
        });
    });

    // Delete button events
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            if (confirm('Remove this supervisor?')) {
                supervisors = supervisors.filter(s => s.id !== id);
                saveState();
                render();
            }
        });
    });
}

// -- Add supervisor --
addBtn.addEventListener('click', () => {
    const name = newName.value.trim();
    const zone = newZone.value.trim();
    if (!name || !zone) {
        alert('Please enter both a name and zone.');
        return;
    }
    supervisors.push({
        id: nextId++,
        name,
        zone,
        safety: 0,
        quality: 0,
        attendance: 100,
        notes: '',
        onLeave: false
    });
    newName.value = '';
    newZone.value = '';
    saveState();
    render();
});

// -- Save week to history --
saveBtn.addEventListener('click', () => {
    const week = getWeekLabel();
    const existing = history.findIndex(h => h.week === week);
    const entry = {
        week,
        data: JSON.parse(JSON.stringify(supervisors))
    };
    if (existing >= 0) {
        history[existing] = entry;
    } else {
        history.unshift(entry);
    }
    saveState();
    alert(`Week of ${week} saved.`);
});

// -- History panel --
historyBtn.addEventListener('click', () => {
    const isVisible = historyPanel.style.display !== 'none';
    historyPanel.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) renderHistory();
});

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p style="color:#aaa;font-size:0.9rem;">No saved weeks yet.</p>';
        return;
    }
    historyList.innerHTML = '';
    history.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'history-entry';
        div.innerHTML = `
            <h3>Week of ${entry.week}</h3>
            <table class="history-table">
                <tr style="color:#aaa;font-size:0.8rem;">
                    <td>Supervisor</td><td>Zone</td><td>Safety</td><td>Quality</td><td>Attendance</td><td>Notes</td>
                </tr>
                ${entry.data.map(s => `
                    <tr>
                        <td>${s.name}</td>
                        <td>${s.zone}</td>
                        <td>${s.safety}</td>
                        <td>${s.quality}</td>
                        <td>${s.attendance}%</td>
                        <td>${s.notes}</td>
                    </tr>
                `).join('')}
            </table>
        `;
        historyList.appendChild(div);
    });
}

// -- Initial render --
render();