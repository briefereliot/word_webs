import { GameCard, HintButton, shuffle, StatusPopUp, StartPopup, BluredPopup, LocalStorageManager} from '../game_components.js';

class Scramble {
    constructor(parent, LSM, id, title, dispenserStrings = []) {
        
        //Init instance variables
        this.parent = parent;
        this.LSM = LSM;
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

        //Create game element
        this.element = document.createElement("div");
        this.element.classList.add("scramble-game");

        //Create Start button
        this.startButton = new StartPopup(this.parent.parentNode, this.start.bind(this));
        this.titleP = document.createElement("p");
        this.titleP.innerText =this.title ;
        this.startButton.element.prepend(this.titleP);

        //Create current word
        this.currentWordElement = document.createElement("p");
        this.currentWordElement.classList.add("current-word");
        this.currentWordElement.innerText = "_";
        this.element.appendChild(this.currentWordElement);
        this.parent.appendChild(this.element);

        //Create dispensers
        this.dispensersDiv = document.createElement("div");
        this.dispensersDiv.classList.add("dispensers-div");
        this.element.appendChild(this.dispensersDiv);
        for(let i = 0; i < dispenserStrings.length; i++) {
            this.addDispenser(dispenserStrings[i]);
        }

        this.timerElement = document.createElement("p");
        this.timerElement.classList.add("timer");
        this.timerElement.innerText = "0";
        this.element.appendChild(this.timerElement);
        this.startTime = 0;
        this.winDuration = 0;
        this.timerFunction = null;

        //Create Buttons div
        this.buttonsDiv = document.createElement("div");
        this.buttonsDiv.classList.add("buttons-div", "row");
        this.element.appendChild(this.buttonsDiv);

        //Create Undo Button
        this.undoButton = document.createElement("button");
        this.undoButton.innerText = "UNDO";
        this.buttonsDiv.appendChild(this.undoButton);
        this.undoButton.addEventListener("click", () => {
            this.undo();
        });

        //Create win popup
        this.winPopup = new BluredPopup(this.parent.parentNode);
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

const LSM = new LocalStorageManager('ms', 16, 7);
LSM.setRememberChoice(true);

const feb15 = document.getElementById("feb15");
const s16 = new Scramble(feb15, LSM, 16, "SUNDAY, FEBRUARY 15TH\nSCRAMBLE #16");
s16.addDispenser('ROD');
s16.addDispenser('EUR');
s16.addDispenser('PCE');

const feb14 = document.getElementById("feb14");
const s15 = new Scramble(feb14, LSM, 15, "SATURDAY, FEBRUARY 14TH\nSCRAMBLE #15");
s15.addDispenser('BRT');
s15.addDispenser('SUC');
s15.addDispenser('SIP');

const feb13 = document.getElementById("feb13");
const s14 = new Scramble(feb13, LSM, 14, "FRIDAY, FEBRUARY 13TH\nSCRAMBLE #14");
s14.addDispenser('EEN');
s14.addDispenser('NLI');
s14.addDispenser('GGT');

const feb12 = document.getElementById("feb12");
const s13 = new Scramble(feb12, LSM, 13, "THURSDAY, FEBRUARY 12TH\nSCRAMBLE #13");
s13.addDispenser('ECN');
s13.addDispenser('TAL');
s13.addDispenser('SIO');

const feb11 = document.getElementById("feb11");
const s12 = new Scramble(feb11, LSM, 12, "WEDNESDAY, FEBRUARY 11TH\nSCRAMBLE #12");
s12.addDispenser('EAG');
s12.addDispenser('RRR');
s12.addDispenser('ANE');

const feb10 = document.getElementById("feb10");
const s11 = new Scramble(feb10, LSM, 11, "TUESDAY, FEBRUARY 10TH\nSCRAMBLE #11");
s11.addDispenser('RCY');
s11.addDispenser('DOC');
s11.addDispenser('EMA');

const feb9 = document.getElementById("feb9");
const s10 = new Scramble(feb9, LSM, 10, "MONDAY, FEBRUARY 9TH\nSCRAMBLE #10");
s10.addDispenser('ABO');
s10.addDispenser('MIN');
s10.addDispenser('DAL');

const feb8 = document.getElementById("feb8");
const s9 = new Scramble(feb8, LSM, 9, "SUNDAY, FEBRUARY 8TH\nSCRAMBLE #9");
s9.addDispenser('IAL');
s9.addDispenser('UNV');
s9.addDispenser('RED');

/*const feb7 = document.getElementById("feb7");
const s8 = new Scramble(feb7, LSM, 8, "SATURDAY, FEBRUARY 7TH\nSCRAMBLE #8");
s8.addDispenser('IAR');
s8.addDispenser('DSC');
s8.addDispenser('HGE');

const feb6 = document.getElementById("feb6");
const s7 = new Scramble(feb6, LSM, 7, "FRIDAY, FEBRUARY 6TH\nSCRAMBLE #7");
s7.addDispenser('FIT');
s7.addDispenser('ESS');
s7.addDispenser('RUL');

const feb5 = document.getElementById("feb5");
const s6 = new Scramble(feb5, LSM, 6, "THURSDAY, FEBRUARY 5TH\nSCRAMBLE #6");
s6.addDispenser('ETE');
s6.addDispenser('MMA');
s6.addDispenser('IDI');
const feb4 = document.getElementById("feb4");
const s5 = new Scramble(feb4, LSM, 5, "WEDNESDAY, FEBRUARY 4TH\nSCRAMBLE #5");
s5.addDispenser('FSO');
s5.addDispenser('BRN');
s5.addDispenser('IRT');

const feb3 = document.getElementById("feb3");
const s4 = new Scramble(feb3, "TUESDAY, FEBRUARY 3RD\nSCRAMBLE #4");
s4.addDispenser('RIT');
s4.addDispenser('ISE');
s4.addDispenser('DON');

const feb2 = document.getElementById("feb2");
const s3 = new Scramble(feb2, "MONDAY, FEBRUARY 2ND\nSCRAMBLE #3");
s3.addDispenser('CUB');
s3.addDispenser('HLE');
s3.addDispenser('BYO');

const testCard8 = document.getElementById("test8");
const s2 = new Scramble(testCard8, "SUNDAY, FEBRUARY 1ST\nSCRAMBLE #2");
s2.addDispenser('ENA');
s2.addDispenser('AST');
s2.addDispenser('CDN');

const testCard7 = document.getElementById("test7");
const s1 = new Scramble(testCard7, "SATURDAY, JANUARY 31ST\nSCRAMBLE #1");
s1.addDispenser('ELU');
s1.addDispenser('RSE');
s1.addDispenser('CIV');*/