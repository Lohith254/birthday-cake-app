let candleCount = 0;
let flames = [];
let micStream = null;
let audioContext, analyser, dataArray, source;
let animationFrame;

const addCandleBtn = document.getElementById("addCandleBtn");
const candleCountEl = document.getElementById("candleCount");
const candlesContainer = document.getElementById("candlesContainer");
const messageEl = document.getElementById("message");

const confettiCanvas = document.getElementById("confetti-canvas");
const confettiCtx = confettiCanvas.getContext("2d");
let confettiPieces = [];

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createCandle() {
  const candle = document.createElement("div");
  candle.classList.add("candle");

  const flame = document.createElement("div");
  flame.classList.add("flame");

  candle.appendChild(flame);

  // Position candle randomly within cake bounds
  const cake = document.getElementById("cake");
  const cakeRect = cake.getBoundingClientRect();
  const margin = 10; // percentage margin from both sides
  const candleX = Math.random() * (100 - 2 * margin) + margin; // ensures candles stay within bounds
  candle.style.left = `${candleX}%`;

  candlesContainer.appendChild(candle);
  flames.push(flame);
}

function addCandle() {
  candleCount++;
  candleCountEl.textContent = candleCount;
  createCandle();

  if (candleCount === 1) {
    initMic();
  }
}

addCandleBtn.addEventListener("click", addCandle);

function initMic() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      micStream = stream;
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 128;
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      detectBlow();
    })
    .catch((err) => {
      alert("Happy Birthday!!!");
      console.error(err);
    });
}

function detectBlow() {
  analyser.getByteFrequencyData(dataArray);
  let volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

  if (volume > 70) {
    blowOutCandle();
  }

  animationFrame = requestAnimationFrame(detectBlow);
}

function blowOutCandle() {
  for (let i = 0; i < flames.length; i++) {
    const flame = flames[i];
    if (flame && !flame.classList.contains("hidden")) {
      flame.classList.add("hidden");
      break;
    }
  }

  const remaining = flames.filter(f => !f.classList.contains("hidden")).length;

  if (remaining === 0) {
    celebrate();
    stopMic();
  }
}

function stopMic() {
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
  }
  cancelAnimationFrame(animationFrame);
}

function celebrate() {
  messageEl.textContent = "🎉 Candles Blown! Happy Birthday! 🎉";
  launchConfetti();
}

function celebrateBirthday() {

  const audio = document.getElementById('birthdaySong');
  if (audio) {
    audio.play();
  }

  const message = document.createElement('p');
  // message.textContent = '🎉 Candles Blown! Happy Birthday! 🎉';
  message.classList.add('celebration-message');
  document.body.appendChild(message);
}

function launchConfetti() {
    celebrateBirthday();
  confettiPieces = [];

  for (let i = 0; i < 200; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 40 + 10,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltAngleIncrement: Math.random() * 0.1
    });
  }

  requestAnimationFrame(drawConfetti);
}

function drawConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces.forEach(p => {
    p.y += Math.cos(p.d) + 3;
    p.tiltAngle += p.tiltAngleIncrement;
    p.tilt = Math.sin(p.tiltAngle) * 10;

    confettiCtx.beginPath();
    confettiCtx.lineWidth = p.r;
    confettiCtx.strokeStyle = p.color;
    confettiCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
    confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
    confettiCtx.stroke();
  });

  requestAnimationFrame(drawConfetti);
}