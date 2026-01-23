let scale = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;
const formats = ['jpg', 'png', 'jpeg', 'JPG', 'PNG'];

// Funkcja sprawdzająca czy plik istnieje
async function checkImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Naprawa galerii głównej
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

// Otwieranie Lightboxa
async function openLightbox(folderName) {
    const imgElement = document.getElementById('main-lb-img');
    let foundPath = "";
    for (let ext of formats) {
        let path = `img/${folderName}/${folderName}.${ext}`;
        if (await checkImage(path)) { foundPath = path; break; }
    }
    
    if (foundPath) {
        imgElement.src = foundPath;
        document.getElementById('lb-title').innerText = folderName;
        document.getElementById('lightbox').style.display = 'flex';
        resetZoom();
    }
}

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

// LOGIKA DRAG & DROP (KLIKNIJ I TRZYMAJ)
document.addEventListener('DOMContentLoaded', () => {
    const zoomBox = document.getElementById('zoom-container');

    zoomBox.addEventListener('mousedown', (e) => {
        if (scale > 1) {
            isDragging = true;
            // Zapamiętujemy punkt startu względem obecnego przesunięcia
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            e.preventDefault(); // TO JEST KLUCZ - blokuje domyślne przeciąganie obrazka przez przeglądarkę
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

    // Zoom na kółku myszy
    zoomBox.addEventListener('wheel', (e) => {
        e.preventDefault();
        changeZoom(e.deltaY > 0 ? -0.2 : 0.2);
    }, { passive: false });
});

function closeLightbox() { document.getElementById('lightbox').style.display = 'none'; }

// Zamykanie po kliknięciu w czarne tło
window.onclick = function(event) {
    const lb = document.getElementById('lightbox');
    if (event.target == lb) closeLightbox();
}

window.onload = fixMainGallery;
