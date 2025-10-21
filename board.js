document.addEventListener('DOMContentLoaded', function() {

    const board = document.getElementById('board');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const boardSettings = document.getElementById('boardSettings');
    const closeSettingsBtn = document.querySelector('.close-settings');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const resetSettingsBtn = document.getElementById('resetSettings');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const colorOptions = document.querySelectorAll('.color-option');
    const shapeOptions = document.querySelectorAll('.shape-option');
    const sizeOptions = document.querySelectorAll('.size-option');
    const shadowOptions = document.querySelectorAll('.shadow-option');
    const hoverAnimationToggle = document.getElementById('hoverAnimation');
    const dragAnimationToggle = document.getElementById('dragAnimation');
    const autoSaveToggle = document.getElementById('autoSave');


    let settings = {
        boardColor: '#dab88b',
        noteColor: '#fff9c4',
        noteShape: 'square',
        noteSize: 'medium',
        noteFont: 'Arial',
        noteShadow: 'medium',
        hoverAnimation: true,
        dragAnimation: true,
        autoSave: true
    };


    function loadSettings() {
        const savedSettings = localStorage.getItem('boardSettings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
            applySettings();
            updateActiveOptions();
        }
    }


    function saveSettings() {
        if (settings.autoSave) {
            localStorage.setItem('boardSettings', JSON.stringify(settings));
        }
    }


    function applySettings() {

        board.style.backgroundColor = settings.boardColor;
        document.getElementById('boardColor').value = settings.boardColor;


        document.getElementById('noteFont').value = settings.noteFont;
        hoverAnimationToggle.checked = settings.hoverAnimation;
        dragAnimationToggle.checked = settings.dragAnimation;
        autoSaveToggle.checked = settings.autoSave;


        updateAllNotes();
    }


    function updateActiveOptions() {
        colorOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.color === settings.noteColor);
        });
        shapeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.shape === settings.noteShape);
        });
        sizeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.size === settings.noteSize);
        });
        shadowOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.shadow === settings.noteShadow);
        });
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


    function createNote() {
        const note = document.createElement('div');
        note.className = 'note';
        updateNoteStyle(note);


        const rotation = Math.floor(Math.random() * 11) - 5;
        note.style.transform = `rotate(${rotation}deg)`;


        const content = document.createElement('div');
        content.className = 'note-content';
        content.contentEditable = true;
        content.placeholder = 'Notunuzu buraya yazın...';


        const header = document.createElement('div');
        header.className = 'note-header';
        

        const date = document.createElement('span');
        date.className = 'note-date';
        date.textContent = new Date().toLocaleDateString('tr-TR');


        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-note';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', () => {
            note.classList.add('fade-out');
            setTimeout(() => note.remove(), 300);
        });

        header.appendChild(date);
        header.appendChild(deleteBtn);
        note.appendChild(header);
        note.appendChild(content);
        board.appendChild(note);


        if (settings.dragAnimation) {
            makeDraggable(note);
        }


        content.addEventListener('input', () => {
            if (settings.autoSave) {
                saveNoteContent(note);
            }
        });
    }


    function saveNoteContent(note) {
        const content = note.querySelector('.note-content').innerHTML;
        const noteId = note.id || Date.now().toString();
        note.id = noteId;
        localStorage.setItem(`note_${noteId}`, content);
    }


    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            element.style.zIndex = 1000;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            element.style.zIndex = 1;
            if (settings.autoSave) {
                saveNotePosition(element);
            }
        }
    }


    function saveNotePosition(note) {
        const position = {
            top: note.style.top,
            left: note.style.left,
            transform: note.style.transform
        };
        localStorage.setItem(`note_position_${note.id}`, JSON.stringify(position));
    }


    addNoteBtn.addEventListener('click', createNote);
    
    settingsBtn.addEventListener('click', () => {
        boardSettings.style.display = boardSettings.style.display === 'none' ? 'block' : 'none';
    });

    closeSettingsBtn.addEventListener('click', () => {
        boardSettings.style.display = 'none';
    });


    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });


    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            settings.noteColor = option.dataset.color;
            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            updateAllNotes();
            saveSettings();
        });
    });


    shapeOptions.forEach(option => {
        option.addEventListener('click', () => {
            settings.noteShape = option.dataset.shape;
            shapeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            updateAllNotes();
            saveSettings();
        });
    });


    sizeOptions.forEach(option => {
        option.addEventListener('click', () => {
            settings.noteSize = option.dataset.size;
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            updateAllNotes();
            saveSettings();
        });
    });


    shadowOptions.forEach(option => {
        option.addEventListener('click', () => {
            settings.noteShadow = option.dataset.shadow;
            shadowOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            updateAllNotes();
            saveSettings();
        });
    });


    hoverAnimationToggle.addEventListener('change', () => {
        settings.hoverAnimation = hoverAnimationToggle.checked;
        updateAllNotes();
        saveSettings();
    });

    dragAnimationToggle.addEventListener('change', () => {
        settings.dragAnimation = dragAnimationToggle.checked;
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            if (settings.dragAnimation) {
                makeDraggable(note);
            } else {
                note.onmousedown = null;
            }
        });
        saveSettings();
    });

    autoSaveToggle.addEventListener('change', () => {
        settings.autoSave = autoSaveToggle.checked;
        saveSettings();
    });

    saveSettingsBtn.addEventListener('click', () => {
        settings.boardColor = document.getElementById('boardColor').value;
        settings.noteFont = document.getElementById('noteFont').value;
        saveSettings();
        applySettings();
        boardSettings.style.display = 'none';
    });

    resetSettingsBtn.addEventListener('click', () => {
        settings = {
            boardColor: '#dab88b',
            noteColor: '#fff9c4',
            noteShape: 'square',
            noteSize: 'medium',
            noteFont: 'Arial',
            noteShadow: 'medium',
            hoverAnimation: true,
            dragAnimation: true,
            autoSave: true
        };
        saveSettings();
        applySettings();
        updateActiveOptions();
    });


    loadSettings();
    loadSavedNotes();
}); 
