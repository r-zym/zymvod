// Sprawdzenie autoryzacji administratora
let isAdminLoggedIn = false;

// Zarządzanie filmami
let movies = JSON.parse(localStorage.getItem('zymvod_movies')) || [
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

document.addEventListener('DOMContentLoaded', () => {
    setupAdminLogin();
    setupAdminPanel();
});

function setupAdminLogin() {
    const loginForm = document.getElementById('admin-login-form');
    const loginSection = document.getElementById('admin-login');
    const adminPanel = document.getElementById('admin-panel');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        const errorMessage = document.getElementById('admin-error-message');
        
        if (await authSystem.verifyAdmin(username, password)) {
            isAdminLoggedIn = true;
            loginSection.style.display = 'none';
            adminPanel.style.display = 'block';
            loadAdminData();
        } else {
            errorMessage.textContent = 'Nieprawidłowe dane administratora';
            errorMessage.classList.add('show');
        }
    });
    
    document.getElementById('logout-admin-btn').addEventListener('click', () => {
        isAdminLoggedIn = false;
        loginSection.style.display = 'block';
        adminPanel.style.display = 'none';
        document.getElementById('admin-login-form').reset();
    });
}

function setupAdminPanel() {
    // Tabs
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabName = tab.getAttribute('data-tab');
            document.querySelectorAll('.admin-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(tabName + '-tab').style.display = 'block';
        });
    });
    
    // Movie form
    const movieForm = document.getElementById('movie-form');
    movieForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveMovie();
    });
    
    document.getElementById('clear-movie-form').addEventListener('click', clearMovieForm);
    
    // User form
    const userForm = document.getElementById('user-form');
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('user-username').value;
        const password = document.getElementById('user-password').value;
        
        await authSystem.addUser(username, password);
        loadUsers();
        userForm.reset();
    });
    
    // Admin form
    const adminForm = document.getElementById('admin-form');
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('admin-username-input').value;
        const password = document.getElementById('admin-password-input').value;
        
        await authSystem.addAdmin(username, password);
        loadAdmins();
        adminForm.reset();
    });
}

function loadAdminData() {
    loadMovies();
    loadUsers();
    loadAdmins();
}

function loadMovies() {
    const moviesList = document.getElementById('movies-list');
    moviesList.innerHTML = '';
    
    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.className = 'admin-item';
        movieItem.innerHTML = `
            <div class="admin-item-info">
                <div class="admin-item-title">${movie.title}</div>
                <div class="admin-item-meta">${movie.genre} • ${movie.year} • Rating: ${movie.rating}</div>
            </div>
            <div class="admin-item-actions">
                <button class="admin-button admin-button-small" onclick="editMovie('${movie.id}')">Edytuj</button>
                <button class="admin-button admin-button-small danger" onclick="deleteMovie('${movie.id}')">Usuń</button>
            </div>
        `;
        moviesList.appendChild(movieItem);
    });
}

function saveMovie() {
    const movieId = document.getElementById('movie-id').value;
    const movieData = {
        id: movieId || Date.now().toString(),
        title: document.getElementById('movie-title').value,
        description: document.getElementById('movie-description').value,
        thumbnail: document.getElementById('movie-thumbnail').value,
        videoUrl: document.getElementById('movie-video-url').value,
        duration: parseInt(document.getElementById('movie-duration').value),
        genre: document.getElementById('movie-genre').value,
        year: parseInt(document.getElementById('movie-year').value),
        rating: parseInt(document.getElementById('movie-rating').value),
        featured: document.getElementById('movie-featured').checked,
        new: document.getElementById('movie-new').checked,
        trending: document.getElementById('movie-trending').checked
    };
    
    if (movieId) {
        // Edit existing movie
        const index = movies.findIndex(m => m.id === movieId);
        if (index !== -1) {
            movies[index] = movieData;
        }
    } else {
        // Add new movie
        movies.push(movieData);
    }
    
    localStorage.setItem('zymvod_movies', JSON.stringify(movies));
    loadMovies();
    clearMovieForm();
}

function editMovie(movieId) {
    const movie = movies.find(m => m.id === movieId);
    if (!movie) return;
    
    document.getElementById('movie-id').value = movie.id;
    document.getElementById('movie-title').value = movie.title;
    document.getElementById('movie-description').value = movie.description;
    document.getElementById('movie-thumbnail').value = movie.thumbnail;
    document.getElementById('movie-video-url').value = movie.videoUrl;
    document.getElementById('movie-duration').value = movie.duration;
    document.getElementById('movie-genre').value = movie.genre;
    document.getElementById('movie-year').value = movie.year;
    document.getElementById('movie-rating').value = movie.rating;
    document.getElementById('movie-featured').checked = movie.featured;
    document.getElementById('movie-new').checked = movie.new;
    document.getElementById('movie-trending').checked = movie.trending;
}

function deleteMovie(movieId) {
    if (confirm('Czy na pewno chcesz usunąć ten film?')) {
        movies = movies.filter(m => m.id !== movieId);
        localStorage.setItem('zymvod_movies', JSON.stringify(movies));
        loadMovies();
    }
}

function clearMovieForm() {
    document.getElementById('movie-form').reset();
    document.getElementById('movie-id').value = '';
}

function loadUsers() {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';
    
    const users = authSystem.getUsers();
    users.forEach(username => {
        const userItem = document.createElement('div');
        userItem.className = 'admin-item';
        userItem.innerHTML = `
            <div class="admin-item-info">
                <div class="admin-item-title">${username}</div>
                <div class="admin-item-meta">Użytkownik</div>
            </div>
            <div class="admin-item-actions">
                <button class="admin-button admin-button-small danger" onclick="deleteUser('${username}')">Usuń</button>
            </div>
        `;
        usersList.appendChild(userItem);
    });
}

function deleteUser(username) {
    if (confirm(`Czy na pewno chcesz usunąć użytkownika ${username}?`)) {
        authSystem.deleteUser(username);
        loadUsers();
    }
}

function loadAdmins() {
    const adminsList = document.getElementById('admins-list');
    adminsList.innerHTML = '';
    
    const admins = authSystem.getAdmins();
    admins.forEach(username => {
        const adminItem = document.createElement('div');
        adminItem.className = 'admin-item';
        adminItem.innerHTML = `
            <div class="admin-item-info">
                <div class="admin-item-title">${username}</div>
                <div class="admin-item-meta">Administrator</div>
            </div>
            <div class="admin-item-actions">
                <button class="admin-button admin-button-small danger" onclick="deleteAdmin('${username}')">Usuń</button>
            </div>
        `;
        adminsList.appendChild(adminItem);
    });
}

function deleteAdmin(username) {
    if (confirm(`Czy na pewno chcesz usunąć administratora ${username}?`)) {
        authSystem.deleteAdmin(username);
        loadAdmins();
    }
}