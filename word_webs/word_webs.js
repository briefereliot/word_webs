import { GameCard, HintButton, LocalStorageManager} from '../game_components.js';
const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

class Web {
    constructor(parent, LSM, id, string, answer, dateString, hintString, threads = [],  bonus = false, svgNS = 'http://www.w3.org/2000/svg') {
        this.LSM = LSM;
        this.svgNS = svgNS;
        this.parent = parent;
        this.id = id;
        this.numLetters = string.length;
        this.answer = []
        this.answer.push(answer);
        this.won = false;
        this.hinting = false;
        this.threads = [];
        this.letters = [];

        //Create DOM elements
        this.card = new GameCard(parent, true, bonus);
        this.card.setTopText(dateString);
        this.card.setBottomText('CLUE: ' + hintString);
        this.card.showTopText();
        this.card.showBottomText();
        for(let i = 0; i < string.length; i++) {
            let x = this.#getLetterX(i);
            let y = this.#getLetterY(i);
            let l = new Letter(this.card.gameElement, String(x)+'%', String(y)+'%',1,!this.#isLetter(string[i]),string[i]);
            this.letters.push(l);
        }

        //create SVG image for connections
        this.svg = document.createElementNS(this.svgNS, "svg");
        this.svg.setAttribute("width", "100%");
        this.svg.setAttribute("height", "100%");
        this.card.gameElement.appendChild(this.svg);
        for(let i = 0; i < threads.length; i++) {
            this.addThread(threads[i]);
        };

        //create hint button
        //this.hintButton = document.createElement('button');
        //this.hintButton.textContent = "THROW ME A BONE";
        //this.hintButton.disabled = true;
        //this.window.parentElement.appendChild(this.hintButton);

        this.#initEvents();
        if(this.LSM.getWinStateByID(this.id)) {
            this.#showSolution();
        }
    }

    addThread(thread,pattern = 1) {
        this.threads.push(thread);
        for (let i=1; i < thread.length; i++) {
            let l1 = Number(thread[i-1])-1;
            let l2 = Number(thread[i])-1;
            this.connect(l1,l2,pattern);
        };
    }

    addSolution(solution) {
        this.answer.push(solution);
    }

    connect(l1, l2, pattern = 1) {
        let x1 = this.#getLetterX(l1,1-(pattern-1)*0.1);
        let x2 = this.#getLetterX(l2,1-(pattern-1)*0.1);
        let y1 = this.#getLetterY(l1,1-(pattern-1)*0.1);
        let y2 = this.#getLetterY(l2,1-(pattern-1)*0.1);
        let c = new Connection(this.svg, String(x1)+'%', String(y1)+'%', String(x2)+'%', String(y2)+'%', pattern);
    }

    #initEvents() {
        //Check for win conditions every time a key is pressed
        this.card.element.addEventListener('keyup', () => {
            this.#checkWinCondition();
        });
        //hint button pressed
        this.card.addHintFunction(this.#revealOrder.bind(this));
        /*this.card.hintButton.element.addEventListener('click', () => {
            this.#revealOrder();
        });*/

        //this.card.addHintFunction(this.#revealOrder);

        //enable hint button after 45 seconds
        //setTimeout(() => {
        //    if(this.won) return;
        //    this.hintButton.disabled = false;
        //}, 30000);
    }

    #checkWinCondition() {
        let string = '';
        for(let i = 0; i < this.letters.length; i++) {
            string += this.letters[i].value;
        };
        if(this.answer.includes(string)) {
            this.won = true;
            this.card.win();
            this.LSM.addGameToStreak(this.id);
            console.log(`STREAK LENGTH: ${this.LSM.getStreakLength()}`);
            //this.hintButton.disabled = true;
            for(let n = 0; n < 3; n++) {
                for(let i = 0; i < this.letters.length; i++) {
                    this.letters[i].disable();
                    this.letters[i].turnBlack();
                    setTimeout(() => {
                        this.letters[i].turnGold();
                        setTimeout(() => {
                            this.letters[i].turnBlack();
                        }, 150);
                    }, 150*(i+1)+150*n*(this.letters.length));
                };
            };
            setTimeout(() => {
                for(let i = 0; i < this.letters.length; i++) {
                    this.letters[i].turnGold();
                    this.letters[i].disable();
                }
                let congrats = document.createElement("p");
                congrats.textContent = "YOU GOT IT!";
                //congrats.style.color = "gold";
                congrats.style.fontWeight = "900";
                this.card.gameElement.appendChild(congrats);
            },150*this.letters.length+150*2*(this.letters.length+2));
        };
    }

    #showSolution() {
        this.won = true;
        this.card.win();
        for(let i = 0; i < this.letters.length; i++) {
            this.letters[i].setValue(this.answer[0][i]);
            this.letters[i].turnGold();
            this.letters[i].disable();
        }
    }

    #revealOrder() {
        if(this.won) return; //prevent won while hinting glitch
        if(this.hinting) return; //prevent double-click glitch
        this.hinting = true;

        let delay = 0;
        for(let t = 0; t < this.threads.length; t++) {
            let thread = this.threads[t];
            for(let i = 0; i < thread.length; i++) {
                setTimeout(() => {
                    if(this.won) return;
                    this.letters[thread[i]-1].turnGold();
                }, delay + 500*i);
                setTimeout(() => {
                    if(this.won) return;
                    this.letters[thread[i]-1].turnBlack();
                }, delay + 500*i +thread.length*500+500);
            };
            delay += 1000 + 1000*thread.length;
        }

        //prevent double-click glitch
        setTimeout(() => {
            this.hinting = false;
        }, delay);
    }

    #isLetter(str) {
        return str.length === 1 && str.match(/[a-z]/i);
    }

    #getLetterX(i, scale = 1, rotation = 0) {
        let a = 2*Math.PI*i/this.numLetters-Math.PI/2;
        let x = 50+scale*40*Math.cos(a);
        return x;
    }

    #getLetterY(i, scale = 1, rotation = 0) {
        let a = 2*Math.PI*i/this.numLetters-Math.PI/2;
        let y = 50+scale*40*Math.sin(a);
        return y;
    }
}

class Connection {
    static patterns = ["1 0", "15 15", "25 5", "15 5 5 5"];

    constructor(svg, x1, y1, x2, y2, pattern = 1, svgNS = 'http://www.w3.org/2000/svg') {
        this.svg = svg;
        this.svgNS = svgNS;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.line = document.createElementNS(this.svgNS, "line");
        this.line.classList.add("foreground");
        this.line.setAttribute('x1', this.x1);
        this.line.setAttribute('y1', this.y1);
        this.line.setAttribute('x2', this.x2);
        this.line.setAttribute('y2', this.y2);
        this.line.setAttribute('stroke-width', '4');
        this.line.setAttribute('stroke-dasharray', Connection.patterns[pattern-1]);
        this.svg.append(this.line);
    }
}

class Letter {
    constructor(parent, x, y, z = 1, editable = false, value = "") {
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.z = z;
        this.editable = editable;
        this.value = value;
        this.textBox = document.createElement("input");
        this.textBox.readOnly = !this.editable;
        if(!this.editable) this.textBox.classList.toggle("given");
        this.#stylize();
        this.#initEvents();
        this.parent.appendChild(this.textBox);
    };

    disable() {
        this.textBox.disabled = true;
    }

    enable() {
        this.textBox.disabled = false;
    }

    turnGold() {
        //this.textBox.style.border = "6px solid gold";
        //this.textBox.style.color = "gold";
        this.textBox.classList.add("emphasized");
    }

    turnBlack() {
        this.textBox.classList.remove("emphasized");
        if(darkMode) {
            //this.textBox.style.border = "2px solid white";
            //this.textBox.style.color = "white";
        } else {
            //this.textBox.style.border = "2px solid black";
            //this.textBox.style.color = "black";
        }
    }

    setValue(value) {
        this.value = value;
        this.textBox.value = value;
    }

    #stylize() {
        this.textBox.setAttribute("type", "text");
        this.textBox.setAttribute("size", "1");
        this.textBox.value = this.value;
        this.textBox.setAttribute("maxlength","1");
        this.textBox.style.top = String(this.y);
        this.textBox.style.left = String(this.x);
        this.textBox.style.transform = 'translate(-50%, -50%)';
    };

    #initEvents() {
        this.textBox.addEventListener('focus', () => {
            this.textBox.classList.add("selected");
        });

        this.textBox.addEventListener('blur', () => {
            this.textBox.classList.remove("selected");
        });

        this.textBox.addEventListener('keydown', (event) => {
            if(this.editable){
                if(this.#isLetter(event.key)) {
                    this.textBox.value = event.key.toUpperCase();
                } else {
                    this.textBox.value = "";
                };
                this.value = this.textBox.value;
            };
        });
    };

    #isLetter(str) {
        return str.length === 1 && str.match(/[a-z]/i);
    }


};

//const promo = document.getElementById("promotion");
//const p1 = new Web(promo," OY EN", "JOYIEN");
//p1.addThread('56123',1);
//p1.addThread('1246',2);

const LSM = new LocalStorageManager('ww', 88, 7);
LSM.setRememberChoice(true);

const carousel = document.getElementById("carousel");

const w88 = new Web(carousel, LSM, 88, "P   ", "POLY", "SUNDAY, MARCH 1ST", "FISHING FOR A THIRD WITH ONLY HALF THE PICTURE");
w88.addThread('1234', 1);
w88.addThread('1324', 2);
w88.addSolution('PLOY');

const w87 = new Web(carousel, LSM, 87, "  RE  TI", "VEREACTI", "SATURDAY, FEBRUARY 28TH", "THE DIFFERENCE BETWEEN ARTISTS AND CRITICS.");
w87.addThread('63457812', 2);
w87.addThread('34567812', 1);

const w86 = new Web(carousel, LSM, 86, "  ET ", "ABETS", "FRIDAY, FEBRUARY 27TH", "LET THE DJ COOK.");
w86.addThread('21543', 1);
w86.addThread('23145', 2);

const w85 = new Web(carousel, LSM, 85, "L E ", "LIEV", "THURSDAY, FEBRUARY 26TH", "AN OIL COMPANY'S GREEN-WASHING CAMPAIGN");
w85.addThread('3421', 2);
w85.addThread('4321', 1);

const w84 = new Web(carousel, LSM, 84, "E R  ", "ESRUN", "WEDNESDAY, FEBRUARY 25TH", "EVERYONE KNOWS DOCTORS HAVE BAD HANDWRITING, BUT HAVE YOU HEARD OF _____ _____?");
w84.addThread('54321', 1);
w84.addThread('34512', 2);

const w83 = new Web(carousel, LSM, 83, " RY ", "URYB", "TUESDAY, FEBRUARY 24TH", "A PIRATES TREASURE");
w83.addThread('4123', 1);
w83.addThread('2143', 2);

const w82 = new Web(carousel, LSM, 82, " H  R", "THMIR", "MONDAY, FEBRUARY 23RD", "WHEN YOUR FRIENDS LAUGH AT YOUR NEW HAIRCUT");
w82.addThread('1543', 1);
w82.addThread('34512', 2);

/*setTimeout(() => {
    const carousel = document.getElementById("carousel");
    carousel.scrollTo(carousel.scrollWidth, 0);
}, 500);*/


