/* Hero plot: two classes of points and a decision boundary that follows the pointer. */
(() => {
  const canvas = document.getElementById('plot');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const readout = document.getElementById('plot-readout');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const styles = getComputedStyle(document.documentElement);
  const COLOR = {
    cobalt: styles.getPropertyValue('--cobalt').trim(),
    amber: styles.getPropertyValue('--amber').trim(),
    ink: styles.getPropertyValue('--ink').trim(),
    line: styles.getPropertyValue('--line').trim()
  };

  // Seeded random numbers so the plot looks the same on every visit.
  function seeded(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = seeded(7);
  const gauss = () => (rand() + rand() + rand() + rand() - 2) * 1.2;

  // Class 0 sits lower left, class 1 upper right. Coordinates run from -1 to 1.
  const centers = [[-0.38, -0.25], [0.38, 0.25]];
  const points = [];
  for (let cls = 0; cls < 2; cls++) {
    for (let i = 0; i < 24; i++) {
      points.push({
        cls,
        x: centers[cls][0] + gauss() * 0.2,
        y: centers[cls][1] + gauss() * 0.2,
        phase: rand() * Math.PI * 2
      });
    }
  }

  const baseAngle = Math.atan2(centers[1][1] - centers[0][1], centers[1][0] - centers[0][0]);
  let tilt = 0;
  let pointerX = null;
  let width = 0, height = 0;
  let lastText = '';

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }

  function targetTilt(t) {
    if (pointerX !== null) return (pointerX - 0.5) * 1.3;
    return reduceMotion ? 0 : Math.sin(t / 1800) * 0.3;
  }

  function draw(t) {
    const target = targetTilt(t);
    tilt = reduceMotion ? target : tilt + (target - tilt) * 0.08;

    const theta = baseAngle + tilt;
    const nx = Math.cos(theta), ny = Math.sin(theta);
    const scale = Math.min(width, height) / 2 * 0.88;
    const cx = width / 2, cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Faint grid
    ctx.strokeStyle = COLOR.line;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    for (let i = -2; i <= 2; i++) {
      const p = cx + (i / 2) * scale;
      ctx.moveTo(p, 0); ctx.lineTo(p, height);
      const q = cy + (i / 2) * scale;
      ctx.moveTo(0, q); ctx.lineTo(width, q);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Two sides of the boundary
    const reach = Math.max(width, height) * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(theta);
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = COLOR.cobalt;
    ctx.fillRect(0, -reach, reach, reach * 2);
    ctx.fillStyle = COLOR.amber;
    ctx.fillRect(-reach, -reach, reach, reach * 2);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = COLOR.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -reach);
    ctx.lineTo(0, reach);
    ctx.stroke();
    ctx.restore();

    // Points
    const radius = Math.max(4, scale * 0.04);
    let correct = 0;
    for (const p of points) {
      const wobble = reduceMotion ? 0 : 0.008;
      const px = p.x + Math.sin(t / 1400 + p.phase) * wobble;
      const py = p.y + Math.cos(t / 1700 + p.phase) * wobble;
      const side = px * nx + py * ny > 0 ? 1 : 0;
      const right = side === p.cls;
      if (right) correct++;

      const sx = cx + px * scale, sy = cy + py * scale;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = p.cls === 1 ? COLOR.cobalt : COLOR.amber;
      ctx.fill();

      if (!right) {
        ctx.beginPath();
        ctx.arc(sx, sy, radius + 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = COLOR.ink;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    if (readout) {
      const text = correct + ' of ' + points.length + ' points on the correct side (misclassified points are ringed)';
      if (text !== lastText) { readout.textContent = text; lastText = text; }
    }
  }

  function loop(t) {
    draw(t);
    requestAnimationFrame(loop);
  }

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointerX = (e.clientX - rect.left) / rect.width;
    if (reduceMotion) draw(performance.now());
  });
  canvas.addEventListener('pointerleave', () => {
    pointerX = null;
    if (reduceMotion) draw(performance.now());
  });

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);

  resize();
  if (!reduceMotion) requestAnimationFrame(loop);
})();
