import { simulateQuarterCar, comfortGrade } from './dynamics.js';

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const ui = {
  spring: document.getElementById('spring'), damping: document.getElementById('damping'),
  speed: document.getElementById('speed'), severity: document.getElementById('severity'),
  springOut: document.getElementById('springOut'), dampingOut: document.getElementById('dampingOut'),
  speedOut: document.getElementById('speedOut'), severityOut: document.getElementById('severityOut'),
  rms: document.getElementById('rms'), peak: document.getElementById('peak'), travel: document.getElementById('travel'),
  grade: document.getElementById('grade'), insight: document.getElementById('insight'),
  timeReadout: document.getElementById('timeReadout'), status: document.getElementById('status')
};
let result;
let elapsed = 0;
let running = true;
let last = performance.now();

function values() {
  return { spring: Number(ui.spring.value), damping: Number(ui.damping.value), speed: Number(ui.speed.value), severity: Number(ui.severity.value) };
}
function sync() {
  ui.springOut.textContent = ui.spring.value;
  ui.dampingOut.textContent = Number(ui.damping.value).toFixed(1);
  ui.speedOut.textContent = ui.speed.value;
  ui.severityOut.textContent = Number(ui.severity.value).toFixed(1);
  result = simulateQuarterCar(values());
  ui.rms.textContent = `${result.rms.toFixed(2)} m/s²`;
  ui.peak.textContent = `${result.maxAccel.toFixed(2)} m/s²`;
  ui.travel.textContent = `${(result.maxTravel * 1000).toFixed(1)} mm`;
  ui.grade.textContent = comfortGrade(result.rms);
  ui.insight.textContent = result.rms > 1.3
    ? 'High body acceleration detected. Increase damping gradually, then verify suspension travel remains acceptable.'
    : 'Balanced setup: body acceleration is controlled while wheel contact and suspension travel remain stable.';
}
function draw(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (running) elapsed = (elapsed + dt) % 7;
  const index = Math.min(result.samples.length - 1, Math.floor(elapsed / 7 * result.samples.length));
  const current = result.samples[index];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#091522'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const left = 60, right = 840, ground = 350;
  const scaleX = (right - left) / 7;
  const scaleY = 2500;
  ctx.strokeStyle = 'rgba(160,190,210,.16)';
  for (let i = 0; i <= 7; i++) { const x = left + i / 7 * (right - left); ctx.beginPath(); ctx.moveTo(x, 45); ctx.lineTo(x, 390); ctx.stroke(); }
  ctx.strokeStyle = '#ffb35f'; ctx.lineWidth = 3; ctx.beginPath();
  result.samples.forEach((sample, i) => { const x = left + sample.time / 7 * (right - left); const y = ground - sample.road * scaleY; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
  const currentX = left + current.time / 7 * (right - left);
  const bodyY = ground - current.body * scaleY - 112;
  const wheelY = ground - current.wheel * scaleY - 18;
  ctx.strokeStyle = '#68d8e6'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(currentX, bodyY + 45); ctx.lineTo(currentX, wheelY); ctx.stroke();
  ctx.fillStyle = '#68d8e6'; ctx.fillRect(currentX - 70, bodyY - 48, 140, 50);
  ctx.fillStyle = '#dffaff'; ctx.fillRect(currentX - 45, bodyY - 35, 38, 22); ctx.fillRect(currentX + 7, bodyY - 35, 38, 22);
  ctx.fillStyle = '#99dc54'; ctx.beginPath(); ctx.arc(currentX, wheelY, 20, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#9aafc1'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(left, ground); ctx.lineTo(right, ground); ctx.stroke();
  ctx.fillStyle = '#edf5ff'; ctx.font = '13px Inter, sans-serif'; ctx.fillText('Road excitation', left, 30); ctx.fillText('Vehicle body response', left, 430);
  ui.timeReadout.textContent = `t = ${current.time.toFixed(1)} s`;
  requestAnimationFrame(draw);
}
[ui.spring, ui.damping, ui.speed, ui.severity].forEach((input) => input.addEventListener('input', sync));
document.getElementById('runBtn').addEventListener('click', () => { elapsed = 0; running = true; ui.status.textContent = 'SIMULATION LIVE'; sync(); });
document.getElementById('pauseBtn').addEventListener('click', (event) => { running = !running; event.currentTarget.textContent = running ? 'Pause' : 'Resume'; ui.status.textContent = running ? 'SIMULATION LIVE' : 'SIMULATION PAUSED'; });
sync();
requestAnimationFrame(draw);
