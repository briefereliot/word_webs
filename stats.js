import { LabelCard, LocalStorageManager } from "./game_components.js";

const wordWebsLSM = new LocalStorageManager("ww", 77, 7);
wordWebsLSM.setRememberChoice(true);
const wordWebsCard = document.getElementById('word-webs');
const wordWebsDate = new LabelCard(wordWebsCard, `Feb 18th, ${wordWebsLSM.getStreakLength()} day streak.`);

const analogsCard = document.getElementById('analogs');
const analogsDate = new LabelCard(analogsCard, "Feb 14th");

const scrambleLSM = new LocalStorageManager("ms", 19, 7);
const scrambleCard = document.getElementById('scramble');
const scrambleDate = new LabelCard(scrambleCard, `Feb 18th, ${scrambleLSM.getStreakLength()} day streak.`);
