import { GameCard, HintButton, shuffle, StatusPopUp} from '../game_components.js';

class Scramble {
    constructor(parent, dispenserStrings = [],  svgNS = 'http://www.w3.org/2000/svg') {
        
        //Init instance variables
        this.svgNS = svgNS;
        this.parent = parent;
        this.won = false;
        this.score = 0;
        this.highScore = 0;
        this.dispensers = [];
        this.currentWord = "";
        this.history = [];

        //Load dictionary
        this.baseURL = window.location.protocol + window.location.host;
        console.log(this.baseURL);
        this.dictionaryURL = new URL("dictionary.json", this.baseURL);
        this.dictionary = [];
        this.#loadDictionaryFromUrl(this.dictionaryURL);

        //Create game element
        this.element = document.createElement("div");
        this.element.classList.add("scramble-game");

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

        //Create Score element
        this.scoreElement = document.createElement("p");
        this.scoreElement.classList.add("score");
        this.scoreElement.innerText = "SCORE: 0, BEST: 0";
        this.element.appendChild(this.scoreElement);

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

        //Create discard Button
        this.discardButton = document.createElement("button");
        this.discardButton.innerText = "DISCARD";
        this.buttonsDiv.appendChild(this.discardButton);
        this.discardButton.addEventListener("click", () => {
            this.#discard();
        });

        //Create Enter Button
        this.enterButton = new HintButton(0,5,"SUBMIT");
        this.element.appendChild(this.enterButton.element);
        this.enterButton.element.addEventListener("click", () => {
            this.#submitWord();
        });
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
        this.enterButton.incrementProgress(24);
        this.currentWordElement.scrollTo({
            left: this.currentWordElement.scrollWidth,
            behavior: 'smooth'
        });
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
            this.enterButton.setProgress(5+24*this.currentWord.length);
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
        this.enterButton.setProgress(5);
        this.history.push(this.currentWord);
        this.currentWord = "";
        this.currentWordElement.textContent = "_";
    }

    #discard() {
        this.enterButton.setProgress(5);
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

const testCard3 = document.getElementById("test3");
const s3 = new Scramble(testCard3);
s3.addDispenser('DOTIO');
s3.addDispenser('REONP');
s3.addDispenser('INHTM');
s3.addDispenser('OELET');
s3.addDispenser('PARIS');

const testCard2 = document.getElementById("test2");
const s2 = new Scramble(testCard2);
s2.addDispenser('AREMI');
s2.addDispenser('RLOOS');
s2.addDispenser('DHETT');
s2.addDispenser('STNVP');
s2.addDispenser('IGITB');

const testCard = document.getElementById("test");
const s1 = new Scramble(testCard);
s1.addDispenser('ZERME');
s1.addDispenser('ONETO');
s1.addDispenser('ANTRR');
s1.addDispenser('ERPOA');
s1.addDispenser('DHBKY');


