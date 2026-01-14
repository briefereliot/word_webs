//analogs specific game logic
import { GameCard } from '../game_components.js';

class Analogs {
    constructor(parent, relationship, bonus='false') {
        this.parent = parent;
        this.itemElements = [];
        this.pairElements = [];
        this.solution = [];

        //Create DOM elements
        this.card = new GameCard(parent, true, bonus);
        this.card.hideTopText();
        this.card.hideBottomText();
        this.card.setTopText(relationship);
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
            this.#checkWinConditions();
        })
        this.card.gameElement.appendChild(pairDiv);
        this.itemElements.push(item1, item2);
    }

    addSolution(wordOne, wordTwo) {
        this.solution.push(wordOne + ':' + wordTwo);
    }

    deselectAll() {
        this.itemElements.forEach(item => {
            item.deselect();
        });
    }

    animateWin() {
        this.card.win();
        this.itemElements.forEach((item,index) => {
            item.disable();
            item.deselect();
            setTimeout(() => {
                item.select();
            }, index*300);
        });
        setTimeout(() => {
            this.card.showTopText();
        }, this.itemElements.length * 300);
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
        let reversed = false;
        for(let i=0; i<this.itemElements.length-1; i+= 2) {
            let text1 = this.itemElements[i].getText();
            let text2 = this.itemElements[i+1].getText();
            let forwardPair = text1 + ':' + text2;
            let reversePair = text2 + ':' + text1;
            if(this.solution.includes(reversePair)) {
                if(i === 0) {
                    reversed = true;
                } else if(reversed === false) {
                    return;
                }
                
            }
            if(this.solution.includes(forwardPair) && reversed === true) {
                return;
            }
            if(!this.solution.includes(forwardPair) && !this.solution.includes(reversePair)) {
                return;
            }
        }
        console.log('won');
        this.animateWin();
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




const carousel = document.getElementById("carousel");

const testGame = new Analogs(carousel, 'A SMALLER PART', false);
testGame.addPair('Kobe', 'eggs');
testGame.addPair('fish', 'Bryant');
testGame.addPair('Japan', 'Rhode Island');
testGame.addPair('clam cakes', 'sushi');
testGame.addSolution('Japan', 'Kobe');
testGame.addSolution('sushi', 'fish');
testGame.addSolution('Rhode Island', 'Bryant');
testGame.addSolution('clam cakes', 'eggs');

