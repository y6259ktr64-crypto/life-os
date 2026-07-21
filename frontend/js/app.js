const tg = window.Telegram.WebApp;
tg.expand();

let state = JSON.parse(localStorage.getItem('life_os_state')) || {
    energy: '70%',
    tasks: [
        { text: 'Сделать ревью кода', done: false },
        { text: 'Тренировка 45 мин', done: true },
        { text: 'Прочитать главу книги', done: false }
    ],
    expenses: 0,
    notes: []
};

function saveState() {
    localStorage.setItem('life_os_state', JSON.stringify(state));
    render();
}

function setEnergy(val, btn) {
    document.querySelectorAll('.energy-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.energy = val;
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    saveState();
}

function toggleTask(index) {
    state.tasks[index].done = !state.tasks[index].done;
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    saveState();
}

function addExpense() {
    const input = document.getElementById('expenseInput');
    const val = parseFloat(input.value);
    if (val) {
        state.expenses += val;
        input.value = '';
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
        saveState();
    }
}

function addNote() {
    const input = document.getElementById('noteInput');
    const text = input.value.trim();
    if (text) {
        state.notes.push(text);
        input.value = '';
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
        saveState();
    }
}

function render() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    state.tasks.forEach((t, i) => {
        const div = document.createElement('div');
        div.className = `task-item ${t.done ? 'done' : ''}`;
        div.onclick = () => toggleTask(i);
        div.innerHTML = `
            <span style="font-size: 14px; font-weight: 500;">${t.text}</span>
            <span style="font-size: 12px;">${t.done ? '✅' : '⚪️'}</span>
        `;
        taskList.appendChild(div);
    });

    document.getElementById('financeSum').innerText = `${state.expenses} ₽`;
    document.getElementById('inboxCount').innerText = state.notes.length;
}

render();