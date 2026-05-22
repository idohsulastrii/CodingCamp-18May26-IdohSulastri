function updateDashboard() {
    const now = new Date();
    const hours = now.getHours();
    
    // Update Jam
    document.getElementById('clock').innerText = now.toLocaleTimeString();

    // Update Greeting
    let greet = "";
    if (hours < 12) greet = "Selamat Pagi, Idoh!";
    else if (hours < 18) greet = "Selamat Siang, Idoh!";
    else greet = "Selamat Malam, Idoh!";
    
    document.getElementById('greeting').innerText = greet;
}

// Jalankan setiap detik
setInterval(updateDashboard, 1000);
updateDashboard();
// ==============================
// FITUR POMODORO TIMER
// ==============================
let timeLeft = 25 * 60; // 25 menit
let timerInterval = null;

const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.innerText = `${minutes}:${seconds}`;
}

startBtn.addEventListener('click', () => {
    if (timerInterval !== null) return; // Biar ga dobel klik
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimer();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            alert("Waktu fokus selesai! Istirahat dulu yuk.");
        }
    }, 1000);
});

stopBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
});

resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    updateTimer();
});

// ==============================
// FITUR TO-DO LIST (LOCAL STORAGE)
// ==============================
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

// Ambil data dari Local Storage pas web dibuka
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

function renderTasks() {
    todoList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${task} 
            <button onclick="deleteTask(${index})" style="margin-left: 10px; color: red;">X</button>
        `;
        todoList.appendChild(li);
    });
}

// Tambah tugas baru
addBtn.addEventListener('click', () => {
    const newTask = todoInput.value.trim();
    if (newTask !== '') {
        tasks.push(newTask);
        localStorage.setItem('myTasks', JSON.stringify(tasks)); // Simpan ke Local Storage
        todoInput.value = '';
        renderTasks();
    }
});

// Hapus tugas
window.deleteTask = function(index) {
    tasks.splice(index, 1);
    localStorage.setItem('myTasks', JSON.stringify(tasks)); // Update Local Storage
    renderTasks();
}

// Tampilkan list saat pertama kali load
renderTasks();