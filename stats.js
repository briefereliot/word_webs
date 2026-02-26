import { LabelCard, LocalStorageManager } from "./game_components.js";

const microScrambleLSM = new LocalStorageManager("ms", 27, 7);
const microScrambleCard = document.getElementById('micro-scramble');
const microScrambleDate = new LabelCard(microScrambleCard, `Feb 26th, ${microScrambleLSM.getStreakLength()} day streak.`);

const wordWebsLSM = new LocalStorageManager("ww", 85, 7);
wordWebsLSM.setRememberChoice(true);
const wordWebsCard = document.getElementById('word-webs');
const wordWebsDate = new LabelCard(wordWebsCard, `Feb 26th, ${wordWebsLSM.getStreakLength()} day streak.`);

const scrambleCard = document.getElementById('scramble');
const scrambleDate = new LabelCard(scrambleCard, "Feb 26th");

const analogsCard = document.getElementById('analogs');
const analogsDate = new LabelCard(analogsCard, "Feb 25th");
