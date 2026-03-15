import { LabelCard, LocalStorageManager } from "./game_components.js";

const microScrambleLSM = new LocalStorageManager("ms", 42, 7);
microScrambleLSM.setRememberChoice(true);
const microScrambleCard = document.getElementById('micro-scramble');
const microScrambleDate = new LabelCard(microScrambleCard, `Mar 15th, ${microScrambleLSM.getStreakLength()} day streak.`);

const wordWebsLSM = new LocalStorageManager("ww", 100, 7);
wordWebsLSM.setRememberChoice(true);
const wordWebsCard = document.getElementById('word-webs');
const wordWebsDate = new LabelCard(wordWebsCard, `Mar 15th, ${wordWebsLSM.getStreakLength()} day streak.`);

const scrambleLSM = new LocalStorageManager("bs", 30, 7)
const scrambleCard = document.getElementById("scramble");
const scrambleDate = new LabelCard(scrambleCard, `Mar 15th, ${scrambleLSM.getStreakLength()} day streak.`);

const analogsCard = document.getElementById('analogs');
const analogsDate = new LabelCard(analogsCard, "Mar 14th");
