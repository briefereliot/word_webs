const template5SVG = document.getElementById("svg1");

letter1 = document.getElementById("letter1");
letter2 = document.getElementById("letter2");
letter3 = document.getElementById("letter3");
letter4 = document.getElementById("letter4");
letter5 = document.getElementById("letter5");

bubble1 = document.getElementById("bubble1");
bubble2 = document.getElementById("bubble2");
bubble3 = document.getElementById("bubble3");
bubble4 = document.getElementById("bubble4");
bubble5 = document.getElementById("bubble5");

a12 = document.getElementById("a12");
a23 = document.getElementById("a23");
a34 = document.getElementById("a34");
a45 = document.getElementById("a45");
a15 = document.getElementById("a15");

b12 = document.getElementById("b12");
b13 = document.getElementById("b13");
b14 = document.getElementById("b14");
b15 = document.getElementById("b15");
b23 = document.getElementById("b23");
b24 = document.getElementById("b24");
b25 = document.getElementById("b25");
b34 = document.getElementById("b34");
b35 = document.getElementById("b35");
b45 = document.getElementById("b45");
b11 = document.getElementById("b11");
b22 = document.getElementById("b22");
b33 = document.getElementById("b33");
b44 = document.getElementById("b44");
b55 = document.getElementById("b55");

paths = [a12, a23, a34, a45, a15, 
    b12, b13, b14, b15, b23, b24, b25, b34, b35, b45, b11, b22, b33, b44, b55];

aDict = {
    "12" : a12,
    "23" : a23,
    "34" : a34,
    "45" : a45,
    "51" : a15,
    "15" : a15,
    "54" : a45,
    "43" : a34,
    "32" : a23,
    "21" : a12
};

bDict = {
    "11" : b11,
    "12" : b12,
    "13" : b13,
    "14" : b14,
    "15" : b15,
    "21" : b12,
    "22" : b22,
    "23" : b23,
    "24" : b24,
    "25" : b25,
    "31" : b13,
    "32" : b23,
    "33" : b33,
    "34" : b34,
    "35" : b35,
    "41" : b14,
    "42" : b24,
    "43" : b34,
    "44" : b44,
    "45" : b45,
    "51" : b15,
    "52" : b25,
    "53" : b35,
    "54" : b45,
    "55" : b55
};

letterDict = {
    0 : letter1,
    1 : letter2,
    2 : letter3,
    3 : letter4,
    4 : letter5
};

letter1.textContent = "A";
letter2.textContent  = "B";
letter3.textContent  = "C";
letter4.textContent  = "D";
letter5.textContent  = "E";
hideAllPaths();
showPath("12345", aDict);
showPath("41352", bDict);
setLetters(" L  E", letterDict);

bubble1.addEventListener('focus', () => {
    bubble1.style.outline = "none";
    bubble1.style.strokeWidth = "4";
    console.log("pressed");
});

bubble1.addEventListener('blur', () => {
    bubble1.style.strokeWidth = "1.05"
});

bubble1.addEventListener('keyup', (event) => {
    if(isLetter(event.key)) {
        letter1.textContent = event.key.toUpperCase();
    };
});

function setLetters(letters, dict) {
    for (let i=0; i<letters.length && i<5; i++) {
        dict[i].textContent = letters.slice(i, i+1);
        if(letters.slice(i, i+1) != " ") {
            dict[i].style.fontWeight = "900";
        } else {
            dict[i].style.fontWeight = "400";
        }
    }
}

function showPath(path, dict) {
    for (let i=1; i < path.length; i++) {
        key = path.slice(i-1, i+1);
        show(dict[key]);
    };
};
function hideAllPaths() {
    paths.forEach((path) => {
        hide(path);
    });
};

function hide(elem) {
    elem.style.visibility = "hidden";
};

function show(elem) {
    elem.style.visibility = "visible";
};

function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}
