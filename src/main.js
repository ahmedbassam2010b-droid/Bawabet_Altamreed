
import { createScene } from "./scene.js";
import { createPlayer } from "./player.js";
import { createInteraction } from "./interaction.js";
import { createUI } from "./ui.js";
import { firstCase } from "./scenarios/first-case.js";
import { loadProgress, saveProgress } from "./save.js";

const canvas = document.getElementById("game-canvas");
const sceneApi = createScene(canvas);
const player = createPlayer(sceneApi.camera, canvas);

let currentStep = "start";
let totalScore = 0;
let lastTimestamp = 0;
let lastSavedStep = "start";
let lastCompleted = false;

const saved = loadProgress();
if (saved.scenarioId === firstCase.id && typeof saved.bestScore === "number") {
  console.info("تم العثور على نتيجة سابقة:", saved.bestScore);
}

const ui = createUI({
  scenario: firstCase,
  onChoose: handleChoice,
  onRestart: restartCase,
  onHint: showHint
});

function showHint(hint) {
  ui.showFeedback(`تلميح: ${hint}`, true);
  document.getElementById("message-box").textContent =
    firstCase.steps[currentStep]?.text || firstCase.intro;
}

function handleChoice(choice) {
  currentStep = choice.next;
  ui.showFeedback(choice.feedback, (choice.score || 0) > 0);

  if (firstCase.steps[currentStep]?.end) {
    lastCompleted = true;
    const previous = loadProgress();
    const bestScore = Math.max(previous.bestScore || 0, totalScore);
    saveProgress({
      scenarioId: firstCase.id,
      bestScore,
      lastScore: totalScore,
      completed: true,
      currentStep
    });
  } else {
    saveProgress({
      scenarioId: firstCase.id,
      currentStep,
      lastScore: totalScore,
      completed: false
    });
  }

  ui.show(currentStep);
}

function restartCase() {
  currentStep = "start";
  totalScore = 0;
  lastCompleted = false;
  lastSavedStep = "start";
  ui.setScore(0);
  ui.show("start");
  saveProgress({
    scenarioId: firstCase.id,
    currentStep: "start",
    lastScore: 0,
    completed: false
  });
}

function handleWorldInteraction(data) {
  if (data.action === "monitor") {
    ui.showFeedback(data.message, true);
    return;
  }

  if (data.action === "supervisor" && currentStep === "start") {
    document.getElementById("message-box").textContent =
      "محطة التمريض: أنت الآن تعرف مكان الممرض المسؤول. اختر الخطوة المناسبة من لوحة الحالة لبدء التقييم التعليمي.";
  } else if (data.action === "start") {
    document.getElementById("message-box").textContent =
      "غرفة المريض: " + firstCase.intro;
  } else {
    document.getElementById("message-box").textContent = data.message;
  }

  ui.showFeedback(data.message, true);
}

const interaction = createInteraction(sceneApi, handleWorldInteraction);

ui.show("start");

function animate(timestamp) {
  const delta = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 1000, 0.05) : 0;
  lastTimestamp = timestamp;

  player.update(delta);
  interaction.update();
  sceneApi.animate();

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

window.addEventListener("pagehide", () => {
  player.destroy();
  sceneApi.dispose();
});
