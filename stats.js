import { LabelCard, LocalStorageManager } from "./game_components.js";

const microScrambleLSM = new LocalStorageManager("ms", 39, 7);
const microScrambleCard = document.getElementById('micro-scramble');
const microScrambleDate = new LabelCard(microScrambleCard, `Mar 12th, ${microScrambleLSM.getStreakLength()} day streak.`);

const wordWebsLSM = new LocalStorageManager("ww", 97, 7);
wordWebsLSM.setRememberChoice(true);
const wordWebsCard = document.getElementById('word-webs');
const wordWebsDate = new LabelCard(wordWebsCard, `Mar 12th, ${wordWebsLSM.getStreakLength()} day streak.`);

const scrambleCard = document.getElementById('scramble');
const scrambleDate = new LabelCard(scrambleCard, "Mar 12th");

const analogsCard = document.getElementById('analogs');
const analogsDate = new LabelCard(analogsCard, "Mar 4th");
