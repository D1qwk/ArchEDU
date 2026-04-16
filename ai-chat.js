const ArchAI = (function() {
    let widget = null;
    let isOpen = false;

    const mockResponses = {
        ru: [
            { keywords: ['привет', 'здравствуй', 'салам'], response: 'Здравствуйте! Я ArchAI, ваш помощник по архитектуре ПО. Задайте вопрос или выберите из списка ниже.' },
            { keywords: ['курс', 'обучение'], response: 'У нас есть курсы по 8 архитектурным стилям: монолит, слоистая, микроядерная, микросервисная, serverless, событийная, pipes-and-filters и сервис-ориентированная. Какой вас интересует?' },
            { keywords: ['микросервис', 'микросервисы', 'microservice'], response: 'Микросервисная архитектура — это подход, при котором приложение строится как набор небольших независимых сервисов. Каждый сервис работает в своём процессе и взаимодействует по сети через API или сообщения.' },
            { keywords: ['монолит'], response: 'Монолит — традиционный подход: всё приложение собирается в один артефакт. Прост в разработке на старте, но может стать сложным при росте. Преимущества: простота отладки, единая транзакционность.' },
            { keywords: ['слоистая', 'layered', 'n-tier'], response: 'Слоистая архитектура (N-tier) разделяет приложение на горизонтальные слои: Presentation, Business, Data. Упрощает поддержку и замену компонентов.' },
            { keywords: ['api gateway', 'gateway'], response: 'API Gateway — единая точка входа для всех клиентов. Он маршрутизирует запросы к нужным микросервисам, выполняет аутентификацию, агрегирует ответы.' },
            { keywords: ['circuit breaker', 'circuit', 'breaker'], response: 'Circuit Breaker — паттерн отказоустойчивости. Он предотвращает каскадные сбои, временно блокируя вызовы к проблемному сервису. Состояния: CLOSED, OPEN, HALF_OPEN.' },
            { keywords: ['docker', 'контейнер'], response: 'Docker — платформа для контейнеризации приложений. Упаковывает приложение со всеми зависимостями в изолированный контейнер, который легко развёртывать.' },
            { keywords: ['kubernetes', 'k8s'], response: 'Kubernetes — система оркестрации контейнеров. Управляет развёртыванием, масштабированием и работой контейнеризированных приложений.' },
            { keywords: ['service discovery', 'eureka'], response: 'Service Discovery — механизм, позволяющий микросервисам находить друг друга без жёсткой привязки к IP. Eureka — реализация от Netflix (Spring Cloud).' },
            { keywords: ['config', 'конфигурация'], response: 'Spring Cloud Config — централизованное хранилище конфигураций для микросервисов. Позволяет менять настройки без перезапуска.' },
            { keywords: ['спасибо', 'благодарю'], response: 'Пожалуйста! Рад помочь. Если будут ещё вопросы — обращайтесь.' }
        ],
        kk: [
            { keywords: ['сәлем', 'сәлеметсіз', 'салам'], response: 'Сәлеметсіз бе! Мен ArchAI, бағдарламалық жасақтама архитектурасы бойынша көмекшіңіз. Сұрағыңызды жазыңыз немесе төмендегі тізімнен таңдаңыз.' },
            { keywords: ['курс', 'оқыту'], response: 'Бізде 8 архитектуралық стиль бойынша курстар бар: монолит, қабатты, микроядролық, микросервистік, serverless, оқиғалық, pipes-and-filters және сервис-бағытталған. Сізді қайсысы қызықтырады?' },
            { keywords: ['микросервис', 'микросервистер', 'microservice'], response: 'Микросервистік архитектура — бұл қосымша шағын тәуелсіз сервистер жиынтығы ретінде құрылатын тәсіл. Әрбір сервис өз процесінде жұмыс істейді және API немесе хабарламалар арқылы байланысады.' },
            { keywords: ['монолит'], response: 'Монолит — дәстүрлі тәсіл: барлық қосымша бір артефактқа жиналады. Бастапқыда әзірлеу оңай, бірақ өсу кезінде күрделі болуы мүмкін. Артықшылықтары: жөндеудің қарапайымдылығы, бірыңғай транзакциялық.' },
            { keywords: ['қабатты', 'layered', 'n-tier'], response: 'Қабатты архитектура (N-tier) қосымшаны көлденең қабаттарға бөледі: Presentation, Business, Data. Қолдауды және компоненттерді ауыстыруды жеңілдетеді.' },
            { keywords: ['api gateway', 'gateway'], response: 'API Gateway — барлық клиенттер үшін бірыңғай кіру нүктесі. Ол сұрауларды қажетті микросервистерге бағыттайды, аутентификацияны орындайды, жауаптарды біріктіреді.' },
            { keywords: ['circuit breaker', 'circuit', 'breaker'], response: 'Circuit Breaker — ақауға төзімділік үлгісі. Ол проблемалы сервиске шақыруларды уақытша блоктау арқылы каскадты ақауларды болдырмайды. Күйлері: CLOSED, OPEN, HALF_OPEN.' },
            { keywords: ['docker', 'контейнер'], response: 'Docker — қосымшаларды контейнерлеу платформасы. Қосымшаны барлық тәуелділіктерімен оқшауланған контейнерге орайды, оны орналастыру оңай.' },
            { keywords: ['kubernetes', 'k8s'], response: 'Kubernetes — контейнерлерді оркестрлеу жүйесі. Контейнерленген қосымшаларды орналастыруды, масштабтауды және жұмысын басқарады.' },
            { keywords: ['service discovery', 'eureka'], response: 'Service Discovery — микросервистерге бір-бірін IP-ге қатаң байланбай табуға мүмкіндік беретін механизм. Eureka — Netflix (Spring Cloud) іске асыруы.' },
            { keywords: ['config', 'конфигурация'], response: 'Spring Cloud Config — микросервистер үшін орталықтандырылған конфигурация қоймасы. Баптауларды қайта іске қоспай өзгертуге мүмкіндік береді.' },
            { keywords: ['рахмет', 'алғыс'], response: 'Оқасы жоқ! Көмектесуге қуаныштымын. Тағы сұрақтар болса — хабарласыңыз.' }
        ]
    };

    const faqQuestions = {
        ru: ['Что такое микросервисы?', 'Преимущества монолита', 'Как работает API Gateway?', 'Что такое Circuit Breaker?', 'Зачем нужен Docker?'],
        kk: ['Микросервистер дегеніміз не?', 'Монолиттің артықшылықтары', 'API Gateway қалай жұмыс істейді?', 'Circuit Breaker деген не?', 'Docker не үшін қажет?']
    };

    function generateResponse(userMessage) {
        const lang = I18n.getCurrentLanguage();
        const responses = mockResponses[lang] || mockResponses.ru;
        const lowerMsg = userMessage.toLowerCase();
        for (let item of responses) {
            if (item.keywords.some(kw => lowerMsg.includes(kw))) return item.response;
        }
        return lang === 'ru' 
            ? 'Извините, я ещё учусь и не знаю ответа на этот вопрос. Попробуйте спросить о микросервисах, монолитах, API Gateway, Circuit Breaker или Docker.'
            : 'Кешіріңіз, мен әлі үйреніп жатырмын және бұл сұраққа жауап білмеймін. Микросервистер, монолиттер, API Gateway, Circuit Breaker немесе Docker туралы сұрап көріңіз.';
    }

    function createWidget() {
        const lang = I18n.getCurrentLanguage();
        const faqList = faqQuestions[lang] || faqQuestions.ru;
        const faqHtml = faqList.map(q => `<button class="archai-faq-btn">${q}</button>`).join('');
        
        const html = `
            <div class="archai-widget">
                <button class="archai-toggle" id="archai-toggle" title="${lang === 'ru' ? 'ArchAI Assistant' : 'ArchAI көмекшісі'}">
                    <i class="fas fa-robot"></i>
                </button>
                <div class="archai-window" id="archai-window">
                    <div class="archai-header">
                        <span>ArchAI</span>
                        <button class="archai-close" id="archai-close"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="archai-messages" id="archai-messages"></div>
                    <div class="archai-faq" id="archai-faq">
                        <div class="archai-faq-title">${lang === 'ru' ? 'Часто задаваемые вопросы:' : 'Жиі қойылатын сұрақтар:'}</div>
                        <div class="archai-faq-buttons">${faqHtml}</div>
                    </div>
                    <div class="archai-input-area">
                        <input type="text" class="archai-input" id="archai-input" placeholder="${lang === 'ru' ? 'Задайте вопрос...' : 'Сұрағыңызды жазыңыз...'}">
                        <button class="archai-send" id="archai-send"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        widget = document.querySelector('.archai-widget');
        bindEvents();
        addWelcomeMessage();
    }

    function bindEvents() {
        const toggle = document.getElementById('archai-toggle');
        const close = document.getElementById('archai-close');
        const send = document.getElementById('archai-send');
        const input = document.getElementById('archai-input');
        const windowEl = document.getElementById('archai-window');

        toggle.addEventListener('click', () => {
            isOpen = !isOpen;
            windowEl.classList.toggle('open', isOpen);
        });
        close.addEventListener('click', () => {
            isOpen = false;
            windowEl.classList.remove('open');
        });
        send.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
        
        // FAQ buttons
        document.querySelectorAll('.archai-faq-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.textContent;
                addMessage(question, 'user');
                const messagesDiv = document.getElementById('archai-messages');
                const thinkingDiv = document.createElement('div');
                thinkingDiv.className = 'archai-message bot';
                thinkingDiv.id = 'archai-thinking';
                thinkingDiv.textContent = I18n.getCurrentLanguage() === 'ru' ? 'Печатает...' : 'Теруде...';
                messagesDiv.appendChild(thinkingDiv);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
                setTimeout(() => {
                    const thinking = document.getElementById('archai-thinking');
                    if (thinking) thinking.remove();
                    addMessage(generateResponse(question), 'bot');
                }, 1000);
            });
        });

        document.addEventListener('click', (e) => {
            if (isOpen && !widget.contains(e.target)) {
                isOpen = false;
                windowEl.classList.remove('open');
            }
        });
    }

    function sendMessage() {
        const input = document.getElementById('archai-input');
        const message = input.value.trim();
        if (!message) return;
        addMessage(message, 'user');
        input.value = '';
        const messagesDiv = document.getElementById('archai-messages');
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'archai-message bot';
        thinkingDiv.id = 'archai-thinking';
        thinkingDiv.textContent = I18n.getCurrentLanguage() === 'ru' ? 'Печатает...' : 'Теруде...';
        messagesDiv.appendChild(thinkingDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        setTimeout(() => {
            const thinking = document.getElementById('archai-thinking');
            if (thinking) thinking.remove();
            addMessage(generateResponse(message), 'bot');
        }, 1000 + Math.random() * 1000);
    }

    function addMessage(text, sender) {
        const messagesDiv = document.getElementById('archai-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `archai-message ${sender}`;
        msgDiv.textContent = text;
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function addWelcomeMessage() {
        const lang = I18n.getCurrentLanguage();
        addMessage(lang === 'ru' ? 'Здравствуйте! Я ArchAI. Чем могу помочь?' : 'Сәлеметсіз бе! Мен ArchAI. Қалай көмектесе аламын?', 'bot');
    }

    function updateLanguage() {
        if (!widget) return;
        const lang = I18n.getCurrentLanguage();
        const input = document.getElementById('archai-input');
        if (input) input.placeholder = lang === 'ru' ? 'Задайте вопрос...' : 'Сұрағыңызды жазыңыз...';
        const toggle = document.getElementById('archai-toggle');
        if (toggle) toggle.title = lang === 'ru' ? 'ArchAI Assistant' : 'ArchAI көмекшісі';
        
        const faqTitle = document.querySelector('.archai-faq-title');
        if (faqTitle) faqTitle.textContent = lang === 'ru' ? 'Часто задаваемые вопросы:' : 'Жиі қойылатын сұрақтар:';
        
        const faqButtons = document.querySelectorAll('.archai-faq-btn');
        const faqList = faqQuestions[lang] || faqQuestions.ru;
        faqButtons.forEach((btn, idx) => { if (faqList[idx]) btn.textContent = faqList[idx]; });
    }

    function init() {
        createWidget();
        window.addEventListener('languageChanged', updateLanguage);
    }

    return { init, updateLanguage };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(ArchAI.init, 100));
else setTimeout(ArchAI.init, 100);