let currentAlbum = []; 
let currentIndex = 0;   
const formats = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];
let scale = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

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

async function openLightbox(folderName) {
    resetZoom();
    currentAlbum = [];
    for (let i = 0; i <= 10; i++) {
        let name = (i === 0) ? folderName : `${folderName}-${i}`;
        let found = false;
        for (let ext of formats) {
            let path = `img/${folderName}/${name}.${ext}`;
            if (await checkImage(path)) { currentAlbum.push(path); found = true; break; }
        }
        if (!found && i > 0) break;
    }

    if (currentAlbum.length > 0) {
        currentIndex = 0;
        document.getElementById('main-lb-img').src = currentAlbum[0];
        const thumbContainer = document.getElementById('lb-thumbnails');
        thumbContainer.innerHTML = '';
        currentAlbum.forEach((path, idx) => {
            const thumb = document.createElement('img');
            thumb.src = path;
            thumb.onclick = () => { currentIndex = idx; document.getElementById('main-lb-img').src = path; resetZoom(); updateThumbnails(); };
            thumbContainer.appendChild(thumb);
        });
        updateThumbnails();
    }
    document.getElementById('lb-title').innerText = "Dzieło: " + folderName;
    document.getElementById('lightbox').style.display = 'flex';
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
    const cont = document.getElementById('zoom-container');
    if (scale > 1) {
        const maxW = (cont.offsetWidth * scale - cont.offsetWidth) / 2;
        const maxH = (cont.offsetHeight * scale - cont.offsetHeight) / 2;
        translateX = Math.min(Math.max(translateX, -maxW), maxW);
        translateY = Math.min(Math.max(translateY, -maxH), maxH);
    } else {
        translateX = 0; translateY = 0;
    }
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// OBSŁUGA PRZESUWANIA (TRZYMAM = PRZESUWAM)
document.addEventListener('DOMContentLoaded', () => {
    const zoomBox = document.getElementById('zoom-container');
    
    zoomBox.addEventListener('mousedown', (e) => {
        if (scale > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            zoomBox.style.cursor = 'grabbing';
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
        if(zoomBox) zoomBox.style.cursor = 'grab';
    });

    zoomBox.addEventListener('wheel', (e) => {
        e.preventDefault();
        changeZoom(e.deltaY > 0 ? -0.3 : 0.3);
    }, { passive: false });
});

function closeLightbox() { document.getElementById('lightbox').style.display = 'none'; }
function closeLightboxOutside(e) { if (e.target.id === 'lightbox') closeLightbox(); }
function updateThumbnails() {
    const thumbs = document.querySelectorAll('.thumbnails-container img');
    thumbs.forEach((img, idx) => img.style.borderColor = (idx === currentIndex) ? '#FF69B4' : 'transparent');
}
window.onload = fixMainGallery;
