const BACKEND_URL = 'http://127.0.0.1:8000/api';

const loader = document.getElementById('loader');
const errorBox = document.getElementById('error');

function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
}

function clearError() {
    errorBox.textContent = '';
    errorBox.hidden = true;
}


const searchGames = async(searchTerm) => {
    const url = `${BACKEND_URL}/games?search=${encodeURIComponent(searchTerm)}`;
    clearError();
    loader.hidden = false;
    try {
        const response = await fetch(url);
        if(response.ok) {
            const data = await response.json();
            renderGames(data.results, searchTerm);
        } else {
            console.error('HTTP error:', response.status, response.statusText);
            showError(`Server error (${response.status}). Please try again.`);
        }
    }
    catch(error) {
        console.error(error);
        showError('Network error. Check your connection and try again.');
    }
    finally {
        loader.hidden = true;
    }
}

function renderGames(games, searchTerm) {
    const container = document.getElementById('results');
    document.getElementById('detail').hidden = true;
    container.hidden = false;
    container.innerHTML = '';
    if(games.length === 0) {
        container.innerHTML = `<p>No games found for "${searchTerm}". Try another search?</p>`;
        return;
    }
    else {
        games.forEach(game => {
            const card = document.createElement('div');
            card.innerHTML = `
                <img src="${game.background_image}" alt="${game.name}">
                <h2>${game.name}</h2>
                <p>Released: ${game.released}</p>
                <p>Rating: ${game.rating}</p>
            `;
            card.addEventListener('click', () => {
                showGameDetail(game.id);
            });
            container.appendChild(card);
        })
    }
}

function renderDetail(game) {
    const detailContainer = document.getElementById('detail');
    const resultsContainer = document.getElementById('results');
    detailContainer.innerHTML = `
        <h2>${game.name}</h2>
        <img src="${game.background_image}" alt="${game.name}">
        <p>${game.description_raw}</p>
        <p>Released: ${game.released} Rating: ${game.rating}</p>
        <p>Platforms: ${game.platforms?.map(p => p.platform.name).join(', ') || 'N/A'}</p>
        <p>Genres: ${game.genres?.map(genre => genre.name).join(', ') || 'N/A'}</p>
        <button id="back-button">Back</button>
    `
    const buttonContainer = document.getElementById('back-button');

    resultsContainer.hidden = true;
    detailContainer.hidden = false;

    buttonContainer.addEventListener('click', () => {
        resultsContainer.hidden = false;
        detailContainer.hidden = true;
    });
}

const showGameDetail = async(gameId) => {
    const url = `${BACKEND_URL}/games/${gameId}`;
    clearError();
    loader.hidden = false;
    try {
        const response = await fetch(url);
        if(response.ok) {
            const data = await response.json();
            renderDetail(data);
        } else {
            console.error('HTTP error:', response.status, response.statusText);
            showError(`Couldn't load game details (${response.status}). Please try again.`);
        }
    }
    catch(error) {
        console.error(error);
        showError('Network error. Check your connection and try again.');
    }
    finally {
        loader.hidden = true;
    }
}

function handleSearch(event) {
    event.preventDefault();
    const searchTerm = document.getElementById('search-input').value;
    if(searchTerm.trim() === '') {
        showError('Please enter a game name');
        return;
    } 
    searchGames(searchTerm);
}


const form = document.getElementById('search-form');
form.addEventListener('submit', handleSearch);