// Swiper initialization
if (typeof Swiper !== 'undefined') {
  const swiper = new Swiper('.slider-container', {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: {
      delay: 3000,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    spaceBetween: 50,
    slidesPerView: 'auto',
    centeredSlides: true,
  });

  // Slide click handler
  document.querySelectorAll('.swiper-slide').forEach(slide => {
    slide.addEventListener('click', function () {
      const index = parseInt(slide.getAttribute('data-index'));
      swiper.slideTo(index);
    });
  });
}


// Loading header and footer only once (if needed)
document.addEventListener('DOMContentLoaded', async function () {
  // Only load if necessary
  if (document.getElementById('header-placeholder') && document.getElementById('footer-placeholder')) {
    await loadHeader();
    await loadFooter();
  }
});

async function loadHeader() {
  const headerResponse = await fetch('/header.html');
  const headerData = await headerResponse.text();
  document.getElementById('header-placeholder').innerHTML = headerData;
}

async function loadFooter() {
  const footerResponse = await fetch('/footer.html');
  const footerData = await footerResponse.text();
  document.getElementById('footer-placeholder').innerHTML = footerData;
}


document.addEventListener('DOMContentLoaded', async function () {
  await loadHeader(); // Ждём, пока хедер загрузится
  setupBurgerMenu();  // Настроим меню после загрузки

  function loadHeader() {
      return fetch('/header.html')
          .then(response => response.text())
          .then(data => {
              document.getElementById('header-placeholder').innerHTML = data;
          })
          .catch(error => console.error('Ошибка загрузки хедера:', error));
  }

  function setupBurgerMenu() {
      const burgerButton = document.querySelector('.header__burger');
      const popupMenu = document.getElementById('popup-menu');

      if (burgerButton && popupMenu) {
          burgerButton.addEventListener('click', () => {
              burgerButton.classList.toggle('open');
              popupMenu.classList.toggle('open');
          });
      } else {
          console.error('Не удалось найти кнопку или меню.');
      }
  }
});
