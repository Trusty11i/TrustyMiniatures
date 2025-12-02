document.addEventListener('DOMContentLoaded', () => {
  const filtersPanel = document.getElementById('filters-panel');
  const filtersToggle = document.querySelector('.filters-btn');
  const filtersClose = null;
  const applyBtn = document.getElementById('apply-filters-btn');
  const resetBtn = document.getElementById('reset-filters-btn');
  const searchInput = document.getElementById('search-input');
  const productsContainer = document.querySelector('.search-results');
  const bodyEl = document.body;

  let products = [];
  const mapCategory = {
    gender: { female:['woman'], male:['man'] },
    adult: { adult:['nsfw'] },
    category: { anime:['anime','manga'], games:['games'] }
  };

  const tagLabels = { 'nsfw':'18+', 'woman':'Женские персонажи','man':'Мужские персонажи','anime':'Аниме','games':'Игры'};

  function applyNSFWBlur() {
    const { showNSFW=false } = JSON.parse(localStorage.getItem('profileSettings'))||{};
    document.querySelectorAll('.product-card.nsfw img').forEach(img=>{
      img.classList.toggle('blurred',!showNSFW);
    });
  }

  function handleNSFWClick(e) {
    const card = e.currentTarget;
    if(card.classList.contains('nsfw')) {
      if(!confirm("Подтвердите, что вам есть 18 лет.")) e.preventDefault();
    }
  }

  function readSelectedFilters() {
    const genders = Array.from(document.querySelectorAll('input[name="gender"]:checked')).map(i=>i.value);
    const adults = Array.from(document.querySelectorAll('input[name="adult"]:checked')).map(i=>i.value);
    const categories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(i=>i.value);
    const height = (document.querySelector('input[name="height"]:checked')||{}).value||'';
    const priceMin = parseInt(document.getElementById('price-min')?.value,10)||0;
    const priceMaxRaw = document.getElementById('price-max')?.value;
    const priceMax = priceMaxRaw===''||priceMaxRaw==null?Infinity:parseInt(priceMaxRaw,10);
    return {genders,adults,categories,height,priceMin,priceMax};
  }

  function heightToRange(value){
    switch(value){
      case 'lt10': return {min:0,max:9.999};
      case '10-20': return {min:10,max:20};
      case '20-30': return {min:20,max:30};
      case 'gt30': return {min:30.001,max:Infinity};
      default: return {min:0,max:Infinity};
    }
  }

  function applyFilters(query=''){
    const q=(query||searchInput.value||'').toLowerCase().trim();
    const sel=readSelectedFilters();
    const heightRange=heightToRange(sel.height);

    const filtered = products.filter(p=>{
      const name=(p.name||'').toLowerCase();
      const ruName=(p['ru-name']||'').toLowerCase();
      const tags=(p.tags||[]).map(t=>String(t).toLowerCase());
      const matchesQuery = !q || [name, ruName, ...tags, ...tags.map(t => tagLabels[t] || '')]
        .some(field => String(field || '').toLowerCase().includes(q));
      if(!matchesQuery) return false;
      if(typeof p.price==='number'){if(p.price<sel.priceMin||p.price>sel.priceMax)return false;}
      const h=parseFloat(p.height||0); if(h<heightRange.min||h>heightRange.max)return false;
      if(sel.genders.length){if(!sel.genders.some(g=>(mapCategory.gender[g]||[]).some(t=>tags.includes(t))))return false;}
      if(sel.adults.length){if(!sel.adults.some(a=>(mapCategory.adult[a]||[]).some(t=>tags.includes(t))))return false;}
      if(sel.categories.length){if(!sel.categories.some(c=>(mapCategory.category[c]||[]).some(t=>tags.includes(t))))return false;}
      return true;
    });
    renderProducts(filtered);
  }

  function updateProductCount(count){
    const box=document.getElementById("product-count");
    if(!box) return;
    box.textContent=count?`Показано товаров: ${count}`:'Ничего не найдено';
  }

  function renderProducts(items){
    productsContainer.innerHTML='';
    updateProductCount(items.length);
    if(items.length===0){
      const msg=document.createElement('div');
      msg.className='no-results-message';
      msg.textContent='Ничего не найдено.';
      productsContainer.appendChild(msg);
      return;
    }
    items.forEach(product=>{
      const card=document.createElement('div');
      card.className='product-card';
      if((product.tags||[]).map(t=>String(t).toLowerCase()).includes('nsfw'))card.classList.add('nsfw');
      const link=document.createElement('a'); link.href=product.url||'#'; link.className='product-card__link';
      const img=document.createElement('img'); img.src=product.image||''; img.alt=product.name||'';
      const title=document.createElement('h4'); title.textContent=product.name||product['ru-name']||'—';
      const price=document.createElement('p'); price.textContent=product.price?`${product.price} ₽`:'';
      link.append(img,title,price); card.appendChild(link); card.addEventListener('click',handleNSFWClick);
      productsContainer.appendChild(card);
    });
    applyNSFWBlur();
  }

  function resetFilters(){
    document.querySelectorAll('#filters-panel input[type="checkbox"]').forEach(i=>i.checked=false);
    document.querySelectorAll('#filters-panel input[type="radio"]').forEach(i=>i.value===''?i.checked=true:i.checked=false);
    document.getElementById('price-min').value='';
    document.getElementById('price-max').value='';
    applyFilters();
  }

  // события
 // События для кнопок панели фильтров
filtersToggle?.addEventListener('click', () => {
  // переключаем видимость панели
  filtersPanel.classList.toggle('show');
  bodyEl.classList.toggle('filters-open');
  filtersPanel.setAttribute('aria-hidden', !filtersPanel.classList.contains('show'));
});

applyBtn?.addEventListener('click', e => {
  e.preventDefault();
  applyFilters();
  // на мобильных скрываем панель после применения
  if (window.innerWidth <= 650) {
    filtersPanel.classList.remove('show');
    bodyEl.classList.remove('filters-open');
    filtersPanel.setAttribute('aria-hidden', 'true');
  }
});

resetBtn?.addEventListener('click', e => {
  e.preventDefault();
  resetFilters();
});

  searchInput?.addEventListener('input',e=>applyFilters(e.target.value));
  document.querySelectorAll('#filters-panel input.filter-control, #filters-panel input.price-input').forEach(el=>{el.addEventListener('input',()=>applyFilters()); el.addEventListener('change',()=>applyFilters());});

  // клик вне панели на мобилке
  document.addEventListener('click',e=>{
    if(window.innerWidth<=650&&!filtersPanel.classList.contains('hidden')&&!filtersPanel.contains(e.target)&&!filtersToggle.contains(e.target)){
      filtersPanel.classList.add('hidden'); bodyEl.classList.remove('filters-open'); filtersPanel.setAttribute('aria-hidden','true');
    }
  });

  // загрузка товаров
  fetch('/data/products.json')
    .then(res=>res.json())
    .then(data=>{products=data||[]; renderProducts(products); const q=new URLSearchParams(window.location.search).get('search')||''; if(q){searchInput.value=decodeURIComponent(q); applyFilters(q);}})
    .catch(err=>{console.error(err); productsContainer.innerHTML='<div class="no-results-message">Ошибка загрузки данных.</div>';});

});
