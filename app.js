// 🔥 YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let quizId = "";
let playerName = "";

// HOST
function createQuiz() {
  quizId = Math.floor(100000 + Math.random()*900000).toString();

  db.collection("quizzes").doc(quizId).set({
    question: "",
    correct: 0,
    players: {}
  });

  document.getElementById("quizId").innerText = quizId;
}

// SEND QUESTION
function sendQuestion() {
  db.collection("quizzes").doc(quizId).update({
    question: document.getElementById("question").value,
    options: [
      o1.value, o2.value, o3.value, o4.value
    ],
    correct: Number(correct.value),
    startTime: Date.now()
  });
}

// PLAYER JOIN
function joinQuiz() {
  quizId = document.getElementById("quizId").value;
  playerName = document.getElementById("name").value;

  document.getElementById("game").style.display = "block";

  db.collection("quizzes").doc(quizId)
    .onSnapshot(doc => {
      const data = doc.data();

      if (!data) return;

      question.innerText = data.question;

      b1.innerText = data.options[0];
      b2.innerText = data.options[1];
      b3.innerText = data.options[2];
      b4.innerText = data.options[3];

      startTimer(data.startTime);
    });
}

// TIMER
function startTimer(startTime) {
  const timer = document.getElementById("timer");
  timer.style.width = "100%";

  setTimeout(() => {
    timer.style.width = "0%";
  }, 100);
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