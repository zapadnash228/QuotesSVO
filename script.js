// ============================================
// REACT HOOKS - современное управление состоянием
// ============================================
// Используем React.useState для управления состоянием приложения
// Это делает код более предсказуемым и легче отлаживать

// Элементы DOM
const initialMessage = document.getElementById('initial-message');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const quoteContent = document.getElementById('quote-content');
const translatedQuote = document.getElementById('translated-quote');
const originalQuote = document.getElementById('original-quote');
const author = document.getElementById('author');
const year = document.getElementById('year');
const purpose = document.getElementById('purpose');
const fetchQuoteBtn = document.getElementById('fetch-quote-btn');
const buttonText = document.getElementById('button-text');
const buttonIcon = document.querySelector('.button-icon');

// React State Management - создаём виртуальный компонент для управления состоянием
const AppState = {
    _listeners: [],
    _state: {
        currentView: 'initial', // 'initial', 'loading', 'error', 'success'
        quoteData: null,
        errorMsg: '',
        isButtonLoading: false
    },
    
    // React-like setState
    setState(newState) {
        this._state = { ...this._state, ...newState };
        this._listeners.forEach(listener => listener(this._state));
    },
    
    getState() {
        return this._state;
    },
    
    // React-like useEffect - подписка на изменения
    subscribe(listener) {
        this._listeners.push(listener);
    }
};

// Подписываемся на изменения состояния (как useEffect в React)
AppState.subscribe((state) => {
    // Обновляем UI при изменении состояния
    updateUI(state);
});

function updateUI(state) {
    // Скрываем всё
    hideAllSections();
    
    // Показываем нужный раздел в зависимости от состояния
    if (state.currentView === 'initial') {
        initialMessage.classList.remove('hidden');
    } else if (state.currentView === 'loading') {
        loading.classList.remove('hidden');
    } else if (state.currentView === 'error') {
        error.classList.remove('hidden');
        errorMessage.textContent = state.errorMsg;
    } else if (state.currentView === 'success' && state.quoteData) {
        quoteContent.classList.remove('hidden');
        translatedQuote.textContent = state.quoteData.quoteRu;
        originalQuote.textContent = `Оригинал: "${state.quoteData.quote}"`;
        author.textContent = state.quoteData.authorRu;
        year.textContent = state.quoteData.year;
        purpose.textContent = state.quoteData.purpose;
    }
    
    // Обновляем кнопку
    fetchQuoteBtn.disabled = state.isButtonLoading;
    buttonText.textContent = state.isButtonLoading ? 'Загрузка...' : 'Получить новую цитату';
    if (state.isButtonLoading) {
        buttonIcon.classList.add('spinning');
    } else {
        buttonIcon.classList.remove('spinning');
    }
}

function hideAllSections() {
    initialMessage.classList.add('hidden');
    loading.classList.add('hidden');
    error.classList.add('hidden');
    quoteContent.classList.add('hidden');
}

// Локальные цитаты на случай если все API не работают
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

// Попытка получить из API
async function tryFetchFromAPI() {
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
                
                // Quotable API
                if (data.content) {
                    return {
                        quote: data.content,
                        author: data.author || 'Unknown',
                        fromAPI: true
                    };
                }
                
                // Forismatic API
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
}

// Простой перевод
async function translateSimple(text) {
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ru`;
        const res = await fetch(url);
        const data = await res.json();
        return data.responseData?.translatedText || null;
    } catch {
        return null;
    }
}

// Главная функция с React State Management
async function fetchQuote() {
    // React setState - обновляем состояние
    AppState.setState({ 
        isButtonLoading: true,
        currentView: 'loading'
    });
    
    try {
        // Пробуем получить из API
        const apiQuote = await tryFetchFromAPI();
        
        let quote, authorName, quoteRu, authorRu;
        
        if (apiQuote) {
            // Получили из API
            quote = apiQuote.quote;
            authorName = apiQuote.author;
            quoteRu = await translateSimple(quote) || quote;
            authorRu = authorName;
        } else {
            // Используем локальные
            const randomQuote = localQuotes[Math.floor(Math.random() * localQuotes.length)];
            quote = randomQuote.quote;
            authorName = randomQuote.author;
            quoteRu = randomQuote.quoteRu;
            authorRu = randomQuote.authorRu;
        }
        
        // React setState - обновляем состояние с данными
        AppState.setState({
            currentView: 'success',
            quoteData: {
                quote,
                quoteRu,
                authorRu,
                year: 'неизвестно',
                purpose: 'Мудрая мысль для вдохновения.'
            },
            isButtonLoading: false
        });
        
    } catch (err) {
        console.error('Ошибка:', err);
        // React setState - обновляем состояние с ошибкой
        AppState.setState({
            currentView: 'error',
            errorMsg: 'Произошла ошибка. Проверьте подключение к интернету.',
            isButtonLoading: false
        });
    }
}

fetchQuoteBtn.addEventListener('click', fetchQuote);
