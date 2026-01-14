//Contains classes for common game elements
//Import into <game_name>.js to use in game logic

//------------CLASSES------------
//Game card creates the main div for a game and common static game elemnts
export class GameCard {
    constructor(parent, hintButton=false, bonus=false) {
        this.parent = parent;
        this.won = false;
        this.hinting = false;

        //create DOM elements
        this.listItem = document.createElement('li');
        this.element = document.createElement('div');
        this.element.classList.add('card');
        if(bonus) {
            this.element.classList.add('bonus');
        }
        this.topTextElement = document.createElement('p');
        this.bottomTextElement = document.createElement('p');
        this.gameElement = document.createElement('div');
        this.gameElement.classList.add('game')

        //create hint button
        this.hintButton = document.createElement('button');
        this.hintButton.textContent = "THROW ME A BONE";
        this.hideHintButton();
        
        //Build DOM tree
        this.element.appendChild(this.topTextElement);
        this.element.appendChild(this.gameElement);
        this.element.appendChild(this.bottomTextElement);
        if(hintButton) {
            this.element.appendChild(this.hintButton);
        }
        this.listItem.appendChild(this.element);
        this.parent.appendChild(this.listItem);

        //enable hint button after 45 seconds
        setTimeout(() => {
            if(this.won) return;
            this.showHintButton();
        }, 30000);
    }

    addHintFunction(hintFunction) {
        this.hintButton.addEventListener('click', () => {
            hintFunction();
        })
    }

    //Game logic should call when the win conditions are met
    win() {
        this.won = true;
        this.disable();
        this.hintButton.disable = true;
    }

    hideTopText() {
        this.topTextElement.style.visibility = 'hidden';
    }

    showTopText() {
        this.topTextElement.style.visibility = 'visible';
    }

    hideBottomText() {
        this.bottomTextElement.style.visibility = 'hidden';
    }

    showBottomText() {
        this.bottomTextElement.style.visibility = 'visible';
    }

    setTopText(text) {
        this.topTextElement.innerText = text;
    }

    setBottomText(text) {
        this.bottomTextElement.innerText = text;
    }

    hideHintButton() {
        this.hintButton.disabled = true;
    }

    showHintButton() {
        this.hintButton.disabled = false;
    }

    disable() {
        this.element.classList.add('disabled');
    }
}


//----------FUNCTIONS------------
export function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}