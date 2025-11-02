if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
}

let watchProgress = JSON.parse(localStorage.getItem('watchProgress')) || {};

const movies = [
    {
        id: '1',
        title: 'PRZYCZEPIŁEM AKUMULATOR DO JAJ w MINECRAFT',
        description: 'by Jak Wymyslimy To Nazwiemy',
        thumbnail: 'https://cdn.discordapp.com/attachments/1266007649934250066/1394694513842196610/hq720.jpg?ex=6877bdfc&is=68766c7c&hm=18d1d4b5bef759a4dafe342beddfc02333909183f9cb52662469b3edeb9ae025&',
        videoUrl: 'https://ia601702.us.archive.org/4/items/przyczepil-em-akumulator-do-jaj-w-minecraft-sznur-wyciek-gazu-kowadlo/PRZYCZEPIŁEM%20AKUMULATOR%20DO%20JAJ%20w%20MINECRAFT%20%28sznur%2C%20wyciek%20gazu%2C%20kowadło%29.mp4',
        duration: 173,
        genre: 'Akcja',
        year: 2025,
        rating: 9,
        featured: false,
        new: true,
        trending: false
    },
    {
        id: '2',
        title: 'DOMINACJA KRYSTALMC | MOCNA VIXA (ft. Vanadium)',
        description: 'by g0gus',
        thumbnail: 'https://cdn.discordapp.com/attachments/1391557477492986017/1394711193079517285/2sluFN7.png?ex=6877cd84&is=68767c04&hm=7edae521456796d1ab9b7f135529d2b1be8760bed5a2791c1d332cceb6630071&',
        videoUrl: 'https://ia600903.us.archive.org/15/items/dominacja-krystalmc-mocna-vixa/DOMINACJA%20KRYSTALMC%20%28MOCNA%20VIXA%29%20.mp4',
        duration: 84,
        genre: 'Akcja',
        year: 2025,
        rating: 9,
        featured: true,
        new: true,
        trending: false
    }
];

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
});

function loadMovies() {
    loadFeaturedMovie();
    loadContinueWatching();
    loadMoviesGrid();
    setupFilters();
}

function loadFeaturedMovie() {
    const featuredMovie = movies.find(movie => movie.featured);
    if (!featuredMovie) return;
    
    const featuredContainer = document.getElementById('featured-movie');
    featuredContainer.innerHTML = `
        <img src="${featuredMovie.thumbnail}" alt="${featuredMovie.title}" class="featured-thumbnail">
        <div class="featured-info">
            <div class="featured-badge">Polecane</div>
            <h3>${featuredMovie.title}</h3>
            <p>${featuredMovie.description}</p>
            <div class="movie-meta">
                <span>${featuredMovie.genre.toUpperCase()} • ${featuredMovie.year}</span>
                <span class="movie-rating">Rating: ${featuredMovie.rating}</span>
            </div>
        </div>
    `;
    
    featuredContainer.addEventListener('click', () => playMovie(featuredMovie));
}

function loadContinueWatching() {
    const continueContainer = document.getElementById('continue-watching');
    const moviesToContinue = movies.filter(movie => {
        const progress = watchProgress[movie.id];
        const progressPercent = progress ? (progress.currentTime / progress.duration) * 100 : 0;
        return progress && progress.currentTime > 30 && progressPercent < 95;
    });
    
    if (moviesToContinue.length === 0) {
        continueContainer.style.display = 'none';
        continueContainer.previousElementSibling.style.display = 'none';
        return;
    }
    
    continueContainer.innerHTML = '';
    moviesToContinue.forEach(movie => {
        const progress = watchProgress[movie.id];
        const progressPercent = Math.round((progress.currentTime / progress.duration) * 100);
        
        const continueCard = document.createElement('div');
        continueCard.className = 'continue-card liquid-glass';
        continueCard.innerHTML = `
            <img src="${movie.thumbnail}" alt="${movie.title}" class="continue-thumbnail">
            <div class="continue-info">
                <div class="continue-title">${movie.title}</div>
                <div class="continue-progress">${progressPercent}% obejrzane</div>
                <div class="progress-bar-small">
                    <div class="progress-fill-small" style="width: ${progressPercent}%"></div>
                </div>
            </div>
        `;
        
        continueCard.addEventListener('click', () => playMovie(movie));
        continueContainer.appendChild(continueCard);
    });
}

function loadMoviesGrid(filter = 'all') {
    const moviesGrid = document.getElementById('movies-grid');
    moviesGrid.innerHTML = '';
    
    const filteredMovies = filter === 'all' ? movies : movies.filter(movie => movie.genre === filter);
    
    filteredMovies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card liquid-glass';
        
        const progress = watchProgress[movie.id];
        const progressPercent = progress ? Math.round((progress.currentTime / progress.duration) * 100) : 0;
        const continueWatching = progress && progress.currentTime > 30 && progressPercent < 95 ? 
            `<div class="continue-watching">Obejrzane ${progressPercent}%</div>` : '';
        
        const newBadge = movie.new ? '<div class="new-badge">NOWOSC</div>' : '';
        const trendingBadge = movie.trending && !movie.new ? '<div class="trending-badge">NA TOPIE</div>' : '';
        
        movieCard.innerHTML = `
            ${continueWatching}
            ${newBadge}
            ${trendingBadge}
            <img src="${movie.thumbnail}" alt="${movie.title}" class="movie-thumbnail">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-description">${movie.description}</p>
                <div class="movie-meta">
                    <span>${movie.genre.toUpperCase()} • ${movie.year}</span>
                    <span class="movie-rating">Rating: ${movie.rating}</span>
                </div>
            </div>
        `;
        
        movieCard.addEventListener('click', () => playMovie(movie));
        moviesGrid.appendChild(movieCard);
    });
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filter = button.getAttribute('data-filter');
            loadMoviesGrid(filter);
        });
    });
}

function playMovie(movie) {
    showLoading();
    localStorage.setItem('currentMovie', JSON.stringify(movie));
    window.location.href = 'player.html';
}

function showLoading() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div>
            <div class="loading-spinner"></div>
            <div class="loading-text">Ładowanie filmu...</div>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
}

document.addEventListener('DOMContentLoaded', () => {
    loadMovies();
});