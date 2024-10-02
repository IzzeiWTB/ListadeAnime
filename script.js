let listaAnimes = [];
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
let paginaAtual = 1;
let listaGeneros = [];
let carregandoMais = false;

async function buscarAnimes(pagina = 1) {
    try {
        carregandoMais = true;
        const resposta = await fetch(`https://api.jikan.moe/v4/anime?page=${pagina}`);
        const dados = await resposta.json();
        listaAnimes = [...listaAnimes, ...dados.data];
        exibirAnimes(listaAnimes);
        extractGenres(dados.data);
        carregandoMais = false;
    } catch (erro) {
        console.log("Erro ao buscar animes:", erro);
        carregandoMais = false;
    }
}

function exibirAnimes(animes) {
    const elementoListaAnimes = document.getElementById('anime-list');
    elementoListaAnimes.innerHTML = '';

    animes.forEach(anime => {
        const itemAnime = document.createElement('div');
        itemAnime.className = 'anime-item';

        const generos = anime.genres.map(genero => genero.name).join(', ');

        itemAnime.innerHTML = `
            <img src="${anime.images.jpg.image_url}" class="anime-image" alt="${anime.title}">
            <div class="anime-genres">${generos}</div>
            <div class="anime-title">
                <h3>${anime.title}</h3>
                <span class="favorite" data-id="${anime.mal_id}" onclick="alternarFavorito('${anime.mal_id}', event)">${favoritos.includes(String(anime.mal_id)) ? '❤️' : '🤍'}</span>
            </div>
            <p>${anime.synopsis ? anime.synopsis.substring(0, 100) + '...' : 'Sem descrição disponível'}</p>
        `;

        itemAnime.addEventListener('click', () => mostrarDetalhes(anime));
        elementoListaAnimes.appendChild(itemAnime);
    });

    atualizarFavoritos();
}

function mostrarDetalhes(anime) {
    alert(`Título: ${anime.title}\nPontuação: ${anime.score}\nEpisódios: ${anime.episodes}\nSinopse: ${anime.synopsis}`);
}

function alternarFavorito(animeId, event) {
    event.stopPropagation();

    animeId = String(animeId);
    if (favoritos.includes(animeId)) {
        favoritos = favoritos.filter(fav => fav !== animeId);
    } else {
        favoritos.push(animeId);
    }

    localStorage.setItem('favoritos', JSON.stringify(favoritos));

    const elementoFavorito = event.target;
    elementoFavorito.textContent = favoritos.includes(animeId) ? '❤️' : '🤍';
}

function atualizarFavoritos() {
    const elementosFavorito = document.querySelectorAll('.favorite');
    elementosFavorito.forEach(elemento => {
        const id = elemento.getAttribute('data-id');
        elemento.textContent = favoritos.includes(id) ? '❤️' : '🤍';
    });
}

function extractGenres(animes) {
    animes.forEach(anime => {
        anime.genres.forEach(genre => {
            if (!listaGeneros.includes(genre.name)) {
                listaGeneros.push(genre.name);
            }
        });
    });

    const genreFilter = document.getElementById('genre-filter');
    genreFilter.innerHTML = '<option value="">Todos os Gêneros</option>';
    listaGeneros.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

function exibirFavoritos() {
    const animesFavoritos = listaAnimes.filter(anime => favoritos.includes(String(anime.mal_id)));
    if (animesFavoritos.length > 0) {
        exibirAnimes(animesFavoritos);
    } else {
        alert('Nenhum anime foi favoritado ainda.');
    }
}

document.getElementById('genre-filter').addEventListener('change', (e) => {
    const generoSelecionado = e.target.value;
    if (generoSelecionado === '') {
        exibirAnimes(listaAnimes);
    } else {
        const animesFiltrados = listaAnimes.filter(anime =>
            anime.genres.some(genero => genero.name === generoSelecionado)
        );
        exibirAnimes(animesFiltrados);
    }
});

document.getElementById('search').addEventListener('input', (e) => {
    const termoBusca = e.target.value.toLowerCase();
    const animesFiltrados = listaAnimes.filter(anime => anime.title.toLowerCase().includes(termoBusca));
    exibirAnimes(animesFiltrados);
});

document.getElementById('load-more').addEventListener('click', () => {
    paginaAtual++;
    buscarAnimes(paginaAtual);
});

document.getElementById('show-favorites').addEventListener('click', exibirFavoritos);

window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50 && !carregandoMais) {
        paginaAtual++;
        buscarAnimes(paginaAtual);
    }
});

buscarAnimes();
