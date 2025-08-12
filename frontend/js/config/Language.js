 const translations = {
            he: {
                'page-title': 'משחק שחמט - גרסה מודולרית',
                'game-title': '♔ משחק שחמט ♛',
                'white-turn': 'תור הלבן',
                'black-turn': 'תור השחור',
                'moves-list': '📝 רשימת המהלכים',
                'captured-pieces': '♜ כלים שנתפסו ♜',
                'white-pieces': 'כלי לבן',
                'black-pieces': 'כלי שחור',
                'new-game': 'משחק חדש',
                'undo-move': 'מהלך קודם',
                'redo-move': 'מהלך הבא',
                'check': 'שח!',
                'checkmate': 'מט! המשחק נגמר',
                'stalemate': 'תיקו! אין מהלכים חוקיים',
                'white-wins': 'הלבן ניצח!',
                'black-wins': 'השחור ניצח!',
                'game-over': 'המשחק נגמר'
            },
            en: {
                'page-title': 'Chess Game - Modular Version',
                'game-title': '♔ Chess Game ♛',
                'white-turn': "White's Turn",
                'black-turn': "Black's Turn",
                'moves-list': '📝 Moves List',
                'captured-pieces': '♜ Captured Pieces ♜',
                'white-pieces': 'White Pieces',
                'black-pieces': 'Black Pieces',
                'new-game': 'New Game',
                'undo-move': 'Undo Move',
                'redo-move': 'Redo Move',
                'check': 'Check!',
                'checkmate': 'Checkmate! Game Over',
                'stalemate': 'Stalemate! No Legal Moves',
                'white-wins': 'White Wins!',
                'black-wins': 'Black Wins!',
                'game-over': 'Game Over'
            }
        };

        // Language Management
        class LanguageManager {
            constructor() {
                this.currentLanguage = this.detectLanguage();
                this.init();
            }

            detectLanguage() {
                // Check localStorage first
                const savedLang = localStorage.getItem('chess-language');
                if (savedLang && translations[savedLang]) {
                    return savedLang;
                }

                // Detect browser language
                const browserLang = navigator.language.slice(0, 2);
                return translations[browserLang] ? browserLang : 'he';
            }

            init() {
                this.bindEvents();
                this.applyLanguage(this.currentLanguage);
            }

            bindEvents() {
                const langButtons = document.querySelectorAll('.lang-btn');
                langButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const lang = btn.dataset.lang;
                        this.setLanguage(lang);
                    });
                });
            }

            setLanguage(lang) {
                if (!translations[lang]) return;

                this.currentLanguage = lang;
                localStorage.setItem('chess-language', lang);
                this.applyLanguage(lang);
                this.updateActiveButton(lang);
            }

            applyLanguage(lang) {
                const html = document.documentElement;
                const body = document.body;

                // Set HTML attributes
                html.lang = lang;
                html.dir = lang === 'he' ? 'rtl' : 'ltr';
                
                // Add/remove RTL/LTR classes
                body.classList.toggle('ltr', lang !== 'he');

                // Update page title
                document.title = translations[lang]['page-title'];

                // Update all elements with data-translate
                const elements = document.querySelectorAll('[data-translate]');
                elements.forEach(element => {
                    const key = element.getAttribute('data-translate');
                    if (translations[lang][key]) {
                        element.textContent = translations[lang][key];
                    }
                });
            }

            updateActiveButton(lang) {
                const langButtons = document.querySelectorAll('.lang-btn');
                langButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.lang === lang);
                });
            }

            translate(key) {
                return translations[this.currentLanguage][key] || key;
            }
        }

        // Initialize Language Manager
        const langManager = new LanguageManager()