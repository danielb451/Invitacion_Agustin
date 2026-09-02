const intro = document.getElementById("intro");
const invitation = document.getElementById("invitation");
const shootBtn = document.getElementById("shootBtn");
const weapon = document.getElementById("weapon");
const muzzleFlash = document.getElementById("muzzleFlash");
const paintball = document.getElementById("paintball");
const paintImpact = document.getElementById("paintImpact");

// ================================
// CONFIGURACIÓN RÁPIDA
// ================================
const PARTY_DATE = new Date("2026-09-07T15:30:00-04:00");

// Reemplaza esta URL con el enlace EXACTO de Google Maps de "Gulag"
// cuando lo tengas.
const LOCATION_URL = "https://www.google.com/maps/search/?api=1&query=Gulag";
document.getElementById("locationBtn").href = LOCATION_URL;

let fired = false;

// Pequeño sonido sintético de disparo, sin archivos MP3 externos.
function playShotSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(115, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.11);

    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.17);

    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noise.buffer = buffer;
    noiseGain.gain.value = 0.18;
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();
  } catch (error) {
    // Si el navegador bloquea audio, la animación sigue funcionando.
  }
}

function shoot() {
  if (fired) return;
  fired = true;
  shootBtn.disabled = true;

  playShotSound();
  weapon.classList.add("recoil");
  muzzleFlash.classList.add("fire");

  const weaponRect = weapon.getBoundingClientRect();

  // Punto de salida aproximado del cañón.
  const startX = Math.min(window.innerWidth - 20, weaponRect.right - 18);
  const startY = weaponRect.top + weaponRect.height * 0.38;

  // Punto de impacto al centro/superior de la pantalla.
  const targetX = window.innerWidth * 0.5;
  const targetY = window.innerHeight * 0.46;

  paintball.style.display = "block";
  paintball.style.left = `${startX}px`;
  paintball.style.top = `${startY}px`;

  const dx = targetX - startX;
  const dy = targetY - startY;

  const animation = paintball.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 25}px) scale(.8)`, opacity: 1, offset: .55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.55)`, opacity: 1 }
    ],
    {
      duration: 430,
      easing: "cubic-bezier(.2,.75,.25,1)",
      fill: "forwards"
    }
  );

  animation.onfinish = () => {
    paintball.style.display = "none";
    paintImpact.classList.add("show");

    setTimeout(() => {
      intro.classList.add("completed");
      invitation.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "auto";
      window.scrollTo(0, 0);

      document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.95) {
          el.classList.add("visible");
        }
      });
    }, 700);

    setTimeout(() => {
      intro.style.display = "none";
    }, 1600);
  };
}

shootBtn.addEventListener("click", shoot);

// Permite disparar también con ESPACIO.
window.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !fired) {
    event.preventDefault();
    shoot();
  }
});

// ================================
// CUENTA REGRESIVA
// ================================
const pad = value => String(value).padStart(2, "0");

function updateCountdown() {
  const now = new Date();
  let diff = PARTY_DATE - now;

  if (diff <= 0) {
    document.getElementById("days").textContent = "00";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";
    return;
  }

  const days = Math.floor(diff / 86400000);
  diff %= 86400000;
  const hours = Math.floor(diff / 3600000);
  diff %= 3600000;
  const minutes = Math.floor(diff / 60000);
  diff %= 60000;
  const seconds = Math.floor(diff / 1000);

  document.getElementById("days").textContent = pad(days);
  document.getElementById("hours").textContent = pad(hours);
  document.getElementById("minutes").textContent = pad(minutes);
  document.getElementById("seconds").textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ================================
// ANIMACIONES AL HACER SCROLL
// ================================
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

// ================================
// CONFIRMACIÓN DE ASISTENCIA
// ================================
const rsvpForm = document.getElementById("rsvpForm");
const successMessage = document.getElementById("successMessage");

rsvpForm.addEventListener("submit", event => {
  event.preventDefault();

  const confirmation = {
    nombre: document.getElementById("guestName").value.trim(),
    asistencia: document.getElementById("attendance").value,
    mensaje: document.getElementById("message").value.trim(),
    fechaRegistro: new Date().toISOString()
  };

  // Guarda la confirmación en este dispositivo.
  localStorage.setItem("confirmacion_agustin_paintball", JSON.stringify(confirmation));

  successMessage.classList.add("show");
  rsvpForm.querySelector(".confirm-btn").textContent = "✓ MISIÓN CONFIRMADA";

  setTimeout(() => {
    successMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 100);
});
