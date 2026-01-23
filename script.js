let currentAlbum = []; 
let currentIndex = 0;   
const formats = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];

// Zmienne do Zoomu i Przesuwania
let scale = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

const imgElement = document.getElementById('main-lb-img');
const container = document.getElementById('zoom-container');

// Naprawa miniatur na starcie
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
    
    resetZoom(); // Resetujemy zoom przy otwieraniu nowej galerii
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
                resetZoom();
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

// LOGIKA ZOOMU
function changeZoom(amount) {
    scale += amount;
    if (scale < 1) scale = 1;
    if (scale > 4) scale = 4;
    applyTransform();
}

function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
}

function applyTransform() {
    const img = document.getElementById('main-lb-img');
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// PRZESUWANIE (PANNING)
container.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

// Scroll myszką też przybliża
container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    changeZoom(delta);
}, { passive: false });


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
    if (e.key === "Escape") closeLightbox();
    if (e.key === "+" || e.key === "=") changeZoom(0.2);
    if (e.key === "-") changeZoom(-0.2);
});

window.onclick = function(event) {
    if (event.target == document.getElementById('lightbox')) closeLightbox();
}

window.onload = fixMainGallery;
