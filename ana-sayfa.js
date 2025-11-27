document.addEventListener('DOMContentLoaded', function() {

    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let draggedNote = null;
    let isDragging = false;
    let currentNote = null;
    let dragOffset = { x: 0, y: 0 };
    

    let boardSettings = {
        width: 900,
        height: 550,
        background: 'default',
        noteShape: 'rectangle',
        noteFont: 'Arial'
    };


    let tytInterval = null;
    let aytInterval = null;
    let kronometreInterval = null;
    let tytDenemeInterval = null;
    let aytDenemeInterval = null;
    let ozelInterval = null;
    let kronometreTime = 0;
    let tytDenemeTime = 165 * 60; // 165 dakika
    let aytDenemeTime = 180 * 60; // 180 dakika
    let ozelTime = 0;


    let customSounds = {
        'kronometre': null,
        'tyt-deneme': null,
        'ayt-deneme': null,
        'ozel': null
    };
    const defaultSound = 'sound/Kayıt.mp3';
    let currentSoundType = null;
    let selectedSound = null;


    let isResizing = false;
    let resizingNote = null;
    let resizeHandle = null;
    let resizeStartData = {};


    loadSettings();
    displayNotes();
    updateStats();
    initializeCounters();
    loadSoundSettings();
    

    initBoard();
    

    function loadNotes() {
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
            notes = JSON.parse(savedNotes);
        }
        displayNotes();
    }
    

    

    function initBoard() {

        document.documentElement.style.setProperty('--board-width', '900px');
        document.documentElement.style.setProperty('--board-height', '550px');
        

        window.defaultNoteShape = 'rectangle';
        window.defaultNoteFont = 'Arial';
        

        localStorage.removeItem('lastQuestionDate');
        localStorage.removeItem('lastQuestionData');
        

        loadNotes();
        

        initDragAndDrop();
    }


    function initDragAndDrop() {
        const notesContainer = document.getElementById('notesContainer');
        if (notesContainer) {
            notesContainer.addEventListener('dragover', handleDragOver);
            notesContainer.addEventListener('drop', handleDrop);
        }
    }
    

    function addNote() {
        const note = {
            id: Date.now(),
            title: 'Yeni Not',
            content: 'Not içeriğini buraya yazın...',
            x: Math.random() * 200 + 50,
            y: Math.random() * 200 + 50,
            width: 250,
            height: 200,
            isEditing: true,
            shape: boardSettings.noteShape,
            font: boardSettings.noteFont,
            rotation: getRandomRotation(),
            backgroundColor: '#FFFFFF',
            textColor: '#000000'
        };
        
        notes.push(note);
        saveNotes();
        displayNotes();
        

        setTimeout(() => {
            const newNoteElement = document.querySelector(`[data-note-id="${note.id}"]`);
            if (newNoteElement) {
                const titleInput = newNoteElement.querySelector('.note-title-input');
                if (titleInput) {
                    titleInput.focus();
                    titleInput.select();
                }
            }
        }, 100);
    }
    

    function addNewNote() {
        console.log('addNewNote fonksiyonu çağrıldı');
        

        const container = document.getElementById('notesContainer');
        let x = 50, y = 50;
        
        if (container) {
            const containerRect = container.getBoundingClientRect();
            x = Math.random() * (containerRect.width - 250);
            y = Math.random() * (containerRect.height - 200);
        }
        
        const note = {
            id: Date.now(),
            title: 'Yeni Not',
            content: 'Not içeriğini buraya yazın...',
            x: x,
            y: y,
            width: 250,
            height: 200,
            isEditing: true,
            shape: 'rectangle',
            font: 'Arial',
            rotation: getRandomRotation(),
            backgroundColor: '#FFFFFF',
            textColor: '#000000'
        };
        
        notes.push(note);
        saveNotes();
        displayNotes();
        
        console.log('Not eklendi, toplam not sayısı:', notes.length);
        

        setTimeout(() => {
            const newNoteElement = document.querySelector(`[data-note-id="${note.id}"]`);
            if (newNoteElement) {
                const titleInput = newNoteElement.querySelector('.note-title-input');
                if (titleInput) {
                    titleInput.focus();
                    titleInput.select();
                }
            }
        }, 100);
    }


    function createNewNote() {
        const position = getRandomPosition();
        const note = {
            id: Date.now(),
            title: 'Yeni Not',
            content: 'Not içeriğini buraya yazın...',
            rotation: getRandomRotation(),
            x: position.x,
            y: position.y,
            width: 250,
            height: 200,
            isEditing: true,
            shape: window.defaultNoteShape || 'rectangle',
            font: window.defaultNoteFont || 'Arial',
            backgroundColor: '#FFFFFF',
            textColor: '#000000'
        };

        notes.push(note);
        saveNotes();
        displayNotes();


        setTimeout(() => {
            const newNoteElement = document.querySelector(`[data-note-id="${note.id}"]`);
            if (newNoteElement) {
                const titleInput = newNoteElement.querySelector('.note-title-input');
                if (titleInput) {
                    titleInput.focus();
                    titleInput.select();
                }
            }
        }, 100);
    }
    

    function openSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.classList.add('open');
        }
    }
    

    function closeSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.classList.remove('open');
        }
    }


    function toggleSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.classList.toggle('open');
        }
    }
    

    function showColorPicker(type, noteId) {

        const existingPicker = document.querySelector('.color-picker');
        if (existingPicker) {
            existingPicker.remove();
        }


        const picker = document.createElement('div');
        picker.className = 'color-picker show';
        

        const header = document.createElement('div');
        header.className = 'color-picker-header';
        
        const title = document.createElement('div');
        title.className = 'color-picker-title';
        title.textContent = type === 'text' ? 'Yazı Rengi Seç' : 'Not Rengi Seç';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'color-picker-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.onclick = () => picker.remove();
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        picker.appendChild(header);
        

        const gradientInput = document.createElement('input');
        gradientInput.type = 'color';
        gradientInput.className = 'color-gradient';
        gradientInput.value = type === 'text' ? '#000000' : '#FFFFFF';
        gradientInput.onchange = (e) => {
            if (type === 'text') {
                changeTextColor(noteId, e.target.value);
            } else {
                changeNoteColor(noteId, e.target.value);
            }
        };
        picker.appendChild(gradientInput);


        const colors = type === 'text' ? 
            ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080',
             '#FFD700', '#00FFFF', '#FF00FF', '#008000', '#000080', '#800000'] :
            ['#FFFFFF', '#FFFACD', '#E6E6FA', '#F0FFF0', '#FFE4E1', '#F0F8FF',
             '#F5F5DC', '#FFE4C4', '#E0FFFF', '#F0E68C', '#DDA0DD', '#98FB98'];

        const colorOptions = document.createElement('div');
        colorOptions.className = 'color-options';

        colors.forEach(color => {
            const option = document.createElement('div');
            option.className = 'color-option';
            option.style.backgroundColor = color;
            option.onclick = () => {
                if (type === 'text') {
                    changeTextColor(noteId, color);
                } else {
                    changeNoteColor(noteId, color);
                }

                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            };
            colorOptions.appendChild(option);
        });

        picker.appendChild(colorOptions);


        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const pickerWidth = 300; // Renk seçici genişliği
        const pickerHeight = 400; // Renk seçici yüksekliği
        

        const centerX = (viewportWidth - pickerWidth) / 2;
        const centerY = (viewportHeight - pickerHeight) / 2;
        
        picker.style.position = 'fixed';
        picker.style.top = `${centerY}px`;
        picker.style.left = `${centerX}px`;
        picker.style.zIndex = '9999';
        
        document.body.appendChild(picker);


        const closePicker = (e) => {
            if (!picker.contains(e.target) && e.target !== button) {
                picker.remove();
                document.removeEventListener('click', closePicker);
            }
        };
        setTimeout(() => document.addEventListener('click', closePicker), 0);
    }

    function changeTextColor(noteId, color) {
        const note = notes.find(note => note.id === noteId);
        if (note) {
            note.textColor = color;
            saveNotes();
            displayNotes();
        }
    }

    function changeNoteColor(noteId, color) {
        const note = notes.find(note => note.id === noteId);
        if (note) {
            note.backgroundColor = color;
            saveNotes();
            displayNotes();
        }
    }
    

    function changeBackground(value) {
        const board = document.getElementById('board');
        if (board) {
            if (value === 'default') {
                board.style.backgroundImage = 'url("https://img.freepik.com/free-photo/wood-board-background_1339-5417.jpg")';
            }
            boardSettings.background = value;
        }
    }
    

    function changeNoteShape(shape) {
        boardSettings.noteShape = shape;
        window.defaultNoteShape = shape;
    }
    

    function changeNoteFont(font) {
        boardSettings.noteFont = font;
        window.defaultNoteFont = font;
    }
    

        function changeBoardSize() {
            const width = document.getElementById('boardWidth').value;
            const height = document.getElementById('boardHeight').value;
            
            boardSettings.width = parseInt(width);
            boardSettings.height = parseInt(height);
            
            document.documentElement.style.setProperty('--board-width', width + 'px');
            document.documentElement.style.setProperty('--board-height', height + 'px');
        }


    function initializeCounters() {

        const counterBtns = document.querySelectorAll('.counter-btn');
        counterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const counterType = btn.dataset.type;
                showCounter(counterType);
            });
        });


        startTYTCounter();
        startAYTCounter();
    }


    function showCounterSelection() {

        const allCounters = document.querySelectorAll('.counter-display');
        allCounters.forEach(counter => {
            counter.style.display = 'none';
            counter.classList.remove('animate-in', 'animate-out');
        });
        

        document.getElementById('counterSelection').style.display = 'flex';
        

        const sectionTitle = document.querySelector('.counters-section h3');
        if (sectionTitle) {
            sectionTitle.classList.remove('hide-icon');
        }
    }


    function showCounter(counterType) {

        const allCounters = document.querySelectorAll('.counter-display');
        allCounters.forEach(counter => {
            counter.style.display = 'none';
            counter.classList.remove('animate-in', 'animate-out');
        });
        

        document.getElementById('counterSelection').style.display = 'none';
        

        const el = document.getElementById(counterType + 'Counter');
        if (el) {
            el.style.display = 'flex';
            el.classList.add('animate-in');
            

            setTimeout(() => {
                el.classList.remove('animate-in');
            }, 220);
        }
        

        const sectionTitle = document.querySelector('.counters-section h3');
        if (sectionTitle) {
            sectionTitle.classList.add('hide-icon');
        }
    }


    function startTYTCounter() {
        const tytDate = localStorage.getItem('tytDate');
        if (tytDate) {
            updateTYTDisplay();
            tytInterval = setInterval(updateTYTDisplay, 1000);
        }
    }

    function updateTYTDisplay() {
        const tytDate = new Date(localStorage.getItem('tytDate'));
        const now = new Date();
        const diff = tytDate - now;

        if (diff <= 0) {
            document.querySelector('#tytCounter .days').textContent = '0';
            document.querySelector('#tytCounter .hours').textContent = '0';
            document.querySelector('#tytCounter .minutes').textContent = '0';
            document.querySelector('#tytCounter .seconds').textContent = '0';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.querySelector('#tytCounter .days').textContent = days;
        document.querySelector('#tytCounter .hours').textContent = hours;
        document.querySelector('#tytCounter .minutes').textContent = minutes;
        document.querySelector('#tytCounter .seconds').textContent = seconds;
    }


    function startAYTCounter() {
        const aytDate = localStorage.getItem('aytDate');
        if (aytDate) {
            updateAYTDisplay();
            aytInterval = setInterval(updateAYTDisplay, 1000);
        }
    }

    function updateAYTDisplay() {
        const aytDate = new Date(localStorage.getItem('aytDate'));
        const now = new Date();
        const diff = aytDate - now;

        if (diff <= 0) {
            document.querySelector('#aytCounter .days').textContent = '0';
            document.querySelector('#aytCounter .hours').textContent = '0';
            document.querySelector('#aytCounter .minutes').textContent = '0';
            document.querySelector('#aytCounter .seconds').textContent = '0';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.querySelector('#aytCounter .days').textContent = days;
        document.querySelector('#aytCounter .hours').textContent = hours;
        document.querySelector('#aytCounter .minutes').textContent = minutes;
        document.querySelector('#aytCounter .seconds').textContent = seconds;
    }


    function startKronometre() {
        if (!kronometreInterval) {
            kronometreInterval = setInterval(() => {
                kronometreTime++;
                updateKronometreDisplay();
            }, 1000);
        }
    }

    function resetKronometre() {
        if (kronometreInterval) {
            clearInterval(kronometreInterval);
            kronometreInterval = null;
        }
        kronometreTime = 0;
        updateKronometreDisplay();
    }

    function updateKronometreDisplay() {
        const hours = Math.floor(kronometreTime / 3600);
        const minutes = Math.floor((kronometreTime % 3600) / 60);
        const seconds = kronometreTime % 60;

        document.querySelector('#kronometreCounter .hours').textContent = hours.toString().padStart(2, '0');
        document.querySelector('#kronometreCounter .minutes').textContent = minutes.toString().padStart(2, '0');
        document.querySelector('#kronometreCounter .seconds').textContent = seconds.toString().padStart(2, '0');
    }


    function startTYTDeneme() {
        if (!tytDenemeInterval) {
            tytDenemeInterval = setInterval(() => {
                tytDenemeTime--;
                if (tytDenemeTime <= 0) {
                    clearInterval(tytDenemeInterval);
                    tytDenemeInterval = null;
                    tytDenemeTime = 0;

                    playSound('tyt-deneme');
                }
                updateTYTDenemeDisplay();
            }, 1000);
        }
    }

    function resetTYTDeneme() {
        if (tytDenemeInterval) {
            clearInterval(tytDenemeInterval);
            tytDenemeInterval = null;
        }
        tytDenemeTime = 165 * 60;
        updateTYTDenemeDisplay();
    }

    function updateTYTDenemeDisplay() {
        const minutes = Math.floor(tytDenemeTime / 60);
        const seconds = tytDenemeTime % 60;

        document.querySelector('#tyt-denemeCounter .minutes').textContent = minutes.toString().padStart(2, '0');
        document.querySelector('#tyt-denemeCounter .seconds').textContent = seconds.toString().padStart(2, '0');
    }


    function startAYTDeneme() {
        if (!aytDenemeInterval) {
            aytDenemeInterval = setInterval(() => {
                aytDenemeTime--;
                if (aytDenemeTime <= 0) {
                    clearInterval(aytDenemeInterval);
                    aytDenemeInterval = null;
                    aytDenemeTime = 0;

                    playSound('ayt-deneme');
                }
                updateAYTDenemeDisplay();
            }, 1000);
        }
    }

    function resetAYTDeneme() {
        if (aytDenemeInterval) {
            clearInterval(aytDenemeInterval);
            aytDenemeInterval = null;
        }
        aytDenemeTime = 180 * 60;
        updateAYTDenemeDisplay();
    }

    function updateAYTDenemeDisplay() {
        const minutes = Math.floor(aytDenemeTime / 60);
        const seconds = aytDenemeTime % 60;

        document.querySelector('#ayt-denemeCounter .minutes').textContent = minutes.toString().padStart(2, '0');
        document.querySelector('#ayt-denemeCounter .seconds').textContent = seconds.toString().padStart(2, '0');
    }


    function startOzelCounter() {
        const saat = parseInt(document.getElementById('saat').value) || 0;
        const dakika = parseInt(document.getElementById('dakika').value) || 0;
        const saniye = parseInt(document.getElementById('saniye').value) || 0;
        
        ozelTime = saat * 3600 + dakika * 60 + saniye;
        
        if (ozelTime > 0 && !ozelInterval) {
            ozelInterval = setInterval(() => {
                ozelTime--;
                if (ozelTime <= 0) {
                    clearInterval(ozelInterval);
                    ozelInterval = null;
                    ozelTime = 0;

                    playSound('ozel');
                }
                updateOzelDisplay();
            }, 1000);
        }
    }

    function resetOzelCounter() {
        if (ozelInterval) {
            clearInterval(ozelInterval);
            ozelInterval = null;
        }
        ozelTime = 0;
        updateOzelDisplay();
    }

    function updateOzelDisplay() {
        const hours = Math.floor(ozelTime / 3600);
        const minutes = Math.floor((ozelTime % 3600) / 60);
        const seconds = ozelTime % 60;

        document.querySelector('#ozelCounter .hours').textContent = hours.toString().padStart(2, '0');
        document.querySelector('#ozelCounter .minutes').textContent = minutes.toString().padStart(2, '0');
        document.querySelector('#ozelCounter .seconds').textContent = seconds.toString().padStart(2, '0');
    }


    function selectSound(counterType) {
        const fileInput = document.getElementById('soundFileInput');
        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                customSounds[counterType] = new Audio(url);
                alert('Ses başarıyla değiştirildi!');
            }
        };
        fileInput.click();
    }


    function playAlarm(counterType = null) {
        let audio;
        
        if (counterType && customSounds[counterType]) {
            audio = customSounds[counterType];
        } else {
            audio = new Audio(defaultSound);
        }
        
        audio.play().catch(e => console.log('Alarm çalınamadı:', e));
    }


    	function fullscreenKronometre() {
		const element = document.getElementById('kronometreCounter');
		const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
		if (isFs) {
			if (document.exitFullscreen) document.exitFullscreen();
			else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
			else if (document.msExitFullscreen) document.msExitFullscreen();
		} else if (element) {
			if (element.requestFullscreen) element.requestFullscreen();
			else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
			else if (element.msRequestFullscreen) element.msRequestFullscreen();
		}
	}

    	function fullscreenTYT() {
		const element = document.getElementById('tytCounter');
		const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
		if (isFs) {
			if (document.exitFullscreen) document.exitFullscreen();
			else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
			else if (document.msExitFullscreen) document.msExitFullscreen();
		} else if (element) {
			if (element.requestFullscreen) element.requestFullscreen();
			else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
			else if (element.msRequestFullscreen) element.msRequestFullscreen();
		}
	}

    	function fullscreenAYT() {
		const element = document.getElementById('aytCounter');
		const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
		if (isFs) {
			if (document.exitFullscreen) document.exitFullscreen();
			else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
			else if (document.msExitFullscreen) document.msExitFullscreen();
		} else if (element) {
			if (element.requestFullscreen) element.requestFullscreen();
			else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
			else if (element.msRequestFullscreen) element.msRequestFullscreen();
		}
	}

    	function fullscreenTYTDeneme() {
		const element = document.getElementById('tyt-denemeCounter');
		const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
		if (isFs) {
			if (document.exitFullscreen) document.exitFullscreen();
			else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
			else if (document.msExitFullscreen) document.msExitFullscreen();
		} else if (element) {
			if (element.requestFullscreen) element.requestFullscreen();
			else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
			else if (element.msRequestFullscreen) element.msRequestFullscreen();
		}
	}

    	function fullscreenAYTDeneme() {
		const element = document.getElementById('ayt-denemeCounter');
		const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
		if (isFs) {
			if (document.exitFullscreen) document.exitFullscreen();
			else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
			else if (document.msExitFullscreen) document.msExitFullscreen();
		} else if (element) {
			if (element.requestFullscreen) element.requestFullscreen();
			else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
			else if (element.msRequestFullscreen) element.msRequestFullscreen();
		}
	}

    	function fullscreenOzel() {
		const element = document.getElementById('ozelCounter');
		const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
		if (isFs) {
			if (document.exitFullscreen) document.exitFullscreen();
			else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
			else if (document.msExitFullscreen) document.msExitFullscreen();
		} else if (element) {
			if (element.requestFullscreen) element.requestFullscreen();
			else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
			else if (element.msRequestFullscreen) element.msRequestFullscreen();
		}
	}


    function updateStats() {

        const totalNotesElement = document.getElementById('totalNotes');
        if (totalNotesElement) {
            totalNotesElement.textContent = notes.length;
        }
        

        const completedTasksElement = document.getElementById('completedTasks');
        if (completedTasksElement) {
            const completedTasks = localStorage.getItem('completedTasks') || 0;
            completedTasksElement.textContent = completedTasks;
        }
        

        const studyTimeElement = document.getElementById('studyTime');
        if (studyTimeElement) {
            const studyTime = localStorage.getItem('studyTime') || 0;
            studyTimeElement.textContent = studyTime;
        }
        

        const gameScoreElement = document.getElementById('gameScore');
        if (gameScoreElement) {
            const gameScore = localStorage.getItem('gameScore') || 0;
            gameScoreElement.textContent = gameScore;
        }
    }


    function loadSettings() {
        const savedSettings = localStorage.getItem('boardSettings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
            applySettings();
        }
    }


    function saveSettings() {
        if (settings.autoSave) {
            localStorage.setItem('boardSettings', JSON.stringify(settings));
        }
    }


    function applySettings() {
        const board = document.querySelector('.board');
        if (board) {
            board.style.backgroundColor = settings.boardColor;
        }
        
        if (document.getElementById('boardColor')) {
            document.getElementById('boardColor').value = settings.boardColor;
        }
        
        if (document.getElementById('noteFont')) {
            document.getElementById('noteFont').value = settings.noteFont;
        }
        
        updateAllNotes();
    }


    function updateAllNotes() {
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            updateNoteStyle(note);
        });
    }


    function updateNoteStyle(note) {
        note.style.backgroundColor = settings.noteColor;
        note.style.fontFamily = settings.noteFont;
        
        note.className = 'note';
        note.classList.add(settings.noteShape);
        note.classList.add(settings.noteSize);
        note.classList.add(`shadow-${settings.noteShadow}`);

        if (settings.hoverAnimation) {
            note.classList.add('hover-animation');
        } else {
            note.classList.remove('hover-animation');
        }
    }


    function getRandomRotation() {
        return Math.random() * 6 - 3;
    }


    function getRandomPosition() {
        const container = document.getElementById('notesContainer');
        const containerRect = container.getBoundingClientRect();
        const maxX = containerRect.width - 250;
        const maxY = containerRect.height - 150;
        

        return {
            x: Math.max(0, Math.min(Math.random() * maxX, maxX)),
            y: Math.max(0, Math.min(Math.random() * maxY, maxY))
        };
    }




    function editNote(noteId) {
        const note = notes.find(note => note.id === noteId);
        if (note) {
            note.isEditing = true;
            saveNotes();
            displayNotes();
            

            setTimeout(() => {
                const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
                if (noteElement) {
                    const titleInput = noteElement.querySelector('.note-title-input');
                    if (titleInput) {
                        titleInput.focus();
                        titleInput.select();
                    }
                }
            }, 100);
        }
    }
    

    function saveNote(noteId) {
        const note = notes.find(note => note.id === noteId);
        if (note) {
            const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
            if (noteElement) {
                const titleInput = noteElement.querySelector('.note-title-input');
                const contentInput = noteElement.querySelector('.note-content-input');
                
                if (titleInput && contentInput) {
                    note.title = titleInput.value;
                    note.content = contentInput.value;
                    note.isEditing = false;
                    saveNotes();
                    displayNotes();
                }
            }
        }
    }
    

    function deleteNote(noteId) {
        notes = notes.filter(note => note.id !== noteId);
        saveNotes();
        displayNotes();
    }
    

    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }
    



    function displayNotes() {
        const container = document.getElementById('notesContainer');
        if (!container) return;
        
        container.innerHTML = '';

        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = `note ${note.shape || 'rectangle'} ${note.isEditing ? 'editing' : ''}`;
            

            noteElement.style.position = 'absolute';
            noteElement.style.left = `${note.x}px`;
            noteElement.style.top = `${note.y}px`;
            noteElement.style.width = `${note.width}px`;
            noteElement.style.height = `${note.height}px`;
            noteElement.style.zIndex = '1';
            noteElement.style.setProperty('--rotation', `${note.rotation || 0}deg`);
            

            if (note.backgroundColor) {
                noteElement.style.backgroundColor = note.backgroundColor;
            }
            if (note.textColor) {
                noteElement.style.color = note.textColor;
            }
            
            noteElement.draggable = false; // HTML5 drag yerine mouse drag kullanıyoruz
            noteElement.dataset.id = note.id;
            noteElement.dataset.noteId = note.id;

            if (note.isEditing) {
                noteElement.innerHTML = `
                    <input type="text" class="note-title-input" value="${note.title}" placeholder="Not başlığı" style="color: ${note.textColor || '#000000'}; font-family: ${note.font || 'Arial'}">
                    <textarea class="note-content-input" placeholder="Not içeriği" style="color: ${note.textColor || '#000000'}; font-family: ${note.font || 'Arial'}">${note.content}</textarea>
                    <div class="note-actions">
                        <button onclick="saveNote(${note.id})" title="Kaydet">
                            <i class="fas fa-save"></i>
                        </button>
                    </div>
                `;
            } else {

                noteElement.innerHTML = `
                    <div class="note-header">
                        <h3 style="color: ${note.textColor || '#000000'}; font-family: ${note.font || 'Arial'}">${note.title}</h3>
                        <div class="note-actions">
                            <button onclick="editNote(${note.id})" title="Düzenle">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="showColorPicker('text', ${note.id})" title="Yazı Rengi">
                                <i class="fas fa-font"></i>
                            </button>
                            <button onclick="showColorPicker('note', ${note.id})" title="Not Rengi">
                                <i class="fas fa-palette"></i>
                            </button>
                            <button onclick="deleteNote(${note.id})" title="Sil">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="note-content">
                        <p style="color: ${note.textColor || '#000000'}; font-family: ${note.font || 'Arial'}">${note.content}</p>
                    </div>
                `;
            }


            if (!note.isEditing) {
                noteElement.addEventListener('mousedown', handleMouseDown);

                addResizeHandles(noteElement);
            }

            container.appendChild(noteElement);
        });
    }


    function handleDragStart(e) {
        draggedNote = this;
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.dataset.id);
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedNote = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const note = notes.find(n => n.id === parseInt(id));
        
        if (note) {
            const container = document.getElementById('notesContainer');
            const containerRect = container.getBoundingClientRect();
            
            let newX = e.clientX - containerRect.left - (note.width / 2);
            let newY = e.clientY - containerRect.top - (note.height / 2);
            
            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + note.width > containerRect.width) {
                newX = containerRect.width - note.width;
            }
            if (newY + note.height > containerRect.height) {
                newY = containerRect.height - note.height;
            }
            
            note.x = newX;
            note.y = newY;
            
            saveNotes();
            displayNotes();
        }
    }



    function handleMouseDown(e) {

        if (e.target.classList.contains('resize-handle')) {
            const noteElement = e.target.closest('.note');
            if (noteElement) {
                startResize(e, noteElement, e.target);
                return;
            }
        }
        
        if (e.target.closest('.note-actions') || e.target.closest('input') || e.target.closest('textarea')) {
            return; // Butonlara veya input'lara tıklandıysa sürüklemeyi başlatma
        }
        
        isDragging = true;
        currentNote = this;
        const note = notes.find(n => n.id === parseInt(this.dataset.noteId));
        
        if (note) {
            const rect = this.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            this.style.zIndex = '1000';
            this.classList.add('dragging');
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        
        e.preventDefault();
    }

    function handleMouseMove(e) {
        if (!isDragging || !currentNote) return;
        
        const note = notes.find(n => n.id === parseInt(currentNote.dataset.noteId));
        if (!note) return;
        
        const container = document.getElementById('notesContainer');
        const containerRect = container.getBoundingClientRect();
        
        let newX = e.clientX - containerRect.left - dragOffset.x;
        let newY = e.clientY - containerRect.top - dragOffset.y;
        

        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + note.width > containerRect.width) {
            newX = containerRect.width - note.width;
        }
        if (newY + note.height > containerRect.height) {
            newY = containerRect.height - note.height;
        }
        

        currentNote.style.left = `${newX}px`;
        currentNote.style.top = `${newY}px`;
    }

    function handleMouseUp() {
        if (!isDragging || !currentNote) return;
        
        const note = notes.find(n => n.id === parseInt(currentNote.dataset.noteId));
        if (note) {
            const container = document.getElementById('notesContainer');
            const containerRect = container.getBoundingClientRect();
            

            const rect = currentNote.getBoundingClientRect();
            note.x = rect.left - containerRect.left;
            note.y = rect.top - containerRect.top;
            
            saveNotes();
        }
        

        currentNote.style.zIndex = '';
        currentNote.classList.remove('dragging');
        currentNote = null;
        isDragging = false;
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }


    function addResizeHandles(noteElement) {
        if (noteElement.classList.contains('editing')) return;
        

        const existingHandles = noteElement.querySelector('.resize-handles');
        if (existingHandles) {
            existingHandles.remove();
        }
        

        const handleContainer = document.createElement('div');
        handleContainer.className = 'resize-handles';
        

        const handles = [
            { class: 'se', position: 'se' }, // Sağ alt
            { class: 'sw', position: 'sw' }, // Sol alt
            { class: 'ne', position: 'ne' }, // Sağ üst
            { class: 'nw', position: 'nw' }  // Sol üst
        ];
        
        handles.forEach(handle => {
            const handleElement = document.createElement('div');
            handleElement.className = `resize-handle ${handle.class}`;
            handleElement.dataset.position = handle.position;
            handleContainer.appendChild(handleElement);
        });
        
        noteElement.appendChild(handleContainer);
    }


    function startResize(e, noteElement, handleElement) {
        isResizing = true;
        resizingNote = noteElement;
        resizeHandle = handleElement.dataset.position;
        
        const note = notes.find(n => n.id === parseInt(noteElement.dataset.noteId));
        if (!note) return;
        
        const rect = noteElement.getBoundingClientRect();
        const container = document.getElementById('notesContainer');
        const containerRect = container.getBoundingClientRect();
        
        resizeStartData = {
            startX: e.clientX,
            startY: e.clientY,
            startWidth: rect.width,
            startHeight: rect.height,
            startLeft: rect.left - containerRect.left,
            startTop: rect.top - containerRect.top,
            minWidth: 150,
            minHeight: 100
        };
        
        noteElement.classList.add('resizing');
        noteElement.style.zIndex = '1000';
        
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
        
        e.preventDefault();
        e.stopPropagation();
    }


    function handleResize(e) {
        if (!isResizing || !resizingNote) return;
        
        const deltaX = e.clientX - resizeStartData.startX;
        const deltaY = e.clientY - resizeStartData.startY;
        
        let newWidth = resizeStartData.startWidth;
        let newHeight = resizeStartData.startHeight;
        let newLeft = resizeStartData.startLeft;
        let newTop = resizeStartData.startTop;
        

        switch (resizeHandle) {
            case 'se': // Sağ alt
                newWidth += deltaX;
                newHeight += deltaY;
                break;
            case 'sw': // Sol alt
                newWidth -= deltaX;
                newHeight += deltaY;
                newLeft += deltaX;
                break;
            case 'ne': // Sağ üst
                newWidth += deltaX;
                newHeight -= deltaY;
                newTop += deltaY;
                break;
            case 'nw': // Sol üst
                newWidth -= deltaX;
                newHeight -= deltaY;
                newLeft += deltaX;
                break;
        }
        

        if (newWidth < resizeStartData.minWidth) {
            if (resizeHandle.includes('w')) {
                newLeft = resizeStartData.startLeft + (resizeStartData.startWidth - resizeStartData.minWidth);
            }
            newWidth = resizeStartData.minWidth;
        }
        
        if (newHeight < resizeStartData.minHeight) {
            if (resizeHandle.includes('n')) {
                newTop = resizeStartData.startTop + (resizeStartData.startHeight - resizeStartData.minHeight);
            }
            newHeight = resizeStartData.minHeight;
        }
        

        const container = document.getElementById('notesContainer');
        const containerRect = container.getBoundingClientRect();
        
        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft + newWidth > containerRect.width) {
            newWidth = containerRect.width - newLeft;
        }
        if (newTop + newHeight > containerRect.height) {
            newHeight = containerRect.height - newTop;
        }
        

        resizingNote.style.left = `${newLeft}px`;
        resizingNote.style.top = `${newTop}px`;
        resizingNote.style.width = `${newWidth}px`;
        resizingNote.style.height = `${newHeight}px`;
    }


    function stopResize() {
        if (!isResizing || !resizingNote) return;
        
        const note = notes.find(n => n.id === parseInt(resizingNote.dataset.noteId));
        if (note) {
            const rect = resizingNote.getBoundingClientRect();
            const container = document.getElementById('notesContainer');
            const containerRect = container.getBoundingClientRect();
            
            note.x = rect.left - containerRect.left;
            note.y = rect.top - containerRect.top;
            note.width = rect.width;
            note.height = rect.height;
            
            saveNotes();
        }
        
        resizingNote.classList.remove('resizing');
        resizingNote.style.zIndex = '';
        resizingNote = null;
        resizeHandle = null;
        isResizing = false;
        
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    }


    function initializeDragAndDrop() {
        const notesContainer = document.getElementById('notesContainer');
        if (notesContainer) {
            notesContainer.addEventListener('dragover', handleDragOver);
            notesContainer.addEventListener('drop', handleDrop);
        }
    }
    

    function initializeButtons() {
        console.log('initializeButtons fonksiyonu çağrıldı');
        
        const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
        const createNewNoteBtn = document.getElementById('createNewNoteBtn');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        const backgroundSelect = document.getElementById('backgroundSelect');
        const defaultNoteShape = document.getElementById('defaultNoteShape');
        const defaultNoteFont = document.getElementById('defaultNoteFont');
        const boardWidth = document.getElementById('boardWidth');
        const boardHeight = document.getElementById('boardHeight');
        
        console.log('Bulunan butonlar:', {
            toggleSettingsBtn: !!toggleSettingsBtn,
            createNewNoteBtn: !!createNewNoteBtn,
            closeSettingsBtn: !!closeSettingsBtn
        });
        
        if (toggleSettingsBtn) {
            toggleSettingsBtn.addEventListener('click', toggleSettings);
            console.log('toggleSettings event listener eklendi');
        }
        
        if (createNewNoteBtn) {
            createNewNoteBtn.addEventListener('click', createNewNote);
            console.log('createNewNote event listener eklendi');
        }
        
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', toggleSettings);
            console.log('closeSettings event listener eklendi');
        }
        
        if (backgroundSelect) {
            backgroundSelect.addEventListener('change', function() {
                handleBackgroundChange(this.value);
            });
        }
        
        if (defaultNoteShape) {
            defaultNoteShape.addEventListener('change', function() {
                changeDefaultNoteShape(this.value);
            });
        }
        
        if (defaultNoteFont) {
            defaultNoteFont.addEventListener('change', function() {
                changeDefaultNoteFont(this.value);
            });
        }
        
        if (boardWidth) {
            boardWidth.addEventListener('change', function() {
                changeBoardSize();
            });
        }
        
        if (boardHeight) {
            boardHeight.addEventListener('change', function() {
                changeBoardSize();
            });
        }
    }
    



    function handleBackgroundChange(value) {
        const board = document.querySelector('.board');
        if (!board) return;

        if (value === 'default') {
            board.style.backgroundImage = 'url("https://img.freepik.com/free-photo/wood-board-background_1339-5417.jpg")';
        }
    }


    function changeDefaultNoteShape(shape) {
        window.defaultNoteShape = shape;
    }


    function changeDefaultNoteFont(font) {
        window.defaultNoteFont = font;
    }


        function changeBoardSize() {
            const width = document.getElementById('boardWidth').value;
            const height = document.getElementById('boardHeight').value;
            
            if (width < 600) width = 600;
            if (width > 1200) width = 1200;
            if (height < 400) height = 400;
            if (height > 800) height = 800;
            
            document.documentElement.style.setProperty('--board-width', `${width}px`);
            document.documentElement.style.setProperty('--board-height', `${height}px`);
            
            checkNotePositions();
        }


    function checkNotePositions() {
        const container = document.getElementById('notesContainer');
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        
        notes.forEach(note => {
            if (note.x < 0) note.x = 0;
            if (note.y < 0) note.y = 0;
            if (note.x + note.width > containerRect.width) {
                note.x = containerRect.width - note.width;
            }
            if (note.y + note.height > containerRect.height) {
                note.y = containerRect.height - note.height;
            }
        });
        
        saveNotes();
        displayNotes();
    }


    window.addEventListener('beforeunload', function() {
        if (window.countdownIntervals) {
            Object.values(window.countdownIntervals).forEach(interval => {
                clearInterval(interval);
            });
            window.countdownIntervals = {};
        }
        

        if (tytInterval) clearInterval(tytInterval);
        if (aytInterval) clearInterval(aytInterval);
        if (kronometreInterval) clearInterval(kronometreInterval);
        if (tytDenemeInterval) clearInterval(tytDenemeInterval);
        if (aytDenemeInterval) clearInterval(aytDenemeInterval);
        if (ozelInterval) clearInterval(ozelInterval);
    });


    window.addNote = addNote;
    window.addNewNote = addNewNote;
    window.createNewNote = createNewNote;
    window.deleteNote = deleteNote;
    window.editNote = editNote;
    window.saveNote = saveNote;
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.changeBackground = changeBackground;
    window.changeNoteShape = changeNoteShape;
    window.changeNoteFont = changeNoteFont;
    window.changeBoardSize = changeBoardSize;
    window.showCounterSelection = showCounterSelection;
    window.showCounter = showCounter;
    window.showColorPicker = showColorPicker;
    window.changeTextColor = changeTextColor;
    window.changeNoteColor = changeNoteColor;
    window.toggleSettings = toggleSettings;
    window.selectSound = selectSound;
    window.playAlarm = playAlarm;
    
    console.log('Window fonksiyonları eklendi:', {
        addNewNote: !!window.addNewNote,
        createNewNote: !!window.createNewNote,
        openSettings: !!window.openSettings
    });


    window.setTYTDate = function() {
        const date = prompt('TYT sınav tarihini girin (YYYY-MM-DD):');
        if (date) {
            localStorage.setItem('tytDate', date);
            startTYTCounter();
        }
    };


    function clearCounterStates() {
        const allCounters = document.querySelectorAll('.counter-display');
        allCounters.forEach(counter => {
            counter.style.display = 'none';
            counter.classList.remove('animate-in', 'animate-out');
        });
        
        const counterSelection = document.getElementById('counterSelection');
        if (counterSelection) {
            counterSelection.style.display = 'flex';
        }
    }


    window.clearCounterStates = clearCounterStates;

    window.setAYTDate = function() {
        const date = prompt('AYT sınav tarihini girin (YYYY-MM-DD):');
        if (date) {
            localStorage.setItem('aytDate', date);
            startAYTCounter();
        }
    };


    window.startKronometre = startKronometre;
    window.resetKronometre = resetKronometre;
    window.fullscreenKronometre = fullscreenKronometre;


    window.startTYTDeneme = startTYTDeneme;
    window.resetTYTDeneme = resetTYTDeneme;
    window.fullscreenTYTDeneme = fullscreenTYTDeneme;


    window.startAYTDeneme = startAYTDeneme;
    window.resetAYTDeneme = resetAYTDeneme;
    window.fullscreenAYTDeneme = fullscreenAYTDeneme;


    window.startOzelCounter = startOzelCounter;
    window.resetOzelCounter = resetOzelCounter;
    window.fullscreenOzel = fullscreenOzel;


    window.fullscreenTYT = fullscreenTYT;
    window.fullscreenAYT = fullscreenAYT;


    window.startResize = startResize;
    window.handleResize = handleResize;
    window.stopResize = stopResize;

    // Ses Seçme Fonksiyonları
    function loadSoundSettings() {
        const savedSounds = localStorage.getItem('customSounds');
        if (savedSounds) {
            customSounds = JSON.parse(savedSounds);
        }
    }

    function saveSoundSettings() {
        localStorage.setItem('customSounds', JSON.stringify(customSounds));
    }

    function selectSound(soundType) {
        currentSoundType = soundType;
        document.getElementById('soundModal').style.display = 'flex';
        
        // Mevcut ses ayarını göster
        const currentSound = customSounds[soundType];
        if (currentSound) {
            if (currentSound === 'default') {
                setSound('default');
            } else if (currentSound === 'none') {
                setSound('none');
            } else {
                // Özel ses
                document.getElementById('previewAudio').src = currentSound;
                document.getElementById('soundPreview').style.display = 'block';
            }
        } else {
            setSound('default');
        }
    }

    function setSound(soundType) {
        // Önceki seçimleri temizle
        document.querySelectorAll('.sound-option').forEach(option => {
            option.style.borderColor = '#e0e0e0';
            option.style.backgroundColor = '';
        });

        // Yeni seçimi vurgula
        const selectedOption = event.target.closest('.sound-option');
        if (selectedOption) {
            selectedOption.style.borderColor = '#3498db';
            selectedOption.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        }

        selectedSound = soundType;
        
        if (soundType === 'default') {
            document.getElementById('previewAudio').src = defaultSound;
            document.getElementById('soundPreview').style.display = 'block';
        } else if (soundType === 'none') {
            document.getElementById('soundPreview').style.display = 'none';
        } else if (soundType === 'custom') {
            document.getElementById('soundFileInput').click();
        }
    }

    function handleSoundUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('previewAudio').src = e.target.result;
                document.getElementById('soundPreview').style.display = 'block';
                selectedSound = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    function saveSoundSelection() {
        if (currentSoundType && selectedSound !== null) {
            customSounds[currentSoundType] = selectedSound;
            saveSoundSettings();
            closeSoundModal();
            
            // Başarı mesajı göster
            showNotification('Ses ayarı kaydedildi!', 'success');
        }
    }

    function closeSoundModal() {
        document.getElementById('soundModal').style.display = 'none';
        currentSoundType = null;
        selectedSound = null;
        document.getElementById('soundPreview').style.display = 'none';
        document.getElementById('soundFileInput').value = '';
    }

    function playSound(soundType) {
        const sound = customSounds[soundType];
        if (sound && sound !== 'none') {
            const audio = new Audio(sound === 'default' ? defaultSound : sound);
            audio.play().catch(e => console.log('Ses çalınamadı:', e));
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            border-radius: 6px;
            z-index: 1001;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Global fonksiyonları tanımla
    window.selectSound = selectSound;
    window.setSound = setSound;
    window.handleSoundUpload = handleSoundUpload;
    window.saveSoundSelection = saveSoundSelection;
    window.closeSoundModal = closeSoundModal;
    window.playSound = playSound;
}); 
