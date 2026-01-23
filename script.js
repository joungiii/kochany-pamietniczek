let currentAlbum = []; // Przechowuje listę ścieżek aktualnie otwartego folderu
let currentIndex = 0;   // Przechowuje indeks aktualnie wyświetlanego zdjęcia

async function openLightbox(folderName) {
    const mainImg = document.getElementById('main-lb-img');
    const thumbContainer = document.getElementById('lb-thumbnails');
    const title = document.getElementById('lb-title');
    
    thumbContainer.innerHTML = 'Wczytywanie...';
    title.innerText = "Dzieło: " + folderName;
    currentAlbum = [];

    const formats = ['png', 'jpg', 'jpeg', 'PNG', 'JPG'];
    
    // 1. Szukanie głównego i dodatkowych obrazków
    for (let i = 0; i <= 10; i++) {
        let name = (i === 0) ? folderName : `${folderName}-${i}`;
        let foundPath = null;
        
        for (let ext of formats) {
            let path = `img/${folderName}/${name}.${ext}`;
            if (await checkImage(path)) {
                foundPath = path;
                break;
            }
        }
        
        if (foundPath) {
            currentAlbum.push(foundPath);
        } else if (i > 0) {
            break; // Przerwij jeśli nie ma kolejnego numeru
        }
    }

    if (currentAlbum.length > 0) {
        currentIndex = 0;
        mainImg.src = currentAlbum[0];
        thumbContainer.innerHTML = '';
        currentAlbum.forEach((path, idx) => {
            const thumb = document.createElement('img');
            thumb.src = path;
            thumb.onclick = (e) => {
                e.stopPropagation();
                currentIndex = idx;
                mainImg.src = path;
                updateThumbnails();
            };
            thumbContainer.appendChild(thumb);
        });
    }

    document.getElementById('lightbox').style.display = 'flex';
}

function checkImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// FULLSCREEN LOGIC
function openFullscreen() {
    const fsOverlay = document.getElementById('fullscreen-view');
    const fsImg = document.getElementById('fs-img');
    fsImg.src = currentAlbum[currentIndex];
    fsOverlay.style.display = 'flex';
}

function closeFullscreen() {
    document.getElementById('fullscreen-view').style.display = 'none';
}

function changeFsImg(direction) {
    currentIndex += direction;
    if (currentIndex >= currentAlbum.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = currentAlbum.length - 1;
    
    document.getElementById('fs-img').src = currentAlbum[currentIndex];
    document.getElementById('main-lb-img').src = currentAlbum[currentIndex];
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
    closeFullscreen();
}

function updateThumbnails() {
    document.querySelectorAll('.thumbnails-container img').forEach((img, idx) => {
        img.style.borderColor = (idx === currentIndex) ? '#FF69B4' : 'transparent';
    });
}

// Obsługa klawiszy
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        if (document.getElementById('fullscreen-view').style.display === 'flex') {
            closeFullscreen();
        } else {
            closeLightbox();
        }
    }
    if (document.getElementById('fullscreen-view').style.display === 'flex') {
        if (e.key === "ArrowRight") changeFsImg(1);
        if (e.key === "ArrowLeft") changeFsImg(-1);
    }
});

window.onclick = function(event) {
    if (event.target == document.getElementById('lightbox')) closeLightbox();
    if (event.target == document.getElementById('fullscreen-view')) closeFullscreen();
}
