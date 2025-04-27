const languageId = 2; // talvez mudar para o usuario escolher, ou deixar ingles como default
const wgerForm = document.getElementById('wgerForm');
const exercisesPerPage = 12;

wgerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const categoryId = document.getElementById('categoryInput').value;

    if (!categoryId) {
        alert("Escolha um músculo");
        return;
    }

    loadExercises(categoryId);
});

function loadExercises(categoryId, page = 1) {
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';

    requestExercises(categoryId, page)
        .then(data => {
            const results = data.results;

            if (results.length === 0) {
                exerciseList.innerHTML = `<p class="text-center">Nenhum exercício encontrado.</p>`;
                return;
            }


            results.forEach(ex => {
                const translation = ex.translations.find(t => t.language === languageId);
                if (!translation) return;

                const exercideId = ex.id;
            
                const col = document.createElement('div');
                col.className = 'col-md-4';
            
                const card = document.createElement('div');
                card.className = 'card h-100 p-3';
            
                const titleRow = document.createElement('div');
                titleRow.className = 'd-flex justify-content-between align-items-center';

                const title = document.createElement('h5');
                title.className = 'card-title mb-0';
                title.textContent = translation.name;
            
                const isFav = isFavorited(ex.id);
                const favButton = document.createElement('button');
                favButton.className = isFav ? 'btn btn-warning' : 'btn btn-outline-warning';
                favButton.innerHTML = isFav ? `<i class="bi bi-star-fill"></i>` : `<i class="bi bi-star"></i>`; 
                favButton.addEventListener('click', () => toggleFavButton(favButton, exercideId));

                titleRow.appendChild(title);
                titleRow.appendChild(favButton);

                const desc = document.createElement('p');
                desc.className = 'card-text';
                desc.innerHTML = translation.description;
            
                card.appendChild(titleRow);
                card.appendChild(desc);
                col.appendChild(card);
                exerciseList.appendChild(col);
            });
            generatePagination(categoryId, data.count, page);
        });

}

function requestExercises(categoryId, page){
    const offset = (page - 1) * exercisesPerPage;

    if(categoryId === 'favoritos'){
        return requestFavorites();
    }
    return fetch(`https://wger.de/api/v2/exerciseinfo/?category=${categoryId}&language=${languageId}&limit=${exercisesPerPage}&offset=${offset}`)
        .then(res => res.json());
}

function requestFavorites() {
    const favIds = JSON.parse(localStorage.getItem('favorites')) || [];
    const promises = favIds.map(id => fetch(`https://wger.de/api/v2/exerciseinfo/${id}/`).then(res => res.json()));
    return Promise.all(promises)
        .then(exercises => ({ results: exercises }));
}

function toggleFavButton(button, exerciseId) {
    toggleFavorite(exerciseId);

    const isFav = isFavorited(exerciseId);

    button.classList.toggle('btn-warning', isFav);
    button.classList.toggle('btn-outline-warning', !isFav);
    button.innerHTML = isFav ? `<i class="bi bi-star-fill"></i>` : `<i class="bi bi-star"></i>`; 
}

function toggleFavorite(exerciseId) {
    let favIds = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favIds.includes(exerciseId)) {
        favIds = favIds.filter(id => id !== exerciseId);
    } else {
        favIds.push(exerciseId);
    }
    localStorage.setItem('favorites', JSON.stringify(favIds));
}

function isFavorited(exerciseId) {
    let favIds = JSON.parse(localStorage.getItem('favorites')) || [];
    return favIds.includes(exerciseId);
}


function generatePagination(categoryId, totalExercises, currentPage) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalExercises / exercisesPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `btn ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'} m-1`;
        btn.textContent = i;

        btn.addEventListener('click', () => {
            loadExercises(categoryId, i);
        });

        paginationContainer.appendChild(btn);
    }
}