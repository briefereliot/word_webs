import { LabelCard, LocalStorageManager } from "./game_components.js";

const wordWebsLSM = new LocalStorageManager("ww", 73, 7);
wordWebsLSM.setRememberChoice(true);
const wordWebsCard = document.getElementById('word-webs');
const wordWebsDate = new LabelCard(wordWebsCard, `Feb 14th, ${wordWebsLSM.getStreakLength()} day streak.`);

const analogsCard = document.getElementById('analogs');
const analogsDate = new LabelCard(analogsCard, "Feb 14th");

const scrambleLSM = new LocalStorageManager("ms", 15, 7);
const scrambleCard = document.getElementById('scramble');
const scrambleDate = new LabelCard(scrambleCard, `Feb 14th, ${scrambleLSM.getStreakLength()} day streak.`);
