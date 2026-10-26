const api_key = '8a5d458ffd134bfcb0486700977c732f';
const base_url = 'https://api.rawg.io/api/games';


const searchGames = async(searchTerm) => {
    const url = base_url + '/games?search=' + searchTerm + '&key=' + api_key;
    try {
        const response = await fetch(url);
        if(response.ok) {
            const data = await response.json();
            console.log(data);
        }
    }
    catch(error) {
        console.log(error);
  }
}

searchGames("zelda");