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

// ВАЖНО: Весь код работает ТОЛЬКО через Claude API
// Никаких прямых запросов к ZenQuotes из браузера!
async function fetchAndTranslateQuote() {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1500,
                messages: [{
                    role: 'user',
                    content: `Получи случайную цитату из ZenQuotes API (https://zenquotes.io/api/random).
API возвращает JSON массив: [{"q": "quote", "a": "author"}]

Переведи цитату на русский и верни JSON (без markdown):
{
  "quote": "оригинал на английском",
  "author": "автор",
  "quoteRu": "перевод на русский",
  "year": "год/период",
  "purpose": "контекст на русском (1-2 предложения)"
}`
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Ошибка API: ${errorData.error?.message || response.status}`);
        }

        const data = await response.json();
        
        // Собираем текст из ответа
        let fullText = '';
        for (const item of data.content) {
            if (item.type === 'text') {
                fullText += item.text;
            }
        }
        
        // Убираем markdown
        const cleanedContent = fullText.replace(/```json|```/g, '').trim();
        
        // Парсим JSON
        const parsed = JSON.parse(cleanedContent);
        
        if (!parsed.quote || !parsed.quoteRu) {
            throw new Error('Неполные данные от API');
        }
        
        return parsed;
    } catch (err) {
        console.error('Ошибка получения цитаты:', err);
        throw err;
    }
}

// Основная функция
async function fetchQuote() {
    // Блокируем кнопку
    fetchQuoteBtn.disabled = true;
    buttonText.textContent = 'Загрузка...';
    buttonIcon.classList.add('spinning');
    
    // Показываем загрузку
    hideAllSections();
    loading.classList.remove('hidden');
    
    try {
        // Получаем цитату через Claude API
        const quoteData = await fetchAndTranslateQuote();
        
        // Заполняем данные
        translatedQuote.textContent = quoteData.quoteRu;
        originalQuote.textContent = `Оригинал: "${quoteData.quote}"`;
        author.textContent = quoteData.author;
        year.textContent = quoteData.year || 'неизвестно';
        purpose.textContent = quoteData.purpose || 'Вдохновляющая цитата';
        
        // Показываем результат
        hideAllSections();
        quoteContent.classList.remove('hidden');
        
    } catch (err) {
        console.error('Ошибка:', err);
        
        // Показываем ошибку
        hideAllSections();
        error.classList.remove('hidden');
        errorMessage.textContent = `${err.message}`;
    } finally {
        // Разблокируем кнопку
        fetchQuoteBtn.disabled = false;
        buttonText.textContent = 'Получить новую цитату';
        buttonIcon.classList.remove('spinning');
    }
}

// Слушатель события
fetchQuoteBtn.addEventListener('click', fetchQuote);
