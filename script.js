// Lista rozszerzeń, które skrypt będzie sprawdzał automatycznie
const formats = ['png', 'jpg', 'jpeg', 'PNG', 'JPG'];

async function openLightbox(folderName) {
    const mainImg = document.getElementById('main-lb-img');
    const thumbContainer = document.getElementById('lb-thumbnails');
    const title = document.getElementById('lb-title');
    
    thumbContainer.innerHTML = 'Wczytywanie...'; // Mały feedback dla użytkownika
    title.innerText = "Dzieło: " + folderName;

    // 1. Szukamy zdjęcia głównego (obrazX.rozszerzenie)
    const mainPath = await findProperPath(`img/${folderName}/${folderName}`);
    
    if (mainPath) {
        mainImg.src = mainPath;
        thumbContainer.innerHTML = ''; // Czyścimy komunikat wczytywania
        addThumb(mainPath, thumbContainer, mainImg);
    } else {
        thumbContainer.innerHTML = 'Nie znaleziono zdjęcia głównego (.png lub .jpg)';
        return;
    }

    // 2. Szukamy dodatkowych zdjęć (obrazX-1, obrazX-2...)
    for (let i = 1; i <= 10; i++) {
        const extraPath = await findProperPath(`img/${folderName}/${folderName}-${i}`);
        
        if (extraPath) {
            addThumb(extraPath, thumbContainer, mainImg);
        } else {
            break; // Jeśli nie ma kolejnego numeru w żadnym formacie, kończymy
        }
    }
}

// Funkcja pomocnicza, która "testuje" rozszerzenia jedno po drugim
async function findProperPath(basePath) {
    for (let ext of formats) {
        const fullPath = `${basePath}.${ext}`;
        const exists = await new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = fullPath;
        });
        if (exists) return fullPath;
    }
    return null; // Jeśli żadne rozszerzenie nie zadziałało
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
    if (event.target == document.getElementById('lightbox')) closeLightbox();
}
