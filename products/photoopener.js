function initLightbox() {
    const thumbnails = document.querySelectorAll('.product-thumb');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox__img');
    const closeBtn = lightbox.querySelector('.lightbox__close');
    const prevBtn = lightbox.querySelector('.lightbox__prev');
    const nextBtn = lightbox.querySelector('.lightbox__next');
  
    let currentIndex = 0;
    const imageSources = Array.from(thumbnails).map(img => {
      return img.dataset.fullsize || img.src; // берём data-fullsize, если есть, иначе src
    });
  
    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        currentIndex = index;
        openLightbox();
      });
    });
  
    function openLightbox() {
      lightboxImg.src = imageSources[currentIndex];
      lightbox.style.display = 'flex';
      updateControls();
    }
  
    function closeLightbox() {
      lightbox.style.display = 'none';
    }
  
    function showNext() {
      if (currentIndex < imageSources.length - 1) {
        currentIndex++;
        lightboxImg.src = imageSources[currentIndex];
        updateControls();
      }
    }
  
    function showPrev() {
      if (currentIndex > 0) {
        currentIndex--;
        lightboxImg.src = imageSources[currentIndex];
        updateControls();
      }
    }
  
    function updateControls() {
      prevBtn.style.display = currentIndex === 0 ? 'none' : 'block';
      nextBtn.style.display = currentIndex === imageSources.length - 1 ? 'none' : 'block';
    }
  
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);
  
    document.addEventListener('keydown', (e) => {
      if (lightbox.style.display === 'flex') {
        if (e.key === 'ArrowRight' && currentIndex < imageSources.length - 1) showNext();
        if (e.key === 'ArrowLeft' && currentIndex > 0) showPrev();
        if (e.key === 'Escape') closeLightbox();
      }
    });
  }
  

fetch('/products/photoopener.html')
  .then(response => response.text())
  .then(data => {
    document.body.insertAdjacentHTML('beforeend', data);
    initLightbox();
  });
