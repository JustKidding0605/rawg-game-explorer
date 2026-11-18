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


const searchGames = async(searchTerm, genres, ordering) => {
    const url = `${BACKEND_URL}/games?search=${encodeURIComponent(searchTerm)}&genres=${encodeURIComponent(genres)}&ordering=${encodeURIComponent(ordering)}`;
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
    document.getElementById('backlog').hidden = true;
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
    document.getElementById('backlog').hidden = true;
    detailContainer.innerHTML = `
        <h2>${game.name}</h2>
        <img src="${game.background_image}" alt="${game.name}">
        <p>${game.description_raw}</p>
        <p>Released: ${game.released} Rating: ${game.rating}</p>
        <p>Platforms: ${game.platforms?.map(p => p.platform.name).join(', ') || 'N/A'}</p>
        <p>Genres: ${game.genres?.map(genre => genre.name).join(', ') || 'N/A'}</p>
        <button id="back-button">Back</button>
        <button id="save-button">Save to Backlog</button>
    `
    const buttonContainer = document.getElementById('back-button');
    const buttonSave = document.getElementById('save-button');
    buttonSave.addEventListener('click', async() => {
        const originalText = buttonSave.textContent;
        buttonSave.disabled = true;
        buttonSave.textContent = 'Saving...';

        const isSaved = await saveToBacklog(game);

        if (isSaved) {
            buttonSave.textContent = 'Saved!';
        } else {
            buttonSave.textContent = originalText;
            buttonSave.disabled = false;
        }
    });

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
    const genresSelect = document.getElementById('genre-select').value;
    const orderingSelect = document.getElementById('ordering-select').value;
    const searchTerm = document.getElementById('search-input').value;
    if(searchTerm.trim() === '') {
        showError('Please enter a game name');
        return;
    } 
    searchGames(searchTerm, genresSelect, orderingSelect);
}

const saveToBacklog = async(game, status = "Want to Play") => {
    try {
        const response = await fetch(`${BACKEND_URL}/backlog`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rawg_id: game.rawg_id || game.id,
                name: game.name,
                background_image: game.background_image,
                released: game.released,
                rating: game.rating,
                status: status,
            }),
        });
        if(response.ok) {
            return true;
        } else {
            showError('Failed to save game.');
            return false;
        }
    }
    catch(error) {
        console.error(error);
        showError('Network error. Check your connection and try again.');
        return false;
    }
}

const loadBacklog = async() => {
    const url = `${BACKEND_URL}/backlog`;
    clearError();
    loader.hidden = false;
    try {
        const response = await fetch(url);
        if(response.ok) {
            const data = await response.json();
            renderBacklog(data);
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

function renderBacklog(savedGames) {
    const resultsContainer = document.getElementById('results');
    const detailContainer = document.getElementById('detail');
    const backlogContainer = document.getElementById('backlog');

    resultsContainer.hidden = true;
    detailContainer.hidden = true;
    backlogContainer.hidden = false;
    backlogContainer.innerHTML = '';

    if(savedGames.length === 0) {
        backlogContainer.innerHTML = `<p>Your backlog is empty. Search for games to add!</p>`;
        return;
    }
    savedGames.forEach(game => {
        const card = document.createElement('div');
        card.innerHTML = `
            <img src="${game.background_image}" alt="${game.name}">
            <h2>${game.name}</h2>
            <select id="status-${game.id}">
                <option value="Want to Play" ${game.status === 'Want to Play' ? 'selected' : ''}>Want to Play</option>
                <option value="Playing" ${game.status === 'Playing' ? 'selected' : ''}>Playing</option>
                <option value="Completed" ${game.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
            <button id="delete-${game.id}">Delete</button>
        `;
        const statusSelect = card.querySelector('select');
        const deleteButton = card.querySelector('button');
        deleteButton.addEventListener('click', async() => {
            await removedFromBacklog(game.rawg_id);
            loadBacklog();
        });
        statusSelect.addEventListener('change', async() => {
            await saveToBacklog(game, statusSelect.value);
        });
        backlogContainer.appendChild(card);
    })
}
   
const removedFromBacklog = async(rawgId) => {
    try {
        await fetch(`${BACKEND_URL}/backlog/${rawgId}`, { method: 'DELETE' });
    }
    catch(error) {
        console.error(error);
        showError('Network error. Check your connection and try again.');
    }
}
const form = document.getElementById('search-form');
form.addEventListener('submit', handleSearch);

const backlogButton = document.getElementById('view-backlog');
backlogButton.addEventListener('click', () => {
    loadBacklog();
});