import { LabelCard, LocalStorageManager } from "./game_components.js";

const wordWebsLSM = new LocalStorageManager("ww", 79, 7);
wordWebsLSM.setRememberChoice(true);
const wordWebsCard = document.getElementById('word-webs');
const wordWebsDate = new LabelCard(wordWebsCard, `Feb 20th, ${wordWebsLSM.getStreakLength()} day streak.`);

const analogsCard = document.getElementById('analogs');
const analogsDate = new LabelCard(analogsCard, "Feb 18th");

const scrambleLSM = new LocalStorageManager("ms", 21, 7);
const scrambleCard = document.getElementById('scramble');
const scrambleDate = new LabelCard(scrambleCard, `Feb 20th, ${scrambleLSM.getStreakLength()} day streak.`);
