//analogs specific game logic
import { GameCard } from '../game_components.js';

class Analogs {
    constructor(parent, relationship, bonus='false') {
        this.parent = parent;
        this.itemElements = [];

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
        this.card.gameElement.appendChild(pairDiv);
    }
}

class Item {
    constructor(text) {
        this.text = text;
        this.element = document.createElement('button');
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
            this.select();
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
}




const carousel = document.getElementById("carousel");

const testGame = new Analogs(carousel, 'TESTING', true);
testGame.addPair('Hello', 'But what about word wrap?');
