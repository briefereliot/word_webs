//Contains classes for common game elements
//Import into <game_name>.js to use in game logic

//------------CLASSES------------
//Hint button
export class HintButton {
    constructor(delaySeconds = 30, progress = 100, text = 'THROW ME A BONE') {
        this.element = document.createElement('button');
        this.element.textContent = text;
        this.progressValue = progress;
        this.progressBar = document.createElement('div');
        this.progressBar.classList.add('button-progress');
        this.disable();
        this.setProgress(progress);
        this.element.appendChild(this.progressBar);
        setTimeout(() => {
            this.show();
        }, delaySeconds * 1000);
    }

    enable() {
        this.element.disabled = false;
    }

    disable() {
        this.element.disabled = true;
    }

    show() {
        this.element.style.visibility = 'visible';
    }

    hide() {
        this.element.style.visibility = 'hidden';
    }

    setProgress(value) {
        if(value < 100) {
            this.progressBar.style.visibility = 'visible';
            this.disable();
            if(value > 0) {
                this.progressBar.style.width = String(value) + '%';
                this.progressValue = value;
                return;
            }
            this.progressValue = 0;
            this.progressBar.style.width = '0%';
            return;
        }
        this.progressValue = 100;
        this.progressBar.style.visibility = 'hidden';
        this.enable();
    }

    incrementProgress(increment) {
        this.setProgress(this.progressValue + increment);
    }

    addHintFunction(hintFunction) {
        this.element.addEventListener('click', () => {
            hintFunction();
        })
    }
}

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
        /*this.hintButton = document.createElement('button');
        this.hintButton.textContent = "THROW ME A BONE";
        this.hideHintButton();*/
        this.hintButton = new HintButton(0,100);
        
        //Build DOM tree
        this.element.appendChild(this.topTextElement);
        this.element.appendChild(this.gameElement);
        this.element.appendChild(this.bottomTextElement);
        if(hintButton) {
            this.element.appendChild(this.hintButton.element);
        }
        this.listItem.appendChild(this.element);
        this.parent.appendChild(this.listItem);

        //enable hint button after 45 seconds
        /*setTimeout(() => {
            if(this.won) return;
            this.hintButton.enable();
        }, 30000);*/
    }

    addHintFunction(hintFunction) {
        /*this.hintButton.addEventListener('click', () => {
            hintFunction();
        })*/
       this.hintButton.addHintFunction(hintFunction);
    }

    //Game logic should call when the win conditions are met
    win() {
        this.won = true;
        this.disable();
        this.hintButton.disable();
        this.hintButton.hide();
        //this.hintButton.disable = true;
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