import { GameCard, HintButton, StatusPopUp, BluredPopup, LocalStorageManager, StartPopup} from '../game_components.js';

class Scramble {

    static parent = undefined;
    static LSM = undefined;
    static xMark = "☒";
    static checkMark = "☑";

    constructor(id, title, solution = undefined, solutionFour = undefined, solutionThree = undefined, dispenserStrings = [], parent = undefined, LSM = undefined) {
        
        //Init instance variables
        if(parent == undefined) this.parent = Scramble.parent;
        else this.parent = parent;
        if(LSM == undefined) this.LSM = Scramble.LSM;
        else this.LSM = LSM;
        this.id = id;
        this.title = title;
        this.won = false;
        this.score = 0;
        this.highScore = 0;
        this.dispensers = [];
        this.currentWord = "";
        this.history = [];
        this.gameState = this.LSM.getGameStateByID(this.id, {
            foundSolution : false,
            solution : "",
            foundSolutionFour : false,
            solutionFour : "",
            foundSolutionThree : false,
            solutionThree : "",
            longestWord : "___"
        });

        console.log(this.gameState);

        //Load dictionary
        this.baseURL = window.location.protocol + window.location.host;
        this.dictionaryURL = new URL("dictionary.json", this.baseURL);
        this.dictionary = [];
        this.#loadDictionaryFromUrl(this.dictionaryURL);

        //Create game element
        this.card = new GameCard(this.parent, false, false);
        this.card.setTopText(this.title);
        this.card.showTopText();
        this.card.gameElement.classList.add("scramble-game");

        //Create Stats Popup
        this.statsPopup = new BluredPopup(this.card.element);
        this.titleP = document.createElement("p");
        this.titleP.innerText =this.title ;

        //Longest Word
        this.longestWordP = document.createElement("p");
        this.longestWordP.innerText = `LONGEST WORD: ${this.gameState.longestWord}`;

        //Any Solution
        this.foundSolutionP = document.createElement("p");
        this.foundSolutionP.innerText = "☒ FIND A SOLUTION";
        if(this.gameState.foundSolution) this.foundSolutionP.innerText = "☑ FOUND A SOLUTION";
        this.solutionP = document.createElement("p");
        this.solutionButton = document.createElement("button");
        this.solutionButton.innerText = "REVEAL SOLUTION";
        this.solutionP.hidden = true;
        this.solutionButton.hidden = true;
        if(this.gameState.solution != "") {
            this.solutionP.innerText = this.gameState.solution;
            this.solutionP.hidden = false;
        } else if(solution != undefined){
            this.solutionP.innerText = solution;
            this.solutionButton.addEventListener('click', () => {
                this.solutionButton.hidden = true;
                this.solutionP.hidden = false;
            });
            this.solutionButton.hidden = false;
        }

        //Four word solution
        this.foundFourSolutionP = document.createElement("p");
        this.foundFourSolutionP.innerText = "☒ FIND A FOUR WORD SOLUTION";
        if(this.gameState.foundSolutionFour) this.foundFourSolutionP.innerText = "☑ FOUND A FOUR WORD SOLUTION";
        this.solutionFourP = document.createElement("p");
        this.solutionFourButton = document.createElement("button");
        this.solutionFourButton.innerText = "REVEAL SOLUTION";
        this.solutionFourP.hidden = true;
        this.solutionFourButton.hidden = true;
        if(this.gameState.solutionFour != "") {
            this.solutionFourP.innerText = this.gameState.solutionFour;
            this.solutionFourP.hidden = false;
        } else if(solutionFour != undefined){
            this.solutionFourP.innerText = solutionFour;
            this.solutionFourButton.addEventListener('click', () => {
                this.solutionFourButton.hidden = true;
                this.solutionFourP.hidden = false;
            });
            this.solutionFourButton.hidden = false;
        }

        //Three word solution
        this.foundThreeSolutionP = document.createElement("p");
        this.foundThreeSolutionP.innerText = "☒ FIND A THREE WORD SOLUTION";
        if(this.gameState.foundSolutionThree) this.foundThreeSolutionP.innerText = "☑ FOUND A THREE WORD SOLUTION";
        this.solutionThreeP = document.createElement("p");
        this.solutionThreeButton = document.createElement("button");
        this.solutionThreeButton.innerText = "REVEAL SOLUTION";
        this.solutionThreeP.hidden = true;
        this.solutionThreeButton.hidden = true;
        if(this.gameState.solutionThree != "") {
            this.solutionThreeP.innerText = this.gameState.solutionThree;
            this.solutionThreeP.hidden = false;
        } else if(solutionThree != undefined){
            this.solutionThreeP.innerText = solutionThree;
            this.solutionThreeButton.addEventListener('click', () => {
                this.solutionThreeButton.hidden = true;
                this.solutionThreeP.hidden = false;
            });
            this.solutionThreeButton.hidden = false;
        }

        this.statsCloseButton = document.createElement("button");
        this.statsCloseButton.innerText = "CLOSE";
        this.statsCloseButton.addEventListener('click', () => {
            this.statsPopup.hide();
        })

        this.statsPopup.element.append(this.titleP);
        this.statsPopup.element.append(document.createElement("br"));

        this.statsPopup.element.append(this.longestWordP);
        this.statsPopup.element.append(document.createElement("br"));

        this.statsPopup.element.append(this.foundSolutionP);
        this.statsPopup.element.append(this.solutionP);
        this.statsPopup.element.append(this.solutionButton);
        this.statsPopup.element.append(document.createElement("br"));

        this.statsPopup.element.append(this.foundFourSolutionP);
        this.statsPopup.element.append(this.solutionFourP);
        this.statsPopup.element.append(this.solutionFourButton);
        this.statsPopup.element.append(document.createElement("br"));

        this.statsPopup.element.append(this.foundThreeSolutionP);
        this.statsPopup.element.append(this.solutionThreeP);
        this.statsPopup.element.append(this.solutionThreeButton);
        this.statsPopup.element.append(document.createElement("br"));

        this.statsPopup.element.append(this.statsCloseButton);
        this.statsPopup.show();

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

        //Create Score element
        this.scoreElement = document.createElement("p");
        this.scoreElement.classList.add("score");
        this.scoreElement.innerText = "SCORE: 0, BEST: 0";
        this.card.gameElement.appendChild(this.scoreElement);

        //Create Buttons div
        this.buttonsDiv = document.createElement("div");
        this.buttonsDiv.classList.add("buttons-div", "row");
        this.card.gameElement.appendChild(this.buttonsDiv);

        this.buttonsDiv2 = document.createElement("div");
        this.buttonsDiv2.classList.add("buttons-div", "row");
        this.card.gameElement.appendChild(this.buttonsDiv2);

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
        this.buttonsDiv2.appendChild(this.enterButton.element);
        this.enterButton.element.addEventListener("click", () => {
            this.#submitWord();
        });

        //Create Stats Button
        this.statsButton = document.createElement("button");
        this.statsButton.innerText = "STATS";
        this.buttonsDiv2.appendChild(this.statsButton);
        this.statsButton.addEventListener("click", () => {
            this.statsPopup.show();
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
        this.score += amount;
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        this.scoreElement.innerText = `SCORE: ${this.score}, BEST: ${this.highScore}`;
        this.scoreElement.classList.add('highlight');
        setTimeout(() => {
                this.scoreElement.classList.remove('highlight');
        },1000);

        //Update Stats
        if (this.score > 0) {
            this.#updateGameState();
        }
    }

    #isLetter(str) {
        return str.length === 1 && str.match(/[a-z]/i);
    }

    #submitWord() {
        let wordScore = this.#getWordScore(this.currentWord);
        this.history.push(this.currentWord);
        if(wordScore > 0) {
            this.addScore(wordScore);
        } else {
            let popUp = new StatusPopUp(this.card.gameElement, "NOT IN WORD LIST", 1);
        }
        this.enterButton.setProgress(5);
        this.currentWord = "";
        this.currentWordElement.textContent = "_";
    }

    #discard() {
        let wordScore = this.#getWordScore(this.currentWord);
        this.history.push(this.currentWord);
        if(wordScore > 0) {
            this.addScore(wordScore);
        }
        this.enterButton.setProgress(5);
        this.currentWord = "";
        this.currentWordElement.textContent = "_";
    }

    #getWordScore(word) {
        if(this.dictionary.includes(word.toLowerCase())) {
            return word.length*2 - 4;
        }
        return 0;
    }

    #updateGameState() {
        var numLettersUsed = 0;
        var allValidWords = true;
        const words = this.history.filter(item => typeof item === 'string');
        for(const word of words) {
            console.log(word);
            numLettersUsed += word.length;
            if(this.#getWordScore(word) === 0) {
                allValidWords = false;
                break;
            }
        }

        console.log(this.history);
        console.log(`Num letters used: ${numLettersUsed}`);
        console.log(`All valid words: ${allValidWords}`);

        if(this.currentWord.length > this.gameState.longestWord.length) {
            this.gameState.longestWord = this.currentWord;
            this.longestWordP.innerText = `LONGEST WORD: ${this.gameState.longestWord}`;
        }

        //Solution Found
        if(allValidWords && numLettersUsed === 25) {
            console.log('found solution');
            if(words.length === 3) {
                this.gameState.foundSolutionThree = true;
                this.gameState.solutionThree = words.join(', ');
                this.solutionThreeP.innerText = words.join(', ');
                this.solutionThreeP.hidden = false;
                this.solutionThreeButton.hidden = true;
                this.foundThreeSolutionP.innerText = "☑ FOUND A THREE WORD SOLUTION";
            } else if(words.length === 4) {
                this.gameState.foundSolutionFour = true;
                this.gameState.solutionFour = words.join(', ');
                this.solutionFourP.innerText = words.join(', ');
                this.solutionFourP.hidden = false;
                this.solutionFourButton.hidden = true;
                this.foundFourSolutionP.innerText = "☑ FOUND A FOUR WORD SOLUTION";
            } else {
                this.gameState.foundSolution = true;
                this.gameState.solution = words.join(', ');
                this.solutionP.innerText = words.join(', ');
                this.solutionP.hidden = false;
                this.solutionButton.hidden = true;
                this.foundSolutionP.innerText = "☑ FOUND A SOLUTION";
            }
            this.statsPopup.show();
        }

        this.LSM.setGameStateByID(this.id, this.gameState);
        this.LSM.saveToLocalStorage();
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


const LSM = new LocalStorageManager('bs', 39, 7);
LSM.setRememberChoice(true);
Scramble.LSM = LSM;

const carousel = document.getElementById("carousel");
Scramble.parent = carousel;

const s28 = new Scramble(28, "THURSDAY, MARCH 12TH\nBIG SCRAMBLE #28");
s28.addDispenser('RANMS');
s28.addDispenser('ONLYC');
s28.addDispenser('GERAE');
s28.addDispenser('ENLDO');
s28.addDispenser('ETISO');

const s27 = new Scramble(27, "THURSDAY, MARCH 5TH\nBIG SCRAMBLE #27", undefined, "whisked, linear, suitor, clumsy", "whisk, inelastic, murderously");
s27.addDispenser('NSICM');
s27.addDispenser('KIATU');
s27.addDispenser('DERLY');
s27.addDispenser('ISRUS');
s27.addDispenser('WHELO');
//whisked -> linear -> suitor -> clumsy -> 0.37
//whisker -> denial -> suitor -> clumsy
//whisk -> inelastic -> murderously

const s26 = new Scramble(26, "SUNDAY, MARCH 1ST\nBIG SCRAMBLE #26", undefined, undefined, "necessitate, harpoon, stormed");
s26.addDispenser('NEAST');
s26.addDispenser('ESIEN');
s26.addDispenser('CTRPO');
s26.addDispenser('OORMD');
s26.addDispenser('STHAE');
//contest -> easiest -> orphan -> modest -> 0.65
//necessitate -> harpoon -> stormed

/*const feb28 = document.getElementById("feb28");
const s25 = new Scramble(feb28);
s25.addDispenser('SAINE');
s25.addDispenser('ERECK');
s25.addDispenser('TITPE');
s25.addDispenser('RMLBC');
s25.addDispenser('FAAED');
//frames -> retail -> cabinet -> pecked -> 0.70
//streamline -> fabricate -> pecked -> 0.36

const feb27 = document.getElementById("feb27");
const s24 = new Scramble(feb27);
s24.addDispenser('AERIE');
s24.addDispenser('LNOST');
s24.addDispenser('DNEML');
s24.addDispenser('CERNB');
s24.addDispenser('ISIPS');
//dancer -> linens -> mobiles -> priest -> 0.61
//iceland -> sniper -> melons -> tribes -> 0.27
//discernable -> innermost -> piles

const feb26 = document.getElementById("feb26");
const s23 = new Scramble(feb26);
s23.addDispenser('PAEMY');
s23.addDispenser('ERSRE');
s23.addDispenser('COIEH');
s23.addDispenser('IGNAR');
s23.addDispenser('OTNAT');
//cooperating -> seminary -> reheat -> 0.237
//poetic -> oranges -> marine -> hearty -> 0.683

const feb25 = document.getElementById("feb25");
const s22 = new Scramble(feb25);
s22.addDispenser('EIHAN');
s22.addDispenser('OIIPA');
s22.addDispenser('MVMEN');
s22.addDispenser('LUTST');
s22.addDispenser('TQDYE');
//motive -> liquid -> payment -> hasten -> 0.625
//movement -> liquidity -> pheasant -> 0.437
//move -> mile -> thin -> quit -> sandy -> peat -> 0.71

const feb24 = document.getElementById("feb24");
const s21 = new Scramble(feb24);
s21.addDispenser('OEDCW');
s21.addDispenser('COTES');
s21.addDispenser('MRAES');
s21.addDispenser('SNUPH');
s21.addDispenser('ICSCE');
//comics -> treason -> cusped -> eschew -> 0.1576
//isomer -> conduct -> spaces -> eschew
//microseconds -> teacups -> eschew -> 0.0447

/*const feb23 = document.getElementById("feb23");
const s20 = new Scramble(feb23);
s20.addDispenser('CITSH');
s20.addDispenser('OGLAU');
s20.addDispenser('OLAED');
s20.addDispenser('MPITR');
s20.addDispenser('NOISL');
//compilations -> goliaths -> ruled
//coming -> topsoil -> trials -> hauled -> 0.3989
//cooling -> taoism -> plaits -> hurled -> 0.0200

/*const feb22 = document.getElementById("feb22");
const s19 = new Scramble(feb22);
s19.addDispenser('USTID');
s19.addDispenser('RSTLY');
s19.addDispenser('NGLEF');
s19.addDispenser('JOGRA');
s19.addDispenser('EADUL');
//readjusting -> sold -> gratefully
//jungle -> stride -> softly -> gradual -> 0.5612069121833578
//jungle -> roasts -> grated -> fluidly -> 0.5412972130047689
//jungle -> storage -> druids -> flatly -> 0.14192460425393028

/*const feb20b = document.getElementById("feb20b");
const s18 = new Scramble(feb20b);
s18.addDispenser('IEABE');
s18.addDispenser('TADUK');
s18.addDispenser('SNKYE');
s18.addDispenser('NGTRE');
s18.addDispenser('VIOLR');

/*const feb20a = document.getElementById("feb20a");
const s17 = new Scramble(feb20a);
s17.addDispenser('HLLEV');
s17.addDispenser('ECBAT');
s17.addDispenser('TRNRO');
s17.addDispenser('IPMIE');
s17.addDispenser('SEGTM');

/*const feb20 = document.getElementById("feb20");
const s16 = new Scramble(feb20);
s16.addDispenser('RHEIG');
s16.addDispenser('IXUIS');
s16.addDispenser('CTOAP');
s16.addDispenser('PGRYD');
s16.addDispenser('YNDSE');
*/


