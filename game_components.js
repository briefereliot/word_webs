//Contains classes for common game elements
//Import into <game_name>.js to use in game logic

//------------CLASSES------------

//Used to remember a users progress for a specific game
export class LocalStorageManager {
    constructor(gameName, currentGameID, lifeTimeDays = 7) {
        this.currentGameID = currentGameID;
        this.lifeTimeDays = lifeTimeDays;
        this.gameKey = String(gameName);
        this.streakKey = this.gameKey + 'Streak'
        this.gameState = null;
        this.streak = null;
        this.streakLength = 0;

        if(this.getRememberChoice()) {
            this.#loadFromLocalStorage();
        } else {
            this.deleteAll();
        }
    }

    //Load all game states and streak from local storage
    //remove all game states past lifeTimeDays age and re-save
    #loadFromLocalStorage() {
        this.gameState = JSONParseSafe(localStorage.getItem(this.gameKey));
        if(this.gameState === null) {
            this.gameState = {};
        }
        console.log(this.gameState);

        
        this.streak = JSONParseSafe(localStorage.getItem(this.streakKey));
        if(this.streak === null) {
            this.streak = {};
            this.streak['startID'] = null;
            this.streak['endID'] = null;
            this.streak['wonIDs'] = [];
            this.streakLength = 0;
        }
        console.log(this.streak);
        
        //remove all game states past lifeTimeDays age and re-save
        Object.keys(this.gameState).forEach((key) => {
            if(this.currentGameID - key >= this.lifeTimeDays) {
                delete this.gameState.key;
            }
        });

        //this.#updateStreak();
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        if(this.getRememberChoice) {
            localStorage.setItem(this.gameKey, JSON.stringify(this.gameState));
            this.#updateStreak();
        } else {
            this.deleteAll();
        }
        
    }

    deleteAll() {
        localStorage.removeItem(this.gameKey);
        localStorage.removeItem(this.streakKey);
    }

    getGameStateByID(id, defaultState = null) {
        try {
            return this.gameState[id];
        } catch (e) {
            console.error(e);
            return defaultState;
        }
    }

    getWinStateByID(id) {
        if(this.streak['wonIDs'].includes(id)) {
            return true
        }
        return false;
    }

    //Does not automatically save new game state to local storage
    //Must call saveToLocalStorage() to persist changes
    setGameStateByID(id, state) {
        if(this.getRememberChoice()) {
            this.gameState[id] = state;
        }
    }

    getStreakLength() {
        return this.streakLength;
    }

    //Recalculates streak length and persists streak to local storage
    #updateStreak() {
        if(this.getRememberChoice()) {
            let sequentialIDs = this.streak['wonIDs'].sort((a, b) => a - b);
            let currentStreakLength = 0;
            let currentStreakStart = null
            let longestStreak = 0;
            for(let i = sequentialIDs.length - 1; i>= 0; i--) {
                console.log(i);
                //find the oldest consecutively won 
                /*if(this.streak['startID'] - 1 === sequentialIDs[i] || this.streak['startID'] === null) {
                    this.streak['startID'] = sequentialIDs[i];
                    console.log(`New streak start: ${sequentialIDs[i]}`);
                }*/

                if(currentStreakStart - 1 === sequentialIDs[i]) {
                    currentStreakLength++;
                    currentStreakStart = sequentialIDs[i];
                } else {
                    currentStreakLength = 1;
                    if(this.currentGameID - sequentialIDs[i] <= this.lifeTimeDays){
                        currentStreakStart = sequentialIDs[i];
                    }
                }

                if(currentStreakLength > longestStreak) {
                    longestStreak = currentStreakLength;
                }
                
                //purge id's older than life time
                /*if(this.currentGameID - sequentialIDs[i] >= this.lifeTimeDays) {
                    sequentialIDs.splice(i, 1);
                }*/
            }

            this.streakLength = longestStreak;
            //this.streakLength = Math.max(this.currentGameID - this.streak['startID'] + 1, 0);

            //Save purged streak object to local storage
            if(this.getRememberChoice()) {
                localStorage.setItem(this.streakKey, JSON.stringify(this.streak));
            } else {
                this.deleteAll();
            }
        }
    }

    addGameToStreak(id) {
        console.log(localStorage);
        if(this.getRememberChoice() && !this.streak['wonIDs'].includes(id)) {
            this.streak['wonIDs'].push(id);
            this.#updateStreak();
        }
    }

    getRememberChoice() {
        if(localStorage.getItem('rememberMe') === 'true') {
            return true;
        }
        return false;
    }

    setRememberChoice(choice = false) {
        if (choice) {
            localStorage.setItem('rememberMe', 'true');
            this.#loadFromLocalStorage();
        } else {
            localStorage.setItem('rememberMe', 'false');
        }
        
    }
}

//Start button with blured background
//Rembember to startFunction.bind(this) when passing start function to avoid
//losing "this" context
export class StartPopup {
    constructor(parent, startFunction, text = "I'm Ready") {
        this.parent = parent;
        this.startFunction = startFunction;
        this.element = document.createElement('div');
        this.element.classList.add('blur');
        this.buttonElement = document.createElement('button');
        this.buttonElement.innerText = text;
        this.element.appendChild(this.buttonElement)
        this.parent.appendChild(this.element);
        this.buttonElement.addEventListener('click', () => {
            this.element.remove();
            this.startFunction();
        })
    }
}

export class BluredPopup {
    constructor(parent) {
        this.parent = parent;
        this.element = document.createElement('div');
        this.element.classList.add('blur');
    }

    show() {
        this.parent.appendChild(this.element);
    }

    hide() {
        this.element.remove();
    }
}

//Status Popup
export class StatusPopUp {
    constructor(parent, text, durationSeconds = 3) {
        this.parent = parent;
        this.element = document.createElement('dialog');
        this.element.textContent = text;
        this.parent.appendChild(this.element);
        this.element.showModal();
        setTimeout(() => {
            this.element.close();
        }, durationSeconds * 1000);
    }
}

//Label Card
export class LabelCard {
    constructor(parent, text) {
        this.parent = parent;
        this.parent.style.position = 'relative';
        this.element = document.createElement('div');
        this.element.textContent = text;
        this.element.classList.add('label-card');
        this.parent.appendChild(this.element);
    }
}

//Hint button
export class HintButton {
    constructor(delaySeconds = 30, progress = 0, text = 'GIVE ME A HINT') {
        this.element = document.createElement('button');
        this.element.style.visibility = 'visible';
        this.element.textContent = text;
        this.progressValue = progress;
        this.progressIncrement = 0;
        if (delaySeconds > 0) {
            this.progressIncrement = 10/delaySeconds;
            setInterval(() => {
                this.incrementProgress(this.progressIncrement);
            }, 100);
        }
        
        this.progressBar = document.createElement('div');
        this.progressBar.classList.add('button-progress');
        this.disable();
        //this.hide();
        this.setProgress(progress);
        this.element.appendChild(this.progressBar);

        /*setTimeout(() => {
            this.setProgress(progress);
            this.show();
        }, delaySeconds * 1000);*/
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
        this.progressBar.style.visibility = 'hidden';
    }

    setProgress(value) {
        if(value < 100) {
            if (this.element.style.visibility === 'visible') {
                this.progressBar.style.visibility = 'visible';
            } else {
                this.progressBar.style.visibility = 'hidden';
            }
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
        this.hintButton = new HintButton();
        
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
        this.hintButton.hide();
    }

    showHintButton() {
        this.hintButton.show();
    }

    disable() {
        this.element.classList.add('disabled');
    }
}


//----------FUNCTIONS------------
export function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

//Source: https://javascript.info/task/shuffle
export function shuffle(array) {
    for(let i = array.length -1; i > 0; i--){
        let j = Math.floor(Math.random() * (i+1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function JSONParseSafe(value, defaultValue = null) {
        //try {
            return JSON.parse(value);
        //} catch (e) {
        //    console.error(e);
        //    return defaultValue;
        //}
}