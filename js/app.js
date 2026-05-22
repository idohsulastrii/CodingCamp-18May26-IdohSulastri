// --- JAM, GREETING, & NAME ---
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('id-ID');
}
setInterval(updateClock, 1000);

const nameInput = document.getElementById('name-input');
const saveNameBtn = document.getElementById('save-name-btn');
const greeting = document.getElementById('greeting');

saveNameBtn.onclick = () => {
    localStorage.setItem('userName', nameInput.value);
    greeting.innerText = `Halo, ${nameInput.value}!`;
};
if(localStorage.getItem('userName')) greeting.innerText = `Halo, ${localStorage.getItem('userName')}!`;

// --- DARK MODE ---
const themeToggle = document.getElementById('theme-toggle');
themeToggle.onclick = () => {
    document.body.classList.toggle('dark');
    themeToggle.innerText = document.body.classList.contains('dark') ? '☀️ Light' : '🌙 Dark';
};

// --- POMODORO TIMER (Dengan Custom Durasi) ---
let timeLeft = 25 * 60, timerId = null;
const display = document.getElementById('timer-display');
const timerInput = document.getElementById('timer-input');

const renderTimer = () => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    display.innerText = `${m}:${s}`;
};

document.getElementById('set-timer-btn').onclick = () => {
    const newMinutes = parseInt(timerInput.value);
    if (newMinutes > 0) {
        timeLeft = newMinutes * 60;
        renderTimer();
    }
};

document.getElementById('start-btn').onclick = () => {
    if (!timerId) timerId = setInterval(() => { timeLeft--; renderTimer(); if(timeLeft <= 0) clearInterval(timerId); }, 1000);
};
document.getElementById('stop-btn').onclick = () => { clearInterval(timerId); timerId = null; };
document.getElementById('reset-btn').onclick = () => { clearInterval(timerId); timerId = null; timeLeft = (parseInt(timerInput.value) || 25) * 60; renderTimer(); };

// --- TO-DO LIST (Anti-Duplikat) ---
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    list.innerHTML = "";
    tasks.forEach((t, i) => {
        const li = document.createElement('li');
        li.innerHTML = `${t} <button onclick="deleteTask(${i})">❌</button>`;
        list.appendChild(li);
    });
}

document.getElementById('add-btn').onclick = () => {
    const newTask = input.value.trim();
    if (newTask && !tasks.includes(newTask)) {
        tasks.push(newTask);
        input.value = "";
        saveAndRender();
    } else if (tasks.includes(newTask)) alert("Tugas sudah ada!");
};

window.deleteTask = (i) => { tasks.splice(i, 1); saveAndRender(); };

// --- QUICK LINKS ---
const lName = document.getElementById('link-name'), lUrl = document.getElementById('link-url');
let links = JSON.parse(localStorage.getItem('quickLinks')) || [];

function renderLinks() {
    localStorage.setItem('quickLinks', JSON.stringify(links));
    const container = document.getElementById('links-container');
    container.innerHTML = "";
    links.forEach((link, i) => {
        container.innerHTML += `<a href="${link.url}" target="_blank" class="link-item">${link.name}</a>
                                <button onclick="deleteLink(${i})" style="padding:0; background:none;">❌</button>`;
    });
}

document.getElementById('add-link-btn').onclick = () => {
    if (lName.value && lUrl.value) {
        links.push({ name: lName.value, url: lUrl.value.startsWith('http') ? lUrl.value : 'https://'+lUrl.value });
        lName.value = ""; lUrl.value = ""; renderLinks();
    }
};

window.deleteLink = (i) => { links.splice(i, 1); renderLinks(); };

// --- INIT ---
updateClock(); renderTimer(); saveAndRender(); renderLinks();