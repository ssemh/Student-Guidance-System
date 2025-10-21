
class FloatingChatWidget {
    constructor() {
        this.isOpen = false;
        this.chatHistory = [];
        this.API_KEY = 'Your_API_KEY';
        this.API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
        this.retryCount = 0;
        this.MAX_RETRIES = 3;
        this.RETRY_DELAY = 2000;
        this.TIMEOUT_DURATION = 60000;
        
        this.init();
    }

    init() {
        this.createWidget();
        this.bindEvents();
        this.addWelcomeMessage();
    }

    createWidget() {

        const widget = document.createElement('div');
        widget.className = 'floating-chat-widget';
        widget.innerHTML = `
            <button class="chat-toggle-btn" id="chatToggleBtn">
                <i class="fas fa-robot"></i>
                <span class="notification-badge" id="notificationBadge" style="display: none;">1</span>
            </button>
            
            <div class="floating-chat-container" id="floatingChatContainer">
                <div class="floating-chat-header">
                    <h3><i class="fas fa-robot"></i> AI Asistan</h3>
                    <button class="close-btn" id="closeChatBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="floating-chat-messages" id="floatingChatMessages">
                </div>
                
                <div class="floating-chat-input">
                    <textarea id="floatingChatInput" placeholder="Mesajınızı yazın..." rows="1"></textarea>
                    <button id="floatingSendBtn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
        

        this.toggleBtn = document.getElementById('chatToggleBtn');
        this.chatContainer = document.getElementById('floatingChatContainer');
        this.chatMessages = document.getElementById('floatingChatMessages');
        this.chatInput = document.getElementById('floatingChatInput');
        this.sendBtn = document.getElementById('floatingSendBtn');
        this.closeBtn = document.getElementById('closeChatBtn');
        this.notificationBadge = document.getElementById('notificationBadge');
    }

    bindEvents() {

        this.toggleBtn.addEventListener('click', () => {
            this.toggleChat();
        });


        this.closeBtn.addEventListener('click', () => {
            this.closeChat();
        });


        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });


        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });


        this.chatInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });


        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.chatContainer.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        this.chatContainer.classList.add('show');
        this.notificationBadge.style.display = 'none';
        this.chatInput.focus();
        

        setTimeout(() => {
            this.scrollToBottom();
        }, 100);
    }

    closeChat() {
        this.isOpen = false;
        this.chatContainer.classList.remove('show');
    }

    adjustTextareaHeight() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;


        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.adjustTextareaHeight();


        this.chatHistory.push({
            role: 'user',
            content: message
        });


        const loadingMessage = this.addLoadingMessage();

        try {

            const response = await this.callAI(message);
            

            loadingMessage.remove();
            

            this.addMessage(response, 'ai');
            

            this.chatHistory.push({
                role: 'model',
                content: response
            });


            if (this.chatHistory.length > 10) {
                this.chatHistory = this.chatHistory.slice(-10);
            }

        } catch (error) {
            console.error('AI Chat Error:', error);
            loadingMessage.remove();
            this.addMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 'ai');
        }
    }

    async callAI(message) {
        const requestBody = {
            contents: this.chatHistory.map(msg => ({
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

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_DURATION);

        try {
            const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 503 && this.retryCount < this.MAX_RETRIES) {
                    this.retryCount++;
                    await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
                    return this.callAI(message);
                }
                throw new Error(`API error: ${response.status}`);
            }

            this.retryCount = 0;
            const data = await response.json();

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid API response format');
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('İstek zaman aşımına uğradı');
            }
            throw error;
        }
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `floating-message ${type}`;
        
        if (type === 'ai') {
            messageDiv.innerHTML = this.formatMarkdown(text);
        } else {
            messageDiv.textContent = text;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }

    addLoadingMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'floating-message ai loading';
        messageDiv.textContent = 'Düşünüyorum...';
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }

    addWelcomeMessage() {

        if (this.chatHistory.length === 0) {
            setTimeout(() => {

                const firstName = localStorage.getItem('firstName') || '';
                let userName = '';
                
                if (firstName) {

                    userName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
                } else {

                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    if (currentUser) {
                        const nameFromUser = currentUser.name || currentUser.username;
                        if (nameFromUser) {

                            const firstWord = nameFromUser.split(' ')[0];
                            userName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
                        } else {
                            userName = 'Değerli Kullanıcı';
                        }
                    } else {
                        userName = 'Değerli Kullanıcı';
                    }
                }
                
                const greetingMessage = `Merhaba ${userName}! 👋\n\nDerslerle ilgili bir sorun mu var?`;
                this.addMessage(greetingMessage, 'ai');
            }, 500);
        }
    }

    formatMarkdown(text) {

        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    showNotification() {
        if (!this.isOpen) {
            this.notificationBadge.style.display = 'flex';
        }
    }

    hideNotification() {
        this.notificationBadge.style.display = 'none';
    }
}


document.addEventListener('DOMContentLoaded', function() {

    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (isLoggedIn && currentUser) {

        if (typeof FontAwesome !== 'undefined' || document.querySelector('link[href*="font-awesome"]')) {
            new FloatingChatWidget();
        } else {

            const checkFontAwesome = setInterval(() => {
                if (document.querySelector('link[href*="font-awesome"]') || document.querySelector('.fas')) {
                    clearInterval(checkFontAwesome);
                    new FloatingChatWidget();
                }
            }, 100);
        }
    }
});
