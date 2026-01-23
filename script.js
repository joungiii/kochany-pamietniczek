let currentAlbum = []; 
let scale = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;
const formats = ['jpg', 'png', 'jpeg', 'JPG', 'PNG'];

// 1. WCZYTYWANIE OBRAZÓW (Twoja działająca wersja)
async function checkImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

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

// 2. LIGHTBOX
async function openLightbox(folderName) {
    resetZoom();
    let foundPath = "";
    for (let ext of formats) {
        let path = `img/${folderName}/${folderName}.${ext}`;
        if (await checkImage(path)) { foundPath = path; break; }
    }
    
    if (foundPath) {
        document.getElementById('main-lb-img').src = foundPath;
        document.getElementById('lb-title').innerText = "Dzieło: " + folderName;
        document.getElementById('lightbox').style.display = 'flex';
    }
}

// 3. ZOOM I PRZESUWANIE (Kliknij i trzymaj)
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
            e.preventDefault(); // Blokuje domyślne przeciąganie obrazka
        }
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

    zoomBox.addEventListener('wheel', (e) => {
        e.preventDefault();
        changeZoom(e.deltaY > 0 ? -0.2 : 0.2);
    }, { passive: false });
});

function closeLightbox() { document.getElementById('lightbox').style.display = 'none'; }

// Zamykanie po kliknięciu poza okno
window.onclick = function(e) {
    if (e.target == document.getElementById('lightbox')) closeLightbox();
}

window.onload = fixMainGallery;
