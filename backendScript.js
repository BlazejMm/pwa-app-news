// backendscript.js

const apiUrl = 'http://localhost:3000/api/users';

let saveNewsToDB, getNewsFromDB;
let saveUsersToDB, getUsersFromDB;

(async () => {
    // Dynamiczny import modułu IndexedDB
    const idbModule = await import('./idb.js');
    saveNewsToDB = idbModule.saveNewsToDB;
    getNewsFromDB = idbModule.getNewsFromDB;

    saveUsersToDB = idbModule.saveUsersToDB;
    getUsersFromDB = idbModule.getUsersFromDB;
})();

const isLoggedIn = () => {
    return localStorage.getItem('loggedIn') === 'true';
};

// Logowanie z backendu
const login = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/users');
        const users = await response.json();

        // Zapisz użytkowników do IndexedDB
        await saveUsersToDB(users);

        // Szukaj użytkownika w pobranych danych
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem('loggedIn', 'true');
            showDashboard();
        } else {
            alert('Nieprawidłowa nazwa użytkownika lub hasło.');
        }
    } catch (error) {
        console.error('Błąd logowania, próbuję offline...', error);

        // Próba zalogowania z IndexedDB offline
        const cachedUsers = await getUsersFromDB();
        const user = cachedUsers.find(u => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem('loggedIn', 'true');
            showDashboard();
        } else {
            alert('Nie można połączyć z serwerem i nie znaleziono użytkownika w pamięci lokalnej.');
        }
    }
};


const newUser = async (username, password) => {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log(data.message); // Komunikat z serwera
    } catch (error) {
        console.error('Błąd podczas tworzenia użytkownika:', error);
    }
};

const registerButton = document.getElementById('registerButton');
registerButton.addEventListener('click', () => {
    const username = document.getElementById('username2').value;
    const password = document.getElementById('password2').value;
    newUser(username, password);
    alert('Użytkownik został zarejestrowany.');
});

const logout = () => {
    localStorage.removeItem('loggedIn');
    showLoginPage();
};
const showLoginPage = () => {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
};
const showDashboard = () => {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
};
window.onload = () => {
    if (isLoggedIn()) {
        showDashboard();
    } else {
        showLoginPage();
    }
};
async function showNews() {
    const newsSection = document.getElementById('newsSection');
    const newsList = document.getElementById('newsList');
    newsSection.style.display = 'block';
    newsList.innerHTML = '';

    try {
        const response = await fetch('https://newsdata.io/api/1/news?apikey=pub_1ee8b924e85d492cae8a85cb14c8272d&category=technology&language=pl');
        const data = await response.json();

        if (data.results) {
            await saveNewsToDB(data.results);
            renderNews(data.results);
        }
    } catch (error) {
        console.warn('Offline lub błąd API. Ładowanie z IndexedDB...');
        const cachedNews = await getNewsFromDB();
        if (cachedNews.length > 0) {
            renderNews(cachedNews);
        } else {
            newsList.innerHTML = '<li>Brak zapisanych newsów offline.</li>';
        }
    }
}
function renderNews(newsArray) {
    const newsList = document.getElementById('newsList');
    newsList.innerHTML = '';
    newsArray.forEach(article => {
        const li = document.createElement('li');
        li.textContent = article.title;
        newsList.appendChild(li);
    });
}
