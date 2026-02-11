import { LabelCard, LocalStorageManager } from "./game_components.js";

const wordWebsLSM = new LocalStorageManager("ww", 69, 7);
wordWebsLSM.setRememberChoice(true);
const wordWebsCard = document.getElementById('word-webs');
const wordWebsDate = new LabelCard(wordWebsCard, `Feb 10th, ${wordWebsLSM.getStreakLength()} day streak.`);

const analogsCard = document.getElementById('analogs');
const analogsDate = new LabelCard(analogsCard, "Feb 7th");

const scrambleLSM = new LocalStorageManager("ms", 11, 7);
const scrambleCard = document.getElementById('scramble');
const scrambleDate = new LabelCard(scrambleCard, `Feb 10th, ${scrambleLSM.getStreakLength()} day streak.`);
