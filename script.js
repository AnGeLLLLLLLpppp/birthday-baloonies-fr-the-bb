// Balloon letters canvas animation
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W = window.innerWidth;
let H = window.innerHeight;

function resizeCanvas() {
  W = window.innerWidth;
  H = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  // Set transform so we can use CSS pixels in drawing code
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', () => {
  resizeCanvas();
  spawnLetters();
});
resizeCanvas();

// Letter (balloon) class
class Letter {
  constructor(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.vy = - (1 + Math.random() * 1.6); // upward speed
    this.hue = Math.floor((x / Math.max(W,1)) * 360);
    this.color = `hsl(${this.hue}, 80%, 50%)`;
    this.size = Math.max(18, Math.floor(W * 0.02)); // font size scales with screen
    this.rx = this.size + 10; // balloon horizontal radius
    this.ry = this.size + 14; // balloon vertical radius
    this.swayPhase = Math.random() * Math.PI * 2;
  }

  draw(ctx, time) {
    // draw string
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.ry);
    ctx.lineTo(this.x, this.y + this.ry + 30);
    ctx.stroke();

    // balloon
    ctx.save();
    // tiny sway rotation for natural movement
    const sway = Math.sin((time * 0.002) + this.swayPhase) * 0.03;
    ctx.translate(this.x, this.y);
    ctx.rotate(sway);

    // body
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.ellipse(0, 0, this.rx, this.ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // knot
    ctx.beginPath();
    ctx.moveTo(6, this.ry - 1);
    ctx.lineTo(-6, this.ry - 1);
    ctx.lineTo(0, this.ry + 8);
    ctx.closePath();
    ctx.fill();

    // highlight (white sheen)
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.ellipse(-this.rx * 0.35, -this.ry * 0.35, this.rx * 0.22, this.ry * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // letter
    ctx.fillStyle = '#fff';
    ctx.font = `${this.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.char, 0, 0);

    ctx.restore();
  }

  update(dt) {
    // dt is roughly 1 at 60fps; scale motion with dt
    this.y += this.vy * dt;
    // slight horizontal wiggle
    this.x += Math.sin(this.y * 0.01 + this.hue) * 0.25;
    // if balloon goes off top, respawn at bottom
    if (this.y + this.ry < -60) {
      this.y = H + (Math.random() * 120 + 20);
      this.x = Math.random() * (W - 80) + 40;
      this.vy = - (1 + Math.random() * 1.6);
    }
  }
}

// spawn letters across the bottom
let letters = [];
const message = "HAPPY BIRTHDAY";

function spawnLetters() {
  letters = [];
  const len = message.length;
  const gap = Math.min(80, Math.floor(W / (len + 1)));
  const startX = (W - gap * (len - 1)) / 2;
  for (let i = 0; i < len; i++) {
    const x = startX + i * gap + (Math.random() * 12 - 6); // small x jitter
    const y = H + Math.random() * 200;
    letters.push(new Letter(message[i], x, y));
  }
}
spawnLetters();

// animation loop with time delta
let lastTime = 0;
function animate(time = 0) {
  const dt = lastTime ? Math.min(2, (time - lastTime) / 16.6667) : 1;
  lastTime = time;

  ctx.clearRect(0, 0, W, H);

  for (let l of letters) {
    l.update(dt);
    l.draw(ctx, time);
  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// optional: click to add a new balloon with a random letter
window.addEventListener('click', (e) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const c = chars[Math.floor(Math.random() * chars.length)];
  letters.push(new Letter(c, e.clientX, e.clientY + 30));
});
