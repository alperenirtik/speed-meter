let currentSpeed = 0;
let speedData;
let currentSpeedIndex = 0;
let isIncreasing = true;
let targetSpeed = 0;
let animationSpeed = 0.05; // Animasyon hızı

// JSON verisini yükle
fetch('speed-data.json')
    .then(response => response.json())
    .then(data => {
        speedData = data;
        createSpeedMarks();
        startSpeedometer();
        startAnimation();
    })
    .catch(error => console.error('Veri yükleme hatası:', error));

// Hız çizgilerini oluştur
function createSpeedMarks() {
    const speedMarksDiv = document.querySelector('.speed-marks');
    const totalMarks = speedData.speeds.length;
    const degreePerMark = 240 / (totalMarks - 1);

    for (let i = 0; i < totalMarks; i++) {
        const mark = document.createElement('div');
        const rotation = -120 + (i * degreePerMark);

        mark.style.cssText = `
            position: absolute;
            width: 2px;
            height: ${i % 2 === 0 ? '15px' : '10px'};
            background: white;
            left: 50%;
            bottom: 50%;
            transform-origin: bottom;
            transform: translateX(-50%) rotate(${rotation}deg) translateY(-120px);
        `;

        speedMarksDiv.appendChild(mark);
    }
}

// Yumuşak geçiş için easing fonksiyonu
function easeInOutCubic(t) {
    return t < 0.5 ?
        4 * t * t * t :
        1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Hız göstergesini güncelle
function updateSpeedometer() {
    const indicator = document.querySelector('.speed-indicator');
    const speedDisplay = document.querySelector('.current-speed');
    const maxSpeed = speedData.speeds[speedData.speeds.length - 1];

    const rotation = -120 + (currentSpeed / maxSpeed * 240);
    indicator.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

    speedDisplay.textContent = Math.round(currentSpeed);
}

// Animasyon fonksiyonu
function animate() {
    if (currentSpeed !== targetSpeed) {
        const diff = targetSpeed - currentSpeed;
        const distance = Math.abs(diff);

        // Mesafeye bağlı olarak hızı ayarla
        let step = diff * animationSpeed;

        // Minimum adım büyüklüğü
        const minStep = 0.1;
        if (Math.abs(step) < minStep && Math.abs(diff) > minStep) {
            step = diff > 0 ? minStep : -minStep;
        }

        // Easing fonksiyonu uygula
        const progress = 1 - (distance / Math.abs(targetSpeed - currentSpeed));
        const ease = easeInOutCubic(progress);

        currentSpeed += step * (1 - ease * 0.5);

        // Hassasiyet kontrolü
        if (Math.abs(targetSpeed - currentSpeed) < 0.1) {
            currentSpeed = targetSpeed;
        }

        updateSpeedometer();
    }
    requestAnimationFrame(animate);
}

// Animasyonu başlat
function startAnimation() {
    requestAnimationFrame(animate);
}

// Hız göstergesini başlat
function startSpeedometer() {
    setInterval(() => {
        if (isIncreasing) {
            if (currentSpeedIndex < speedData.speeds.length - 1) {
                currentSpeedIndex++;
            } else {
                isIncreasing = false;
            }
        } else {
            if (currentSpeedIndex > 0) {
                currentSpeedIndex--;
            } else {
                isIncreasing = true;
            }
        }

        targetSpeed = speedData.speeds[currentSpeedIndex];
    }, 500);
}