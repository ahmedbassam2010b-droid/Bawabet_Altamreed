
export function createUI({ scenario, onChoose, onRestart, onHint }) {
  const title = document.getElementById("case-title");
  const stepLabel = document.getElementById("step-label");
  const message = document.getElementById("message-box");
  const choices = document.getElementById("choice-list");
  const feedback = document.getElementById("feedback");
  const progress = document.getElementById("progress-bar");
  const hintButton = document.getElementById("hint-btn");
  const restartButton = document.getElementById("restart-btn");

  let stepCount = 0;
  let currentKey = "start";
  let totalScore = 0;
  let completed = false;

  function show(key, extraMessage = "") {
    const step = scenario.steps[key];
    if (!step) return;

    currentKey = key;
    stepCount += 1;
    completed = Boolean(step.end);

    title.textContent = step.label;
    stepLabel.textContent = completed ? "اكتملت الحالة" : `الخطوة ${stepCount}`;
    message.textContent = step.text + (extraMessage ? ` ${extraMessage}` : "");
    feedback.textContent = "";
    feedback.className = "";
    choices.replaceChildren();

    const percentage = completed ? 100 : Math.min(90, 12 + stepCount * 18);
    progress.style.width = `${percentage}%`;

    if (step.end) {
      const result = document.createElement("div");
      result.className = "content-panel";
      result.innerHTML = `<div class="small-text muted">نتيجة التدريب</div><div class="result-score">${totalScore} / 5</div><div class="small-text muted">النقاط مؤشر تعليمي مبسط وليست تقييمًا للكفاءة السريرية.</div>`;
      choices.appendChild(result);

      const again = document.createElement("button");
      again.type = "button";
      again.className = "button button-primary";
      again.textContent = "إعادة المحاولة";
      again.addEventListener("click", onRestart);
      choices.appendChild(again);
      return;
    }

    for (const choice of step.choices || []) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-btn";
      button.textContent = choice.label;
      button.addEventListener("click", () => {
        if (completed) return;
        totalScore += choice.score || 0;
        if (totalScore < 0) totalScore = 0;
        onChoose(choice);
      });
      choices.appendChild(button);
    }
  }

  function showFeedback(text, isGood = false) {
    feedback.textContent = text;
    feedback.className = isGood ? "good" : "bad";
  }

  function setScore(score) {
    totalScore = score;
  }

  function getState() {
    return { currentKey, stepCount, totalScore, completed };
  }

  hintButton?.addEventListener("click", () => {
    const step = scenario.steps[currentKey];
    if (step?.hint) onHint(step.hint);
  });

  restartButton?.addEventListener("click", onRestart);

  return { show, showFeedback, setScore, getState };
}
