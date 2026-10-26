const API_KEY = '8a5d458ffd134bfcb0486700977c732f';
const BASE_URL = 'https://api.rawg.io/api';

const searchGames = async(searchTerm) => {
    const url = `${BASE_URL}/games?search=${searchTerm}&key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if(response.ok) {
            const data = await response.json();
            console.log(data);
        } else {
            console.log('HTTP error:', response.status, response.statusText);
        }
    }
    catch(error) {
        console.log(error);
  }
}

searchGames("zelda");