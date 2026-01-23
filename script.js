async function openLightbox(folderName) {
    const mainImg = document.getElementById('main-lb-img');
    const thumbContainer = document.getElementById('lb-thumbnails');
    const title = document.getElementById('lb-title');
    
    thumbContainer.innerHTML = '';
    title.innerText = "Dzieło: " + folderName;

    // 1. Ustawienie zdjęcia głównego
    const mainPath = `img/${folderName}/${folderName}.png`;
    mainImg.src = mainPath;
    addThumb(mainPath, thumbContainer, mainImg);

    // 2. Automatyczne szukanie zdjęć od -1 do -10
    for (let i = 1; i <= 10; i++) {
        const extraPath = `img/${folderName}/${folderName}-${i}.png`;
        
        const exists = await new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = extraPath;
        });

        if (exists) {
            addThumb(extraPath, thumbContainer, mainImg);
        } else {
            break; // Jeśli nie ma np. zdjęcia nr 2, przestań szukać
        }
    }

    document.getElementById('lightbox').style.display = 'flex';
}

function addThumb(path, container, mainImgDisplay) {
    const thumb = document.createElement('img');
    thumb.src = path;
    thumb.onclick = () => {
        mainImgDisplay.src = path;
        // Podświetlenie aktywnej miniaturki
        document.querySelectorAll('.thumbnails-container img').forEach(i => i.style.borderColor = 'transparent');
        thumb.style.borderColor = '#FF69B4';
    };
    container.appendChild(thumb);
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == document.getElementById('lightbox')) closeLightbox();
}