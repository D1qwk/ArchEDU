const A11y = (function() {
    let panel = null;
    let isOpen = false;
    const STORAGE_KEY = 'archEdu_a11y_settings';
    const settings = {
        highContrast: false,
        largeFont: false,
        textToSpeech: false,
        reduceMotion: false,
        underlineLinks: false,
        grayscale: false,
        colorFilter: 'none', // 'deuteranopia', 'protanopia', 'tritanopia'
        largeCursor: false
    };

    function loadSettings() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) Object.assign(settings, JSON.parse(saved));
        applySettings();
    }

    function saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        applySettings();
    }

    function applySettings() {
        const body = document.body;
        body.classList.toggle('a11y-high-contrast', settings.highContrast);
        body.classList.toggle('a11y-large-font', settings.largeFont);
        body.classList.toggle('a11y-reduce-motion', settings.reduceMotion);
        body.classList.toggle('a11y-underline-links', settings.underlineLinks);
        body.classList.toggle('a11y-grayscale', settings.grayscale);
        body.classList.toggle('a11y-large-cursor', settings.largeCursor);
        
        body.classList.remove('a11y-deuteranopia', 'a11y-protanopia', 'a11y-tritanopia');
        if (settings.colorFilter !== 'none') {
            body.classList.add(`a11y-${settings.colorFilter}`);
        }
        
        settings.textToSpeech ? enableTextToSpeech() : disableTextToSpeech();
    }

    let speechSynth = window.speechSynthesis;
    let speaking = false;
    function enableTextToSpeech() { document.body.addEventListener('mouseup', handleTextSelection); }
    function disableTextToSpeech() { document.body.removeEventListener('mouseup', handleTextSelection); if (speaking) { speechSynth.cancel(); speaking = false; } }
    function handleTextSelection() {
        const text = window.getSelection().toString().trim();
        if (text && settings.textToSpeech) {
            if (speaking) speechSynth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = I18n.getCurrentLanguage() === 'ru' ? 'ru-RU' : 'kk-KZ';
            utterance.onstart = () => speaking = true;
            utterance.onend = () => speaking = false;
            speechSynth.speak(utterance);
        }
    }

    function createWidget() {
        const lang = I18n.getCurrentLanguage();
        const html = `
            <div class="a11y-widget">
                <button class="a11y-toggle" id="a11y-toggle" title="${lang === 'ru' ? 'Специальные возможности' : 'Арнайы мүмкіндіктер'}">
                    <i class="fas fa-universal-access"></i>
                </button>
                <div class="a11y-panel" id="a11y-panel">
                    <div class="a11y-header">
                        <span id="a11y-title">${lang === 'ru' ? 'Специальные возможности' : 'Арнайы мүмкіндіктер'}</span>
                        <button class="a11y-close" id="a11y-close"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="a11y-option"><label for="a11y-high-contrast" id="a11y-label-contrast">${lang === 'ru' ? 'Высокий контраст' : 'Жоғары контраст'}</label><input type="checkbox" id="a11y-high-contrast" ${settings.highContrast ? 'checked' : ''}></div>
                    <div class="a11y-option"><label for="a11y-large-font" id="a11y-label-font">${lang === 'ru' ? 'Крупный шрифт' : 'Үлкен қаріп'}</label><input type="checkbox" id="a11y-large-font" ${settings.largeFont ? 'checked' : ''}></div>
                    <div class="a11y-option"><label for="a11y-tts" id="a11y-label-tts">${lang === 'ru' ? 'Озвучивание текста' : 'Мәтінді дауыстау'}</label><input type="checkbox" id="a11y-tts" ${settings.textToSpeech ? 'checked' : ''}></div>
                    <div class="a11y-option"><label for="a11y-reduce-motion" id="a11y-label-motion">${lang === 'ru' ? 'Уменьшить анимацию' : 'Анимацияны азайту'}</label><input type="checkbox" id="a11y-reduce-motion" ${settings.reduceMotion ? 'checked' : ''}></div>
                    <div class="a11y-option"><label for="a11y-underline-links" id="a11y-label-links">${lang === 'ru' ? 'Подчёркивать ссылки' : 'Сілтемелерді сызу'}</label><input type="checkbox" id="a11y-underline-links" ${settings.underlineLinks ? 'checked' : ''}></div>
                    <div class="a11y-option"><label for="a11y-grayscale" id="a11y-label-grayscale">${lang === 'ru' ? 'Чёрно-белый режим' : 'Ақ-қара режим'}</label><input type="checkbox" id="a11y-grayscale" ${settings.grayscale ? 'checked' : ''}></div>
                    <div class="a11y-option"><label for="a11y-large-cursor" id="a11y-label-cursor">${lang === 'ru' ? 'Крупный курсор' : 'Үлкен курсор'}</label><input type="checkbox" id="a11y-large-cursor" ${settings.largeCursor ? 'checked' : ''}></div>
                    <div class="a11y-option">
                        <label for="a11y-color-filter" id="a11y-label-filter">${lang === 'ru' ? 'Фильтр дальтонизма' : 'Дальтонизм сүзгісі'}</label>
                        <select id="a11y-color-filter" style="padding: 0.25rem; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-light); border-radius: 8px;">
                            <option value="none" ${settings.colorFilter === 'none' ? 'selected' : ''}>${lang === 'ru' ? 'Нет' : 'Жоқ'}</option>
                            <option value="deuteranopia" ${settings.colorFilter === 'deuteranopia' ? 'selected' : ''}>${lang === 'ru' ? 'Дейтеранопия' : 'Дейтеранопия'}</option>
                            <option value="protanopia" ${settings.colorFilter === 'protanopia' ? 'selected' : ''}>${lang === 'ru' ? 'Протанопия' : 'Протанопия'}</option>
                            <option value="tritanopia" ${settings.colorFilter === 'tritanopia' ? 'selected' : ''}>${lang === 'ru' ? 'Тританопия' : 'Тританопия'}</option>
                        </select>
                    </div>
                    <button class="a11y-reset" id="a11y-reset">${lang === 'ru' ? 'Сбросить настройки' : 'Параметрлерді қалпына келтіру'}</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        panel = document.querySelector('.a11y-panel');
        bindEvents();
    }

    function bindEvents() {
        const toggle = document.getElementById('a11y-toggle');
        const close = document.getElementById('a11y-close');
        const panelEl = document.getElementById('a11y-panel');
        toggle.addEventListener('click', () => { isOpen = !isOpen; panelEl.classList.toggle('open', isOpen); });
        close.addEventListener('click', () => { isOpen = false; panelEl.classList.remove('open'); });
        document.addEventListener('click', (e) => { if (isOpen && !panel.contains(e.target) && e.target !== toggle) { isOpen = false; panelEl.classList.remove('open'); } });
        
        document.getElementById('a11y-high-contrast').addEventListener('change', e => { settings.highContrast = e.target.checked; saveSettings(); });
        document.getElementById('a11y-large-font').addEventListener('change', e => { settings.largeFont = e.target.checked; saveSettings(); });
        document.getElementById('a11y-tts').addEventListener('change', e => { settings.textToSpeech = e.target.checked; saveSettings(); });
        document.getElementById('a11y-reduce-motion').addEventListener('change', e => { settings.reduceMotion = e.target.checked; saveSettings(); });
        document.getElementById('a11y-underline-links').addEventListener('change', e => { settings.underlineLinks = e.target.checked; saveSettings(); });
        document.getElementById('a11y-grayscale').addEventListener('change', e => { settings.grayscale = e.target.checked; saveSettings(); });
        document.getElementById('a11y-large-cursor').addEventListener('change', e => { settings.largeCursor = e.target.checked; saveSettings(); });
        document.getElementById('a11y-color-filter').addEventListener('change', e => { settings.colorFilter = e.target.value; saveSettings(); });
        
        document.getElementById('a11y-reset').addEventListener('click', () => {
            settings.highContrast = settings.largeFont = settings.textToSpeech = settings.reduceMotion = settings.underlineLinks = settings.grayscale = settings.largeCursor = false;
            settings.colorFilter = 'none';
            document.querySelectorAll('#a11y-panel input[type=checkbox]').forEach(cb => cb.checked = false);
            document.getElementById('a11y-color-filter').value = 'none';
            saveSettings();
        });
    }

    function updateLanguage() {
        if (!panel) return;
        const lang = I18n.getCurrentLanguage();
        document.getElementById('a11y-title').textContent = lang === 'ru' ? 'Специальные возможности' : 'Арнайы мүмкіндіктер';
        document.getElementById('a11y-label-contrast').textContent = lang === 'ru' ? 'Высокий контраст' : 'Жоғары контраст';
        document.getElementById('a11y-label-font').textContent = lang === 'ru' ? 'Крупный шрифт' : 'Үлкен қаріп';
        document.getElementById('a11y-label-tts').textContent = lang === 'ru' ? 'Озвучивание текста' : 'Мәтінді дауыстау';
        document.getElementById('a11y-label-motion').textContent = lang === 'ru' ? 'Уменьшить анимацию' : 'Анимацияны азайту';
        document.getElementById('a11y-label-links').textContent = lang === 'ru' ? 'Подчёркивать ссылки' : 'Сілтемелерді сызу';
        document.getElementById('a11y-label-grayscale').textContent = lang === 'ru' ? 'Чёрно-белый режим' : 'Ақ-қара режим';
        document.getElementById('a11y-label-cursor').textContent = lang === 'ru' ? 'Крупный курсор' : 'Үлкен курсор';
        document.getElementById('a11y-label-filter').textContent = lang === 'ru' ? 'Фильтр дальтонизма' : 'Дальтонизм сүзгісі';
        document.getElementById('a11y-reset').textContent = lang === 'ru' ? 'Сбросить настройки' : 'Параметрлерді қалпына келтіру';
        document.getElementById('a11y-toggle').title = lang === 'ru' ? 'Специальные возможности' : 'Арнайы мүмкіндіктер';
        
        const select = document.getElementById('a11y-color-filter');
        select.options[0].text = lang === 'ru' ? 'Нет' : 'Жоқ';
    }

    function init() {
        loadSettings();
        createWidget();
        window.addEventListener('languageChanged', updateLanguage);
    }

    return { init, updateLanguage };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(A11y.init, 100));
else setTimeout(A11y.init, 100);