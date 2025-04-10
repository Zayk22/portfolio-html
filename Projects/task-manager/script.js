const state = {
    tasks: [],
    currentFilter: 'all',
    sortPreference: 'dueDate',
    isLoading: false
};


const elements = {
    themeToggle: document.getElementById('themeToggle'),
    taskInput: document.getElementById('taskInput'),
    dueDate: document.getElementById('dueDate'),
    taskTime: document.getElementById('taskTime'),
    taskCategory: document.getElementById('taskCategory'),
    taskPriority: document.getElementById('taskPriority'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    tasksList: document.getElementById('tasks'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    totalTasksEl: document.getElementById('totalTasks'),
    completedTasksEl: document.getElementById('completedTasks'),
    completionRateEl: document.getElementById('completionRate'),
    dueTodayEl: document.getElementById('dueToday'),
    reminderModal: document.getElementById('reminderModal'),
    reminderList: document.getElementById('reminderList'),
    closeModal: document.querySelector('.close-modal')
};


document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    loadThemePreference();
    loadTasks();
    setupEventListeners();
    setupDragAndDrop();
    setupNotificationPermission();
    elements.dueDate.valueAsDate = new Date();
    checkDueDateReminders();
    setInterval(checkDueDateReminders, 60000); 
}


function loadThemePreference() {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', savedMode);
    elements.themeToggle.textContent = savedMode ? 'Toggle Light' : 'Toggle Dark';
}

function toggleDarkMode() {
    const isDarkMode = !document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    elements.themeToggle.textContent = isDarkMode ? 'Toggle Light' : 'Toggle Dark';
}

function setupEventListeners() {
    elements.themeToggle.addEventListener('click', toggleDarkMode);
    elements.addTaskBtn.addEventListener('click', addTask);
    elements.taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());
    elements.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => filterTasks(btn.dataset.filter));
    });
    elements.closeModal.addEventListener('click', () => elements.reminderModal.style.display = 'none');
}

function setLoading(isLoading) {
    state.isLoading = isLoading;
    if (isLoading) {
        const loader = document.createElement('div');
        loader.className = 'loading-spinner';
        elements.tasksList.innerHTML = '';
        elements.tasksList.appendChild(loader);
    }
}

function addTask() {
    const text = elements.taskInput.value.trim();
    if (!text) return;

    const task = {
        text,
        dueDate: elements.dueDate.value,
        dueTime: elements.taskTime.value || null,
        category: elements.taskCategory.value,
        priority: elements.taskPriority.value,
        completed: false,
        id: Date.now().toString()
    };

    const taskElement = createTaskElement(task);
    taskElement.style.opacity = 0;
    elements.tasksList.appendChild(taskElement);
    
    setTimeout(() => {
        taskElement.style.opacity = 1;
    }, 10);

    elements.taskInput.value = '';
    elements.taskTime.value = '';
    saveTasks();
    updateStats();
}

function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.dataset.id = task.id;
    if (task.completed) taskItem.classList.add('completed');
    if (task.priority) taskItem.classList.add(`priority-${task.priority}`);
    
    taskItem.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <div class="task-content">
            <span class="task-text">
                <span class="task-priority priority-${task.priority || 'medium'}"></span>
                ${task.text}
            </span>
            <div class="task-meta">
                <span class="task-category ${task.category}">${task.category}</span>
                ${task.dueDate ? `
                    <span class="task-due">
                        ${formatDate(task.dueDate)}
                        ${task.dueTime ? `at ${formatTime(task.dueTime)}` : ''}
                    </span>
                ` : ''}
            </div>
        </div>
        <div class="task-actions">
            <button class="edit-btn">✏️</button>
            <button class="delete-btn">×</button>
        </div>
    `;

    taskItem.querySelector('.task-checkbox').addEventListener('change', toggleTaskComplete);
    taskItem.querySelector('.delete-btn').addEventListener('click', deleteTask);
    taskItem.querySelector('.edit-btn').addEventListener('click', () => enableTaskEditing(taskItem));
    
    return taskItem;
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour}:${minutes} ${ampm}`;
}


function updateStats() {
    const tasks = getTasksFromStorage();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const today = new Date().toISOString().split('T')[0];
    const dueToday = tasks.filter(t => t.dueDate === today && !t.completed).length;
    
    elements.totalTasksEl.textContent = total;
    elements.completedTasksEl.textContent = completed;
    elements.completionRateEl.textContent = total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%';
    elements.dueTodayEl.textContent = dueToday;
}

function enableTaskEditing(taskItem) {
    const textEl = taskItem.querySelector('.task-text');
    const originalText = textEl.textContent;
    
    textEl.contentEditable = true;
    textEl.focus();
    
    const editControls = document.createElement('div');
    editControls.className = 'edit-controls';
    editControls.innerHTML = `
        <button class="save-edit">💾 Save</button>
        <button class="cancel-edit">✖ Cancel</button>
    `;
    
    textEl.after(editControls);
    
    editControls.querySelector('.save-edit').addEventListener('click', () => {
        saveTaskEdit(taskItem, textEl.textContent);
        editControls.remove();
    });
    
    editControls.querySelector('.cancel-edit').addEventListener('click', () => {
        textEl.textContent = originalText;
        textEl.contentEditable = false;
        editControls.remove();
    });
}

function saveTaskEdit(taskItem, newText) {
    const tasks = getTasksFromStorage();
    const taskId = taskItem.dataset.id;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].text = newText.trim();
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    taskItem.querySelector('.task-text').contentEditable = false;
}

function setupNotificationPermission() {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "default") {
        Notification.requestPermission();
    }
}

function checkDueDateReminders() {
    const tasks = getTasksFromStorage();
    const upcomingTasks = tasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        isDueSoon(task.dueDate)
    );
    
    if (upcomingTasks.length > 0) {
        showReminders(upcomingTasks);
        showDesktopNotifications(upcomingTasks);
    }
}

function isDueSoon(dateString) {
    if (!dateString) return false;
    const today = new Date();
    const taskDate = new Date(dateString);
    const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
}

function showDesktopNotifications(tasks) {
    if (Notification.permission !== "granted") return;
    
    tasks.forEach(task => {
        if (isDueToday(task.dueDate)) {
            new Notification(`Task Due: ${task.text}`, {
                body: `Due: ${formatDate(task.dueDate)}`,
                icon: '/icon.png'
            });
        }
    });
}

function isDueToday(dateString) {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
}

function showReminders(tasks) {
    elements.reminderList.innerHTML = tasks
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .map(task => `
            <li>
                <strong>${task.text}</strong>
                <span class="reminder-due">Due: ${formatDate(task.dueDate)}</span>
            </li>
        `).join('');
    
    elements.reminderModal.style.display = 'flex';
}

function setupDragAndDrop() {
    new Sortable(elements.tasksList, {
        animation: 150,
        ghostClass: 'dragging',
        onEnd: () => {
            const tasks = Array.from(elements.tasksList.children).map(item => {
                const taskId = item.dataset.id;
                return getTasksFromStorage().find(t => t.id === taskId);
            }).filter(Boolean);
            
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    });
}


function getTasksFromStorage() {
    if (state.tasks.length > 0) return state.tasks;
    
    try {
        state.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        return state.tasks;
    } catch (e) {
        console.error("Error loading tasks:", e);
        return [];
    }
}

function saveTasks() {
    const tasks = Array.from(elements.tasksList.children).map(item => ({
        id: item.dataset.id,
        text: item.querySelector('.task-text').textContent.trim(),
        dueDate: item.querySelector('.task-due')?.textContent ? 
            new Date(item.querySelector('.task-due').textContent.split(' at ')[0]).toISOString().split('T')[0] : '',
        dueTime: item.querySelector('.task-due')?.textContent.includes(' at ') ? 
            item.querySelector('.task-due').textContent.split(' at ')[1] : null,
        category: item.querySelector('.task-category').className.split(' ')[1],
        priority: item.classList.contains('priority-high') ? 'high' : 
                 item.classList.contains('priority-medium') ? 'medium' : 'low',
        completed: item.classList.contains('completed')
    }));
    
    state.tasks = tasks;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateStats();
}

function loadTasks() {
    setLoading(true);
    setTimeout(() => {
        try {
            const savedTasks = getTasksFromStorage();
            elements.tasksList.innerHTML = '';
            savedTasks.forEach(task => {
                elements.tasksList.appendChild(createTaskElement(task));
            });
            updateStats();
        } catch (e) {
            console.error("Error loading tasks:", e);
        } finally {
            setLoading(false);
        }
    }, 300);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function filterTasks(category) {
    state.currentFilter = category;
    elements.filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });

    document.querySelectorAll('#tasks li').forEach(task => {
        const taskCategory = task.querySelector('.task-category').textContent.toLowerCase();
        task.style.display = category === 'all' || taskCategory === category ? 'flex' : 'none';
    });
}

function toggleTaskComplete(e) {
    const taskItem = e.target.closest('li');
    taskItem.classList.toggle('completed');
    if (taskItem.classList.contains('completed')) {
        taskItem.style.transform = "scale(0.98)";
        setTimeout(() => {
            taskItem.style.transform = "";
        }, 300);
    }
    saveTasks();
}

function deleteTask(e) {
    if (confirm('Delete this task?')) {
        e.target.closest('li').remove();
        saveTasks();
    }
}


function runPerformanceAudit() {
    console.log('=== Performance Audit ===');
    console.log(`Total Tasks: ${state.tasks.length}`);
    console.log(`DOM Nodes: ${document.querySelectorAll('*').length}`);
    if (performance.memory) {
        console.log(`Memory Usage: ${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB`);
    }
}

setInterval(runPerformanceAudit, 30000);