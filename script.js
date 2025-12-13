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

// Скрыть все секции
function hideAllSections() {
    initialMessage.classList.add('hidden');
    loading.classList.add('hidden');
    error.classList.add('hidden');
    quoteContent.classList.add('hidden');
}

// Перевод популярных авторов
const authorsRu = {
    'Albert Einstein': 'Альберт Эйнштейн',
    'Steve Jobs': 'Стив Джобс',
    'Maya Angelou': 'Майя Энджелоу',
    'Oscar Wilde': 'Оскар Уайльд',
    'Mark Twain': 'Марк Твен',
    'Buddha': 'Будда',
    'Confucius': 'Конфуций',
    'Aristotle': 'Аристотель',
    'Marcus Aurelius': 'Марк Аврелий',
    'Winston Churchill': 'Уинстон Черчилль'
};

// Главная функция
async function fetchQuote() {
    fetchQuoteBtn.disabled = true;
    buttonText.textContent = 'Загрузка...';
    buttonIcon.classList.add('spinning');
    
    hideAllSections();
    loading.classList.remove('hidden');
    
    try {
        // Получаем цитату из Quotable API
        const res = await fetch('https://api.quotable.io/random');
        
        if (!res.ok) throw new Error('API недоступен');
        
        const data = await res.json();
        const quote = data.content;
        const authorEn = data.author || 'Unknown';
        
        // Переводим через MyMemory API
        const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(quote)}&langpair=en|ru`;
        const transRes = await fetch(translateUrl);
        const transData = await transRes.json();
        
        const quoteRu = transData.responseData?.translatedText || quote;
        const authorRu = authorsRu[authorEn] || authorEn;
        
        // Показываем данные
        translatedQuote.textContent = quoteRu;
        originalQuote.textContent = `Оригинал: "${quote}"`;
        author.textContent = authorRu;
        year.textContent = 'неизвестно';
        purpose.textContent = 'Вдохновляющая мысль великого человека.';
        
        hideAllSections();
        quoteContent.classList.remove('hidden');
        
    } catch (err) {
        console.error('Ошибка:', err);
        hideAllSections();
        error.classList.remove('hidden');
        errorMessage.textContent = `Ошибка: ${err.message}`;
    } finally {
        fetchQuoteBtn.disabled = false;
        buttonText.textContent = 'Получить новую цитату';
        buttonIcon.classList.remove('spinning');
    }
}

// Слушатель
fetchQuoteBtn.addEventListener('click', fetchQuote);
