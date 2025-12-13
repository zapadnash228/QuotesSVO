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

// Функция для получения цитаты через Claude API
async function fetchQuoteFromClaude() {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `Получи случайную вдохновляющую цитату от ZenQuotes API (https://zenquotes.io/api/random) и верни мне данные в формате JSON.

Верни ТОЛЬКО JSON в таком формате (без markdown, без backticks):
{
  "quote": "текст цитаты на английском",
  "author": "автор цитаты",
  "quoteRu": "перевод цитаты на русский",
  "year": "примерный год или период",
  "purpose": "краткое объяснение цели или контекста цитаты (1-2 предложения на русском)"
}`
                }],
                tools: [{
                    type: "web_search_20250305",
                    name: "web_search"
                }]
            })
        });

        const data = await response.json();
        
        // Собираем весь текстовый контент
        let fullText = '';
        for (const item of data.content) {
            if (item.type === 'text') {
                fullText += item.text;
            }
        }
        
        // Очищаем от возможных markdown backticks
        const cleanedContent = fullText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanedContent);
        
        return parsed;
    } catch (err) {
        console.error('Claude API error:', err);
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
        // Получаем цитату через Claude API
        const quoteData = await fetchQuoteFromClaude();
        
        if (!quoteData || !quoteData.quote) {
            throw new Error('Неверный формат данных');
        }
        
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
        errorMessage.textContent = `Ошибка загрузки цитаты: ${err.message}`;
    } finally {
        // Включаем кнопку
        fetchQuoteBtn.disabled = false;
        buttonText.textContent = 'Получить новую цитату';
        buttonIcon.classList.remove('spinning');
    }
}

// Обработчик клика на кнопку
fetchQuoteBtn.addEventListener('click', fetchQuote);
