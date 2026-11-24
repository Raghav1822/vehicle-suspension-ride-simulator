export function roadProfile(x, severity = 0.02) {
  const bump = Math.sin(x * 2.4) * severity * 0.25;
  const ripple = Math.sin(x * 9.5) * severity * 0.08;
  const pothole = Math.exp(-((x - 3.9) ** 2) / 0.025) * -severity * 0.65;
  return bump + ripple + pothole;
}

export function simulateQuarterCar({ spring, damping, speed, severity, duration = 7, dt = 0.01 }) {
  const massSprung = 320;
  const massUnsprung = 42;
  const tireStiffness = 190000;
  const k = spring * 1000;
  const c = damping * 1000;
  const velocity = speed / 3.6;
  const samples = [];
  let zs = 0;
  let zu = 0;
  let vs = 0;
  let vu = 0;
  let maxAccel = 0;
  let sumAccel = 0;
  let maxTravel = 0;

  for (let i = 0; i <= duration / dt; i++) {
    const time = i * dt;
    const x = time * velocity;
    const zr = roadProfile(x, severity / 100);
    const previousVs = vs;
    const as = (-k * (zs - zu) - c * (vs - vu)) / massSprung;
    const au = (k * (zs - zu) + c * (vs - vu) - tireStiffness * (zu - zr)) / massUnsprung;
    vs += as * dt;
    vu += au * dt;
    zs += vs * dt;
    zu += vu * dt;
    const accel = (vs - previousVs) / dt;
    maxAccel = Math.max(maxAccel, Math.abs(accel));
    sumAccel += accel * accel;
    maxTravel = Math.max(maxTravel, Math.abs(zs - zu));
    samples.push({ time, road: zr, body: zs, wheel: zu, accel, position: x });
  }
  const rms = Math.sqrt(sumAccel / samples.length);
  return { samples, rms, maxAccel, maxTravel };
}

export function comfortGrade(rms) {
  if (rms < 0.45) return 'A';
  if (rms < 0.8) return 'B';
  if (rms < 1.3) return 'C';
  if (rms < 2.0) return 'D';
  return 'E';
}
