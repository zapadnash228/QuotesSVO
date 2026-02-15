// Локальные цитаты на случай если API не работает
const localQuotes = [
    {
        quote: "The only way to do great work is to love what you do.",
        quoteRu: "Единственный способ делать великую работу - любить то, что ты делаешь.",
        author: "Steve Jobs",
        authorRu: "Стив Джобс"
    },
    {
        quote: "Innovation distinguishes between a leader and a follower.",
        quoteRu: "Инновации отличают лидера от последователя.",
        author: "Steve Jobs",
        authorRu: "Стив Джобс"
    },
    {
        quote: "Life is what happens when you're busy making other plans.",
        quoteRu: "Жизнь - это то, что происходит, пока ты строишь другие планы.",
        author: "John Lennon",
        authorRu: "Джон Леннон"
    },
    {
        quote: "The future belongs to those who believe in the beauty of their dreams.",
        quoteRu: "Будущее принадлежит тем, кто верит в красоту своих мечтаний.",
        author: "Eleanor Roosevelt",
        authorRu: "Элеонора Рузвельт"
    },
    {
        quote: "In the middle of difficulty lies opportunity.",
        quoteRu: "В центре трудности кроется возможность.",
        author: "Albert Einstein",
        authorRu: "Альберт Эйнштейн"
    },
    {
        quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        quoteRu: "Успех не окончателен, неудача не фатальна: важна смелость продолжать.",
        author: "Winston Churchill",
        authorRu: "Уинстон Черчилль"
    },
    {
        quote: "Believe you can and you're halfway there.",
        quoteRu: "Поверь, что можешь, и ты уже на полпути.",
        author: "Theodore Roosevelt",
        authorRu: "Теодор Рузвельт"
    },
    {
        quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
        quoteRu: "Лучшее время посадить дерево было 20 лет назад. Второе лучшее время - сейчас.",
        author: "Chinese Proverb",
        authorRu: "Китайская пословица"
    }
];

// ============================================
// REACT КОМПОНЕНТ
// ============================================
function ZenQuotesApp() {
 
    const [state, setState] = React.useState('initial'); // 'initial', 'loading', 'error', 'success'
    const [quoteData, setQuoteData] = React.useState(null);
    const [errorMsg, setErrorMsg] = React.useState('');
    const [isButtonLoading, setIsButtonLoading] = React.useState(false);

    // Попытка получить из API
    const tryFetchFromAPI = async () => {
        const apis = [
            'https://api.quotable.io/random',
            'https://quotes.rest/qod',
            'https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en'
        ];
        
        for (const apiUrl of apis) {
            try {
                const response = await fetch(apiUrl, { mode: 'cors' });
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.content) {
                        return {
                            quote: data.content,
                            author: data.author || 'Unknown',
                            fromAPI: true
                        };
                    }
                    
                    if (data.quoteText) {
                        return {
                            quote: data.quoteText.trim(),
                            author: data.quoteAuthor || 'Unknown',
                            fromAPI: true
                        };
                    }
                }
            } catch (err) {
                console.log(`API ${apiUrl} failed:`, err);
                continue;
            }
        }
        
        return null;
    };

    // Простой перевод
    const translateSimple = async (text) => {
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ru`;
            const res = await fetch(url);
            const data = await res.json();
            return data.responseData?.translatedText || null;
        } catch {
            return null;
        }
    };

    const fetchQuote = async () => {
        setIsButtonLoading(true);
        setState('loading'); // ← React сам перерисует и покажет loading
        
        try {
            const apiQuote = await tryFetchFromAPI();
            
            let quote, author, quoteRu, authorRu;
            
            if (apiQuote) {
                quote = apiQuote.quote;
                author = apiQuote.author;
                quoteRu = await translateSimple(quote) || quote;
                authorRu = author;
            } else {
                const randomQuote = localQuotes[Math.floor(Math.random() * localQuotes.length)];
                quote = randomQuote.quote;
                author = randomQuote.author;
                quoteRu = randomQuote.quoteRu;
                authorRu = randomQuote.authorRu;
            }
            
            setQuoteData({
                quote,
                quoteRu,
                author,
                authorRu,
                year: 'неизвестно',
                purpose: 'Мудрая мысль для вдохновения.'
            });
            
            setState('success'); // ← React сам покажет цитату
            
        } catch (err) {
            console.error('Ошибка:', err);
            setState('error'); // ← React сам покажет ошибку
            setErrorMsg('Произошла ошибка. Проверьте подключение к интернету.');
        } finally {
            setIsButtonLoading(false);
        }
    };

    return (
        <div className="container">
            {/* Заголовок */}
            <div className="header">
                <h1 className="title">💭 ZenQuotes</h1>
                <p className="subtitle">Мудрость великих людей</p>
            </div>

            {/* Карточка с цитатой */}
            <div className="card">
              
                
                {/* Начальное сообщение */}
                {state === 'initial' && (
                    <div className="initial-message">
                        <p>Нажмите на кнопку, чтобы получить вдохновляющую цитату</p>
                    </div>
                )}

                {/* Индикатор загрузки */}
                {state === 'loading' && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Загрузка мудрости...</p>
                    </div>
                )}

                {/* Сообщение об ошибке */}
                {state === 'error' && (
                    <div className="error">
                        <p>{errorMsg}</p>
                    </div>
                )}

                {/* Контент цитаты */}
                {state === 'success' && quoteData && (
                    <div className="quote-content">
                        {/* Переведенная цитата */}
                        <div className="quote-main">
                            <div className="quote-mark-open">"</div>
                            <p className="quote-text">{quoteData.quoteRu}</p>
                            <div className="quote-mark-close">"</div>
                        </div>

                        {/* Оригинальная цитата */}
                        <div className="original-quote">
                            <p>Оригинал: "{quoteData.quote}"</p>
                        </div>

                        {/* Автор */}
                        <div className="author-info">
                            <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span className="author-name">{quoteData.authorRu}</span>
                        </div>

                        {/* Год */}
                        <div className="info-block">
                            <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <div>
                                <p className="info-label">Период:</p>
                                <p className="info-text">{quoteData.year}</p>
                            </div>
                        </div>

                        {/* Контекст */}
                        <div className="info-block">
                            <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <circle cx="12" cy="12" r="6"></circle>
                                <circle cx="12" cy="12" r="2"></circle>
                            </svg>
                            <div>
                                <p className="info-label">Контекст:</p>
                                <p className="info-text">{quoteData.purpose}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Кнопка */}
            <div className="button-container">
                <button 
                    onClick={fetchQuote}
                    disabled={isButtonLoading}
                    className="fetch-button"
                >
                    <svg 
                        className={`button-icon ${isButtonLoading ? 'spinning' : ''}`}
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    <span>{isButtonLoading ? 'Загрузка...' : 'Получить новую цитату'}</span>
                </button>
            </div>

            {/* Футер */}
            <div className="footer">
                <p>Powered by ZenQuotes API & Claude AI (React Version)</p>
            </div>
        </div>
    );
}


// React берёт наш компонент и засовывает его в <div id="root">
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ZenQuotesApp />);
