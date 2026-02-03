let currentAlbum = []; 
let currentIndex = 0;
let scale = 1;
let isDragging = false;
let isLightboxLoading = false; 
let currentLoadId = 0; // Identyfikator zapobiegający dublowaniu zdjęć
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

async function fixMainGallery() {
    const thumbs = document.querySelectorAll('.auto-thumb');
    if (thumbs.length === 0) return;
    for (let img of thumbs) {
        const folder = img.getAttribute('data-folder');
        for (let ext of formats) {
            const path = `img/${folder}/${folder}.${ext}`;
            if (await checkImage(path)) { img.src = path; break; }
        }
    }
}

async function openLightbox(folderName) {
    if (isLightboxLoading) return; 
    isLightboxLoading = true;
    
    // Zwiększamy ID sesji przy każdym otwarciu
    const loadId = ++currentLoadId; 

    resetZoom();
    
    // Czyścimy wszystko na starcie
    currentAlbum = [];
    const thumbContainer = document.getElementById('lb-thumbnails');
    if (thumbContainer) thumbContainer.innerHTML = '';
    
    let tempAlbum = [];

    // Szukanie zdjęć
    for (let i = 0; i <= 10; i++) {
        // Jeśli w międzyczasie kliknięto coś innego, przerwij tę pętlę
        if (loadId !== currentLoadId) return;

        let name = (i === 0) ? folderName : `${folderName}-${i}`;
        let foundPath = null;
        for (let ext of formats) {
            let path = `img/${folderName}/${name}.${ext}`;
            if (await checkImage(path)) { foundPath = path; break; }
        }
        
        if (foundPath) {
            tempAlbum.push(foundPath);
        } else if (i > 0) {
            break;
        }
    }

    // Sprawdzamy ponownie, czy to nadal ta sama sesja ładowania
    if (loadId !== currentLoadId) return;

    currentAlbum = tempAlbum;

    if (currentAlbum.length > 0) {
        currentIndex = 0;
        const mainImg = document.getElementById('main-lb-img');
        if (mainImg) mainImg.src = currentAlbum[0];
        
        if (thumbContainer) {
            thumbContainer.innerHTML = ''; // Dodatkowe czyszczenie przed renderowaniem
            currentAlbum.forEach((path, idx) => {
                const thumb = document.createElement('img');
                thumb.src = path;
                thumb.onclick = (e) => {
                    e.stopPropagation();
                    currentIndex = idx;
                    if (mainImg) mainImg.src = path;
                    resetZoom();
                    updateThumbnails();
                };
                thumbContainer.appendChild(thumb);
            });
            updateThumbnails();
        }
    }

    const title = document.getElementById('lb-title');
    if (title) title.innerText = folderName;
    
    const lb = document.getElementById('lightbox');
    if (lb) lb.style.display = 'flex';

    isLightboxLoading = false;
}

function updateThumbnails() {
    const thumbs = document.querySelectorAll('.thumbnails-container img');
    thumbs.forEach((img, idx) => {
        img.style.borderColor = (idx === currentIndex) ? '#FF69B4' : 'transparent';
        img.style.opacity = (idx === currentIndex) ? '1' : '0.6';
    });
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
    if (img) img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

document.addEventListener('DOMContentLoaded', () => {
    const zoomBox = document.getElementById('zoom-container');
    if (zoomBox) {
        zoomBox.addEventListener('mousedown', (e) => {
            if (scale > 1) {
                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                e.preventDefault();
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
            if (scale > 1 || e.deltaY < 0) {
                e.preventDefault();
                changeZoom(e.deltaY > 0 ? -0.2 : 0.2);
            }
        }, { passive: false });
    }
});

function closeLightbox() { 
    const lb = document.getElementById('lightbox');
    if (lb) lb.style.display = 'none'; 
    isLightboxLoading = false;
}

function closeLightboxOutside(e) { 
    if (e.target.id === 'lightbox') closeLightbox(); 
}

window.onload = fixMainGallery;
