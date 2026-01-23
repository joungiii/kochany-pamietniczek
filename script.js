let currentAlbum = []; 
let currentIndex = 0;   
const formats = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];

// Automatyczne naprawianie miniaturek na stronie głównej
async function fixMainGallery() {
    const thumbs = document.querySelectorAll('.auto-thumb');
    for (let img of thumbs) {
        const folder = img.getAttribute('data-folder');
        for (let ext of formats) {
            const path = `img/${folder}/${folder}.${ext}`;
            if (await checkImage(path)) {
                img.src = path;
                break;
            }
        }
    }
}

async function openLightbox(folderName) {
    const mainImg = document.getElementById('main-lb-img');
    const thumbContainer = document.getElementById('lb-thumbnails');
    const title = document.getElementById('lb-title');
    
    thumbContainer.innerHTML = 'Wczytywanie...';
    title.innerText = "Dzieło: " + folderName;
    currentAlbum = [];

    for (let i = 0; i <= 15; i++) {
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
        } else if (i > 0) break;
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
        updateThumbnails();
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
    updateThumbnails();
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

function updateThumbnails() {
    const thumbs = document.querySelectorAll('.thumbnails-container img');
    thumbs.forEach((img, idx) => {
        img.style.borderColor = (idx === currentIndex) ? '#FF69B4' : 'transparent';
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        if (document.getElementById('fullscreen-view').style.display === 'flex') closeFullscreen();
        else closeLightbox();
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

// Uruchomienie naprawy galerii przy starcie strony
window.onload = fixMainGallery;
