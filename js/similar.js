document.addEventListener('DOMContentLoaded', function () {
    const productPage = document.querySelector('.product-page');
    if (!productPage) return;

    const productId = productPage.getAttribute('data-id');

    fetch('/data/products.json')
        .then(response => response.json())
        .then(products => {
            function getSimilarProducts() {
                const currentProduct = products.find(product => product.id === productId);
                if (!currentProduct) return [];

                function nameSimilarity(name1, name2) {
                    const words1 = name1.toLowerCase().split(/\s+/);
                    const words2 = name2.toLowerCase().split(/\s+/);
                    const commonWords = words1.filter(word => words2.includes(word));
                    return commonWords.length / Math.max(words1.length, 1);
                }

                const otherProducts = products.filter(p => p.id !== productId);

                const scored = otherProducts.map(p => {
                    const nameScore = nameSimilarity(p.name, currentProduct.name);
                    const tagScore = currentProduct.tags.filter(tag => p.tags.includes(tag)).length;
                    return {
                        product: p,
                        nameScore,
                        tagScore,
                        totalScore: nameScore * 2 + tagScore
                    };
                });

                return scored
                    .filter(s => s.totalScore > 0)
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map(s => s.product)
                    .slice(0, 12); // Всего максимум 12
            }

            function renderSimilarProducts() {
                const similarProducts = getSimilarProducts();
                const sections = document.querySelectorAll('.product-similar');

                if (similarProducts.length === 0 || sections.length < 2) {
                    sections.forEach(section => {
                        section.innerHTML = '<p>Похожие товары не найдены.</p>';
                    });
                    return;
                }

                const firstSix = similarProducts.slice(0, 6);
                const secondSix = similarProducts.slice(6, 12);

                const renderTo = (productsArray, section) => {
                    const html = productsArray.map(product => {
                        const imageId = `similar-img-${product.id}`;
                        return `
                            <div class="product-similar-item">
                                <a href="${product.url}">
                                    <img id="${imageId}" src="${product.image}" alt="${product.name}" class="product-similar-image">
                                    <h3 class="product-similar-name">${product.name}</h3>
                                    <p class="product-similar-price">${product.price} руб.</p>
                                </a>
                            </div>
                        `;
                    }).join('');
                    section.innerHTML = html;

                    // JS-блюр после вставки
                    productsArray.forEach(product => {
                        const isNSFW = product.tags.includes('nsfw');
                        const showNSFW = localStorage.getItem('showNSFW') === 'true';
                        const img = document.getElementById(`similar-img-${product.id}`);

                        if (img && isNSFW && !showNSFW) {
                            img.style.filter = 'blur(4px)';
                            img.style.pointerEvents = 'none';
                            img.title = '18+ контент скрыт';
                        }
                    });

                    // Логика скрытия элементов, если они не помещаются в контейнер
                    const checkOverflow = () => {
                        const containerWidth = section.offsetWidth;
                        const itemWidth = section.querySelector('.product-similar-item').offsetWidth;
                        const itemsPerRow = Math.floor(containerWidth / (itemWidth + 10));

                        // Если элементов больше, чем можно разместить в одной строке
                        const items = section.querySelectorAll('.product-similar-item');
                        items.forEach((item, index) => {
                            if (index >= itemsPerRow) {
                                item.style.display = 'none'; // Прячем элемент
                            } else {
                                item.style.display = ''; // Показываем элемент
                            }
                        });
                    };

                    // Проверка после рендеринга
                    checkOverflow();

                    // Обработчик для изменения размера окна
                    window.addEventListener('resize', checkOverflow);
                };

                renderTo(firstSix, sections[0]);
                renderTo(secondSix, sections[1]);
            }

            renderSimilarProducts();
        })
        .catch(error => {
            console.error('Ошибка при загрузке товаров:', error);
        });
});
