console.log('Script başlatılıyor...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM yüklendi, başlatılıyor...');
    
    try {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log('Giriş durumu:', isLoggedIn);
        
        if (!isLoggedIn || !currentUser) {
            console.log('Kullanıcı giriş yapmamış, giriş sayfasına yönlendiriliyor...');
            window.location.href = 'giris.html';
            return;
        }

        const chatMessages = document.querySelector('.chat-messages');
        const chatInput = document.querySelector('.chat-input textarea');
        const sendButton = document.querySelector('.chat-input button');

        if (!chatMessages || !chatInput || !sendButton) {
            console.error('Gerekli DOM elementleri bulunamadı:', {
                chatMessages: !!chatMessages,
                chatInput: !!chatInput,
                sendButton: !!sendButton
            });
            return;
        }

        console.log('DOM elementleri başarıyla bulundu');

        const API_KEY = 'Your_API_Key';
        const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';
        let retryCount = 0;
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 2000; // 2 seconds
        const TIMEOUT_DURATION = 60000; // 60 seconds


        let chatHistory = [];
        

        const suggestionPool = [
            { text: "📐 Matematikte integral konusunu açıklar mısın", suggestion: "Matematikte integral konusunu açıklar mısın?" },
            { text: "⚡ Fizikte elektrik konusunda yardım eder misin", suggestion: "Fizikte elektrik konusunda yardım eder misin?" },
            { text: "🧪 Kimya organik bileşikler konusunu anlatır mısın", suggestion: "Kimya organik bileşikler konusunu anlatır mısın?" },
            { text: "🧬 Biyolojide kalıtımın genel ilkeleri konusunu açıklar mısın", suggestion: "Biyolojide kalıtımın genel ilkeleri konusunu açıklar mısın?" },
            { text: "🎯 YKS sınav stratejileri önerir misin", suggestion: "YKS sınav stratejileri önerir misin?" },
            { text: "📅 Çalışma programı nasıl hazırlarım", suggestion: "Çalışma programı nasıl hazırlarım?" },
            { text: "😌 Sınav kaygısı nasıl yönetilir", suggestion: "Sınav kaygısı nasıl yönetilir?" },
            { text: "🎯 Hangi konulara odaklanmalıyım", suggestion: "Hangi konulara odaklanmalıyım?" },
            { text: "📊 Matematikte analitik geometri konusunu açıklar mısın", suggestion: "Matematikte analitik geometri konusunu açıklar mısın?" },
            { text: "⚛️ Kimya atom teorisi konusunda yardım eder misin", suggestion: "Kimya atom teorisi konusunda yardım eder misin?" },
            { text: "🔬 Biyolojide hücre konusunu anlatır mısın", suggestion: "Biyolojide hücre konusunu anlatır mısın?" },
            { text: "🌊 Fizikte dalgalar konusunu açıklar mısın", suggestion: "Fizikte dalgalar konusunu açıklar mısın?" },
            { text: "📈 Matematikte fonksiyonlar konusunda yardım eder misin", suggestion: "Matematikte fonksiyonlar konusunda yardım eder misin?" },
            { text: "⚗️ Kimya asit-baz konusunu anlatır mısın", suggestion: "Kimya asit-baz konusunu anlatır mısın?" },
            { text: "🧠 Biyolojide sinir sistemi konusunu açıklar mısın", suggestion: "Biyolojide sinir sistemi konusunu açıklar mısın?" },
            { text: "⚙️ Fizikte mekanik konusunda yardım eder misin", suggestion: "Fizikte mekanik konusunda yardım eder misin?" },
            { text: "📚 YKS deneme sınavları nasıl çözülür", suggestion: "YKS deneme sınavları nasıl çözülür?" },
            { text: "⏰ Sınavda zaman yönetimi nasıl yapılır", suggestion: "Sınavda zaman yönetimi nasıl yapılır?" },
            { text: "🎓 Çalışma motivasyonu nasıl artırılır", suggestion: "Çalışma motivasyonu nasıl artırılır?" },
        ];
        

        function getRandomSuggestions(count = 2) {
            const shuffled = [...suggestionPool].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }
        

        function createFloatingSuggestions() {
            const container = document.getElementById('floating-suggestions');
            if (!container) return;
            

            container.innerHTML = '';
            

            const randomSuggestions = getRandomSuggestions(2);
            

            randomSuggestions.forEach(item => {
                const button = document.createElement('button');
                button.className = 'floating-suggestion';
                button.setAttribute('data-suggestion', item.suggestion);
                button.textContent = item.text;
                

                button.addEventListener('click', () => {
                    const suggestion = button.getAttribute('data-suggestion');
                    if (suggestion) {
                        chatInput.value = suggestion;
                        chatInput.focus();
                        

                        container.style.display = 'none';
                        

                        sendMessage();
                    }
                });
                
                container.appendChild(button);
            });
        }
        

        const SYSTEM_PROMPT = `Sen NetOdak adlı bir eğitim platformunun AI asistanısın. Görevin öğrencilere derslerinde yardımcı olmak ve eğitim konularında rehberlik etmek.

Özelliklerin:
- Kişisel koçluk yapay zekasısın
- Öğrencilere rehberlik edersin
- YKS sınavına yönelik bir AI asistanısın
- YKS sınavına hazırlık ödevlerinde yardım edersin
- YKS sınavına hazırlık konularında rehberlik edersin
- YKS sınavına hazırlık sorularını yanıtlarsın
- YKS sınavına hazırlık ödevlerinin çözümlerini yapar ve açıklamalar yaparsın
- YKS sınavına hazırlık ödevlerinin açıklamalarını yaparsın
- YKS sınavına hazırlık ödevlerinin öğrenme stratejilerini önerirsin
- YKS sınavına hazırlık ödevlerinin öğrencileri motive edersin ve cesaretlendirirsin
- Matematik, Fizik, Kimya, Biyoloji gibi derslerde soruları yanıtlarsın
- Ödevlerde yardım edersin ve açıklamalar yaparsın
- Öğrenme stratejileri önerirsin
- Türkçe konuşursun ve samimi bir ton kullanırsın
- Karmaşık konuları basit ve anlaşılır şekilde açıklarsın
- Öğrencileri motive edersin ve cesaretlendirirsin

Kuralların:
- Cümleleri çok uzatmadan anlaşılır bir şekilde açıkla
- Sadece eğitim ve öğrenme konularında yardım et, diğer konularda da az çok yardımcı olursun
- Ödevleri tamamen çözme, sadece yol göster en son adım olarak ödevleri tamamen çözmeyi yaparsın
- Güvenli ve uygun içerik üret
- Öğrencinin yaş seviyesine uygun açıklamalar yap`;


        chatHistory.push({
            role: 'user',
            content: SYSTEM_PROMPT
        });


        async function validateApiKey() {
            console.log('API anahtarı doğrulanıyor...');
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
                console.log('API yanıt durumu:', response.status);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Anahtarı Doğrulama Hatası:', errorData);
                    addMessage('API anahtarı doğrulanamadı. Lütfen Google Cloud Console\'da API\'nin etkin olduğundan ve faturalandırma hesabının bağlı olduğundan emin olun.', 'ai');
                    return false;
                }
                console.log('API anahtarı doğrulandı');
                return true;
            } catch (error) {
                console.error('API Anahtarı Doğrulama Hatası:', error);
                addMessage('API anahtarı doğrulanamadı. Lütfen internet bağlantınızı kontrol edin.', 'ai');
                return false;
            }
        }


        validateApiKey();

        async function sendMessage() {
            console.log('Mesaj gönderme işlemi başlatılıyor...');
            const message = chatInput.value.trim();
            if (!message) {
                console.log('Boş mesaj, işlem iptal edildi');
                return;
            }


            const isValid = await validateApiKey();
            if (!isValid) {
                console.log('API anahtarı geçersiz, işlem iptal edildi');
                return;
            }

            console.log('Gönderilen mesaj:', message);
            addMessage(message, 'user');
            chatInput.value = '';


            const floatingSuggestionsContainer = document.getElementById('floating-suggestions');
            if (floatingSuggestionsContainer) {
                floatingSuggestionsContainer.style.display = 'none';
            }


            chatHistory.push({
                role: 'user',
                content: message
            });

            const loadingMessage = addLoadingMessage();

            try {
                console.log('API isteği gönderiliyor...');
                const requestBody = {
                    contents: chatHistory.map(msg => ({
                        role: msg.role,
                        parts: [{
                            text: msg.content
                        }]
                    })),
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                };

                console.log('İstek gövdesi:', JSON.stringify(requestBody, null, 2));
                console.log('API URL:', API_URL);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

                const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                console.log('API yanıt durumu:', response.status);
                console.log('API yanıt başlıkları:', Object.fromEntries(response.headers.entries()));
                
                const responseText = await response.text();
                console.log('API yanıt metni:', responseText);
                
                if (!response.ok) {
                    console.error('API hatası:', responseText);
                    

                    if (response.status === 503 && retryCount < MAX_RETRIES) {
                        retryCount++;
                        console.log(`Yeniden deneme ${retryCount}/${MAX_RETRIES}...`);
                        loadingMessage.querySelector('.message-content').textContent = `Yeniden deneniyor (${retryCount}/${MAX_RETRIES})...`;
                        

                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                        return sendMessage();
                    }
                    
                    throw new Error(`API error: ${response.status} - ${responseText}`);
                }


                retryCount = 0;

                let data;
                try {
                    data = JSON.parse(responseText);
                    console.log('API yanıtı (JSON):', data);
                } catch (e) {
                    console.error('JSON ayrıştırma hatası:', e);
                    throw new Error('Invalid JSON response');
                }

                loadingMessage.remove();

                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const aiResponse = data.candidates[0].content.parts[0].text;
                    console.log('AI yanıtı:', aiResponse);
                    addMessage(aiResponse, 'ai');
                    

                    chatHistory.push({
                        role: 'model',
                        content: aiResponse
                    });


                    if (chatHistory.length > 10) {
                        chatHistory = chatHistory.slice(-10);
                    }
                } else {
                    console.error('Geçersiz API yanıt formatı:', data);
                    throw new Error('Invalid API response format');
                }
            } catch (error) {
                console.error('Hata detayı:', error);
                loadingMessage.remove();
                
                let errorMessage = 'Üzgünüm, bir hata oluştu. ';
                if (error.name === 'AbortError') {
                    errorMessage += 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
                } else if (error.message.includes('503')) {
                    errorMessage += 'Model şu anda yoğun. Lütfen biraz sonra tekrar deneyin.';
                } else if (error.message.includes('403')) {
                    errorMessage += 'API erişim izni reddedildi. Lütfen API anahtarınızı ve izinlerinizi kontrol edin.';
                } else if (error.message.includes('401')) {
                    errorMessage += 'Geçersiz API anahtarı. Lütfen API anahtarınızı kontrol edin.';
                } else {
                    errorMessage += 'Lütfen tekrar deneyin. Hata: ' + error.message;
                }
                
                addMessage(errorMessage, 'ai');
            }
        }

        function addMessage(text, type) {
            console.log(`${type} mesajı ekleniyor:`, text);
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            

            if (type === 'ai') {
                contentDiv.innerHTML = formatMarkdown(text);
            } else {
                contentDiv.textContent = text;
            }
            
            messageDiv.appendChild(contentDiv);
            chatMessages.appendChild(messageDiv);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            return messageDiv;
        }

        function addLoadingMessage() {
            console.log('Yükleniyor mesajı ekleniyor...');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai loading';
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = 'Düşünüyorum...';
            
            messageDiv.appendChild(contentDiv);
            chatMessages.appendChild(messageDiv);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            return messageDiv;
        }


        function formatMarkdown(text) {

            text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
            text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
            text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
            

            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
            

            text = text.replace(/^\s*[-*+]\s+(.*$)/gm, '<li>$1</li>');
            text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
            

            text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
            

            text = text.replace(/\n\n/g, '</p><p>');
            text = '<p>' + text + '</p>';
            
            return text;
        }

        console.log('Event listener\'lar ekleniyor...');
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });


        createFloatingSuggestions();

        console.log('Hoş geldin mesajı ekleniyor...');

        const firstName = localStorage.getItem('firstName') || '';
        let userName = '';
        
        if (firstName) {

            userName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        } else {

            if (currentUser) {
                const nameFromUser = currentUser.name || currentUser.username;
                if (nameFromUser) {

                    const firstWord = nameFromUser.split(' ')[0];
                    userName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
                } else {
                    userName = 'Değerli Kullanıcı';
                }
                console.log('currentUser name:', currentUser.name);
                console.log('currentUser username:', currentUser.username);
            } else {
                userName = 'Değerli Kullanıcı';
            }
        }
        
        console.log('localStorage firstName:', firstName);
        console.log('Final userName (capitalized):', userName);
        console.log('All localStorage keys:', Object.keys(localStorage));
        
        const greetingMessage = `Merhaba ${userName}! 👋\n\nBen NetOdak'nın AI asistanıyım. Derslerinde sana yardımcı olmak için buradayım! 📚\n\nHangi konuda yardıma ihtiyacın var? Matematik, Fizik, Kimya, Biyoloji veya başka bir dersle ilgili sorularını sorabilirsin.`;
        addMessage(greetingMessage, 'ai');
        

        chatHistory.push({
            role: 'model',
            content: greetingMessage
        });
        
        console.log('Başlatma tamamlandı');
    } catch (error) {
        console.error('Başlatma sırasında hata oluştu:', error);
    }
}); 
