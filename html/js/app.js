const languageId = 2; // talvez mudar para o usuario escolher, ou deixar ingles como default
const wgerForm = document.getElementById('wgerForm');

wgerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const muscleId = document.getElementById('muscleInput').value;
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';

    if (!muscleId) {
        alert("Escolha um músculo");
        return;
    }

    requestExercises(muscleId)
        .then(response => response.json())
        .then(data => {
            const results = data.results;

            if (results.length === 0) {
                exerciseList.innerHTML = `<p class="text-center">Nenhum exercício encontrado.</p>`;
                return;
            }


            results.forEach(ex => {
                const translation = ex.translations.find(t => t.language === languageId);
                if (!translation) return;
            
                const col = document.createElement('div');
                col.className = 'col-md-4';
            
                const card = document.createElement('div');
                card.className = 'card h-100 p-3';
            
                const titleRow = document.createElement('div');
                titleRow.className = 'd-flex justify-content-between align-items-center';

                const title = document.createElement('h5');
                title.className = 'card-title mb-0';
                title.textContent = translation.name;
            
                const favButton = document.createElement('button');
                favButton.className = 'btn btn-primary';
                favButton.textContent = 'Favoritar';

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
        })
});

function requestExercises(muscleId){
    return Promise.resolve(fetch(`https://wger.de/api/v2/exerciseinfo/?muscles=${muscleId}&language=${languageId}&limit=100`));
}