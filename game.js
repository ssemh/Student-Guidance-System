document.addEventListener('DOMContentLoaded', function() {

    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    const elements = [
        { symbol: 'H', name: 'Hidrojen' },
        { symbol: 'O', name: 'Oksijen' },
        { symbol: 'Na', name: 'Sodyum' },
        { symbol: 'Cl', name: 'Klor' },
        { symbol: 'C', name: 'Karbon' },
        { symbol: 'N', name: 'Azot' },
        { symbol: 'Ca', name: 'Kalsiyum' },
        { symbol: 'Fe', name: 'Demir' }
    ];

    const compounds = [
        { formula: 'H2O', name: 'Su', elements: ['H', 'H', 'O'] },
        { formula: 'NaCl', name: 'Tuz', elements: ['Na', 'Cl'] },
        { formula: 'CO2', name: 'Karbondioksit', elements: ['C', 'O', 'O'] },
        { formula: 'NH3', name: 'Amonyak', elements: ['N', 'H', 'H', 'H'] },
        { formula: 'CaO', name: 'Kalsiyum Oksit', elements: ['Ca', 'O'] }
    ];

    let currentScore = 0;
    let currentLevel = 1;
    let timeLeft = 60;
    let timer;
    let currentCompound;
    let selectedElements = [];

    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const timerElement = document.getElementById('timer');
    const startButton = document.getElementById('startGame');
    const checkButton = document.getElementById('checkCompound');
    const elementsContainer = document.getElementById('elements-container');
    const targetElement = document.getElementById('target');

    function createElementButton(element) {
        const button = document.createElement('button');
        button.className = 'element-btn';
        button.textContent = element.symbol;
        button.title = element.name;
        button.addEventListener('click', () => selectElement(element));
        return button;
    }

    function selectElement(element) {
        if (!timer) return;
        selectedElements.push(element.symbol);
        updateSelectedElements();
        checkCompoundCompletion();
    }

    function updateSelectedElements() {
        const selected = document.getElementById('selected-elements');
        if (selected) {
            selected.textContent = selectedElements.join(' + ');
        }
    }

    function checkCompoundCompletion() {
        if (selectedElements.length === currentCompound.elements.length) {
            checkButton.disabled = false;
        }
    }

    function selectRandomCompound() {
        currentCompound = compounds[Math.floor(Math.random() * compounds.length)];
        targetElement.textContent = `${currentCompound.formula} (${currentCompound.name})`;
    }

    function startGame() {
        currentScore = 0;
        currentLevel = 1;
        timeLeft = 60;
        scoreElement.textContent = currentScore;
        levelElement.textContent = currentLevel;
        timerElement.textContent = timeLeft;
        

        elementsContainer.innerHTML = '';
        elements.forEach(element => {
            elementsContainer.appendChild(createElementButton(element));
        });


        const selectedDisplay = document.createElement('div');
        selectedDisplay.id = 'selected-elements';
        selectedDisplay.className = 'selected-elements';
        elementsContainer.appendChild(selectedDisplay);

        selectRandomCompound();
        startButton.disabled = true;
        checkButton.disabled = true;
        
        timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function checkCompound() {
        const isCorrect = arraysEqual(selectedElements, currentCompound.elements);
        if (isCorrect) {
            currentScore += 10;
            currentLevel++;
            scoreElement.textContent = currentScore;
            levelElement.textContent = currentLevel;
            alert('Doğru! +10 puan kazandınız!');
        } else {
            alert('Yanlış! Tekrar deneyin.');
        }

        selectedElements = [];
        updateSelectedElements();
        selectRandomCompound();
        checkButton.disabled = true;
    }

    function endGame() {
        clearInterval(timer);
        timer = null;
        alert(`Oyun bitti! Toplam puanınız: ${currentScore}`);
        startButton.disabled = false;
        checkButton.disabled = true;
        selectedElements = [];
        updateSelectedElements();
    }

    function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        const sorted1 = [...arr1].sort();
        const sorted2 = [...arr2].sort();
        return sorted1.every((element, index) => element === sorted2[index]);
    }

    startButton.addEventListener('click', startGame);
    checkButton.addEventListener('click', checkCompound);
});
