import { GameCard, StatusPopUp, StartPopup, BluredPopup, LocalStorageManager} from '../game_components.js';

class Scramble {

    static parent = undefined;
    static LSM = undefined;

    constructor(id, title, dispenserStrings = [], parent = undefined, LSM = undefined,) {
        
        //Init instance variables
        if(parent == undefined) this.parent = Scramble.parent;
        else this.parent = parent;
        if(LSM == undefined) this.LSM = Scramble.LSM;
        else this.LSM = LSM;
        this.id = id;
        this.won = false;
        this.score = 0;
        this.highScore = 0;
        this.dispensers = [];
        this.currentWord = "";
        this.history = [];
        this.title = title;

        //Load dictionary
        this.baseURL = window.location.protocol + window.location.host;
        this.dictionaryURL = new URL("dictionary.json", this.baseURL);
        this.dictionary = [];
        this.#loadDictionaryFromUrl(this.dictionaryURL);

        //Create DOM elements
        this.card = new GameCard(this.parent, false, false);
        this.card.setTopText(this.title);
        this.card.showTopText();
        this.card.gameElement.classList.add("scramble-game");

        //Create Start button
        this.startButton = new StartPopup(this.card.element, this.start.bind(this));
        this.titleP = document.createElement("p");
        this.titleP.innerText =this.title ;
        this.startButton.element.prepend(this.titleP);

        //Create current word
        this.currentWordElement = document.createElement("p");
        this.currentWordElement.classList.add("current-word");
        this.currentWordElement.innerText = "_";
        this.card.gameElement.appendChild(this.currentWordElement);

        //Create dispensers
        this.dispensersDiv = document.createElement("div");
        this.dispensersDiv.classList.add("dispensers-div");
        this.card.gameElement.appendChild(this.dispensersDiv);
        for(let i = 0; i < dispenserStrings.length; i++) {
            this.addDispenser(dispenserStrings[i]);
        }

        this.timerElement = document.createElement("p");
        this.timerElement.classList.add("timer");
        this.timerElement.innerText = "0";
        this.card.gameElement.appendChild(this.timerElement);
        this.startTime = 0;
        this.winDuration = 0;
        this.timerFunction = null;

        //Create Buttons div
        this.buttonsDiv = document.createElement("div");
        this.buttonsDiv.classList.add("buttons-div", "row");
        this.card.gameElement.appendChild(this.buttonsDiv);

        //Create Undo Button
        this.undoButton = document.createElement("button");
        this.undoButton.innerText = "UNDO";
        this.buttonsDiv.appendChild(this.undoButton);
        this.undoButton.addEventListener("click", () => {
            this.undo();
        });

        //Create win popup
        this.winPopup = new BluredPopup(this.card.element);
        this.winTextElement = document.createElement("p");
        this.winPopup.element.appendChild(this.winTextElement);

        //Check if already won
        if(this.LSM.getWinStateByID(this.id)) {
            this.startButton.element.remove();
            this.#showSolution();
        }
    }

    start() {
        this.startTime = Date.now();
        this.timerFunction = setInterval(() => {
            console.log(this);
            var delta = Date.now() - this.startTime; // milliseconds elapsed since start
            this.timerElement.innerText = String((delta / 1000).toFixed(0)); // in seconds
        }, 1000); // update about every second
    }

    win() {
        this.winDuration = (Date.now() - this.startTime)/1000;
        clearInterval(this.timerFunction);
        this.currentWordElement.classList.add('highlight');
        this.winTextElement.innerText = `YOU UNSCRAMBLED \"${this.currentWord}\" IN ${this.winDuration.toFixed(1)} SECONDS!`;
        const gameData = {
            "word" : this.currentWord,
            "time" : this.winDuration.toFixed(1)
        };
        this.LSM.addGameToStreak(this.id);
        this.LSM.setGameStateByID(this.id, gameData);
        this.LSM.saveToLocalStorage();

        setTimeout(() => {
            this.winPopup.show();
        }, 750);
        
    }

    addDispenser(letters) {
        let d = new Dispenser(this, letters);
        this.dispensers.push(d);
        this.dispensersDiv.appendChild(d.element);
    }

    addLetterToWord(letter) {
        if(this.#isLetter(letter.value)) {
            this.currentWord += letter.value;
            this.currentWordElement.textContent = this.currentWord;
        }
        this.history.push(letter);
        /*this.enterButton.incrementProgress(24);*/
        this.currentWordElement.scrollTo({
            left: this.currentWordElement.scrollWidth,
            behavior: 'smooth'
        });
        if(this.currentWord.length === 9) {
            if(this.#getWordScore(this.currentWord) > 0) {
                this.win();
            }
        }
    }

    undo() {
        if(this.history.length > 0) {
            let item = this.history.pop();
            if(typeof item === 'string') {
                console.log(item);
                this.addScore(-1 * this.#getWordScore(item));
                this.currentWord = item;
                this.currentWordElement.textContent = item;
            } else {
                item.addToParent();
                this.dispensers.forEach((dispenser) => {
                    dispenser.updateHighlight();
                });
                this.currentWord = this.currentWord.slice(0,-1);
                this.currentWordElement.textContent = this.currentWord;
            }
        }
    }

    addScore(amount) {
        console.log(amount);
        this.score += amount;
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        this.scoreElement.innerText = `SCORE: ${this.score}, BEST: ${this.highScore}`;
        this.scoreElement.classList.add('highlight');
        setTimeout(() => {
                this.scoreElement.classList.remove('highlight');
        },1000);
    }

    #isLetter(str) {
        return str.length === 1 && str.match(/[a-z]/i);
    }

    #submitWord() {
        let wordScore = this.#getWordScore(this.currentWord);
        if(wordScore > 0) {
            this.addScore(wordScore);
        } else {
            console.log(`${this.currentWord} is not a valid word`);
                    let popUp = new StatusPopUp(this.element, "NOT IN WORD LIST", 1);
        }
        //this.enterButton.setProgress(5);
        this.history.push(this.currentWord);
        this.currentWord = "";
        this.currentWordElement.textContent = "_";
    }

    #discard() {
        //this.enterButton.setProgress(5);
        this.history.push(this.currentWord);
        this.currentWord = "";
        this.currentWordElement.textContent = "_";
    }

    #getWordScore(word) {
        if(this.dictionary.includes(word.toLowerCase())) {
            return word.length*2 - 4;
        }
        return 0;
    }

    #showSolution() {
        const savedData = this.LSM.getGameStateByID(this.id);
        if(savedData != null) {
            this.currentWordElement.textContent = savedData['word'];
            this.currentWordElement.classList.add('highlight');
            this.winTextElement.innerText = `YOU UNSCRAMBLED \"${savedData['word']}\" IN ${savedData['time']} SECONDS!`;
            this.winPopup.show();
        }
    }

    async #loadDictionaryFromUrl(url) {
        try {
            const response = await fetch(url);
            if(!response.ok) {
                throw new Error('Network response not OK');
            }
            this.dictionary = await response.json();
        } catch(error) {
            console.error('Error loading array from url:', error);
        }
    }
}

class Dispenser {

    constructor(parent, letters) {
        this.parent = parent;
        this.element = document.createElement("div");
        this.element.classList.add("dispenser");
        this.letters = [];
        this.stack = document.createElement("div");
        this.stack.classList.add("dispenser-stack")
        for(let i=letters.length - 1; i>=0; i--) {
            let l = new Letter(this, letters[i]);
            this.addLetter(l);
        }
        this.letters.at(-1).highlight();
        this.element.appendChild(this.stack);
        //this.element.appendChild(this.dispenseButton);
        this.#initEvents();
    }

    updateHighlight() {
        this.letters.forEach((letter) => {
            letter.unhighlight();
        })
        if(this.letters.length > 0) {
            this.letters.at(-1).highlight();
        }
    }

    addLetter(letter) {
        this.letters.push(letter);
        this.stack.appendChild(letter.element);
        this.updateHighlight();
    }

    dispenseLetter() {
        if(this.letters.length > 0) {
            let l = this.letters.pop();
            l.removeFromParent();
            this.updateHighlight();
            return l;
            
        }
        return null;
    }

    #initEvents() {
        this.element.addEventListener('click', () => {
            if (this.letters.length > 0) {
                this.parent.addLetterToWord(this.dispenseLetter());
            }
        });
    }
}

class Letter {
    constructor(parent, value) {
        this.parent = parent;
        this.value = " "
        if(this.#isLetter(value)) {
            this.value = value;
        }
        this.element = document.createElement("div");
        this.element.classList.add("letter");
        this.element.innerText = this.value;
    };

    addToParent() {
        this.parent.addLetter(this);
    }

    removeFromParent() {
        this.element.remove();
        this.unhighlight();
    }

    #isLetter(str) {
        return str.length === 1 && str.match(/[a-z]/i);
    }

    highlight() {
        this.element.classList.add('highlight');
    }

    unhighlight() {
        this.element.classList.remove('highlight');
    }
};

const carousel = document.getElementById("carousel")

const LSM = new LocalStorageManager('ms', 39, 7);
LSM.setRememberChoice(true);

Scramble.parent = carousel;
Scramble.LSM = LSM;

const s40 = new Scramble(40, "FRIDAY, MARCH 13TH\nSCRAMBLE #40");
s40.addDispenser('TER');
s40.addDispenser('IOS');
s40.addDispenser('INR');

const s39 = new Scramble(39, "THURSDAY, MARCH 12TH\nSCRAMBLE #39");
s39.addDispenser('GGG');
s39.addDispenser('RET');
s39.addDispenser('AAE');

const s38 = new Scramble(38, "WEDNESDAY, MARCH 11TH\nSCRAMBLE #38");
s38.addDispenser('SHT');
s38.addDispenser('NCR');
s38.addDispenser('PIE');

const s37 = new Scramble(37, "TUESDAY, MARCH 10TH\nSCRAMBLE #37");
s37.addDispenser('ITE');
s37.addDispenser('ARB');
s37.addDispenser('RAG');

const s36 = new Scramble(36, "MONDAY, MARCH 9TH\nSCRAMBLE #36");
s36.addDispenser('ING');
s36.addDispenser('UAL');
s36.addDispenser('BLI');

const s35 = new Scramble(35, "SUNDAY, MARCH 8TH\nSCRAMBLE #35");
s35.addDispenser('SHL');
s35.addDispenser('HEO');
s35.addDispenser('OUD');

const s34 = new Scramble(34, "SATURDAY, MARCH 7TH\nSCRAMBLE #34");
s34.addDispenser('MOO');
s34.addDispenser('PHS');
s34.addDispenser('ARU');








