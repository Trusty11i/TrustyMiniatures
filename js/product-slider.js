import vars from './_vars.js';

document.querySelectorAll('.product-slider__thumbs').forEach(container => {
    container.addEventListener('click', (e) => {
        const img = e.target.closest('.product-slider__thumb')?.querySelector('img');
        if (img && vars.$sliderImg) vars.$sliderImg.src = img.src;
    });
});
