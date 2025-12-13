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

// Функция для получения и перевода цитаты через Claude API
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
                    content: `Сделай GET запрос к API ZenQuotes: https://zenquotes.io/api/random

Этот API возвращает массив с одной цитатой в формате:
[{"q": "quote text", "a": "author name", "h": "html quote"}]

После получения цитаты, переведи её на русский и верни мне данные в JSON формате.

Верни ТОЛЬКО JSON (без markdown, без backticks):
{
  "quote": "оригинальная цитата на английском",
  "author": "автор",
  "quoteRu": "перевод на русский",
  "year": "примерный год или период",
  "purpose": "краткое объяснение контекста (1-2 предложения на русском)"
}`
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API недоступен (статус: ${response.status})`);
        }

        const data = await response.json();
        
        // Получаем текст ответа
        let fullText = '';
        for (const item of data.content) {
            if (item.type === 'text') {
                fullText += item.text;
            }
        }
        
        // Очищаем от markdown
        const cleanedContent = fullText.replace(/```json|```/g, '').trim();
        
        // Парсим JSON
        const parsed = JSON.parse(cleanedContent);
        
        if (!parsed.quote || !parsed.author) {
            throw new Error('Неверный формат данных');
        }
        
        return parsed;
    } catch (err) {
        console.error('API error:', err);
        throw new Error('Не удалось получить цитату');
    }
}

// Основная функция получения цитаты
async function fetchQuote() {
    // Отключаем кнопку
    fetchQuoteBtn.disabled = true;
    buttonText.textContent = 'Загрузка...';
    buttonIcon.classList.add('spinning');
    
    // Показываем загрузку
    hideAllSections();
    loading.classList.remove('hidden');
    
    try {
        // Получаем и переводим цитату через Claude
        const quoteData = await fetchAndTranslateQuote();
        
        // Заполняем данные
        translatedQuote.textContent = quoteData.quoteRu;
        originalQuote.textContent = `Оригинал: "${quoteData.quote}"`;
        author.textContent = quoteData.author;
        year.textContent = quoteData.year;
        purpose.textContent = quoteData.purpose;
        
        // Показываем контент
        hideAllSections();
        quoteContent.classList.remove('hidden');
        
    } catch (err) {
        console.error('Error:', err);
        
        // Показываем ошибку
        hideAllSections();
        error.classList.remove('hidden');
        errorMessage.textContent = `${err.message}. Попробуйте еще раз.`;
    } finally {
        // Включаем кнопку
        fetchQuoteBtn.disabled = false;
        buttonText.textContent = 'Получить новую цитату';
        buttonIcon.classList.remove('spinning');
    }
}

// Обработчик клика на кнопку
fetchQuoteBtn.addEventListener('click', fetchQuote);
