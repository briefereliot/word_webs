
class Scramble {
    constructor(parent, dispenserStrings = [],  svgNS = 'http://www.w3.org/2000/svg') {
        
        //Init instance variables
        this.svgNS = svgNS;
        this.parent = parent;
        this.won = false;
        this.score = 0;
        this.dispensers = [];
        this.currentWord = "";

        //Load dictionary
        this.baseURL = window.location.protocol + window.location.host;
        console.log(this.baseURL);
        this.dictionaryURL = new URL("dictionary.json", this.baseURL);
        this.dictionary = [];
        this.#loadDictionaryFromUrl(this.dictionaryURL);

        //Create game element
        this.element = document.createElement("div");
        this.element.classList.add("scramble-game");

        //Create dispensers
        this.dispensersDiv = document.createElement("div");
        this.dispensersDiv.classList.add("dispensers-div");
        this.element.appendChild(this.dispensersDiv);
        for(let i = 0; i < dispenserStrings.length; i++) {
            this.addDispenser(dispenserStrings[i]);
        }

        //Create current word
        this.currentWordElement = document.createElement("p");
        this.currentWordElement.innerText = "_";
        this.element.appendChild(this.currentWordElement);
        this.parent.appendChild(this.element);

        //Create Buttons div
        this.buttonsDiv = document.createElement("div");
        this.buttonsDiv.classList.add("buttons-div", "center", "row");
        this.element.appendChild(this.buttonsDiv);

        //Create Enter Button
        this.enterButton = document.createElement("button");
        this.enterButton.innerText = "ENTER";
        this.buttonsDiv.appendChild(this.enterButton);
        this.enterButton.addEventListener("click", () => {
            this.#submitWord();
        });

        //Create Undo Button
        this.undoButton = document.createElement("button");
        this.undoButton.innerText = "UNDO";
        this.buttonsDiv.appendChild(this.undoButton);
    }

    addDispenser(letters) {
        let d = new Dispenser(this, letters);
        this.dispensers.push(d);
        this.dispensersDiv.appendChild(d.element);
    }

    addLetterToWord(letter) {
        if(this.#isLetter(letter)) {
            this.currentWord += letter;
            this.currentWordElement.textContent = this.currentWord;
        }
    }

    #isLetter(str) {
        return str.length === 1 && str.match(/[a-z]/i);
    }

    #submitWord() {
        console.log(this.dictionary);
        if(this.dictionary.includes(this.currentWord.toLowerCase())) {
            console.log(`${this.currentWord} is a word`);
        } else {
            console.log(`${this.currentWord} is not a valid word`);
        }
        this.currentWord = "";
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
        this.dispenseButton = document.createElement("button");
        this.dispenseButton.classList.add("dispenser-button")
        for(let i=0; i<letters.length; i++) {
            let l = new Letter(this.stack, letters[i]);
            this.letters.push(l);
        }
        this.element.appendChild(this.stack);
        this.element.appendChild(this.dispenseButton);
        this.#initEvents();
    }

    dispenseLetter() {
        if(this.letters.length > 0) {
            let l = this.letters.pop();
            l.removeFromParent();
            return l;
        }
        return null;
    }

    #initEvents() {
        this.element.addEventListener('click', () => {
            this.parent.addLetterToWord(this.dispenseLetter().value);
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
        this.parent.appendChild(this.element);
    };

    removeFromParent() {
        this.element.remove();
    }

    #isLetter(str) {
        return str.length === 1 && str.match(/[a-z]/i);
    }


};

const testCard = document.getElementById("test");
const s1 = new Scramble(testCard);
s1.addDispenser('TSIAW');
s1.addDispenser('LEURC');
s1.addDispenser('YRIAF');
s1.addDispenser('TSOHG');
s1.addDispenser('AMGAM');

setTimeout(() => {
    const carousel = document.getElementById("carousel");
    carousel.scrollTo(carousel.scrollWidth, 0);
}, 500);


