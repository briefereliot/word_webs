import { LabelCard, LocalStorageManager } from "./game_components.js";

const microScrambleLSM = new LocalStorageManager("ms", 23, 7);
const microScrambleCard = document.getElementById('micro-scramble');
const microScrambleDate = new LabelCard(microScrambleCard, `Feb 22nd, ${microScrambleLSM.getStreakLength()} day streak.`);

const wordWebsLSM = new LocalStorageManager("ww", 81, 7);
wordWebsLSM.setRememberChoice(true);
const wordWebsCard = document.getElementById('word-webs');
const wordWebsDate = new LabelCard(wordWebsCard, `Feb 22nd, ${wordWebsLSM.getStreakLength()} day streak.`);

const scrambleCard = document.getElementById('scramble');
const scrambleDate = new LabelCard(scrambleCard, "Feb 22nd");

const analogsCard = document.getElementById('analogs');
const analogsDate = new LabelCard(analogsCard, "Feb 21st");
