const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

class Web {
    constructor(window, string, answer, threads = [],  svgNS = 'http://www.w3.org/2000/svg') {
        this.svgNS = svgNS;
        this.window = window;
        this.numLetters = string.length;
        this.answer = []
        this.answer.push(answer);
        this.won = false;
        this.hinting = false;
        this.threads = [];
        this.letters = [];
        for(let i = 0; i < string.length; i++) {
            let x = this.#getLetterX(i);
            let y = this.#getLetterY(i);
            let l = new Letter(this.window, String(x)+'%', String(y)+'%',1,!this.#isLetter(string[i]),string[i]);
            this.letters.push(l);
        }

        //create SVG image for connections
        this.svg = document.createElementNS(this.svgNS, "svg");
        this.svg.setAttribute("width", "100%");
        this.svg.setAttribute("height", "100%");
        this.window.appendChild(this.svg);
        for(let i = 0; i < threads.length; i++) {
            this.addThread(threads[i]);
        };

        //create hint button
        this.hintButton = document.createElement('button');
        this.hintButton.textContent = "THROW ME A BONE";
        this.hintButton.disabled = true;
        this.window.parentElement.appendChild(this.hintButton);

        this.#initEvents();
    }

    addThread(thread,pattern = 1) {
        this.threads.push(thread);
        console.log(this.threads);
        for (let i=1; i < thread.length; i++) {
            let l1 = Number(thread[i-1])-1;
            let l2 = Number(thread[i])-1;
            this.connect(l1,l2,pattern);
        };
    }

    addSolution(solution) {
        console.log(this.answer);
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
        this.window.addEventListener('keyup', () => {
            this.#checkWinCondition();
        });
        //hint button pressed
        this.hintButton.addEventListener('click', () => {
            this.#revealOrder();
        });

        //enable hint button after 45 seconds
        setTimeout(() => {
            if(this.won) return;
            this.hintButton.disabled = false;
        }, 30000);
    }

    #checkWinCondition() {
        let string = '';
        for(let i = 0; i < this.letters.length; i++) {
            string += this.letters[i].value;
        };
        if(this.answer.includes(string)) {
            this.won = true;
            this.hintButton.disabled = true;
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
                this.window.appendChild(congrats);
            },150*this.letters.length+150*2*(this.letters.length+2));
        };
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
        console.log(Connection.patterns[pattern]);
        this.line.setAttribute('stroke-dasharray', Connection.patterns[pattern-1]);
        this.svg.append(this.line);
    }
}

class Letter {
    constructor(window, x, y, z = 1, editable = false, value = "") {
        this.window = window;
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
        this.window.appendChild(this.textBox);
        console.log(this.value);
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

const dec26 = document.getElementById("dec26");
const w21 = new Web(dec26,"  ED ", "AKEDN");
w21.addThread('25314',2);
w21.addThread('51234',1);


const dec25 = document.getElementById("dec25");
const w20 = new Web(dec25," O  ", "LOCA");
w20.addSolution('AOCL');
w20.addThread('3214',1);
w20.addThread('3241',2);

const dec24 = document.getElementById("dec24");
const w19 = new Web(dec24,"   NS ", "LTINSE");
w19.addThread('531642',2);
w19.addThread('234561',1);

const dec23 = document.getElementById("dec23");
const w18 = new Web(dec23,"  I ", "TNIH");
w18.addSolution('THIN');
w18.addThread('1432',1);
w18.addThread('4321',2);

const dec22 = document.getElementById("dec22");
const w17 = new Web(dec22,"   H", "OOPH");
w17.addThread('4123',1);
w17.addThread('3124',2);

const dec21b = document.getElementById("dec21b");
const w16 = new Web(dec21b,"R H A ", "REHSAD");
w16.addThread('654321',1);
w16.addThread('435126',2);

const dec21 = document.getElementById("dec21");
const w15 = new Web(dec21,"NE  ", "NEBA");
w15.addThread('3241',2);
w15.addThread('3412',1);

const dec20 = document.getElementById("dec20");
const w14 = new Web(dec20,"E  S ", "EFASR");
w14.addThread('21354',2);
w14.addThread('43215',1);

const dec19 = document.getElementById("dec19");
const w13 = new Web(dec19,"E N ", "EANW");
w13.addThread('4123',1);
w13.addThread('2314',2);

setTimeout(() => {
    const carousel = document.getElementById("carousel");
    carousel.scrollTo(carousel.scrollWidth, 0);
}, 500);


