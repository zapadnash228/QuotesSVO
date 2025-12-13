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

// Функция для скрытия всех секций
function hideAllSections() {
    initialMessage.classList.add('hidden');
    loading.classList.add('hidden');
    error.classList.add('hidden');
    quoteContent.classList.add('hidden');
}

// Простые переводы для популярных авторов и базовые шаблоны
const translations = {
    authors: {
        'Albert Einstein': 'Альберт Эйнштейн',
        'Steve Jobs': 'Стив Джобс',
        'Maya Angelou': 'Майя Энджелоу',
        'Oscar Wilde': 'Оскар Уайльд',
        'Mark Twain': 'Марк Твен',
        'Buddha': 'Будда',
        'Confucius': 'Конфуций',
        'Aristotle': 'Аристотель',
        'Socrates': 'Сократ',
        'Plato': 'Платон'
    }
};

// Функция для простого перевода через веб-API (Google Translate альтернатива)
async function translateText(text) {
    try {
        // Используем MyMemory Translation API (бесплатный, без ключа)
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ru`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        }
        return null;
    } catch (err) {
        console.error('Translation error:', err);
        return null;
    }
}

// Функция для получения цитаты
async function fetchQuote() {
    fetchQuoteBtn.disabled = true;
    buttonText.textContent = 'Загрузка...';
    buttonIcon.classList.add('spinning');
    
    hideAllSections();
    loading.classList.remove('hidden');
    
    try {
        // Используем Quotable API - стабильный и с CORS поддержкой
        const response = await fetch('https://api.quotable.io/random');
        
        if (!response.ok) {
            throw new Error('API недоступен');
        }
        
        const data = await response.json();
        
        if (!data.content) {
            throw new Error('Неверные данные от API');
        }
        
        const quote = data.content;
        const authorName = data.author || 'Unknown';
        
        // Переводим цитату
        const translatedText = await translateText(quote);
        
        // Переводим имя автора если есть в базе
        const translatedAuthor = translations.authors[authorName] || authorName;
        
        // Заполняем данные
        translatedQuote.textContent = translatedText || quote;
        originalQuote.textContent = `Оригинал: "${quote}"`;
        author.textContent = translatedAuthor;
        year.textContent = 'неизвестно';
        purpose.textContent = 'Вдохновляющая мысль от известной личности.';
        
        // Показываем результат
        hideAllSections();
        quoteContent.classList.remove('hidden');
        
    } catch (err) {
        console.error('Ошибка:', err);
        
        hideAllSections();
        error.classList.remove('hidden');
        errorMessage.textContent = `Ошибка: ${err.message}. Попробуйте снова.`;
    } finally {
        fetchQuoteBtn.disabled = false;
        buttonText.textContent = 'Получить новую цитату';
        buttonIcon.classList.remove('spinning');
    }
}

// Обработчик клика
fetchQuoteBtn.addEventListener('click', fetchQuote);
