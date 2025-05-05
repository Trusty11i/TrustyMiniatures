let products = [];

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
  'vtuber': 'В-Тюберы'
};

// Загрузка данных
fetch('/data/products.json')
  .then(res => res.json())
  .then(data => {
    products = data;
  })
  .catch(err => console.error('Ошибка при загрузке товаров:', err));

// Поиск и отображение подсказок
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('#main-search-input');
  const suggestionsContainer = document.querySelector('.search-suggestions');
  const showNsfwContent = localStorage.getItem('showNsfwContent') === 'true';
  const nsfwConfirmed = localStorage.getItem('nsfwConfirmed') === 'true';

  if (!searchInput || !suggestionsContainer) {
    console.warn('Элементы #main-search-input или .search-suggestions не найдены.');
    return;
  }

  suggestionsContainer.style.display = 'none';

  searchInput.addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    suggestionsContainer.innerHTML = '';

    if (!query || products.length === 0) {
      suggestionsContainer.style.display = 'none';
      return;
    }

    const matches = products.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(query);
      const ruNameMatch = p['ru-name']?.toLowerCase().includes(query);
      const tagMatch = p.tags?.some(tag => {
        const tagLower = tag.toLowerCase();
        const tagRu = (tagLabels[tag] || '').toLowerCase();
        return tagLower.includes(query) || tagRu.includes(query);
      });

      return nameMatch || ruNameMatch || tagMatch;
    }).slice(0, 3);

    if (matches.length === 0) {
      suggestionsContainer.style.display = 'none';
      return;
    }

    suggestionsContainer.style.display = 'block';

    matches.forEach(product => {
      const isNsfw = product.tags?.includes('nsfw');
      const item = document.createElement('div');
      item.className = 'suggestion-item';

      const imgHtml = `
        <img src="${product.image}" alt="${product.name}" style="${isNsfw && !showNsfwContent ? 'filter: blur(2px);' : ''}">
      `;

      item.innerHTML = `
        <a href="#" class="suggestion-link">
          ${imgHtml}
          <span>${product.name}</span>
        </a>
      `;

      item.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();

        if (isNsfw && !showNsfwContent && !nsfwConfirmed) {
          const confirmed = confirm("Этот контент содержит материалы 18+. Вы уверены, что хотите продолжить?");
          if (!confirmed) return;
          localStorage.setItem('nsfwConfirmed', 'true');
        }

        window.location.href = product.url;
      });

      suggestionsContainer.appendChild(item);
    });
  });

  // Скрытие подсказок при потере фокуса
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      suggestionsContainer.style.display = 'none';
    }, 150);
  });

  searchInput.addEventListener('focus', () => {
    if (suggestionsContainer.children.length > 0) {
      suggestionsContainer.style.display = 'block';
    }
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.search__bar__container'); // Класс формы обновлен
  const input = document.querySelector('#main-search-input');

  if (form && input) {
    form.addEventListener('submit', e => {
      e.preventDefault();  // Перехватываем отправку формы
      const query = input.value.trim();
      if (query) {
        const encoded = encodeURIComponent(query);
        window.location.href = `/search-page/search-page.html?search=${encoded}`;  // Переход на страницу с корректным параметром
      }
    });
  }
});
