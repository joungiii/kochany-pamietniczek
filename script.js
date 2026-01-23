console.log("Skrypt Kochany Pamiętniczku Art załadowany! 💖");

async function openLightbox(folderName) {
    console.log("Kliknięto folder: " + folderName);
    
    const lightbox = document.getElementById('lightbox');
    const mainImg = document.getElementById('main-lb-img');
    const thumbContainer = document.getElementById('lb-thumbnails');
    const title = document.getElementById('lb-title');
    
    if (!lightbox) {
        console.error("Nie znaleziono elementu lightbox w HTML!");
        return;
    }

    // Pokaż lightbox od razu
    lightbox.style.display = 'flex';
    thumbContainer.innerHTML = 'Wczytywanie...';
    title.innerText = "Dzieło: " + folderName;

    const formats = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];
    let mainPath = null;

    // 1. Szukamy głównego obrazka
    for (let ext of formats) {
        const testPath = `img/${folderName}/${folderName}.${ext}`;
        const exists = await checkImage(testPath);
        if (exists) {
            mainPath = testPath;
            break;
        }
    }

    if (mainPath) {
        mainImg.src = mainPath;
        thumbContainer.innerHTML = '';
        addThumb(mainPath, thumbContainer, mainImg);

        // 2. Szukamy dodatkowych obrazków (obraz-1, obraz-2...)
        for (let i = 1; i <= 10; i++) {
            let extraPath = null;
            for (let ext of formats) {
                const testExtra = `img/${folderName}/${folderName}-${i}.${ext}`;
                if (await checkImage(testExtra)) {
                    extraPath = testExtra;
                    break;
                }
            }
            if (extraPath) {
                addThumb(extraPath, thumbContainer, mainImg);
            } else {
                break; 
            }
        }
    } else {
        thumbContainer.innerHTML = "Nie znaleziono plików w img/" + folderName;
        console.error("Błąd ścieżki dla folderu: " + folderName);
    }
}

function checkImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

function addThumb(path, container, mainDisplay) {
    const thumb = document.createElement('img');
    thumb.src = path;
    thumb.onclick = () => {
        mainDisplay.src = path;
        document.querySelectorAll('.thumbnails-container img').forEach(i => i.style.borderColor = 'transparent');
        thumb.style.borderColor = '#FF69B4';
    };
    container.appendChild(thumb);
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

window.onclick = function(event) {
    const lb = document.getElementById('lightbox');
    if (event.target == lb) closeLightbox();
}

// Obsługa klawisza ESC
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeLightbox();
});
