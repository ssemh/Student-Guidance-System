
document.addEventListener('DOMContentLoaded', function() {

    const defaultUser = {
        fullname: "Ahmet Yılmaz",
        email: "ahmet@example.com",
        password: "2121",
        school: "İstanbul Lisesi",
        grade: "12",
        branch: "sayisal",
        createdAt: new Date().toISOString()
    };


    const users = JSON.parse(localStorage.getItem('users')) || [];
    

    if (!users.some(user => user.email === defaultUser.email)) {
        users.push(defaultUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Varsayılan kullanıcı oluşturuldu:', defaultUser);
    }


    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;


            if (!email || !password) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }


            const users = JSON.parse(localStorage.getItem('users')) || [];
            console.log('Kayıtlı kullanıcılar:', users); // Debug için eklendi
            
            const user = users.find(u => {
                console.log('Kontrol edilen kullanıcı:', u); // Debug için eklendi
                console.log('Girilen email:', email); // Debug için eklendi
                console.log('Girilen şifre:', password); // Debug için eklendi
                return u.email === email && u.password === password;
            });

            if (user) {

                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('isLoggedIn', 'true');
                if (user.branch) {
                    localStorage.setItem('userBranch', user.branch);
                }
                window.location.href = 'profil.html';
            } else {
                console.log('Giriş başarısız - Kullanıcı bulunamadı'); // Debug için eklendi
                alert('E-posta veya şifre hatalı! Lütfen bilgilerinizi kontrol edin.');
            }
        });
    }


    const registerForm = document.querySelector('.login-form');
    if (registerForm && window.location.pathname.includes('kaydol.html')) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('password-confirm').value;
            const school = document.getElementById('school').value;
            const grade = document.getElementById('grade').value;
            const branch = document.getElementById('branch').value;


            if (!fullname || !email || !password || !passwordConfirm || !school || !grade || !branch) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }

            if (password !== passwordConfirm) {
                alert('Şifreler eşleşmiyor!');
                return;
            }


            const users = JSON.parse(localStorage.getItem('users')) || [];


            if (users.some(user => user.email === email)) {
                alert('Bu e-posta adresi zaten kayıtlı!');
                return;
            }


            const newUser = {
                fullname,
                email,
                password,
                school,
                grade,
                branch,
                createdAt: new Date().toISOString()
            };


            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));


            localStorage.setItem('currentUser', JSON.stringify(newUser));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userBranch', branch);
            window.location.href = 'profil.html';
        });
    }


    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.innerHTML = '👁️';
        toggleButton.style.position = 'absolute';
        toggleButton.style.right = '10px';
        toggleButton.style.top = '50%';
        toggleButton.style.transform = 'translateY(-50%)';
        toggleButton.style.background = 'none';
        toggleButton.style.border = 'none';
        toggleButton.style.cursor = 'pointer';
        
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(toggleButton);

        toggleButton.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
            toggleButton.innerHTML = input.type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    });


    checkAuth();


    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        

        if (!isLoggedIn && !currentUser && (
            window.location.pathname.includes('profil.html') ||
            window.location.pathname.includes('sayaclar.html') ||
            window.location.pathname.includes('chat.html')
        )) {
            window.location.href = 'giris.html';
            return;
        }
    }


    checkLoginStatus();
});


const menuButton = document.querySelector('.menu-button');
if (menuButton) {
    menuButton.addEventListener('click', function() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}


function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navLinks = document.querySelector('.nav-links');
    

    if (window.location.pathname.includes('index.html')) {

        const menuItems = `
            <a href="giris.html" class="login-btn">Giriş Yap</a>
            <a href="kaydol.html" class="register-btn">Kaydol</a>
        `;
        navLinks.innerHTML = menuItems;
        

        const loginButtons = document.querySelectorAll('a[href="giris.html"]');
        loginButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();

                if (currentUser) {
                    window.location.href = 'ana-sayfa.html';
                } else {

                    window.location.href = 'giris.html';
                }
            });
        });
    } else if (window.location.pathname.includes('kaydol.html')) {

        const menuItems = `
            <a href="index.html">Ana Sayfa</a>
            <a href="giris.html">Giriş Yap</a>
            <a href="kaydol.html" class="active register-btn">Kaydol</a>
        `;
        navLinks.innerHTML = menuItems;
    } else if (window.location.pathname.includes('giris.html')) {

        const menuItems = `
            <a href="index.html">Ana Sayfa</a>
            <a href="giris.html" class="active">Giriş Yap</a>
            <a href="kaydol.html" class="register-btn">Kaydol</a>
        `;
        navLinks.innerHTML = menuItems;
    } else if (currentUser) {

        const menuItems = `
            <a href="ana-sayfa.html"><i class="fas fa-home"></i> Ana Sayfa</a>
            <a href="analiz.html"><i class="fas fa-chart-line"></i> Analiz</a>
            <a href="oyunlar.html"><i class="fas fa-gamepad"></i> Oyunlar</a>
            <a href="homework.html"><i class="fas fa-tasks"></i> Ödev ve Hedefler</a>
            <a href="profil.html"><i class="fas fa-user"></i> Profilim</a>
            <a href="chat.html"><i class="fas fa-robot"></i> Yapay Zeka</a>
        `;
        navLinks.innerHTML = menuItems;
    }
}


function copyToClipboard(text, event) {
    event.preventDefault();
    

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyNotification('Kopyalandı: ' + text);
        }).catch(err => {
            console.error('Kopyalama hatası:', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {

        fallbackCopyTextToClipboard(text);
    }
}


function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    

    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyNotification('Kopyalandı: ' + text);
        } else {
            showCopyNotification('Kopyalama başarısız!', 'error');
        }
    } catch (err) {
        console.error('Fallback kopyalama hatası:', err);
        showCopyNotification('Kopyalama başarısız!', 'error');
    }
    
    document.body.removeChild(textArea);
}


function showCopyNotification(message, type = 'success') {

    const existingNotification = document.querySelector('.copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    

    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    

    if (!document.querySelector('#copy-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'copy-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    

    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}
