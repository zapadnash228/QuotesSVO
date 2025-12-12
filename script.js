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

// Массив с цитатами на случай если API недоступен
const fallbackQuotes = [
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        textRu: "Единственный способ делать великую работу - это любить то, что ты делаешь.",
        year: "2005",
        purpose: "Эта цитата из речи Стива Джобса в Стэнфордском университете вдохновляет людей следовать своей страсти и находить смысл в работе."
    },
    {
        text: "Life is what happens when you're busy making other plans.",
        author: "John Lennon",
        textRu: "Жизнь - это то, что происходит, когда ты занят построением других планов.",
        year: "1980",
        purpose: "Джон Леннон напоминает нам жить настоящим моментом, а не только планировать будущее."
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        textRu: "Будущее принадлежит тем, кто верит в красоту своих мечтаний.",
        year: "1960-е",
        purpose: "Элеонора Рузвельт вдохновляет людей верить в свои мечты и стремиться к их осуществлению."
    },
    {
        text: "In the middle of difficulty lies opportunity.",
        author: "Albert Einstein",
        textRu: "В центре трудности кроется возможность.",
        year: "1940-е",
        purpose: "Эйнштейн учит нас видеть возможности даже в самых сложных ситуациях."
    },
    {
        text: "Be yourself; everyone else is already taken.",
        author: "Oscar Wilde",
        textRu: "Будь собой; все остальные уже заняты.",
        year: "1890-е",
        purpose: "Оскар Уайльд призывает к аутентичности и индивидуальности в жизни."
    }
];

// Функция для скрытия всех секций
function hideAllSections() {
    initialMessage.classList.add('hidden');
    loading.classList.add('hidden');
    error.classList.add('hidden');
    quoteContent.classList.add('hidden');
}

// Функция для получения случайной цитаты из fallback массива
function getFallbackQuote() {
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    return fallbackQuotes[randomIndex];
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
  "purpose": "краткое объяснение цели или контекста цитаты (1-2 предложения на русском)"
}`
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
        // Пробуем получить цитату из API
        let quoteData = null;
        let translatedData = null;
        
        try {
            // Используем API Forismatic (работает без HTTPS проблем)
            const apiUrl = 'http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en';
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data && data.quoteText) {
                quoteData = {
                    q: data.quoteText.trim(),
                    a: data.quoteAuthor || 'Unknown'
                };
                
                // Переводим цитату
                translatedData = await translateToRussian(quoteData.q, quoteData.a);
            }
        } catch (apiError) {
            console.log('API недоступен, используем локальные цитаты');
            // Если API не работает, используем fallback
            const fallback = getFallbackQuote();
            quoteData = {
                q: fallback.text,
                a: fallback.author
            };
            translatedData = {
                text: fallback.textRu,
                year: fallback.year,
                purpose: fallback.purpose
            };
        }
        
        // Если перевод не удался, используем fallback
        if (!translatedData) {
            const fallback = getFallbackQuote();
            translatedData = {
                text: fallback.textRu,
                year: fallback.year,
                purpose: fallback.purpose
            };
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
        // В случае полной ошибки используем fallback
        const fallback = getFallbackQuote();
        
        translatedQuote.textContent = fallback.textRu;
        originalQuote.textContent = `Оригинал: "${fallback.text}"`;
        author.textContent = fallback.author;
        year.textContent = fallback.year;
        purpose.textContent = fallback.purpose;
        
        hideAllSections();
        quoteContent.classList.remove('hidden');
    } finally {
        // Включаем кнопку
        fetchQuoteBtn.disabled = false;
        buttonText.textContent = 'Получить новую цитату';
        buttonIcon.classList.remove('spinning');
    }
}

// Обработчик клика на кнопку
fetchQuoteBtn.addEventListener('click', fetchQuote);