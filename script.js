let currentAlbum = []; 
let currentIndex = 0;
let scale = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;
const formats = ['jpg', 'png', 'jpeg', 'JPG', 'PNG'];

async function checkImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Naprawa miniatur na stronie głównej
async function fixMainGallery() {
    const thumbs = document.querySelectorAll('.auto-thumb');
    for (let img of thumbs) {
        const folder = img.getAttribute('data-folder');
        for (let ext of formats) {
            const path = `img/${folder}/${folder}.${ext}`;
            if (await checkImage(path)) { img.src = path; break; }
        }
    }
}

// Otwieranie Lightboxa z albumem
async function openLightbox(folderName) {
    resetZoom();
    currentAlbum = [];
    const thumbContainer = document.getElementById('lb-thumbnails');
    thumbContainer.innerHTML = 'Wczytywanie...';

    // Przeszukiwanie folderu w poszukiwaniu zdjęć (obraz1, obraz1-1, itd.)
    for (let i = 0; i <= 10; i++) {
        let name = (i === 0) ? folderName : `${folderName}-${i}`;
        let foundPath = null;
        for (let ext of formats) {
            let path = `img/${folderName}/${name}.${ext}`;
            if (await checkImage(path)) { foundPath = path; break; }
        }
        if (foundPath) currentAlbum.push(foundPath);
        else if (i > 0) break;
    }

    if (currentAlbum.length > 0) {
        currentIndex = 0;
        document.getElementById('main-lb-img').src = currentAlbum[0];
        thumbContainer.innerHTML = '';
        currentAlbum.forEach((path, idx) => {
            const thumb = document.createElement('img');
            thumb.src = path;
            thumb.onclick = (e) => {
                e.stopPropagation();
                currentIndex = idx;
                document.getElementById('main-lb-img').src = path;
                resetZoom();
                updateThumbnails();
            };
            thumbContainer.appendChild(thumb);
        });
        updateThumbnails();
    }
    document.getElementById('lb-title').innerText = "Dzieło: " + folderName;
    document.getElementById('lightbox').style.display = 'flex';
}

function updateThumbnails() {
    const thumbs = document.querySelectorAll('.thumbnails-container img');
    thumbs.forEach((img, idx) => {
        img.style.borderColor = (idx === currentIndex) ? '#FF69B4' : 'transparent';
        img.style.opacity = (idx === currentIndex) ? '1' : '0.6';
    });
}

// ZOOM I PAN (Kliknij i trzymaj)
function changeZoom(amount) {
    scale = Math.min(Math.max(1, scale + amount), 5);
    applyTransform();
}

function resetZoom() {
    scale = 1; translateX = 0; translateY = 0;
    applyTransform();
}

function applyTransform() {
    const img = document.getElementById('main-lb-img');
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

document.addEventListener('DOMContentLoaded', () => {
    const zoomBox = document.getElementById('zoom-container');

    zoomBox.addEventListener('mousedown', (e) => {
        if (scale > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            e.preventDefault(); // Blokuje przeciąganie obrazka przez przeglądarkę
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        applyTransform();
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    zoomBox.addEventListener('wheel', (e) => {
        e.preventDefault();
        changeZoom(e.deltaY > 0 ? -0.2 : 0.2);
    }, { passive: false });
});

function closeLightbox() { document.getElementById('lightbox').style.display = 'none'; }
function closeLightboxOutside(e) { if (e.target.id === 'lightbox') closeLightbox(); }

window.onload = fixMainGallery;
