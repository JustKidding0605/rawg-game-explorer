const API_KEY = '8a5d458ffd134bfcb0486700977c732f';
const BASE_URL = 'https://api.rawg.io/api';

const searchGames = async(searchTerm) => {
    const url = `${BASE_URL}/games?search=${searchTerm}&key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if(response.ok) {
            const data = await response.json();
            console.log(data);
            renderGames(data.results);
        } else {
            console.log('HTTP error:', response.status, response.statusText);
        }
    }
    catch(error) {
        console.log(error);
  }
}

function renderGames(games) {
    const container = document.getElementById('results');
    container.innerHTML = '';
    games.forEach(game => {
        const card = document.createElement('div');
        card.innerHTML = `
            <img src="${game.background_image}" alt="${game.name}">
            <h2>${game.name}</h2>
            <p>Released: ${game.released}</p>
            <p>Rating: ${game.rating}</p>
        `;
        container.appendChild(card);
    })
}

function handleSearch(event) {
    event.preventDefault();
    const searchTerm = document.getElementById('search-input').value;
    searchGames(searchTerm);
}


const form = document.getElementById('search-form');
form.addEventListener('submit', handleSearch);