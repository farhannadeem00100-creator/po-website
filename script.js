// Initialize variables & load from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let isDarkMode = false;
let focusMode = false;

// Theme toggle & dark mode
const toggleThemeBtn = document.getElementById('toggleTheme');
toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  isDarkMode = !isDarkMode;
});

// Focus Mode toggle
const focusBtn = document.getElementById('focusModeBtn');
focusBtn.addEventListener('click', () => {
  document.body.classList.toggle('focus-mode');
  focusMode = !focusMode;
});

// Navigation
const sections = document.querySelectorAll('.section');
const navButtons = document.querySelectorAll('.nav-btn');

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(btn.dataset.section).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Save & Load tasks
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add task
function addTask() {
  const title = document.getElementById('taskTitleInput').value.trim();
  const deadline = document.getElementById('taskDeadline').value;
  const priority = document.getElementById('taskPriority').value;

  if (!title) {
    alert('Please enter a task title.');
    return;
  }

  const newTask = {
    id: Date.now(),
    title,
    deadline,
    priority,
    completed: false,
    subtasks: [],
    pinned: false
  };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  document.getElementById('taskTitleInput').value = '';
  document.getElementById('taskDeadline').value = '';
}

// Render tasks
function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  let filteredTasks = tasks;
  if (currentFilter !== 'all') {
    filteredTasks = tasks.filter(t => t.priority === currentFilter);
  }

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.dataset.id = task.id;

    // Task details
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'task-item-details';

    const titleSpan = document.createElement('span');
    titleSpan.innerHTML = `<strong>${task.title}</strong>`;
    if (task.pinned) {
      titleSpan.innerHTML += ' 📌';
    }

    const infoSpan = document.createElement('span');
    infoSpan.innerHTML = `
      <strong>Deadline:</strong> ${task.deadline || 'N/A'} |
      <strong>Priority:</strong> ${task.priority}
    `;

    detailsDiv.appendChild(titleSpan);
    detailsDiv.appendChild(infoSpan);

    // Subtasks button
    const subtaskBtn = document.createElement('button');
    subtaskBtn.textContent = 'Subtasks';
    subtaskBtn.onclick = () => openSubtaskModal(task.id);

    // Pin toggle button
    const pinBtn = document.createElement('button');
    pinBtn.textContent = task.pinned ? 'Unpin' : 'Pin';
    pinBtn.onclick = () => {
      task.pinned = !task.pinned;
      saveTasks();
      renderTasks();
    };

    // Complete checkbox
    const completeCheckbox = document.createElement('input');
    completeCheckbox.type = 'checkbox';
    completeCheckbox.checked = task.completed;
    completeCheckbox.onchange = () => {
      task.completed = completeCheckbox.checked;
      saveTasks();
      renderTasks();
    };

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '✖';
    deleteBtn.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    };

    // Append elements
    const taskItem = document.createElement('div');
    taskItem.style.display = 'flex';
    taskItem.style.alignItems = 'center';
    taskItem.style.gap = '10px';

    taskItem.appendChild(completeCheckbox);
    taskItem.appendChild(detailsDiv);
    taskItem.appendChild(subtaskBtn);
    taskItem.appendChild(pinBtn);
    taskItem.appendChild(deleteBtn);

    li.appendChild(taskItem);
    list.appendChild(li);
  });
}

function filterTasks(priority) {
  currentFilter = priority;
  renderTasks();
}

// Subtask modal functions
let currentTaskId = null;

function openSubtaskModal(taskId) {
  currentTaskId = taskId;
  document.getElementById('subtaskInput').value = '';
  document.getElementById('subtaskModal').classList.remove('hidden');
}

function closeSubtaskModal() {
  document.getElementById('subtaskModal').classList.add('hidden');
}

function saveSubtask() {
  const desc = document.getElementById('subtaskInput').value.trim();
  if (!desc) {
    alert('Enter subtask description.');
    return;
  }
  const task = tasks.find(t => t.id === currentTaskId);
  if (task) {
    if (!task.subtasks) task.subtasks = [];
    task.subtasks.push({ id: Date.now(), description: desc, completed: false });
    saveTasks();
    closeSubtaskModal();
    renderTasks();
  }
}

// Save & load notes
function saveNote() {
  const noteText = document.getElementById('noteInput').value.trim();
  if (!noteText) {
    alert('Write something before saving.');
    return;
  }
  const note = {
    id: Date.now(),
    text: noteText,
    date: new Date().toLocaleString()
  };
  let notes = JSON.parse(localStorage.getItem('notes')) || [];
  notes.push(note);
  localStorage.setItem('notes', JSON.stringify(notes));
  displayNotes();
  document.getElementById('noteInput').value = '';
}

function displayNotes() {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  const container = document.getElementById('notesContainer');
  container.innerHTML = '';
  notes.forEach(note => {
    const div = document.createElement('div');
    div.className = 'note';
    div.innerHTML = `<p>${note.text}</p><small>Saved at: ${note.date}</small>`;
    container.appendChild(div);
  });
}

// Initialize
window.onload = () => {
  renderTasks();
  displayNotes();
  loadProgress();
  // Load other features as needed
};

// Progress Tracking
function loadProgress() {
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  document.getElementById('progressStats').innerHTML = `
    <p>Completed Tasks: ${completedCount} / ${totalCount}</p>
  `;
}

// Save progress periodically
setInterval(() => {
  saveTasks();
  loadProgress();
}, 60000); // every minute