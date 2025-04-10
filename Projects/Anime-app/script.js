
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const genreFilter = document.getElementById('genreFilter');
const seasonFilter = document.getElementById('seasonFilter');
const animeGrid = document.getElementById('animeGrid');
const loading = document.getElementById('loading');
const homeBtn = document.getElementById('homeBtn');


const API_URL = 'https://api.jikan.moe/v4';


document.addEventListener('DOMContentLoaded', () => {
    fetchTopAnime();
    homeBtn.addEventListener('click', () => {
        window.location.href = '../projects.html'; 
    });
});


searchBtn.addEventListener('click', searchAnime);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchAnime();
});
genreFilter.addEventListener('change', filterAnime);
seasonFilter.addEventListener('change', filterAnime);


async function fetchTopAnime() {
    showLoading();
    try {
        const response = await fetch(`${API_URL}/top/anime`);
        const data = await response.json();
        displayAnime(data.data);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}


async function searchAnime() {
    const query = searchInput.value.trim();
    if (!query) return fetchTopAnime();

    showLoading();
    try {
        const response = await fetch(`${API_URL}/anime?q=${query}`);
        const data = await response.json();
        displayAnime(data.data);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}


function filterAnime() {
    const genre = genreFilter.value;
    const season = seasonFilter.value;
    
    const cards = document.querySelectorAll('.anime-card');
    
    cards.forEach(card => {
        const matchesGenre = !genre || card.dataset.genres.includes(genre);
        const matchesSeason = !season || card.dataset.season === season;
        
        card.style.display = (matchesGenre && matchesSeason) ? 'block' : 'none';
    });
}


function displayAnime(animeList) {
    animeGrid.innerHTML = '';
    
    animeList.forEach(anime => {
        const animeCard = document.createElement('div');
        animeCard.className = 'anime-card';
        animeCard.dataset.genres = anime.genres.map(g => g.name.toLowerCase()).join(',');
        animeCard.dataset.season = anime.season ? anime.season.toLowerCase() : '';
        
        animeCard.innerHTML = `
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}" class="anime-poster">
            <div class="anime-info">
                <h3 class="anime-title">${anime.title}</h3>
                <div class="anime-meta">
                    <span>${anime.type}</span>
                    <span>${anime.year || 'N/A'}</span>
                </div>
                <div class="rating">
                    ${getStarRating(anime.score)}
                    <span>${anime.score || 'N/A'}</span>
                </div>
            </div>
        `;

        animeCard.addEventListener('click', () => {
            window.open(anime.url, '_blank');
        });

        animeGrid.appendChild(animeCard);
    });
}


function getStarRating(score) {
    if (!score) return 'N/A';
    const stars = Math.round(score / 2);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}


function showLoading() {
    loading.style.display = 'flex';
    animeGrid.style.opacity = '0.5';
}

function hideLoading() {
    loading.style.display = 'none';
    animeGrid.style.opacity = '1';
}
