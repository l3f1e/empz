const intro = document.getElementById("intro");
const giftScene = document.getElementById("gift-scene");
const photo1Scene = document.getElementById("photo1-scene");
const photo2Scene = document.getElementById("photo2-scene");
const letterScene = document.getElementById("letter-scene");

const openSurpriseButton = document.getElementById("open-surprise");
const giftBox = document.getElementById("gift-box");
const photo1 = document.getElementById("photo1");
const photo2 = document.getElementById("photo2");

const memoryContainer = document.getElementById("memory-container");
const balloonContainer = document.getElementById("balloon-container");
const proudMessage = document.getElementById("proud-message");
const outroScreen = document.getElementById("outro-screen");

const LETTER_READING_TIME = 90 * 1000;
const PROUD_MESSAGE_TIME = 12 * 1000;
const MEMORY_FLOAT_TIME = 7000;
const MEMORY_INTERVAL = 900;

let letterTimerFinished = false;
let landedMemories = 0;
let memoriesStarted = false;
let endingStarted = false;

let memoryIntervalId = null;
let balloonIntervalId = null;
let letterTimerId = null;
let proudTimerId = null;
let outroTimerId = null;

function playSong(songId) {
    const songs = document.querySelectorAll("audio");

    songs.forEach(song => {
        song.pause();
        song.currentTime = 0;
    });

    const selectedSong = document.getElementById(songId);

    if (selectedSong) {
        selectedSong.play().catch(error => {
            console.log("Song playback failed:", error);
        });
    }
}

function stopAllSongs() {
    document.querySelectorAll("audio").forEach(song => {
        song.pause();
        song.currentTime = 0;
    });
}

function showScene(sceneToShow) {
    document.querySelectorAll(".scene").forEach(scene => {
        scene.classList.remove("active");
        scene.classList.add("hidden");
    });

    sceneToShow.classList.remove("hidden");
    sceneToShow.classList.add("active");
}

openSurpriseButton.addEventListener("click", () => {
    showScene(giftScene);
    playSong("gift-music");
});

giftBox.addEventListener("click", () => {
    showScene(photo1Scene);
    playSong("photo1-music");
});

photo1.addEventListener("click", () => {
    showScene(photo2Scene);
    playSong("photo2-music");
});

photo2.addEventListener("click", () => {
    showScene(letterScene);
    playSong("letter-music");

    if (!memoriesStarted) {
        memoriesStarted = true;
        startFloatingMemories();
        startFloatingBalloons();
    }
});

function startFloatingMemories() {
    const memoryFiles = [
        "memory1.jpg",
        "memory2.jpg",
        "memory3.jpg",
        "memory4.jpg",
        "memory5.jpg",
        "memory6.jpg",
        "memory7.jpg",
        "memory8.jpg"
    ];

    let nextMemory = 0;

    letterTimerId = setTimeout(() => {
        letterTimerFinished = true;
        checkEndingConditions();
    }, LETTER_READING_TIME);

    function createMemory() {
        if (nextMemory >= memoryFiles.length) {
            clearInterval(memoryIntervalId);
            memoryIntervalId = null;
            return;
        }

        const photo = document.createElement("img");

        photo.src = memoryFiles[nextMemory];
        photo.alt = "Birthday memory " + (nextMemory + 1);
        photo.className = "memory-photo floating";
        photo.draggable = false;

        const startLeft = 3 + Math.random() * 82;

        photo.style.left = startLeft + "vw";
        photo.style.bottom = "-200px";
        photo.style.top = "auto";

        memoryContainer.appendChild(photo);

        setTimeout(() => {
            photo.classList.remove("floating");
            photo.classList.add("landed");

            const maxLeft = Math.max(
                0,
                window.innerWidth - photo.offsetWidth
            );

            const maxTop = Math.max(
                0,
                window.innerHeight - photo.offsetHeight
            );

            const leftPosition = Math.min(
                maxLeft,
                Math.max(0, (startLeft / 100) * window.innerWidth)
            );

            photo.style.left = leftPosition + "px";

            photo.style.top =
                Math.random() * Math.min(150, maxTop) + "px";

            photo.style.bottom = "auto";

            photo.style.transform =
                "rotate(" + (Math.random() * 12 - 6) + "deg)";

            photo.dataset.landed = "true";

            landedMemories++;

            makeDraggable(photo);

            checkEndingConditions();

        }, MEMORY_FLOAT_TIME);

        nextMemory++;
    }

    createMemory();

    memoryIntervalId = setInterval(createMemory, MEMORY_INTERVAL);
}

function startFloatingBalloons() {
    if (!balloonContainer || balloonIntervalId !== null) {
        return;
    }

    const balloonColors = [
        "#ff8fab",
        "#ffc6ff",
        "#bdb2ff",
        "#a0c4ff",
        "#9bf6ff",
        "#fdffb6",
        "#caffbf"
    ];

    function createBalloon() {
        if (outroScreen.classList.contains("show")) {
            return;
        }

        const balloon = document.createElement("div");

        const color = balloonColors[
            Math.floor(Math.random() * balloonColors.length)
        ];

        const size = 35 + Math.random() * 25;

        balloon.className = "balloon";
        balloon.style.backgroundColor = color;
        balloon.style.setProperty("--balloon-color", color);
        balloon.style.left = Math.random() * 95 + "vw";
        balloon.style.width = size + "px";
        balloon.style.height = size * 1.3 + "px";
        balloon.style.animationDuration =
            (9 + Math.random() * 7) + "s";

        balloonContainer.appendChild(balloon);

        balloon.addEventListener("animationend", () => {
            balloon.remove();
        });
    }

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            if (!outroScreen.classList.contains("show")) {
                createBalloon();
            }
        }, i * 450);
    }

    balloonIntervalId = setInterval(() => {
        if (outroScreen.classList.contains("show")) {
            clearInterval(balloonIntervalId);
            balloonIntervalId = null;
            return;
        }

        createBalloon();
    }, 900);
}

function stopFloatingBalloons() {
    if (balloonIntervalId !== null) {
        clearInterval(balloonIntervalId);
        balloonIntervalId = null;
    }

    if (balloonContainer) {
        balloonContainer.querySelectorAll(".balloon").forEach(balloon => {
            balloon.remove();
        });
    }
}

function makeDraggable(photo) {
    let startX = 0;
    let startY = 0;
    let originalLeft = 0;
    let originalTop = 0;
    let dragging = false;

    photo.addEventListener("pointerdown", event => {
        if (photo.dataset.landed !== "true") {
            return;
        }

        dragging = true;
        photo.classList.add("dragging");

        photo.setPointerCapture(event.pointerId);

        startX = event.clientX;
        startY = event.clientY;

        originalLeft = photo.offsetLeft;
        originalTop = photo.offsetTop;

        photo.style.zIndex = String(Date.now());

        event.preventDefault();
    });

    photo.addEventListener("pointermove", event => {
        if (!dragging) {
            return;
        }

        const maxLeft = window.innerWidth - photo.offsetWidth;
        const maxTop = window.innerHeight - photo.offsetHeight;

        const newLeft =
            originalLeft + event.clientX - startX;

        const newTop =
            originalTop + event.clientY - startY;

        photo.style.left =
            Math.max(0, Math.min(maxLeft, newLeft)) + "px";

        photo.style.top =
            Math.max(0, Math.min(maxTop, newTop)) + "px";
    });

    function stopDragging() {
        dragging = false;
        photo.classList.remove("dragging");
    }

    photo.addEventListener("pointerup", stopDragging);
    photo.addEventListener("pointercancel", stopDragging);
}

function checkEndingConditions() {
    if (endingStarted) {
        return;
    }

    const allMemoriesLanded = landedMemories === 8;

    if (letterTimerFinished && allMemoriesLanded) {
        endingStarted = true;

        proudMessage.classList.remove("hidden");

        proudTimerId = setTimeout(() => {
            stopFloatingBalloons();

            outroScreen.classList.add("show");

            outroTimerId = setTimeout(() => {
                stopAllSongs();
            }, 4000);

        }, PROUD_MESSAGE_TIME);
    }
}

window.addEventListener("beforeunload", () => {
    clearInterval(memoryIntervalId);
    clearInterval(balloonIntervalId);

    clearTimeout(letterTimerId);
    clearTimeout(proudTimerId);
    clearTimeout(outroTimerId);
});



const letterToggle = document.getElementById("letter-toggle");
const birthdayLetter = document.getElementById("birthday-letter");

letterToggle.addEventListener("click", () => {
    const isOpen = birthdayLetter.classList.toggle("open");

    birthdayLetter.classList.toggle("folded", !isOpen);

    letterToggle.textContent = isOpen
        ? "💌 Close My Letter 💗"
        : "💌 Open My Letter 💗";

    letterToggle.setAttribute("aria-expanded", String(isOpen));
});
