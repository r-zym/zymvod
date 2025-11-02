// Sprawdzenie czy użytkownik jest zalogowany
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
}

// Pobranie danych filmu
const currentMovie = JSON.parse(localStorage.getItem('currentMovie'));
if (!currentMovie) {
    window.location.href = 'movies.html';
}

let watchProgress = JSON.parse(localStorage.getItem('watchProgress')) || {};
let video, playerOverlay, playerControls;
let controlsTimeout;
let isDragging = false;

// Inicjalizacja odtwarzacza
document.addEventListener('DOMContentLoaded', () => {
    showVideoLoading();
    
    video = document.getElementById('video-player');
    playerOverlay = document.getElementById('player-overlay');
    playerControls = document.getElementById('player-controls');
    
    // Ustawienie filmu
    video.src = currentMovie.videoUrl;
    document.getElementById('current-movie-title').textContent = currentMovie.title;
    
    // Przywrócenie postępu oglądania
    const progress = watchProgress[currentMovie.id];
    if (progress && progress.currentTime > 30) {
        video.currentTime = progress.currentTime;
    }
    
    // Ukryj loading gdy video się załaduje
    video.addEventListener('loadeddata', hideVideoLoading);
    video.addEventListener('canplay', hideVideoLoading);
    
    setupVideoControls();
    showControls();
});

function showVideoLoading() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'video-loading';
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div>
            <div class="loading-spinner"></div>
            <div class="loading-text">Ładowanie wideo...</div>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
}

function hideVideoLoading() {
    const loadingOverlay = document.getElementById('video-loading');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

function setupVideoControls() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const rewindBtn = document.getElementById('rewind-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const progressBar = document.getElementById('progress-bar');
    const progressFilled = document.getElementById('progress-filled');
    const progressHandle = document.getElementById('progress-handle');
    const currentTimeSpan = document.getElementById('current-time');
    const durationSpan = document.getElementById('duration');
    const volumeRange = document.getElementById('volume-range');
    const muteBtn = document.getElementById('mute-btn');
    const volumeIcon = document.getElementById('volume-icon');
    const muteIcon = document.getElementById('mute-icon');
    
    // Play/Pause
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Rewind/Forward
    rewindBtn.addEventListener('click', () => {
        video.currentTime = Math.max(0, video.currentTime - 10);
        showControls();
    });
    
    forwardBtn.addEventListener('click', () => {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        showControls();
    });
    
    video.addEventListener('click', togglePlayPause);
    
    function togglePlayPause() {
        if (video.paused) {
            video.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            video.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
    
    // Aktualizacja czasu i paska postępu
    video.addEventListener('timeupdate', () => {
        if (!isDragging) {
            const progress = (video.currentTime / video.duration) * 100;
            progressFilled.style.width = progress + '%';
            progressHandle.style.left = progress + '%';
        }
        
        currentTimeSpan.textContent = formatTime(video.currentTime);
        
        // Zapisywanie postępu
        if (currentMovie) {
            watchProgress[currentMovie.id] = {
                currentTime: video.currentTime,
                duration: video.duration,
                lastWatched: new Date()
            };
            localStorage.setItem('watchProgress', JSON.stringify(watchProgress));
        }
    });
    
    video.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(video.duration);
    });
    
    // Pasek postępu
    progressBar.addEventListener('mousedown', startDragging);
    progressBar.addEventListener('click', seekVideo);
    
    function startDragging(e) {
        isDragging = true;
        seekVideo(e);
        
        document.addEventListener('mousemove', seekVideo);
        document.addEventListener('mouseup', stopDragging);
    }
    
    function stopDragging() {
        isDragging = false;
        document.removeEventListener('mousemove', seekVideo);
        document.removeEventListener('mouseup', stopDragging);
    }
    
    function seekVideo(e) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * video.duration;
        
        if (newTime >= 0 && newTime <= video.duration) {
            video.currentTime = newTime;
            const progress = pos * 100;
            progressFilled.style.width = progress + '%';
            progressHandle.style.left = progress + '%';
        }
    }
    
    // Głośność
    volumeRange.addEventListener('input', (e) => {
        video.volume = e.target.value / 100;
        updateVolumeIcon();
    });
    
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        updateVolumeIcon();
    });
    
    function updateVolumeIcon() {
        if (video.muted || video.volume === 0) {
            volumeIcon.style.display = 'none';
            muteIcon.style.display = 'block';
        } else {
            volumeIcon.style.display = 'block';
            muteIcon.style.display = 'none';
        }
    }
    
    // Powrót do filmów
    document.getElementById('back-to-movies').addEventListener('click', () => {
        video.pause();
        window.location.href = 'movies.html';
    });
    
    // Pokazywanie/ukrywanie kontrolek
    let mouseMoveTimeout;
    
    document.addEventListener('mousemove', () => {
        showControls();
        clearTimeout(mouseMoveTimeout);
        mouseMoveTimeout = setTimeout(hideControls, 3000);
    });
    
    // Klawiatura
    document.addEventListener('keydown', (e) => {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowLeft':
                video.currentTime = Math.max(0, video.currentTime - 10);
                break;
            case 'ArrowRight':
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.1);
                volumeRange.value = video.volume * 100;
                break;
            case 'ArrowDown':
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.1);
                volumeRange.value = video.volume * 100;
                break;
            case 'KeyM':
                video.muted = !video.muted;
                updateVolumeIcon();
                break;
            case 'Escape':
                video.pause();
                window.location.href = 'movies.html';
                break;
        }
    });
}

function showControls() {
    playerOverlay.classList.add('show');
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(hideControls, 3000);
}

function hideControls() {
    if (!video.paused) {
        playerOverlay.classList.remove('show');
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}