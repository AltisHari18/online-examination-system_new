import { db, auth } from "./firebase-config.js";

import { 
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";


let questions = [];
let timeLeft = 600;

const examId = localStorage.getItem("examId");

if (!examId) {
    window.location.href = "select-exam.html";
}

async function loadQuestions() {

    const q = query(
        collection(db, "questions"),
        where("examId", "==", examId)
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(doc => {
        questions.push(doc.data());
    });

    if (questions.length === 0) {
        alert("No questions found.");
        return;
    }

    displayAllQuestions();
}

function displayAllQuestions() {

    const container = document.getElementById("questionText");
    const optionsDiv = document.getElementById("options");

    container.innerHTML = "";
    optionsDiv.innerHTML = "";

    questions.forEach((q, index) => {

        const questionHTML = `
            <div class="question-block">
                <h4>Question ${index + 1}</h4>
                <p>${q.question}</p>

                <div>
                    <input type="radio" name="q${index}" value="A"> ${q.optionA}
                </div>
                <div>
                    <input type="radio" name="q${index}" value="B"> ${q.optionB}
                </div>
                <div>
                    <input type="radio" name="q${index}" value="C"> ${q.optionC}
                </div>
                <div>
                    <input type="radio" name="q${index}" value="D"> ${q.optionD}
                </div>
            </div>
            <hr>
        `;

        optionsDiv.innerHTML += questionHTML;
    });

    // Update attempted count dynamically
    document.querySelectorAll("input[type=radio]").forEach(input => {
        input.addEventListener("change", updateAttemptedCount);
    });
}

function updateAttemptedCount() {

    let attempted = 0;

    questions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        if (selected) attempted++;
    });

    document.getElementById("attempted").innerText = attempted;
}

async function submitExam() {

    const user = auth.currentUser;

    if (!user) {
        alert("User not logged in.");
        return;
    }

    let correct = 0;
    let wrong = 0;
    let attempted = 0;

    questions.forEach((q, index) => {

        const selected = document.querySelector(`input[name="q${index}"]:checked`);

        if (selected) {
            attempted++;

            if (selected.value === q.correctAnswer) {
                correct++;
            } else {
                wrong++;
            }
        }
    });

    const total = questions.length;
    const notAttempted = total - attempted;
    const percentage = ((correct / total) * 100).toFixed(2);

    // 🔥 SAVE TO FIRESTORE
    await addDoc(collection(db, "results"), {
        userId: user.uid,
        examId: examId,
        correct: correct,
        wrong: wrong,
        notAttempted: notAttempted,
        percentage: Number(percentage),
        total: total,
        date: serverTimestamp()
    });

    localStorage.setItem("resultData", JSON.stringify({
    correct,
    wrong,
    notAttempted,
    total,
    percentage,
    studentEmail: auth.currentUser.email,
    registerNo: auth.currentUser.uid.substring(0,8).toUpperCase()
}));


    window.location.href = "result.html";
}

document.getElementById("submitBtn")
.addEventListener("click", () => {

    if (confirm("Are you sure you want to submit?")) {
        submitExam();
    }

});

function startTimer() {

    const timerInterval = setInterval(() => {

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        document.getElementById("timer").innerText =
            minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitExam();   // 🔥 Auto-submit
        }

        timeLeft--;

    }, 1000);
}
let tabSwitchCount = 0;

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

        tabSwitchCount++;

        if (tabSwitchCount >= 2) {
            alert("Tab switching detected. Exam auto-submitted.");
            submitExam();
        } else {
            alert("Warning: Do not switch tabs during exam!");
        }
    }
});
// Prevent refresh
window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    e.returnValue = "";
});

// Disable back button
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
};


startTimer();
loadQuestions();
