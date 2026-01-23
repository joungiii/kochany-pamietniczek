/* Zaktualizuj tylko te fragmenty odpowiedzialne za Zoom i Drag */

document.addEventListener('DOMContentLoaded', () => {
    const zoomBox = document.getElementById('zoom-container');
    const img = document.getElementById('main-lb-img');

    if(zoomBox) {
        // SCROLLOWANIE (Zoom)
        zoomBox.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.3 : 0.3;
            changeZoom(delta);
        }, { passive: false });

        // KLIKNIĘCIE I TRZYMANIE (Start Drag)
        zoomBox.addEventListener('mousedown', (e) => {
            if (scale <= 1) return; // Przesuwamy tylko jeśli jest przybliżenie
            isDragging = true;
            zoomBox.style.cursor = 'grabbing';
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            e.preventDefault(); 
        });
    }
});

// RUCH MYSZKĄ (Wykonywany tylko gdy isDragging jest true)
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    
    applyTransform();
});

// PUSZCZENIE PRZYCISKU (Koniec Drag)
window.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        const zoomBox = document.getElementById('zoom-container');
        if(zoomBox) zoomBox.style.cursor = 'grab';
    }
});

// ZABEZPIECZENIE: Jeśli myszka ucieknie poza okno przeglądarki
window.addEventListener('mouseleave', () => {
    isDragging = false;
});

function applyTransform() {
    const img = document.getElementById('main-lb-img');
    const cont = document.getElementById('zoom-container');
    if (!img || !cont) return;

    // "Hamulce" - żeby nie wyjechać obrazkiem poza szarą ramkę
    if (scale > 1) {
        const maxW = (cont.offsetWidth * scale - cont.offsetWidth) / 2;
        const maxH = (cont.offsetHeight * scale - cont.offsetHeight) / 2;
        
        if (translateX > maxW) translateX = maxW;
        if (translateX < -maxW) translateX = -maxW;
        if (translateY > maxH) translateY = maxH;
        if (translateY < -maxH) translateY = -maxH;
    } else {
        translateX = 0;
        translateY = 0;
    }

    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}
