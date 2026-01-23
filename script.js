let currentAlbum = []; 
let currentIndex = 0;   
let scale = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

async function fixMainGallery() {
    const thumbs = document.querySelectorAll('.auto-thumb');
    for (let img of thumbs) {
        const folder = img.getAttribute('data-folder');
        img.src = `img/${folder}/${folder}.jpg`; // Uproszczone dla stabilności
    }
}

async function openLightbox(folderName) {
    resetZoom();
    currentAlbum = [`img/${folderName}/${folderName}.jpg`]; // Przykładowa ścieżka
    document.getElementById('main-lb-img').src = currentAlbum[0];
    document.getElementById('lb-title').innerText = folderName;
    document.getElementById('lightbox').style.display = 'flex';
}

function changeZoom(amount) {
    scale += amount;
    scale = Math.min(Math.max(1, scale), 5);
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
    
    zoomBox.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.2 : 0.2;
        changeZoom(delta);
    }, { passive: false });

    zoomBox.addEventListener('mousedown', (e) => {
        if (scale > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        applyTransform();
    });

    window.addEventListener('mouseup', () => isDragging = false);
});

function closeLightbox() { document.getElementById('lightbox').style.display = 'none'; }
window.onload = fixMainGallery;
