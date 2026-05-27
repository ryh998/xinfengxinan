/**
 * XINFENG XIN'AN - Shared i18n Module v3
 * Fixed: global dict, window.I18N, compatible with all pages
 */
window.__I18N_v = 'v3';
window.__i18n_dict = {};
var _dict = window.__i18n_dict; // alias

I18N = (function() {
    var STORAGE_KEY = 'preferred-lang';
    var SUPPORTED_LANGS = { en:'EN', zh:'中文', ru:'RU' };
    var HTML_LANGS = { en:'en', zh:'zh-CN', ru:'ru' };

    // Store translation dictionary in WINDOW (not closure) to avoid cross-page bugs
    // Pages load this file, and also define their own 'var translations = {...} inside <script>
    // This module should read from a GLOBAL place, not from closure capture of unknown variable.

    var _currentLang = 'en';

    function _init(pageDict) {
        if (!pageDict) { console.log('[i18n] WARN: pageDict empty'); return; }
        // Merge into global dict
        for (var k in pageDict) { window.__i18n_dict[k] = pageDict[k]; }
        var saved = localStorage.getItem(STORAGE_KEY);
        var lang = (saved && window.__i18n_dict[saved]) ? saved : 'en';
        _currentLang = lang;
        _apply(lang);
    }

    function _switchLang(lang) {
        if (!window.__i18n_dict[lang]) {
            console.log('[i18n] no dict for', lang, 'available:', Object.keys(window.__i18n_dict));
            var pg = window.__pageTranslations || window.pageTranslations;
            if (pg && pg[lang]) { window.__i18n_dict = pg; }
            else { return; }
        }
        _currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        _apply(lang);
        _updateUI(lang);

        // Close dropdown (both possible IDs)
        try { document.getElementById('langDropdown').classList.remove('show'); } catch(e){}
        try { document.getElementById('langDD').classList.remove('show'); } catch(e){}
    }

    function _apply(lang) {
        var dict = window.__i18n_dict[lang];
        if (!dict) { console.log('[i18n] apply: no dict for', lang); return; }
        var els = document.querySelectorAll('[data-i18n]');
        var cnt = 0;
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) {
                try {
                    if (el.tagName === 'OPTION') { el.textContent = dict[key]; }
                    else { el.innerHTML = dict[key]; }
                    cnt++;
                } catch(ex) {}
            }
        }
        try { if (HTML_LANGS[lang]) document.documentElement.lang = HTML_LANGS[lang]; } catch(e){}
        try {
            var ttl = dict['page_title_full'] || dict['page_title'];
            if (ttl) document.title = ttl;
        } catch(e){}
        console.log('[i18n] apply('+lang+') OK, translated', cnt, '/'+els.length);
    }

    function _updateUI(lang) {
        var short = SUPPORTED_LANGS[lang] || 'EN';
        var label = document.getElementById('currentLang') || document.getElementById('langLabel');
        if (label) label.textContent = short;
        try {
            document.querySelectorAll('.lang-option').forEach(function(o) { o.classList.remove('active'); });
            document.querySelectorAll('[data-lang="'+lang+'"]').forEach(function(o) { o.classList.add('active'); });
        } catch(e){}
    }

    function _toggleDD() {
        try {
            var dd = document.getElementById('langDropdown') || document.getElementById('langDD');
            if (dd) dd.classList.toggle('show');
        } catch(e){}
    }

    // EXPOSE on window- so all pages can call I18N.switchLang(...)
    window.I18N = {
        init: _init,
        switchLang: _switchLang,
        toggleDropdown: _toggleDD,
        apply: _apply,
        getCurrentLang: function() { return _currentLang; },
        t: function(key) { var d = window.__i18n_dict[_currentLang]; return (d && d[key] !== undefined) ? d[key] : key; },
        _dict: window.__i18n_dict
    };

    return window.I18N;
})();
console.log('[i18n] v3 loaded. I18N:', !!window.I18N, 'dict keys:', Object.keys(window.__i18n_dict||{}));
