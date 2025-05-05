function getFilterValues() {
  return {
    selectedTags: Array.from(document.querySelectorAll('.filter-checkboxes input:checked')).map(cb => cb.value),
    priceMin: parseInt(document.getElementById('price-min-input')?.value, 10) || 0,
    priceMax: parseInt(document.getElementById('price-max-input')?.value, 10) || Infinity,
    heightMin: parseInt(document.getElementById('height-min-input')?.value, 10) || 0,
    heightMax: parseInt(document.getElementById('height-max-input')?.value, 10) || Infinity,
  };
}

// 2. Применение фильтров и поиска
function applyFilters(query = '') {
  const { selectedTags, priceMin, priceMax, heightMin, heightMax } = getFilterValues();
  const lowerQuery = query.toLowerCase();

  const filtered = products.filter(p => {
    const name = p.name?.toLowerCase() || '';
    const ruName = p['ru-name']?.toLowerCase() || '';
    const tags = p.tags || [];

    const matchesQuery = [name, ruName, ...tags.map(t => t.toLowerCase()), ...tags.map(t => tagLabels[t]?.toLowerCase() || '')]
      .some(field => field.includes(lowerQuery));

    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => tags.includes(tag));
    const matchesPrice = p.price >= priceMin && p.price <= priceMax;
    const matchesHeight = p.height >= heightMin && p.height <= heightMax;

    return matchesQuery && matchesTags && matchesPrice && matchesHeight;
  });

  renderProducts(filtered);
}

// 3. NSFW логика
function applyNSFWBlur() {
  const { showNSFW = false } = JSON.parse(localStorage.getItem('profileSettings')) || {};
  document.querySelectorAll('.product-card.nsfw img').forEach(img => {
    img.classList.toggle('blurred', !showNSFW);
  });
}

function handleNSFWClick(event) {
  const card = event.currentTarget;
  if (card.classList.contains('nsfw')) {
    if (!confirm("Подтвердите, что вам есть 18 лет для просмотра данного товара.")) {
      event.preventDefault();
    }
  }
}

document.getElementById('toggle-nsfw')?.addEventListener('click', () => {
  const settings = JSON.parse(localStorage.getItem('profileSettings')) || {};
  settings.showNSFW = !settings.showNSFW;
  localStorage.setItem('profileSettings', JSON.stringify(settings));
  applyNSFWBlur();
});

// 4. Рендер товаров
function renderProducts(items) {
  const container = document.querySelector('.search-results');
  if (!container) return;

  container.innerHTML = '';

  document.querySelector('.no-results-message')?.remove();

  if (items.length === 0) {
    const msg = document.createElement('div');
    msg.classList.add('no-results-message');
    msg.textContent = 'Ничего не найдено. Попробуйте применить другие фильтры';
    container.appendChild(msg);
    return;
  }

  items.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    if (product.tags?.includes('nsfw')) card.classList.add('nsfw');

    const link = document.createElement('a');
    link.href = product.url;
    link.classList.add('product-card__link');

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;

    const title = document.createElement('h4');
    title.textContent = product.name;

    const price = document.createElement('p');
    price.textContent = `${product.price} ₽`;

    link.append(img, title, price);
    card.appendChild(link);
    card.addEventListener('click', handleNSFWClick);
    container.appendChild(card);
  });

  applyNSFWBlur();
}

// 5. Глобальные данные и загрузка
let products = [];

fetch('/data/products.json')
  .then(res => res.json())
  .then(data => {
    products = data;
    renderProducts(products);
    generateFilters(products);
    checkURLSearchQuery();
  })
  .catch(err => console.error('Ошибка при загрузке данных:', err));

// 6. Метки тегов
const tagLabels = {
  'anime': 'Аниме', 
  'jujutsu kaisen': 'Магическая Битва',
  'chainsaw man': 'Человек Бензопила',
  'konosuba': 'KonoSuba',
  'frieren': 'Провожающая в последний путь Фрирен',
  'dandadan': 'Dandadan',
  'ngnl': 'No Game No Life',
  'record of lodoss war': 'Record of Lodoss War',
  'arcane': 'Arcane',
  'games': 'Из Игр',
  'genshin impact': 'Genshin Impact',
  'league of legends': 'League of Legends',
  'zzz': 'Zenless Zone Zero',
  'nier automata': 'NieR: Automata',
  'mario': 'Super Mario',
  'honkai': 'Honkai',
  'dmc': 'Devil May Cry',
  'pokemon': 'Pokémon',
  'overwatch': 'Overwatch',
  'nsfw': 'NSFW (18+)',
  'woman': 'Женские персонажи',
  'man': 'Мужские персонажи',
  'furry': 'Фурри',
  'chibi': 'Чиби',
  'vocaloid': 'Vocaloid / UTAU',
  'demon': 'Демоны',
  'music': 'Музыка',
  'guns': 'Пушки',
  'marvel': 'Марвел',
  'creepy': 'Крипово',
  'hololive': 'Hololive',
  'versions': 'Несколько версий',
  'vtuber': 'В-Тюберы',
  'real': 'С реальными фото',
};

const hiddenTags = ['fungus', 'devil', 'samurai', 'seven deadly sins', 'hatsune miku', 'creepy', 'manga'];

// 7. Генерация фильтров
function generateFilters(data) {
  const allTags = new Set(data.flatMap(p => p.tags));
  const categorizedTags = {
    anime: ['anime', 'manga', 'jujutsu kaisen', 'chainsaw man', 'konosuba', 'frieren', 'dandadan', 'ngnl', 'record of lodoss war', 'arcane'],
    games: ['games', 'genshin impact', 'league of legends', 'zzz', 'nier automata', 'mario', 'honkai', 'dmc', 'pokemon', 'overwatch'],
    popular: ['nsfw', 'woman', 'man', 'furry', 'real'],
    other: []
  };

  allTags.forEach(tag => {
    if (hiddenTags.includes(tag)) return;
    if (!Object.values(categorizedTags).some(cat => cat.includes(tag))) {
      categorizedTags.other.push(tag);
    }
  });

  Object.entries(categorizedTags).forEach(([category, tags]) => {
    const container = document.querySelector(`.filter-checkboxes[data-category="${category}"]`);
    if (!container) return;

    const filteredTags = tags.filter(tag => !hiddenTags.includes(tag));
    const [visibleTags, extraTags] = [filteredTags.slice(0, 6), filteredTags.slice(6)];

    visibleTags.sort().forEach(tag => {
      container.insertAdjacentHTML('beforeend', `<label><input type="checkbox" value="${tag}"> ${tagLabels[tag] || tag}</label>`);
    });

    if (extraTags.length > 0) {
      const hiddenDiv = document.createElement('div');
      hiddenDiv.classList.add('hidden-tags');
      hiddenDiv.style.display = 'none';
      extraTags.sort().forEach(tag => {
        hiddenDiv.innerHTML += `<label><input type="checkbox" value="${tag}"> ${tagLabels[tag] || tag}</label>`;
      });
      container.appendChild(hiddenDiv);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('show-more-btn');
      btn.textContent = 'Показать все';
      btn.onclick = () => {
        hiddenDiv.style.display = hiddenDiv.style.display === 'none' ? 'block' : 'none';
        btn.textContent = hiddenDiv.style.display === 'none' ? 'Показать все' : 'Скрыть';
      };
      container.appendChild(btn);
    }
  });
}

// 8. Слушатели поиска и кнопки "Применить фильтры"
document.getElementById('apply-filters-btn')?.addEventListener('click', () => {
  const query = document.getElementById('search-input')?.value || '';
  applyFilters(query);
});

document.getElementById('search-input')?.addEventListener('input', (e) => {
  applyFilters(e.target.value);
});

// 9. Поиск из URL
function checkURLSearchQuery() {
  const query = new URLSearchParams(window.location.search).get('search');
  if (query) {
    const input = document.getElementById('search-input');
    if (input) input.value = decodeURIComponent(query);
    applyFilters(query);
  }
}