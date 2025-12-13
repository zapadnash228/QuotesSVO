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

// Функция для перевода на русский через Claude API
async function translateToRussian(text, authorName) {
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
                    content: `Переведи эту цитату на русский язык и предоставь информацию в формате JSON:
            
Цитата: "${text}"
Автор: ${authorName}

Верни ТОЛЬКО JSON в таком формате (без markdown, без backticks):
{
  "text": "перевод цитаты на русский",
  "year": "примерный год или период (например: '1960-е' или 'неизвестно')",
  "purpose": "краткое объяснение цели или контекста цитаты (1-2 предложения на русском)"}`
                }]
            })
        });

        const data = await response.json();
        const content = data.content[0].text;
        
        // Очищаем от возможных markdown backticks
        const cleanedContent = content.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanedContent);
        
        return parsed;
    } catch (err) {
        console.error('Translation error:', err);
        return null;
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
        // Получаем цитату из ZenQuotes API
        const apiUrl = 'https://zenquotes.io/api/random';
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // ZenQuotes API возвращает массив с одной цитатой
        if (!data || !data[0]) {
            throw new Error('Неверный формат данных от API');
        }
        
        const quoteData = {
            q: data[0].q.trim(),
            a: data[0].a || 'Unknown'
        };
        
        // Переводим цитату через Claude API
        const translatedData = await translateToRussian(quoteData.q, quoteData.a);
        
        if (!translatedData) {
            throw new Error('Ошибка перевода цитаты');
        }
        
        // Заполняем данные
        translatedQuote.textContent = translatedData.text;
        originalQuote.textContent = `Оригинал: "${quoteData.q}"`;
        author.textContent = quoteData.a;
        year.textContent = translatedData.year;
        purpose.textContent = translatedData.purpose;
        
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
