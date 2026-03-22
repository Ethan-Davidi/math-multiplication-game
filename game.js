const $ = (id) => document.getElementById(id);

// ---- Config ----
const MAX_QUESTIONS_PER_ROUND = 40;

// ---- Helpers ----
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

function setFeedback(text) {
  $("feedback").textContent = text;
}

function setFinalVisible(isVisible) {
  $("finalPanel").classList.toggle("hidden", !isVisible);
}

function formatExercise(ex) {
  return `${ex.a} × ${ex.b}`;
}

function showPracticeList(items) {
  const block = $("practiceBlock");
  const list = $("practiceList");
  const perfect = $("perfectRun");

  list.innerHTML = "";

  if (items.length === 0) {
    block.classList.add("hidden");
    perfect.classList.remove("hidden");
    return;
  }

  perfect.classList.add("hidden");
  block.classList.remove("hidden");

  for (const label of items) {
    const li = document.createElement("li");
    li.textContent = label;
    list.appendChild(li);
  }
}

// ---- Game state ----
let queue = [];
let current = null;
let locked = false;

let attempts = 0;
let masteredCount = 0;
let totalExercises = 0;

// Track missed exercises and their correct answers:
// key: "6×10" -> value: 60
let missedExercisesMap = new Map();

// Keep current round set
let roundSet = [];

// ---- UI ----
function renderStats() {
  $("attempts").textContent = `ניסיונות: ${attempts}`;
  $("mastered").textContent = `נפתרו: ${masteredCount}/${totalExercises}`;
}

function buildChoices(correctAnswer) {
  const choices = new Set();
  choices.add(correctAnswer);

  while (choices.size < 4) {
    const delta = Math.floor(Math.random() * 11) - 5; // -5..+5
    let candidate = correctAnswer + delta;

    if (candidate < 0) candidate = Math.abs(candidate);
    if (candidate === correctAnswer) continue;

    choices.add(candidate);
  }

  return shuffle(Array.from(choices));
}

function sortExerciseLabels(a, b) {
  const [ax, bx] = a.split("×").map(n => parseInt(n.trim(), 10));
  const [ay, by] = b.split("×").map(n => parseInt(n.trim(), 10));
  if (ax !== ay) return ax - ay;
  return bx - by;
}

function showEndScreen() {
  setFinalVisible(true);
  $("grid").innerHTML = "";
  $("exercise").textContent = "סיימנו!";
  setFeedback("");

  const scoreLine =
    `תוצאה: ${totalExercises} / ${attempts} (תרגילים נכונים / ניסיונות)`;
  $("finalScoreLine").textContent = scoreLine;

  // Build list like: "6×10 = 60"
  const missedLabels = Array.from(missedExercisesMap.keys()).sort(sortExerciseLabels);
  const missedWithAnswers = missedLabels.map(lbl => `${lbl} = ${missedExercisesMap.get(lbl)}`);

  showPracticeList(missedWithAnswers);
}

function nextExercise() {
  locked = false;
  $("nextBtn").disabled = true;
  setFinalVisible(false);

  $("practiceBlock").classList.add("hidden");
  $("perfectRun").classList.add("hidden");

  setFeedback("");

  if (queue.length === 0) {
    showEndScreen();
    return;
  }

  current = queue.shift();
  $("exercise").textContent = formatExercise(current);

  const answers = buildChoices(current.answer);
  const grid = $("grid");
  grid.innerHTML = "";

  for (const ans of answers) {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.type = "button";
    btn.textContent = String(ans);

    btn.addEventListener("click", () => onPick(btn, ans === current.answer));
    grid.appendChild(btn);
  }

  renderStats();
}

function onPick(btn, isCorrect) {
  if (locked) return;
  locked = true;

  attempts += 1;

  const label = `${current.a}×${current.b}`;

  if (isCorrect) {
    btn.classList.add("correct");
    setFeedback("נכון מאוד!");
    masteredCount += 1;
  } else {
    btn.classList.add("wrong");
    setFeedback(`לא נורא , תצליחי בפעם הבאה. התשובה הנכונה היא ${current.answer}.`);

    // Track missed exercise + correct answer for final stats
    missedExercisesMap.set(label, current.answer);

    // Wrong -> returns later
    queue.push(current);
  }

  renderStats();
  $("nextBtn").disabled = false;
}

// ---- Buttons ----
$("nextBtn").addEventListener("click", () => {
  nextExercise();
});

$("restartBtn").addEventListener("click", () => {
  startNewGame();
});

// ---- Init ----
function startNewGame() {
  if (!Array.isArray(EXERCISES) || EXERCISES.length === 0) {
    alert("אין תרגילים לטעינה");
    return;
  }

  // choose up to 40 exercises for this round
  roundSet = sample(EXERCISES, MAX_QUESTIONS_PER_ROUND);

  queue = shuffle(roundSet);
  current = null;
  locked = false;

  attempts = 0;
  masteredCount = 0;
  totalExercises = roundSet.length;

  missedExercisesMap = new Map();

  renderStats();
  nextExercise();
}

startNewGame();
