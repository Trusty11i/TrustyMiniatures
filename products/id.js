document.addEventListener('DOMContentLoaded', function () {
  const productPage = document.querySelector('.product-page');
  if (!productPage) return;

  const productId = productPage.dataset.id;

  fetch('/data/products.json')
    .then(res => res.json())
    .then(products => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      // --- 1. Заполнение информации на странице ---
      function populateProductInfo(product) {
        document.getElementById('name').textContent = product.name || 'Не указано';
        document.getElementById('availability').textContent = product.availability || 'Не указано';
        document.getElementById('price').textContent = product.price || 'Не указано';
        document.getElementById('height').textContent = product.height || 'Не указано';
        document.getElementById('tags').textContent = product.tags?.join(', ') || 'Нет тегов';
        document.getElementById('origin').textContent = product.origin || 'Не указано';
        document.getElementById('studio').textContent = product.studio || 'Не указано';

        // Обновляем с единицами измерения
        const infoItems = document.querySelectorAll('.product-info-item');
        infoItems.forEach(item => {
          const title = item.querySelector('.product-info-title');
          const detail = item.querySelector('.product-info-detail');

          if (title && detail) {
            const label = title.textContent.trim();
            if (label === 'Цена') detail.textContent = `${product.price} ₽`;
            if (label === 'Высота') detail.textContent = `${product.height} см`;
          }
        });
      }

      // --- 2. Генерация schema.org микроразметки ---
      function insertSchemaMarkup(product) {
        const baseUrl = window.location.origin; // "https://trustyminiatures.ru"

        const schema = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product["ru-name"] || product.name,
          "image": [`${baseUrl}${product.image}`],
          "description": `${product["ru-name"] || product.name} — фигурка из ${product.origin}, высота ${product.height} см.`,
          "brand": {
            "@type": "Brand",
            "name": "TrustyMiniatures"
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "RUB",
            "price": product.price,
            "availability": product.availability.toLowerCase().includes('заказ') ?
              "https://schema.org/PreOrder" :
              "https://schema.org/InStock",
              "url": `${baseUrl}${product.url}`,
          }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
      }

      // --- Вызов функций ---
      populateProductInfo(product);
      insertSchemaMarkup(product);
    })
    .catch(error => {
      console.error('Ошибка при загрузке данных товара:', error);
    });
});
