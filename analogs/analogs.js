//analogs specific game logic
import { GameCard, HintButton, shuffle} from '../game_components.js';

class Analogs {
    constructor(parent, relationship, bonus='false') {
        this.parent = parent;
        this.itemElements = [];
        this.pairElements = [];
        this.solution = [];
        this.reversible = false;
        this.numberOfGuesses = 0;
        this.numberOfHints = 0;

        //Create DOM elements
        this.card = new GameCard(parent, false, bonus);
        this.card.hideTopText();
        this.card.hideBottomText();
        this.card.setTopText(relationship);

        this.statusP = document.createElement('p');
        this.statusP.textContent = 'ATTEMPT 0';
        this.card.gameElement.appendChild(this.statusP);

        this.buttonsDiv = document.createElement('div');
        this.buttonsDiv.classList.add('buttons-div');
        this.submitButton = document.createElement('button');
        this.submitButton.textContent = 'SUBMIT';
        this.hintButton = new HintButton(0,5);
        this.buttonsDiv.appendChild(this.submitButton);
        this.buttonsDiv.appendChild(this.hintButton.element);
        this.card.element.appendChild(this.buttonsDiv);

        this.#initEvents();

    }

    #initEvents() {
        this.submitButton.addEventListener('click', () => {
            console.log('guessed');
            this.numberOfGuesses += 1;
            this.#checkWinConditions();
            this.hintButton.incrementProgress(31.7);
        })

        this.hintButton.element.addEventListener('click', () => {
            console.log('hinting');
            this.hint();
            this.hintButton.setProgress(5);
        })
    }

    addPair(wordOne, wordTwo) {
        let item1 = new Item(wordOne);
        let item2 = new Item(wordTwo);
        let pairDiv = document.createElement('div');
        let seperator = document.createElement('p');
        seperator.innerText = ':';
        pairDiv.classList.add('pair');
        pairDiv.appendChild(item1.element);
        pairDiv.appendChild(seperator);
        pairDiv.appendChild(item2.element);
        pairDiv.addEventListener('click', () => {
            this.#switchItems();
            //this.#checkWinConditions();
        })
        this.card.gameElement.appendChild(pairDiv);
        this.itemElements.push(item1, item2);
        this.pairElements.push(pairDiv);
    }

    addAllAndShuffle(reversible = false, ...items) {
        this.reversible = reversible;
        for(let i = 0; i < items.length - 1; i+= 2) {
            this.addSolution(items[i], items[i+1]);
            if(reversible) {
                this.addSolution(items[i+1], items[i]);  
            }
        }

        shuffle(items);
        this.addAllPairs(...items);
    }

    addAllPairs(...items) {
        for(let i = 0; i < items.length - 1; i+= 2) {
            this.addPair(items[i], items[i+1]);
        }
    }

    addSolution(wordOne, wordTwo) {
        this.solution.push(wordOne + ':' + wordTwo);
    }

    deselectAll() {
        this.itemElements.forEach(item => {
            item.deselect();
        });
    }

    hint() {
        let solutionMultiplier = 1;
        if(this.reversible) { //Account for double the nomber of solutions for reversible puzzles
            solutionMultiplier = 2;
        }
        let [word1, word2] = this.solution[this.numberOfHints*solutionMultiplier].split(':');
        let item1 = this.itemElements.find(item => item.getText() === word1);
        this.deselectAll();
        item1.select();
        this.itemElements[this.numberOfHints*2].select();
        this.#switchItems();
        setTimeout(() => {
            let item2 = this.itemElements.find(item => item.getText() === word2);
            this.deselectAll();
            item2.select();
            this.itemElements[this.numberOfHints*2 + 1].select();
            this.#switchItems();
            setTimeout(() => {
                this.pairElements[this.numberOfHints].classList.add('disabled', 'correct');
                this.deselectAll();
                this.numberOfHints += 1;
            }, 1000);
        }, 1000);
    }

    animateWin() {
        this.card.win();
        this.itemElements.forEach((item) => {
            item.disable();
            item.deselect();
        });
        this.pairElements.forEach((item,index) => {
            item.classList.add('disabled');
            item.classList.remove('correct');
            setTimeout(() => {
                item.classList.add('correct');
            }, index * 500);
        })
        setTimeout(() => {
            this.card.showTopText();
            this.statusP.textContent = `YOU GOT IT IN ${this.numberOfGuesses} TRYS!`;
        }, this.pairElements.length * 500);
    }

    #switchItems() {
        let selected = [];
        this.itemElements.forEach(item => {
            if(item.selected) {
                selected.push(item);
            }
        });

        if(selected.length > 1) {
            let text1 = selected[0].getText();
            let text2 = selected[1].getText();
            selected[0].setText(text2);
            selected[1].setText(text1);
            selected.forEach(item => {
                setTimeout(() => {
                    item.deselect();
                }, 500);
        });
        }
    }

    #checkWinConditions() {
        let numberCorrectForward = 0;
        let numberCorrectReverse = 0;
        let numberCorrect = 0;
        let numberBackwards = 0;

        for(let i=0; i<this.itemElements.length-1; i+= 2) {
            let text1 = this.itemElements[i].getText();
            let text2 = this.itemElements[i+1].getText();
            let forwardPair = text1 + ':' + text2;
            let reversePair = text2 + ':' + text1;

            if(this.solution.includes(reversePair)) {
                numberCorrectReverse += 1;
            }

            if(this.solution.includes(forwardPair)) {
                numberCorrectForward += 1;
            }
        }

        if(numberCorrectReverse > numberCorrectForward) {
            numberCorrect = numberCorrectReverse;
            if(this.reversible) {
                numberBackwards = 0;
            }else {
                numberBackwards = numberCorrectForward;
            }
        } else {
            numberCorrect = numberCorrectForward;
            if(this.reversible) {
                numberBackwards = 0;
            } else {
                numberBackwards = numberCorrectReverse;
            }
        }

        let popUp = new StatusPopUp(this.card.gameElement, `${numberCorrect}/4 CORRECT, ${numberBackwards} REVERSED`);
        this.statusP.textContent = `ATTEMPT ${this.numberOfGuesses}`;

        if(numberCorrect === this.pairElements.length) {
            console.log('won');
            this.animateWin();
        }
    }

    #hint() {
        return
    }
}

class Item {
    constructor(text) {
        this.text = text;
        this.element = document.createElement('div');
        this.element.classList.add('item');
        this.p = document.createElement('p');
        this.element.appendChild(this.p);
        this.selected = false;
        this.setText(text);
        this.#initEvents();
    }

    setText(text) {
        this.text = text;
        this.p.innerText = text;
    }

    getText(text) {
        return this.text;
    }

    #initEvents() {
        this.element.addEventListener('click', () => {
            this.toggleSelected();
        })
    }

    select() {
        this.selected = true;
        this.element.classList.add('selected');
    }

    deselect() {
        this.selected = false;
        this.element.classList.remove('selected');
    }

    toggleSelected() {
        if(this.selected) {
            this.deselect();
        } else {
            this.select();
        }
    }

    disable() {
        this.element.classList.add('disabled');
    }
}

class StatusPopUp {
    constructor(parent, text, durationSeconds = 3) {
        this.parent = parent;
        this.element = document.createElement('dialog');
        this.element.textContent = text;
        this.parent.appendChild(this.element);
        this.element.showModal();
        setTimeout(() => {
            this.element.close()
        }, durationSeconds * 1000);
    }
}


const carousel = document.getElementById("carousel");

const a20 = new Analogs(carousel, 'PUT TWO AND TWO TOGETHER', false);
a20.addAllAndShuffle(false, 'high', 'iron', 'down on all', 'poster', 'a thing or', 'faced', 'some', 'way');

const a19 = new Analogs(carousel, 'A TYPE OF', false);
a19.addAllAndShuffle(false, 'studio', 'residence', 'rubber', 'bridge', 'repetition', 'draw', 'cloverleaf', 'interchange');

const a18 = new Analogs(carousel, 'SAME PLURAL IRREGULARITY', false);
a18.addAllAndShuffle(true, 'offspring', 'sheep', 'larva', 'alumna', 'loaf', 'self', 'mouse', 'die');

const a17 = new Analogs(carousel, 'A DOUBLED-LETTER SANDWICH', false);
a17.addAllAndShuffle(false, 'haddock', 'dabbed', 'struggle', 'gallivanting', 'betta', 'tesseract', 'eel', 'efface');

const a16 = new Analogs(carousel, 'ADD YELLOW', false);
a16.addAllAndShuffle(false, 'flag of Italy', 'flag of Ireland', 'apple', 'orange', 'white', 'lemon', 'period', 'I (India) flag');

const a15 = new Analogs(carousel, 'KEEP THE EE\'S', false);
a15.addAllAndShuffle(true, 'cups', 'Pacific Rim', 'beast', 'plates', 'Mike Myers', 'pieces', 'exoskeleton', 'Verne Troyer');

const a14 = new Analogs(carousel, 'ANIMAL ACTION', false);
a14.addAllAndShuffle(false, 'duck', 'dive', 'hog', 'barrel', 'ant', 'march', 'deer', 'vault');

/*const a13 = new Analogs(carousel, 'JOINED BY O', false);
a13.addAllAndShuffle(false, 'inc','me','earl','be','rest','ration','tramp','line');

const a12 = new Analogs(carousel, 'LABLED', false);
a12.addAllAndShuffle(false, 'PDO', 'champagne', 'USDA', 'beef', 'FCC', 'laptop', 'NFPA', 'propane');

const a11 = new Analogs(carousel, 'BOTH FOUND IN _', false);
a11.addAllAndShuffle(true, 'blood', 'coal', 'beer', 'wolves', 'matches', 'words', 'ice', 'houses');

const a10 = new Analogs(carousel, 'HOW THE GAME\'S PLAYED', false);
a10.addAllAndShuffle(false, 'ball', 'pool', 'cue', 'table', 'racket', 'court', 'club', 'course');

const a9 = new Analogs(carousel, 'SAID LIKE THIS:', false);
a9.addAllAndShuffle(false, 'sugar', 'shook', 'receipt', 'sweet', 'colonel', 'churn', 'zucchini', 'key');*/

