const QRCodeWidget = (function() {
    let modal = null;
    const SITE_URL = window.location.origin + '/index.html'; // Всегда ведёт на главную

    function loadQRCodeLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof qrcode !== 'undefined') return resolve();
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function generateQRCode(url) {
        const qr = qrcode(0, 'M');
        qr.addData(url);
        qr.make();
        const size = 240;
        const cellsize = size / qr.getModuleCount();
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        for (let row = 0; row < qr.getModuleCount(); row++) {
            for (let col = 0; col < qr.getModuleCount(); col++) {
                ctx.fillStyle = qr.isDark(row, col) ? '#8B5CF6' : '#ffffff';
                ctx.fillRect(col * cellsize, row * cellsize, cellsize, cellsize);
            }
        }
        
        // Логотип ArchEdu по центру
        const logoSize = size * 0.22;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(size/2, size/2, logoSize/2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#8B5CF6';
        ctx.font = `bold ${logoSize * 0.55}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('A', size/2, size/2);
        
        return canvas;
    }

    function createModal() {
        const lang = I18n.getCurrentLanguage();
        const html = `
            <div class="modal qr-modal" id="qr-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="qr-title">${lang === 'ru' ? 'QR-код ArchEdu' : 'ArchEdu QR-коды'}</h3>
                        <button class="modal-close" id="qr-close"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="qr-container">
                            <div class="qr-code" id="qr-code-container"></div>
                            <div class="qr-site-url">archedu.kz</div>
                            <p class="qr-desc" id="qr-description">${lang === 'ru' ? 'Отсканируйте, чтобы открыть наш сайт' : 'Біздің сайтты ашу үшін сканерлеңіз'}</p>
                            <button class="btn btn-primary" id="qr-download">
                                <i class="fas fa-download"></i> <span id="qr-download-text">${lang === 'ru' ? 'Скачать QR-код' : 'QR-кодты жүктеу'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        modal = document.getElementById('qr-modal');
        
        document.getElementById('qr-close').addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
        
        return modal;
    }

    async function show() {
        await loadQRCodeLibrary();
        if (!modal) modal = createModal();
        
        const canvas = generateQRCode(SITE_URL);
        const container = document.getElementById('qr-code-container');
        container.innerHTML = '';
        container.appendChild(canvas);
        
        modal.style.display = 'flex';
        
        document.getElementById('qr-download').onclick = () => {
            const link = document.createElement('a');
            link.download = 'archedu-qr.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
    }

    function updateLanguage() {
        if (!modal) return;
        const lang = I18n.getCurrentLanguage();
        document.getElementById('qr-title').textContent = lang === 'ru' ? 'QR-код ArchEdu' : 'ArchEdu QR-коды';
        document.getElementById('qr-description').textContent = lang === 'ru' ? 'Отсканируйте, чтобы открыть наш сайт' : 'Біздің сайтты ашу үшін сканерлеңіз';
        document.getElementById('qr-download-text').textContent = lang === 'ru' ? 'Скачать QR-код' : 'QR-кодты жүктеу';
        const toggle = document.getElementById('qr-toggle');
        if (toggle) toggle.title = lang === 'ru' ? 'QR-код сайта' : 'Сайттың QR-коды';
    }

    function createToggle() {
        const lang = I18n.getCurrentLanguage();
        const toggle = document.createElement('button');
        toggle.id = 'qr-toggle';
        toggle.className = 'qr-toggle';
        toggle.innerHTML = '<i class="fas fa-qrcode"></i>';
        toggle.title = lang === 'ru' ? 'QR-код сайта' : 'Сайттың QR-коды';
        toggle.addEventListener('click', show);
        document.body.appendChild(toggle);
    }

    function init() {
        createToggle();
        window.addEventListener('languageChanged', updateLanguage);
        
        // Дополнительно: кнопка в футере
        const footerBottom = document.querySelector('.footer-bottom');
        if (footerBottom) {
            const footerBtn = document.createElement('button');
            footerBtn.className = 'btn-outline';
            footerBtn.style.marginLeft = '1rem';
            footerBtn.innerHTML = '<i class="fas fa-qrcode"></i> <span id="footer-qr-text">QR-код</span>';
            footerBtn.addEventListener('click', show);
            footerBottom.appendChild(footerBtn);
            window.addEventListener('languageChanged', () => {
                const span = document.getElementById('footer-qr-text');
                if (span) span.textContent = I18n.getCurrentLanguage() === 'ru' ? 'QR-код' : 'QR-коды';
            });
        }
    }

    return { init, show };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(QRCodeWidget.init, 200));
else setTimeout(QRCodeWidget.init, 200);