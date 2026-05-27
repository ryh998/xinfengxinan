// Xinfeng Xinan - Product Renderer
// ========== URL Helpers ==========
function getUrlParam(name) {
  var q = window.location.search.substring(1);
  var pairs = q.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var p = pairs[i].split('=');
    if (decodeURIComponent(p[0]) === name) return decodeURIComponent(p[1] || '');
  }
  return null;
}

// ========== Product Lookup ==========
function getProductBySeriesAndName(seriesId, variantName) {
  var s = PRODUCTS_DATA[seriesId];
  if (!s) return null;
  variantName = decodeURIComponent(variantName);
  for (var i = 0; i < s.variants.length; i++) {
    if (s.variants[i].name === variantName) {
      return Object.assign({ seriesId: seriesId, seriesName: s.name, seriesNameEn: s.nameEn }, s.variants[i]);
    }
  }
  return null;
}

function getAllProducts() {
  var all = [];
  for (var sid in PRODUCTS_DATA) {
    var s = PRODUCTS_DATA[sid];
    s.variants.forEach(function(v) {
      all.push(Object.assign({ seriesId: sid, seriesName: s.name, seriesNameEn: s.nameEn }, v));
    });
  }
  return all;
}

// ========== Product Card HTML ==========
function renderProductCard(variant, seriesId, seriesName, seriesNameEn) {
  const currentLang = (typeof I18N !== 'undefined' ? I18N.getCurrentLang() : 'en');
  const seriesDisplay = currentLang === 'zh' ? seriesName : seriesNameEn;
  const colorName = currentLang === 'zh' ? (variant.colorZh || variant.color) : variant.color;
  const productName = currentLang === 'zh' ? variant.name : (variant.nameEn || variant.name);
  const finishName = currentLang === 'zh' ? (variant.specs.finishZh || variant.specs.finish) : variant.specs.finish;
  
  var detailLink = 'product-detail.html?series=' + seriesId + '&variant=' + encodeURIComponent(variant.name);
  
  // Normalize sizes for filtering
  var sizeKey = variant.specs.size ? variant.specs.size.replace(/[×xX×]/g, 'x').replace(/\s+/g, '') : '';
  var thickKey = variant.specs.thickness ? variant.specs.thickness.replace(/\s+/g, '') : '';
  var appKey = variant.specs.application || '';
  
  var catHtml = '';
  if (variant.category) {
    catHtml = '<span class="product-category" style="display:block;font-size:11px;color:var(--medium-gray);margin-bottom:4px">' + variant.category + '</span>';
  }
  
  return `
    <div class="product-card reveal" 
      data-series="${seriesId}" 
      data-category="${variant.category || ''}" 
      data-color="${variant.color}"
      data-size="${sizeKey}"
      data-thickness="${thickKey}"
      data-application="${appKey}"
      data-finish="${variant.specs.finish || ''}">
      <div class="product-img">
        <a href="${detailLink}">
          <img src="${variant.primary}" alt="${productName}" loading="lazy">
        </a>
        <div class="product-badge" style="background: ${variant.colorHex}">${colorName}</div>
      </div>
      <div class="product-info">
        <span class="product-series">${seriesDisplay}</span>
        <h3 class="product-name">${productName}</h3>
        ${catHtml}
        <div class="product-specs">
          <span class="product-spec">${variant.specs.size}</span>
          <span class="product-spec">${variant.specs.thickness}</span>
          <span class="product-spec">${finishName}</span>
        </div>
        <div class="product-color-row">
          <span class="color-dot" style="background: ${variant.colorHex}"></span>
          <span class="color-name">${colorName}</span>
          ${variant.specs.model ? '<span class="product-model">' + variant.specs.model + '</span>' : ''}
        </div>
        <a href="${detailLink}" class="product-link">
          <span data-i18n="view_details">View Details</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </div>
  `;
}

// ========== Series Filter HTML ==========
function renderSeriesFilters(activeSeries) {
  let html = `<button class="filter-btn active" data-series="all" data-i18n="filter_all">All Series</button>`;
  for (const sid in PRODUCTS_DATA) {
    const s = PRODUCTS_DATA[sid];
    const isActive = sid === activeSeries;
    html += `<button class="filter-btn${isActive ? ' active' : ''}" data-series="${sid}">${s.nameEn}</button>`;
  }
  return html;
}

// ========== Series Tab Navigation ==========
function renderSeriesTabs(activeSeries) {
  let html = '';
  for (const sid in PRODUCTS_DATA) {
    const s = PRODUCTS_DATA[sid];
    const isActive = sid === activeSeries;
    html += `<button class="series-tab${isActive ? ' active' : ''}" data-series="${sid}">${s.nameEn}</button>`;
  }
  return html;
}

// ========== Color Name Helper ==========
function getChineseColor(colorName) {
  const map = {
    'White': '白色',
    'Light Gray': '浅灰',
    'Medium Gray': '中灰',
    'Dark Gray': '深灰',
    'Black': '黑色',
    'Beige': '米黄',
    'Cream': '米白',
    'Brown': '棕色',
    'Red': '红色',
    'Green': '绿色',
    'Yellow': '黄色',
    'Blue': '蓝色',
    'Gray': '灰色',
    'Floral': '花式',
    'Natural': '自然色',
    'Black Gold': '黑金'
  };
  return map[colorName] || colorName;
}

// ========== Comprehensive Filter System ==========
// Track active filters
var activeFilters = {
  series: 'all',
  size: '',
  thickness: '',
  application: '',
  finish: '',
  color: ''
};

function applyFilters() {
  var cards = document.querySelectorAll('.product-card');
  var count = 0;
  
  cards.forEach(function(card) {
    var show = true;
    
    // Series filter
    if (activeFilters.series !== 'all' && card.dataset.series !== activeFilters.series) {
      show = false;
    }
    
    // Size filter
    if (show && activeFilters.size && card.dataset.size.indexOf(activeFilters.size) === -1) {
      show = false;
    }
    
    // Thickness filter
    if (show && activeFilters.thickness && card.dataset.thickness.indexOf(activeFilters.thickness) === -1) {
      show = false;
    }
    
    // Application filter
    if (show && activeFilters.application && card.dataset.application !== activeFilters.application) {
      show = false;
    }
    
    // Finish filter
    if (show && activeFilters.finish && card.dataset.finish !== activeFilters.finish) {
      show = false;
    }
    
    // Color filter
    if (show && activeFilters.color && card.dataset.color !== activeFilters.color) {
      show = false;
    }
    
    card.style.display = show ? '' : 'none';
    if (show) count++;
  });
  
  // Update count
  var countEl = document.getElementById('productCount');
  if (countEl) countEl.textContent = count;
  
  return count;
}

function setFilter(type, value) {
  activeFilters[type] = value;
  
  // Update sidebar visual
  var group = document.querySelectorAll('[data-filter-type="' + type + '"]');
  group.forEach(function(el) {
    el.classList.toggle('active', el.dataset.filterValue === value);
  });
  
  applyFilters();
  updateActiveTags();
}

function resetFilters() {
  activeFilters = { series: 'all', size: '', thickness: '', application: '', finish: '', color: '' };
  
  document.querySelectorAll('[data-filter-type]').forEach(function(el) {
    if (el.dataset.filterValue === 'all' || (el.dataset.filterType === 'series' && el.dataset.filterValue === 'all')) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
  
  document.querySelectorAll('.color-swatch').forEach(function(s) { s.classList.remove('active'); });
  
  applyFilters();
  updateActiveTags();
}

function updateActiveTags() {
  var container = document.getElementById('activeFilterTags');
  if (!container) return;
  
  var html = '';
  for (var key in activeFilters) {
    if (activeFilters[key] && activeFilters[key] !== 'all') {
      html += '<span class="active-filter-tag" onclick="clearFilter(\'' + key + '\')">' + activeFilters[key] + 
        ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>';
    }
  }
  container.innerHTML = html;
}

function clearFilter(type) {
  activeFilters[type] = (type === 'series') ? 'all' : '';
  
  document.querySelectorAll('[data-filter-type="' + type + '"]').forEach(function(el) {
    if (el.dataset.filterValue === (type === 'series' ? 'all' : '')) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
  
  applyFilters();
  updateActiveTags();
}

function initSidebarFilters() {
  // Series filters
  document.querySelectorAll('.filter-option[data-filter-type="series"]').forEach(function(el) {
    el.addEventListener('click', function() {
      var val = this.dataset.filterValue;
      activeFilters.series = val;
      document.querySelectorAll('.filter-option[data-filter-type="series"]').forEach(function(o) {
        o.classList.toggle('active', o.dataset.filterValue === val);
      });
      applyFilters();
      updateActiveTags();
    });
  });
  
  // Size filters
  document.querySelectorAll('.filter-option[data-filter-type="size"]').forEach(function(el) {
    el.addEventListener('click', function() {
      var val = this.dataset.filterValue;
      activeFilters.size = activeFilters.size === val ? '' : val;
      document.querySelectorAll('.filter-option[data-filter-type="size"]').forEach(function(o) {
        o.classList.toggle('active', o.dataset.filterValue === activeFilters.size);
      });
      applyFilters();
      updateActiveTags();
    });
  });
  
  // Thickness filters
  document.querySelectorAll('.filter-option[data-filter-type="thickness"]').forEach(function(el) {
    el.addEventListener('click', function() {
      var val = this.dataset.filterValue;
      activeFilters.thickness = activeFilters.thickness === val ? '' : val;
      document.querySelectorAll('.filter-option[data-filter-type="thickness"]').forEach(function(o) {
        o.classList.toggle('active', o.dataset.filterValue === activeFilters.thickness);
      });
      applyFilters();
      updateActiveTags();
    });
  });
  
  // Application filters
  document.querySelectorAll('.filter-option[data-filter-type="application"]').forEach(function(el) {
    el.addEventListener('click', function() {
      var val = this.dataset.filterValue;
      activeFilters.application = activeFilters.application === val ? '' : val;
      document.querySelectorAll('.filter-option[data-filter-type="application"]').forEach(function(o) {
        o.classList.toggle('active', o.dataset.filterValue === activeFilters.application);
      });
      applyFilters();
      updateActiveTags();
    });
  });
  
  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(function(el) {
    el.addEventListener('click', function() {
      document.querySelectorAll('.color-swatch').forEach(function(s) { s.classList.remove('active'); });
      this.classList.add('active');
    });
  });
}

// Legacy filter functions (for backward compatibility)
function filterProducts(seriesId) {
  var cards = document.querySelectorAll('.product-card');
  cards.forEach(function(card) {
    if (seriesId === 'all' || card.dataset.series === seriesId) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
  
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.series === seriesId);
  });
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterProducts(this.dataset.series);
    });
  });
}

// ========== Gallery Component ==========
function renderGallery(images, primaryIndex) {
  if (!images || images.length === 0) return '<div class="gallery-empty">No images</div>';
  
  let html = `
    <div class="gallery-main">
      <img id="galleryMainImg" src="${images[0]}" alt="Product">
    </div>
    <div class="gallery-thumbs">
  `;
  
  images.forEach((img, i) => {
    html += `<div class="gallery-thumb${i === 0 ? ' active' : ''}" onclick="switchGalleryImg(this, '${img}', ${i})">
      <img src="${img}" alt="View ${i+1}">
    </div>`;
  });
  
  html += '</div>';
  return html;
}

function switchGalleryImg(el, src) {
  document.getElementById('galleryMainImg').src = src;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// ========== Multilingual Helpers ==========
function getLang() { return (typeof I18N !== 'undefined' ? I18N.getCurrentLang() : 'en'); }
function pName(v) { var l = getLang(); return (l === 'zh' || !v.nameEn) ? v.name : v.nameEn; }
function pColor(v) { var l = getLang(); return (l === 'zh' && v.colorZh) ? v.colorZh : v.color; }

// ========== Related Products ==========
function renderRelatedProducts(currentSeriesId, currentVariantName, count) {
  const s = PRODUCTS_DATA[currentSeriesId];
  if (!s) return '';
  
  const others = s.variants.filter(v => v.name !== currentVariantName);
  const display = others.slice(0, count || 4);
  
  let html = '';
  display.forEach(v => {
    var rn = pName(v);
    var rc = pColor(v);
    html += `
      <a href="product-detail.html?series=${currentSeriesId}&variant=${encodeURIComponent(v.name)}" class="related-card">
        <img src="${v.primary}" alt="${rn}" loading="lazy">
        <h4>${rn}</h4>
        <span class="related-color" style="background:${v.colorHex}">${rc}</span>
      </a>
    `;
  });
  return html;
}

// ========== Init Product Grid ==========
function initProductGrid(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let html = '';
  for (const sid in PRODUCTS_DATA) {
    const s = PRODUCTS_DATA[sid];
    s.variants.forEach(v => {
      html += renderProductCard(v, sid, s.name, s.nameEn);
    });
  }
  container.innerHTML = html;
  initFilters();
  initScrollReveal();
}

// ========== Init Filters Sidebar ==========
function initFilterSidebar(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = renderSeriesFilters('all');
  
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      filterProducts(this.dataset.series);
    });
  });
}

// ========== Category Switching ==========
var currentCategory = 'porcelain'; // 'porcelain' or 'eco-brick'

function switchCategory(cat) {
  currentCategory = cat;
  
  // Update category tab UI
  document.querySelectorAll('.cat-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.cat === cat);
  });
  
  // Show/hide sidebar sections
  document.querySelectorAll('.filter-section-porcelain').forEach(function(el) {
    el.style.display = (cat === 'porcelain') ? '' : 'none';
  });
  document.querySelectorAll('.filter-section-ecobrick').forEach(function(el) {
    el.style.display = (cat === 'eco-brick') ? '' : 'none';
  });
  
  // Reset series filter and update grid
  activeFilters.series = 'all';
  activeFilters.size = '';
  activeFilters.thickness = '';
  activeFilters.application = '';
  
  // Clear all series filter active states
  document.querySelectorAll('[data-filter-type="series"]').forEach(function(el) {
    el.classList.remove('active');
    if (el.dataset.filterValue === 'all') el.classList.add('active');
  });
  
  // Update series tabs
  updateSeriesTabsForCategory(cat);
  updateActiveTags();
}

function updateSeriesTabsForCategory(cat) {
  var container = document.getElementById('seriesTabs');
  if (!container) return;
  
  var gridId = 'productGrid';
  var html = '';
  
  if (cat === 'porcelain') {
    // Show all 10 porcelain series tabs
    html += '<button class="series-tab active" data-series="all">All Pavers</button>';
    for (var sid in PRODUCTS_DATA) {
      if (sid === 'eco-brick') continue;
      var s = PRODUCTS_DATA[sid];
      html += '<button class="series-tab" data-series="' + sid + '">' + s.nameEn + '</button>';
    }
  } else {
    // Show only eco brick
    html += '<button class="series-tab active" data-series="eco-brick">Eco Brick Series</button>';
  }
  
  container.innerHTML = html;
  
  // Show initial grid
  if (cat === 'porcelain') {
    renderPorcelainSeries(gridId);
  } else {
    showSeriesGrid('eco-brick', gridId);
  }
  
  // Attach tab click handlers
  container.querySelectorAll('.series-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      container.querySelectorAll('.series-tab').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      var sid = this.dataset.series;
      if (sid === 'all') {
        renderPorcelainSeries(gridId);
      } else {
        showSeriesGrid(sid, gridId);
      }
    });
  });
}

function renderPorcelainSeries(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  
  var html = '';
  for (var sid in PRODUCTS_DATA) {
    if (sid === 'eco-brick') continue;
    var s = PRODUCTS_DATA[sid];
    s.variants.forEach(function(v) {
      html += renderProductCard(v, sid, s.name, s.nameEn);
    });
  }
  container.innerHTML = html;
  if (typeof initScrollReveal === 'function') initScrollReveal();
  
  // Also update count
  updateProductCount(html.match(/product-card/g) ? html.match(/product-card/g).length : 0);
}

function updateProductCount(count) {
  var pc = document.getElementById('productCount');
  var hpc = document.getElementById('heroProductCount');
  if (pc) pc.textContent = count;
  if (hpc) hpc.textContent = count;
}
function initSeriesTabs(containerId, gridContainerId, showAllTab) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Render tabs
  let html = '';
  let firstSeries = null;
  
  // Add "All" tab if requested
  if (showAllTab) {
    html += `<button class="series-tab active" data-series="all">All Series</button>`;
  }
  
  for (const sid in PRODUCTS_DATA) {
    const s = PRODUCTS_DATA[sid];
    if (!firstSeries) firstSeries = sid;
    html += `<button class="series-tab" data-series="${sid}">${s.nameEn}</button>`;
  }
  container.innerHTML = html;
  
  // Show first series or all
  if (showAllTab) {
    renderAllSeries(gridContainerId);
  } else if (firstSeries) {
    showSeriesGrid(firstSeries, gridContainerId);
  }
  
  // Tab click
  container.querySelectorAll('.series-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      container.querySelectorAll('.series-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const sid = this.dataset.series;
      if (sid === 'all') {
        renderAllSeries(gridContainerId);
      } else {
        showSeriesGrid(sid, gridContainerId);
      }
    });
  });
}

function renderAllSeries(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let html = '';
  for (const sid in PRODUCTS_DATA) {
    const s = PRODUCTS_DATA[sid];
    s.variants.forEach(v => {
      html += renderProductCard(v, sid, s.name, s.nameEn);
    });
  }
  container.innerHTML = html;
  if (typeof initScrollReveal === 'function') initScrollReveal();
}

function showSeriesGrid(seriesId, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const s = PRODUCTS_DATA[seriesId];
  if (!s) { container.innerHTML = ''; return; }
  
  let html = '';
  s.variants.forEach(v => {
    html += renderProductCard(v, seriesId, s.name, s.nameEn);
  });
  container.innerHTML = html;
  
  if (typeof initScrollReveal === 'function') initScrollReveal();
}

// ========== Page Hero with Random Scene ==========
function getRandomSceneBg() {
  const scenes = [
    'images/scenes/19ce0e83fae8f.png',
    'images/scenes/19ce15069e04d.png',
    'images/scenes/19d4715d0a7dc.png',
    'images/scenes/19d4728235bfa.png',
    'images/scenes/19d47a53718a6.png',
    'images/scenes/19d47c4ce09ec.png',
    'images/scenes/19d47dcf05360.png',
    'images/scenes/19d47e69132c6.png',
    'images/scenes/2.png',
    'images/scenes/02f5df3a77340d404657b6f3792d2921_origin(1)(1).jpg'
  ];
  return scenes[Math.floor(Math.random() * scenes.length)];
}

function setSceneBg(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.style.backgroundImage = `url('${getRandomSceneBg()}')`;
  }
}

// ========== Scene Gallery Widget ==========
function renderSceneGallery(containerId, count) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Get a list of scene images
  const sceneCount = count || 8;
  // Use PowerShell/Node generated paths... for now use a fixed set
  const scenes = [
    'images/scenes/19ce0e83fae8f.png',
    'images/scenes/19ce15069e04d.png',
    'images/scenes/19d4715d0a7dc.png',
    'images/scenes/19d4728235bfa.png',
    'images/scenes/19d47a53718a6.png',
    'images/scenes/19d47c4ce09ec.png',
    'images/scenes/19d47dcf05360.png',
    'images/scenes/19d47e69132c6.png'
  ];
  
  let html = '';
  scenes.slice(0, sceneCount).forEach(src => {
    html += `<div class="scene-item reveal">
      <img src="${src}" alt="Application Scene" loading="lazy">
    </div>`;
  });
  container.innerHTML = html;
}

// ========== Scroll Reveal ==========
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ========== Product Detail Renderer ==========
function renderProductDetail(product) {
  const container = document.getElementById('productDetailContainer');
  if (!container) return;
  
  const currentLang = (typeof I18N !== 'undefined' ? I18N.getCurrentLang() : 'en');
  const seriesDisplay = currentLang === 'zh' ? product.seriesName : product.seriesNameEn;
  const colorName = currentLang === 'zh' ? (product.colorZh || product.color) : product.color;
  const productName = currentLang === 'zh' ? product.name : (product.nameEn || product.name);
  const finishName = currentLang === 'zh' ? (product.specs.finishZh || product.specs.finish) : product.specs.finish;
  const catDisplay = currentLang === 'zh' ? (product.category || '') : (product.categoryEn || product.category || '');
  var _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : function(k) { return k; };
  
  // Tech specs highlights
  const slipBadge = product.specs.slip ? 
    `<div class="spec-badge"><span class="badge-label">${_t('spec_slip')}</span><span class="badge-value">${product.specs.slip}</span></div>` : '';
  const frostBadge = product.specs.frost ? 
    `<div class="spec-badge"><span class="badge-label">${_t('spec_frost')}</span><span class="badge-value">${product.specs.frost}</span></div>` : '';
  const absBadge = product.specs.absorption ? 
    `<div class="spec-badge"><span class="badge-label">${_t('spec_absorption')}</span><span class="badge-value">${product.specs.absorption}</span></div>` : '';

  // Build main spec grid
  const specItems = [
    { label: _t('spec_size'), value: product.specs.size },
    { label: _t('spec_thickness'), value: product.specs.thickness },
    { label: _t('spec_finish'), value: finishName },
    { label: _t('spec_color'), value: colorName }
  ];
  if (product.specs.model) specItems.push({ label: _t('spec_model'), value: product.specs.model });
  if (product.specs.slip) specItems.push({ label: _t('spec_slip'), value: product.specs.slip });
  if (product.specs.absorption) specItems.push({ label: _t('spec_absorption'), value: product.specs.absorption });
  if (product.specs.frost) specItems.push({ label: _t('spec_frost'), value: product.specs.frost });
  
  let specGridHtml = '';
  specItems.forEach(item => {
    specGridHtml += `
      <div class="spec-item">
        <span class="spec-label">${item.label}</span>
        <span class="spec-value">${item.value}</span>
      </div>`;
  });
  
  // Tech badges row
  const badgesRow = (slipBadge || frostBadge || absBadge) ? `
    <div class="detail-badges" style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap">
      ${slipBadge}${frostBadge}${absBadge}
    </div>` : '';
  
  // Full technical table
  const techRows = [
    { label: 'Standard', value: 'ISO 9001 / CE Marking' },
    { label: 'Slip Resistance', value: product.specs.slip || 'R11' },
    { label: 'Water Absorption', value: product.specs.absorption || '<0.5%' },
    { label: 'Frost Resistance', value: product.specs.frost || '-30°C' },
    { label: 'Scratch Resistance', value: 'MOHS 7+' },
    { label: 'Chemical Resistance', value: 'Class AA' },
    { label: 'Fire Rating', value: 'Class A1' }
  ];
  
  let techTableHtml = '';
  techRows.forEach(row => {
    techTableHtml += `<tr><td style="padding:10px 16px;border-bottom:1px solid var(--border-gray);font-size:13px;color:var(--medium-gray);background:var(--light-gray)">${row.label}</td><td style="padding:10px 16px;border-bottom:1px solid var(--border-gray);font-size:14px;font-weight:600;color:var(--dark-gray)">${row.value}</td></tr>`;
  });
  
  // Trust badges
  const trustBadges = `
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:24px;padding:20px;background:var(--brand-green-light);border-radius:var(--radius-md)">
      <div style="text-align:center;flex:1;min-width:80px"><div style="width:44px;height:44px;background:var(--brand-green);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:10px;font-weight:800;color:white;font-family:'Montserrat',sans-serif">ISO</div><span style="font-size:11px;color:var(--medium-gray)">9001</span></div>
      <div style="text-align:center;flex:1;min-width:80px"><div style="width:44px;height:44px;background:var(--brand-green);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:10px;font-weight:800;color:white;font-family:'Montserrat',sans-serif">CE</div><span style="font-size:11px;color:var(--medium-gray)">Marking</span></div>
      <div style="text-align:center;flex:1;min-width:80px"><div style="width:44px;height:44px;background:var(--brand-green);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:10px;font-weight:800;color:white;font-family:'Montserrat',sans-serif">R12</div><span style="font-size:11px;color:var(--medium-gray)">Anti-Slip</span></div>
      <div style="text-align:center;flex:1;min-width:80px"><div style="width:44px;height:44px;background:var(--brand-green);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:10px;font-weight:800;color:white;font-family:'Montserrat',sans-serif">-30</div><span style="font-size:11px;color:var(--medium-gray)">Frost Resistant</span></div>
    </div>`;
  
  // Product name with badge for eco brick
  const newBadge = (product.seriesId === 'eco-brick') ? '<span style="display:inline-block;padding:3px 10px;background:#EF4444;color:white;font-size:11px;font-weight:600;border-radius:50px;margin-left:10px">NEW</span>' : '';
  
  container.innerHTML = `
    <!-- Breadcrumb -->
    <div class="breadcrumb">
      <div class="container">
        <a href="index.html">Home</a> &rsaquo; 
        <a href="products.html">Outdoor Tiles</a> &rsaquo; 
        <span class="current">${productName}</span>
      </div>
    </div>
    
    <!-- Product Detail -->
    <div class="container">
      <div class="detail-grid">
        <!-- LEFT: Gallery (60%) -->
        <div class="detail-gallery">
          <div class="main-image" style="border-radius:var(--radius-lg);overflow:hidden;background:var(--light-gray);margin-bottom:16px">
            <img id="galleryMainImg" src="${product.primary}" alt="${productName}" style="width:100%;height:auto;display:block">
          </div>
          <div class="thumb-strip" style="display:flex;gap:8px;overflow-x:auto">
            ${(product.images||[product.primary]).map((img, i) => `
              <div class="thumb-item${i === 0 ? ' active' : ''}" onclick="switchGalleryImg(this, '${img}')" style="width:80px;height:80px;border-radius:var(--radius-sm);overflow:hidden;border:2px solid ${i === 0 ? 'var(--brand-green)' : 'transparent'};cursor:pointer;flex-shrink:0">
                <img src="${img}" alt="View ${i+1}" style="width:100%;height:100%;object-fit:cover">
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- RIGHT: Info (40%) -->
        <div class="detail-info">
          <div class="detail-series" style="display:inline-block;padding:4px 12px;background:var(--brand-green-light);color:var(--brand-green);font-size:12px;font-weight:600;border-radius:50px;margin-bottom:12px">
            ${seriesDisplay}
          </div>
          <h1 class="detail-title" style="font-family:'Montserrat',sans-serif;font-size:28px;font-weight:700;margin-bottom:16px">
            ${productName} ${newBadge}
          </h1>
          
          <!-- Color -->
          <div class="detail-color-info" style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
            <span style="width:24px;height:24px;border-radius:50%;background:${product.colorHex};border:2px solid var(--border-gray);display:inline-block"></span>
            <span style="font-size:15px;color:var(--medium-gray)">${colorName}</span>
          </div>
          
          <!-- Tech Badges -->
          ${badgesRow}
          
          <!-- Spec Grid -->
          <div class="detail-specs" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px;padding:24px;background:var(--light-gray);border-radius:var(--radius-md)">
            ${specGridHtml}
          </div>
          
          <!-- Trust Badges -->
          ${trustBadges}
          
          <!-- CTA Buttons -->
          <div style="display:flex;gap:16px;margin-top:32px">
            <a href="contact.html" class="btn-primary" style="display:inline-flex;align-items:center;gap:10px;padding:14px 32px;background:var(--brand-green);color:white;border:none;border-radius:var(--radius-sm);font-size:15px;font-weight:600;cursor:pointer;transition:var(--transition)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              ${_t('btn_get_quote')}
            </a>
            <a href="sample-request.html" class="btn-outline" style="display:inline-flex;align-items:center;gap:10px;padding:14px 32px;background:transparent;color:var(--brand-green);border:2px solid var(--brand-green);border-radius:var(--radius-sm);font-size:15px;font-weight:600;cursor:pointer;transition:var(--transition)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              ${_t('detail_sample')}
            </a>
          </div>
        </div>
      </div>
      
      <!-- Full Technical Specifications Table -->
      <div style="padding:32px 0 48px">
        <h2 style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;margin-bottom:24px">${_t('tech_title')}</h2>
        <table style="width:100%;border-collapse:collapse;border-radius:var(--radius-md);overflow:hidden;border:1px solid var(--border-gray)">
          ${techTableHtml}
        </table>
      </div>
      
      <!-- Related Products -->
      <div style="padding:32px 0 48px;border-top:1px solid var(--border-gray)">
        <h2 style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;margin-bottom:24px">${_t('related_title')}</h2>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px">
          ${renderRelatedProducts(product.seriesId, product.name, 4)}
        </div>
      </div>
    </div>
    
    <!-- Eco Brick Detail Brochure (Screen 2 & 3) -->
    ${product.detail ? `
    <div style="background:var(--bg-gray);padding:48px 0">
      <div class="container">
        <div style="text-align:center;margin-bottom:24px">
          <span style="display:inline-block;padding:4px 14px;background:var(--brand-green-light);color:var(--brand-green);font-size:11px;font-weight:700;border-radius:50px;letter-spacing:1px;text-transform:uppercase">PRODUCT DETAILS</span>
          <h2 style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;color:var(--dark-gray);margin-top:12px">Detailed Specifications</h2>
          <p style="color:var(--medium-gray);font-size:14px;margin-top:4px">Comprehensive product information and technical data</p>
        </div>
        <div style="background:white;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-md)">
          <img src="images/eco-brick-detail/${product.detail}" alt="${product.name} - Detailed Specifications" style="width:100%;height:auto;display:block">
        </div>
      </div>
    </div>
    ` : ''}
  `;
  
  // Update SEO schema
  updateProductSchema(product);
}

// ========== SEO Schema Updater ==========
function updateProductSchema(product) {
  var script = document.getElementById('productSchema');
  if (!script) return;
  
  var schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.seriesNameEn + " - " + product.name + ". " + (product.specs.size || "") + ", " + (product.specs.thickness || "") + ", " + (product.specs.finish || ""),
    "brand": { "@type": "Brand", "name": "XINFENG XIN'AN" },
    "manufacturer": "Hebei Xinfeng Group",
    "category": product.seriesNameEn,
    "sku": product.specs.model || ""
  };
  
  // Add specs
  if (product.specs.size) schema.size = product.specs.size;
  if (product.specs.thickness) schema.depth = product.specs.thickness;
  if (product.specs.slip) schema["hasSlipResistance"] = product.specs.slip;
  if (product.specs.frost) schema["hasFrostResistance"] = product.specs.frost;
  
  script.textContent = JSON.stringify(schema, null, 2);
}
