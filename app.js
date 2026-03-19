// FIREBASE CONFIG (KEEP YOURS)
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let quizId = "";
let playerName = "";
let questions = [];
let currentQ = 0;

// CREATE QUIZ
function createQuiz() {
  quizId = Math.floor(100000 + Math.random() * 900000).toString();

  db.collection("quizzes").doc(quizId).set({
    players: {}
  });

  document.getElementById("quizId").innerText = quizId;
}

// UPLOAD EXCEL
function uploadExcel() {
  const file = document.getElementById("excelFile").files[0];

  if (!file) {
    alert("Please select file");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    questions = json.map(row => ({
      text: row.Question,
      options: [
        row.Option1,
        row.Option2,
        row.Option3,
        row.Option4
      ],
      correct: Number(row.Correct)
    }));

    alert("✅ Questions Loaded: " + questions.length);
  };

  reader.readAsArrayBuffer(file);
}

// START QUIZ
function startQuiz() {
  currentQ = 0;
  nextQuestion();
}

// NEXT QUESTION
function nextQuestion() {
  if (currentQ >= questions.length) {
    showWinner();
    return;
  }

  const q = questions[currentQ];

  db.collection("quizzes").doc(quizId).update({
    question: q.text,
    options: q.options,
    correct: q.correct,
    startTime: Date.now()
  });

  currentQ++;

  setTimeout(nextQuestion, 20000);
}

// ANSWER
function answer(opt) {
  db.collection("quizzes").doc(quizId).get().then(doc => {
    const data = doc.data();

    if (opt === data.correct) {
      const timeTaken = Date.now() - data.startTime;

      db.collection("quizzes").doc(quizId).update({
        ["players." + playerName]: 20000 - timeTaken
      });
    }
  });
}

// LEADERBOARD
function updateLeaderboard(data) {
  const leaderboardDiv = document.getElementById("leaderboard");

  const sorted = Object.entries(data.players || {})
    .sort((a, b) => b[1] - a[1]);

  leaderboardDiv.innerHTML = sorted.map((p, i) => `
    <div>🏆 ${i + 1}. ${p[0]} - ${Math.floor(p[1])}</div>
  `).join("");
}

// WINNER
function showWinner() {
  db.collection("quizzes").doc(quizId).get().then(doc => {
    const data = doc.data();

    const sorted = Object.entries(data.players || {})
      .sort((a, b) => b[1] - a[1]);

    alert("🏆 Winner: " + sorted[0][0]);
  });
}