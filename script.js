let currentAlbum = []; 
let currentIndex = 0;   
const formats = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];
let scale = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

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

async function openLightbox(folderName) {
    resetZoom();
    document.getElementById('lb-thumbnails').innerHTML = 'Wczytywanie...';
    document.getElementById('lb-title').innerText = "Dzieło: " + folderName;
    currentAlbum = [];

    for (let i = 0; i <= 15; i++) {
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
        const thumbContainer = document.getElementById('lb-thumbnails');
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

function changeZoom(amount) {
    scale += amount;
    if (scale < 1) scale = 1;
    if (scale > 5) scale = 5;
    applyTransform();
}

function resetZoom() {
    scale = 1; translateX = 0; translateY = 0;
    applyTransform();
}

function applyTransform() {
    const img = document.getElementById('main-lb-img');
    const cont = document.getElementById('zoom-container');
    if (!img || !cont) return;

    if (scale > 1) {
        const maxW = (cont.offsetWidth * scale - cont.offsetWidth) / 2;
        const maxH = (cont.offsetHeight * scale - cont.offsetHeight) / 2;
        if (Math.abs(translateX) > maxW) translateX = translateX > 0 ? maxW : -maxW;
        if (Math.abs(translateY) > maxH) translateY = translateY > 0 ? maxH : -maxH;
    } else {
        translateX = 0; translateY = 0;
    }
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

document.addEventListener('DOMContentLoaded', () => {
    const zoomBox = document.getElementById('zoom-container');
    
    if(zoomBox) {
        zoomBox.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.3 : 0.3;
            changeZoom(delta);
        }, { passive: false });

        // POCZĄTEK PRZESUWANIA (tylko mousedown)
        zoomBox.addEventListener('mousedown', (e) => {
            if (scale <= 1) return;
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            e.preventDefault(); // Zapobiega "wyciąganiu" obrazka na pulpit
        });
    }
});

// RUCH MYSZKI (globalny, żeby nie gubić obrazka przy szybkim ruchu)
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform();
});

// KONIEC PRZESUWANIA (globalny)
window.addEventListener('mouseup', () => {
    isDragging = false;
});

// Wyłączenie draga, jeśli myszka wyjdzie poza okno przeglądarki
window.addEventListener('mouseleave', () => {
    isDragging = false;
});

function closeLightbox() { document.getElementById('lightbox').style.display = 'none'; }
function updateThumbnails() {
    const thumbs = document.querySelectorAll('.thumbnails-container img');
    thumbs.forEach((img, idx) => {
        img.style.borderColor = (idx === currentIndex) ? '#FF69B4' : 'transparent';
    });
}
window.onclick = function(event) { if (event.target == document.getElementById('lightbox')) closeLightbox(); }
window.onload = fixMainGallery;
