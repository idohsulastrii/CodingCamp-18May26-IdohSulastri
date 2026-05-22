'use strict';

const $ = (id) => document.getElementById(id);

/* ── Theme ──────────────────────────────────────────────────────────────────── */
const themeToggle = $('theme-toggle');

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeToggle.textContent = dark ? '☀️ Light' : '🌙 Dark';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => applyTheme(!document.body.classList.contains('dark')));
applyTheme(localStorage.getItem('theme') === 'dark');

/* ── Clock / Date / Greeting ────────────────────────────────────────────────── */
const clockEl    = $('clock');
const dateEl     = $('date-display');
const greetingEl = $('greeting');

const TOD = (h) => h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

function updateClock() {
  const now  = new Date();
  clockEl.textContent = now.toLocaleTimeString('en-GB');
  dateEl.textContent  = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const name = localStorage.getItem('userName');
  greetingEl.textContent = name
    ? `${TOD(now.getHours())}, ${name}! 👋`
    : `${TOD(now.getHours())}! What's your name?`;
}

setInterval(updateClock, 1000);
updateClock();

/* ── Name ───────────────────────────────────────────────────────────────────── */
const nameInput = $('name-input');

$('save-name-btn').addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) return;
  localStorage.setItem('userName', name);
  nameInput.value = '';
  updateClock();
});
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('save-name-btn').click(); });

/* ── Focus Timer ────────────────────────────────────────────────────────────── */
const timerDisplay = $('timer-display');
const timerInput   = $('timer-input');
let totalSec = 25 * 60, timeLeft = totalSec, timerId = null;

const renderTimer = () => {
  timerDisplay.textContent =
    `${String(Math.floor(timeLeft / 60)).padStart(2,'0')}:${String(timeLeft % 60).padStart(2,'0')}`;
};

const stopTimer = () => { clearInterval(timerId); timerId = null; };

$('set-timer-btn').addEventListener('click', () => {
  const m = parseInt(timerInput.value, 10);
  if (!m || m < 1) return;
  stopTimer();
  totalSec = m * 60;
  timeLeft = totalSec;
  renderTimer();
});

$('start-btn').addEventListener('click', () => {
  if (timerId || timeLeft <= 0) return;
  timerId = setInterval(() => {
    timeLeft--;
    renderTimer();
    if (timeLeft <= 0) { stopTimer(); timerDisplay.textContent = 'Done! 🎉'; }
  }, 1000);
});

$('stop-btn').addEventListener('click', stopTimer);

$('reset-btn').addEventListener('click', () => { stopTimer(); timeLeft = totalSec; renderTimer(); });

renderTimer();

/* ── To-Do List ─────────────────────────────────────────────────────────────── */
// Shape: { text: string, done: boolean }
const todoInput = $('todo-input');
const todoList  = $('todo-list');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
              .map(t => typeof t === 'string' ? { text: t, done: false } : t); // migrate legacy

const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));

function renderTasks() {
  todoList.innerHTML = '';
  tasks.forEach((task, i) => {
    const li = document.createElement('li');
    if (task.done) li.classList.add('done');

    // Checkbox
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = task.done;
    cb.setAttribute('aria-label', `Toggle "${task.text}"`);
    cb.addEventListener('change', () => { tasks[i].done = cb.checked; saveTasks(); renderTasks(); });

    // Text
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;
    span.title = 'Double-click to edit';
    span.addEventListener('dblclick', () => startEdit(i));

    // Actions
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = makeIconBtn('✏️', 'icon-btn edit', `Edit "${task.text}"`, () => startEdit(i));
    const delBtn  = makeIconBtn('✕',  'icon-btn del',  `Delete "${task.text}"`, () => {
      tasks.splice(i, 1); saveTasks(); renderTasks();
    });

    actions.append(editBtn, delBtn);
    li.append(cb, span, actions);
    todoList.appendChild(li);
  });
}

function startEdit(i) {
  const li      = todoList.children[i];
  const span    = li.querySelector('.task-text');
  const actions = li.querySelector('.task-actions');

  const input = document.createElement('input');
  input.type = 'text'; input.className = 'edit-input'; input.value = tasks[i].text;

  const commit = () => {
    const val = input.value.trim();
    if (val) tasks[i].text = val;
    saveTasks(); renderTasks();
  };

  const saveBtn = makeIconBtn('✔', 'icon-btn save', 'Save', commit);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  commit();
    if (e.key === 'Escape') renderTasks();
  });

  span.replaceWith(input);
  actions.innerHTML = '';
  actions.appendChild(saveBtn);
  input.focus(); input.select();
}

function addTask() {
  const val = todoInput.value.trim();
  if (!val || tasks.some(t => t.text === val)) { todoInput.select(); return; }
  tasks.push({ text: val, done: false });
  todoInput.value = '';
  saveTasks(); renderTasks();
}

$('add-btn').addEventListener('click', addTask);
todoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
renderTasks();

/* ── Quick Links ────────────────────────────────────────────────────────────── */
// Shape: { name: string, url: string }
const linkNameInput  = $('link-name');
const linkUrlInput   = $('link-url');
const linksGrid      = $('links-grid');

let links = JSON.parse(localStorage.getItem('quickLinks') || '[]');

const saveLinks = () => localStorage.setItem('quickLinks', JSON.stringify(links));

function renderLinks() {
  linksGrid.innerHTML = '';
  links.forEach((link, i) => {
    const chip = document.createElement('a');
    chip.className = 'link-chip';
    chip.href      = link.url;
    chip.target    = '_blank';
    chip.rel       = 'noopener noreferrer';

    const label = document.createElement('span');
    label.className   = 'link-chip-label';
    label.textContent = link.name;

    const delBtn = makeIconBtn('✕', 'icon-btn del', `Remove ${link.name}`, (e) => {
      e.preventDefault();
      links.splice(i, 1); saveLinks(); renderLinks();
    });

    chip.append(label, delBtn);
    linksGrid.appendChild(chip);
  });
}

function addLink() {
  const name = linkNameInput.value.trim();
  let   url  = linkUrlInput.value.trim();
  if (!name || !url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  links.push({ name, url });
  linkNameInput.value = ''; linkUrlInput.value = '';
  saveLinks(); renderLinks();
}

$('add-link-btn').addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addLink(); });
renderLinks();

/* ── Utility ────────────────────────────────────────────────────────────────── */
function makeIconBtn(text, className, label, handler) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.className   = className;
  btn.setAttribute('aria-label', label);
  btn.addEventListener('click', handler);
  return btn;
}
