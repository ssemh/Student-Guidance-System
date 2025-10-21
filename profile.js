
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {

            document.querySelector('.tab-btn.active').classList.remove('active');
            document.querySelector('.tab-content.active').classList.remove('active');


            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });


    const changePhotoBtn = document.querySelector('.change-photo-btn');
    const profileImage = document.querySelector('.profile-image');

    changePhotoBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    });




    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const theme = this.querySelector('.theme-preview').classList.contains('light') ? 'light' : 'dark';
            document.body.className = theme;
            localStorage.setItem('theme', theme);
        });
    });


    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(switch_ => {
        switch_.addEventListener('change', function() {
            const setting = this.closest('.toggle-item').querySelector('span').textContent;
            localStorage.setItem(setting, this.checked);
        });
    });


    const profileForm = document.querySelector('.settings-card-body');
    const inputs = profileForm.querySelectorAll('input');
    const selects = profileForm.querySelectorAll('select');
    
    inputs.forEach(input => {

        input.addEventListener('change', function() {
            const field = this.id;
            const value = this.value;
            localStorage.setItem(field, value);
            

            updateProfileInfo();
        });
        

        input.addEventListener('input', function() {
            const field = this.id;
            let value = this.value;
            

            if (field === 'firstName') {
                value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                this.value = value; // Input alanını da güncelle
            }
            
            localStorage.setItem(field, value);
            

            updateProfileInfo();
        });
    });


    selects.forEach(select => {
        select.addEventListener('change', function() {
            const field = this.id;
            const value = this.value;
            localStorage.setItem(field, value);
            

            if (field === 'branch') {
                localStorage.setItem('userBranch', value);
            }
            

            updateProfileInfo();
        });
    });


    function updateProfileInfo() {
        const firstName = localStorage.getItem('firstName') || 'Ahmet';
        const lastName = localStorage.getItem('lastName') || 'Yılmaz';
        const fullName = `${firstName} ${lastName}`;
        const school = localStorage.getItem('school') || 'İstanbul Lisesi';
        const branch = localStorage.getItem('userBranch') || 'sayisal';
        

        const branchNames = {
            'sayisal': 'Sayısal',
            'sozel': 'Sözel',
            'esit-agirlik': 'Eşit Ağırlık'
        };
        const branchDisplayName = branchNames[branch] || 'Sayısal';
        

        document.getElementById('profileName').textContent = fullName;
        document.querySelector('.user-school').textContent = school;
        document.getElementById('userBranch').textContent = branchDisplayName;
        

        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const schoolInput = document.getElementById('school');
        const gradeSelect = document.getElementById('grade');
        const branchSelect = document.getElementById('branch');
        
        if (firstNameInput) {
            firstNameInput.value = firstName;
        }
        if (lastNameInput) {
            lastNameInput.value = lastName;
        }
        if (schoolInput) {
            schoolInput.value = school;
        }
        if (gradeSelect) {
            gradeSelect.value = localStorage.getItem('grade') || '12';
        }
        if (branchSelect) {
            branchSelect.value = branch;
        }
    }


    const saveSettingsBtn = document.querySelector('.save-settings-btn');
    saveSettingsBtn.addEventListener('click', function() {

        const settings = {
            theme: localStorage.getItem('theme') || 'light',
            emailNotifications: localStorage.getItem('E-posta Bildirimleri') === 'true',
            achievementNotifications: localStorage.getItem('Başarı Bildirimleri') === 'true',
            weeklyReport: localStorage.getItem('Haftalık Rapor') === 'true',
            firstName: localStorage.getItem('firstName') || '',
            lastName: localStorage.getItem('lastName') || '',
            email: localStorage.getItem('email') || '',
            school: localStorage.getItem('school') || ''
        };


        updateProfileInfo();


        console.log('Ayarlar kaydedildi:', settings);
        alert('Ayarlarınız başarıyla kaydedildi!');
    });


    const changePasswordBtn = document.querySelector('.change-password');
    changePasswordBtn.addEventListener('click', function() {
        const newPassword = prompt('Yeni şifrenizi girin:');
        if (newPassword) {
            const confirmPassword = prompt('Yeni şifrenizi tekrar girin:');
            if (newPassword === confirmPassword) {
                alert('Şifreniz başarıyla değiştirildi!');
            } else {
                alert('Şifreler eşleşmiyor!');
            }
        }
    });


    const deleteAccountBtn = document.querySelector('.delete-account');
    deleteAccountBtn.addEventListener('click', function() {
        if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            alert('Hesabınız silindi!');

        }
    });


    const logoutBtn = document.querySelector('.logout-btn') || document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Hesabınızdan çıkış yapmak istediğinizden emin misiniz?')) {

                localStorage.removeItem('currentUser');
                localStorage.removeItem('isLoggedIn');

                window.location.href = 'giris.html';
            }
        });
    }


    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        themeOptions.forEach(option => {
            if (option.querySelector('.theme-preview').classList.contains(savedTheme)) {
                option.classList.add('active');
            }
        });
    }


    toggleSwitches.forEach(switch_ => {
        const setting = switch_.closest('.toggle-item').querySelector('span').textContent;
        const savedState = localStorage.getItem(setting);
        if (savedState !== null) {
            switch_.checked = savedState === 'true';
        }
    });


    inputs.forEach(input => {
        const savedValue = localStorage.getItem(input.id);
        if (savedValue) {
            input.value = savedValue;
        }
    });


    selects.forEach(select => {
        const savedValue = localStorage.getItem(select.id);
        if (savedValue) {
            select.value = savedValue;
        }
    });


    updateProfileInfo();
    

    window.addEventListener('storage', function(e) {
        if (e.key === 'userBranch') {

            updateProfileInfo();
            

            window.dispatchEvent(new CustomEvent('branchChanged', {
                detail: { newBranch: e.newValue }
            }));
        }
    });
    

    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    

    if (firstNameInput && !localStorage.getItem('firstName')) {
        const defaultFirstName = firstNameInput.value || 'Ahmet';
        localStorage.setItem('firstName', defaultFirstName);
        console.log('Default firstName saved to localStorage:', defaultFirstName);
    }
    if (lastNameInput && !localStorage.getItem('lastName')) {
        const defaultLastName = lastNameInput.value || 'Yılmaz';
        localStorage.setItem('lastName', defaultLastName);
        console.log('Default lastName saved to localStorage:', defaultLastName);
    }
    

    if (firstNameInput) {
        firstNameInput.addEventListener('blur', function() {
            const newFirstName = this.value.trim();
            if (newFirstName) {

                const capitalizedFirstName = newFirstName.charAt(0).toUpperCase() + newFirstName.slice(1).toLowerCase();
                localStorage.setItem('firstName', capitalizedFirstName);
                this.value = capitalizedFirstName; // Input alanını da güncelle
                updateProfileInfo();
                console.log('Ad güncellendi (büyük harfle):', capitalizedFirstName);
            }
        });
        
        firstNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const newFirstName = this.value.trim();
                if (newFirstName) {

                    const capitalizedFirstName = newFirstName.charAt(0).toUpperCase() + newFirstName.slice(1).toLowerCase();
                    localStorage.setItem('firstName', capitalizedFirstName);
                    this.value = capitalizedFirstName; // Input alanını da güncelle
                    updateProfileInfo();
                    console.log('Ad güncellendi (büyük harfle):', capitalizedFirstName);
                }
            }
        });
    }
    

    if (lastNameInput) {
        lastNameInput.addEventListener('blur', function() {
            const newLastName = this.value.trim();
            if (newLastName) {
                localStorage.setItem('lastName', newLastName);
                updateProfileInfo();
                console.log('Soyad güncellendi:', newLastName);
            }
        });
        
        lastNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const newLastName = this.value.trim();
                if (newLastName) {
                    localStorage.setItem('lastName', newLastName);
                    updateProfileInfo();
                    console.log('Soyad güncellendi:', newLastName);
                }
            }
        });
    }


    const categoryButtons = document.querySelectorAll('.category-btn');
    const achievementCards = document.querySelectorAll('.achievement-card');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {

            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selectedCategory = button.dataset.category;


            achievementCards.forEach(card => {
                if (selectedCategory === 'all' || card.dataset.category === selectedCategory) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}); 
