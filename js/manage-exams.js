import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
let editingExamId = null;
let editingQuestionId = null;

const examSelect = document.getElementById("examSelect");
const questionTable = document.querySelector("#questionTable tbody");

/* ========================
   CREATE EXAM
======================== */
document.getElementById("createExamBtn").addEventListener("click", async () => {

    const subject = document.getElementById("subject").value;
    const year = Number(document.getElementById("year").value);
    const semester = Number(document.getElementById("semester").value);
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;
    const duration = Number(document.getElementById("duration").value);

    if (!subject || !year || !semester || !start || !end || !duration) {
        document.getElementById("examMsg").innerText = "Fill all fields";
        return;
    }

    if (editingExamId) {
        await updateDoc(doc(db, "exams", editingExamId), {
            subject,
            year,
            semester,
            startDate: Timestamp.fromDate(new Date(start)),
            endDate: Timestamp.fromDate(new Date(end)),
            duration
        });

        document.getElementById("examMsg").innerText = "Exam Updated ✅";
        editingExamId = null;

    } else {
        await addDoc(collection(db, "exams"), {
            subject,
            year,
            semester,
            startDate: Timestamp.fromDate(new Date(start)),
            endDate: Timestamp.fromDate(new Date(end)),
            duration
        });

        document.getElementById("examMsg").innerText = "Exam Created ✅";
    }

    loadExams();
});


/* ========================
   LOAD EXAMS
======================== */
async function loadExams() {

    examSelect.innerHTML = "";
    const examTable = document.querySelector("#examListTable tbody");
    examTable.innerHTML = "";

    const snapshot = await getDocs(collection(db, "exams"));

    snapshot.forEach(exam => {

        const data = exam.data();

        // Dropdown for question adding
        examSelect.innerHTML += `
            <option value="${exam.id}">
                ${data.subject} (Year ${data.year} Sem ${data.semester})
            </option>
        `;

        // Table list
        examTable.innerHTML += `
            <tr>
                <td>${data.subject}</td>
                <td>${data.year}</td>
                <td>${data.semester}</td>
                <td>${data.duration} mins</td>
                <td>
                    <button onclick="editExam('${exam.id}')">Edit</button>
                    <button onclick="deleteExam('${exam.id}')" class="delete-btn">Delete</button>
                </td>
            </tr>
        `;
    });
}

/* ========================
   ADD QUESTION
======================== */
document.getElementById("addQuestionBtn").addEventListener("click", async () => {

    const examId = examSelect.value;
    const question = document.getElementById("question").value;
    const option1 = document.getElementById("option1").value;
    const option2 = document.getElementById("option2").value;
    const option3 = document.getElementById("option3").value;
    const option4 = document.getElementById("option4").value;
    const correct = Number(document.getElementById("correct").value);

    if (!question || !option1 || !option2 || !option3 || !option4 || !correct) {
        document.getElementById("questionMsg").innerText = "Fill all fields";
        return;
    }

    if (editingQuestionId) {

        await updateDoc(doc(db, "questions", editingQuestionId), {
            examId,
            question,
            options: [option1, option2, option3, option4],
            correct
        });

        document.getElementById("questionMsg").innerText = "Question Updated ✅";
        editingQuestionId = null;

    } else {

        await addDoc(collection(db, "questions"), {
            examId,
            question,
            options: [option1, option2, option3, option4],
            correct
        });

        document.getElementById("questionMsg").innerText = "Question Added ✅";
    }

    // Clear form
    document.getElementById("question").value = "";
    document.getElementById("option1").value = "";
    document.getElementById("option2").value = "";
    document.getElementById("option3").value = "";
    document.getElementById("option4").value = "";
    document.getElementById("correct").value = "";

    loadQuestions();
});

/* ========================
   LOAD QUESTIONS
======================== */
async function loadQuestions() {

    questionTable.innerHTML = "";

    const selectedExamId = examSelect.value;

    if (!selectedExamId) return;

    const snapshot = await getDocs(collection(db, "questions"));

    snapshot.forEach(q => {

        const data = q.data();

        if (data.examId !== selectedExamId) return;

        questionTable.innerHTML += `
            <tr>
                <td>${data.question}</td>
                <td>Option ${data.correct}</td>
                <td>
                    <button onclick="editQuestion('${q.id}')">Edit</button>
                    <button onclick="deleteQuestion('${q.id}')"
                        class="delete-btn">Delete</button>
                </td>
            </tr>
        `;
    });
}

window.editQuestion = async function(id) {

    const questionRef = doc(db, "questions", id);
    const snapshot = await getDoc(questionRef);
    const data = snapshot.data();

    editingQuestionId = id;

    document.getElementById("question").value = data.question;
    document.getElementById("option1").value = data.options[0];
    document.getElementById("option2").value = data.options[1];
    document.getElementById("option3").value = data.options[2];
    document.getElementById("option4").value = data.options[3];
    document.getElementById("correct").value = data.correct;

    examSelect.value = data.examId;

    document.getElementById("questionMsg").innerText =
        "Editing Question Mode";
};


/* ========================
   DELETE QUESTION
======================== */
window.deleteQuestion = async function(id) {
    await deleteDoc(doc(db, "questions", id));
    loadQuestions();
};
async function loadSubjects() {

    const subjectSelect = document.getElementById("subject");
    subjectSelect.innerHTML = "";

    const snapshot = await getDocs(collection(db, "subjects"));

    snapshot.forEach(doc => {
        const data = doc.data();

        subjectSelect.innerHTML += `
            <option value="${data.name}">
                ${data.name} (Year ${data.year} Sem ${data.semester})
            </option>
        `;
    });
}
window.editExam = async function(id) {

    const examDoc = await getDocs(collection(db, "exams"));
    
    const examRef = doc(db, "exams", id);
    const snapshot = await getDoc(examRef);
    const data = snapshot.data();

    editingExamId = id;

    document.getElementById("subject").value = data.subject;
    document.getElementById("year").value = data.year;
    document.getElementById("semester").value = data.semester;
    document.getElementById("duration").value = data.duration;

    document.getElementById("startDate").value =
        data.startDate.toDate().toISOString().slice(0,16);

    document.getElementById("endDate").value =
        data.endDate.toDate().toISOString().slice(0,16);

    document.getElementById("examMsg").innerText =
        "Editing mode enabled";
};
window.deleteExam = async function(id) {
    await deleteDoc(doc(db, "exams", id));
    loadExams();
};

loadSubjects();

loadExams();
examSelect.addEventListener("change", loadQuestions);
if (examSelect.options.length > 0) {
    examSelect.selectedIndex = 0;
    loadQuestions();
}

loadQuestions();
