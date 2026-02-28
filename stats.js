import { LabelCard, LocalStorageManager } from "./game_components.js";

const microScrambleLSM = new LocalStorageManager("ms", 29, 7);
const microScrambleCard = document.getElementById('micro-scramble');
const microScrambleDate = new LabelCard(microScrambleCard, `Feb 28th, ${microScrambleLSM.getStreakLength()} day streak.`);

const wordWebsLSM = new LocalStorageManager("ww", 87, 7);
wordWebsLSM.setRememberChoice(true);
const wordWebsCard = document.getElementById('word-webs');
const wordWebsDate = new LabelCard(wordWebsCard, `Feb 28th, ${wordWebsLSM.getStreakLength()} day streak.`);

const scrambleCard = document.getElementById('scramble');
const scrambleDate = new LabelCard(scrambleCard, "Feb 28th");

const analogsCard = document.getElementById('analogs');
const analogsDate = new LabelCard(analogsCard, "Feb 28th");
