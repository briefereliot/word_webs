const gameWindow = document.getElementById("game");

class Web {
    constructor(window, string, answer, threads = [],  svgNS = 'http://www.w3.org/2000/svg') {
        this.svgNS = svgNS;
        this.window = window;
        this.numLetters = string.length;
        this.answer = answer;
        this.threads = [];
        this.letters = [];
        for(let i = 0; i < string.length; i++) {
            let x = this.#getLetterX(i);
            let y = this.#getLetterY(i);
            let l = new Letter(this.window, String(x)+'%', String(y)+'%',1,!this.#isLetter(string[i]),string[i]);
            this.letters.push(l);
        }
        this.svg = document.createElementNS(this.svgNS, "svg");
        this.svg.setAttribute("width", "100%");
        this.svg.setAttribute("height", "100%");
        this.window.appendChild(this.svg);
        for(let i = 0; i < threads.length; i++) {
            this.addThread(threads[i]);
        };
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
            let string = '';
            for(let i = 0; i < this.letters.length; i++) {
                string += this.letters[i].value;
            };
            if(string === this.answer) {
                for(let i = 0; i < this.threads[0].length; i++) {
                    this.letters[this.threads[0][i]-1].disable();
                    setTimeout(() => {
                        this.letters[this.threads[0][i]-1].turnGold();
                    }, 150*i);
                };
                setTimeout(() => {
                    let congrats = document.createElement("p");
                    congrats.textContent = "YOU GOT IT!";
                    congrats.style.color = "gold";
                    congrats.style.fontWeight = "900";
                    this.window.appendChild(congrats);
                },150*this.threads[0].length);
            };
        });
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
        this.line.setAttribute('x1', this.x1);
        this.line.setAttribute('y1', this.y1);
        this.line.setAttribute('x2', this.x2);
        this.line.setAttribute('y2', this.y2);
        this.line.setAttribute('stroke', 'black');
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
        this.textBox.style.border = "6px solid gold";
        this.textBox.style.color = "gold"
    }

    #stylize() {
        this.textBox.setAttribute("type", "text");
        this.textBox.setAttribute("size", "1");
        this.textBox.value = this.value;
        this.textBox.setAttribute("maxlength","1");
        this.textBox.style.borderRadius = "50%";
        this.textBox.style.border = "2px solid black";
        this.textBox.style.boxSizing = 'border-box';
        this.textBox.style.width = '4rem';
        this.textBox.style.height = '4rem';
        this.textBox.style.padding = '0';
        this.textBox.style.textAlign = 'center';
        this.textBox.style.fontFamily = 'Roboto Mono';
        this.textBox.style.fontSize = '3rem';
        this.textBox.style.fontWeight = '900';
        this.textBox.style.position = 'absolute';
        this.textBox.style.top = String(this.y);
        this.textBox.style.left = String(this.x);
        this.textBox.style.transform = 'translate(-50%, -50%)';
    };

    #initEvents() {
        this.textBox.addEventListener('focus', () => {
            this.textBox.style.border = "6px solid black";
            console.log("pressed");
        });

        this.textBox.addEventListener('blur', () => {
            this.textBox.style.border = "2px solid black";
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

const w1 = new Web(gameWindow,"  EWA ", "DREWAR");
w1.addThread('125436',2);
w1.addThread('234561',1);

