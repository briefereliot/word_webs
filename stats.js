import { LabelCard, LocalStorageManager } from "./game_components.js";

const microScrambleLSM = new LocalStorageManager("ms", 41, 7);
microScrambleLSM.setRememberChoice(true);
const microScrambleCard = document.getElementById('micro-scramble');
const microScrambleDate = new LabelCard(microScrambleCard, `Mar 14th, ${microScrambleLSM.getStreakLength()} day streak.`);

const wordWebsLSM = new LocalStorageManager("ww", 99, 7);
wordWebsLSM.setRememberChoice(true);
const wordWebsCard = document.getElementById('word-webs');
const wordWebsDate = new LabelCard(wordWebsCard, `Mar 14th, ${wordWebsLSM.getStreakLength()} day streak.`);

const scrambleLSM = new LocalStorageManager("bs", 29, 7)
const scrambleCard = document.getElementById("scramble");
const scrambleDate = new LabelCard(scrambleCard, `Mar 13th, ${scrambleLSM.getStreakLength()} day streak.`);

const analogsCard = document.getElementById('analogs');
const analogsDate = new LabelCard(analogsCard, "Mar 14th");
