/* Quiet Focus: plain JavaScript, organized into small, readable functions. */
'use strict';

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'quiet-focus-v1';
const BREAK_MINUTES = 5;
const presets = [...document.querySelectorAll('[data-minutes]')];

// Storage can be unavailable in private browsing or restricted file contexts.
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
const saved = loadSaved();
let focusMinutes = Number.isInteger(saved.minutes) && saved.minutes >= 1 && saved.minutes <= 120 ? saved.minutes : 25;
let mode = 'focus';
let remaining = focusMinutes * 60;
let running = false;
let deadline = 0;
let interval = null;
let completed = false;

// Use a local calendar day, so progress resets at the user's midnight.
function today() {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
let progress = { day: today(), count: saved.day === today() && Number.isInteger(saved.count) && saved.count >= 0 ? saved.count : 0 };
$('task').value = typeof saved.task === 'string' ? saved.task.slice(0, 120) : '';
$('minutes').value = focusMinutes;

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ minutes: focusMinutes, task: $('task').value, ...progress }));
  } catch { /* The timer still works when saving is unavailable. */ }
}

function refreshDay() {
  if (progress.day !== today()) {
    progress = { day: today(), count: 0 };
    persist();
  }
  $('session-count').textContent = progress.count;
}

function totalSeconds() { return (mode === 'focus' ? focusMinutes : BREAK_MINUTES) * 60; }
function announce(message) { $('status').textContent = message; }

function render() {
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');
  $('timer').textContent = `${minutes}:${seconds}`;
  $('timer-ring').style.setProperty('--progress', `${(1 - remaining / totalSeconds()) * 360}deg`);
  $('timer-caption').textContent = mode === 'focus' ? 'TIME TO FOCUS' : 'ROOM TO RECHARGE';
  $('timer-hint').textContent = completed ? 'A small step. A good one.' : mode === 'focus' ? 'A fresh start, whenever you need it.' : 'Unclench your jaw. Take a breath.';
  $('start').textContent = running ? 'Pause session Ⅱ' : completed ? 'Start again ↗' : remaining < totalSeconds() ? 'Resume session ↗' : mode === 'focus' ? 'Start focus ↗' : 'Start break ↗';
  $('focus-mode').classList.toggle('active', mode === 'focus');
  $('break-mode').classList.toggle('active', mode === 'break');
  $('focus-mode').setAttribute('aria-pressed', String(mode === 'focus'));
  $('break-mode').setAttribute('aria-pressed', String(mode === 'break'));
  presets.forEach((button) => {
    const selected = Number(button.dataset.minutes) === focusMinutes;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.title = running ? `${minutes}:${seconds} — Quiet Focus` : 'Quiet Focus — One thing at a time';
  refreshDay();
}

function stopClock() {
  running = false;
  clearInterval(interval);
  interval = null;
}

function finish() {
  stopClock();
  remaining = 0;
  completed = true;
  refreshDay();
  if (mode === 'focus') {
    progress.count += 1;
    persist();
    announce('Focus complete. Well done! Choose Short break when you are ready.');
  } else announce('Break complete. Ready for a fresh focus session?');
  render();
}

// A deadline avoids drift when the browser throttles a background tab.
function tick() {
  if (!running) return;
  remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  if (remaining === 0) finish();
  else render();
}

function toggleTimer() {
  if (running) {
    tick();
    if (!running) return; // Completion can happen on the same click as a pause.
    stopClock();
    announce('Paused. Your time is yours.');
  } else {
    if (completed) { remaining = totalSeconds(); completed = false; }
    deadline = Date.now() + remaining * 1000;
    running = true;
    interval = setInterval(tick, 250);
    announce(mode === 'focus' ? 'Focus session started. One thing at a time.' : 'Break started. Give yourself a little space.');
  }
  render();
}

function resetTimer() {
  stopClock();
  remaining = totalSeconds();
  completed = false;
  announce('Timer reset. Ready for a fresh start.');
  render();
}

function setMode(nextMode) {
  if (mode === nextMode) return;
  mode = nextMode;
  resetTimer();
  announce(mode === 'focus' ? 'Focus mode selected.' : 'Short break selected. Five minutes to recharge.');
}

function setDuration(minutes) {
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) return;
  focusMinutes = minutes;
  $('minutes').value = focusMinutes;
  if (mode === 'focus') resetTimer();
  else render();
  persist();
  announce(`Focus time set to ${minutes} minutes.`);
}

$('start').addEventListener('click', toggleTimer);
$('reset').addEventListener('click', resetTimer);
$('focus-mode').addEventListener('click', () => setMode('focus'));
$('break-mode').addEventListener('click', () => setMode('break'));
presets.forEach((button) => button.addEventListener('click', () => setDuration(Number(button.dataset.minutes))));
$('duration-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if ($('duration-form').reportValidity()) setDuration(Number($('minutes').value));
});
$('task').addEventListener('input', persist);
document.addEventListener('keydown', (event) => {
  const editing = event.target.closest('input, textarea, select, button, a, [contenteditable]');
  if (event.code === 'Space' && !editing && !event.repeat) { event.preventDefault(); toggleTimer(); }
});
document.addEventListener('visibilitychange', () => { if (running) tick(); else refreshDay(); });
window.addEventListener('focus', refreshDay);
render();
