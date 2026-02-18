import { db, auth } from "./firebase-config.js";
import { 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
const yearSelect = document.getElementById("year");
const semSelect = document.getElementById("semester");
const subjectSelect = document.getElementById("subject");

let examsData = [];

async function loadDropdowns() {

    const snapshot = await getDocs(collection(db, "exams"));

    examsData = [];

    snapshot.forEach(doc => {
        examsData.push(doc.data());
    });

    const years = [...new Set(examsData.map(e => e.year))];

    yearSelect.innerHTML = `<option value="">Select Year</option>`;

    years.forEach(year => {
        yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    });
}

yearSelect.addEventListener("change", () => {

    const year = Number(yearSelect.value);

    const semesters = [
        ...new Set(
            examsData
                .filter(e => e.year == year)
                .map(e => e.semester)
        )
    ];

    semSelect.innerHTML = `<option value="">Select Semester</option>`;

    semesters.forEach(sem => {
        semSelect.innerHTML += `<option value="${sem}">Semester ${sem}</option>`;
    });

    subjectSelect.innerHTML = "";
});

semSelect.addEventListener("change", () => {

    const year = Number(yearSelect.value);
    const semester = Number(semSelect.value);

    const subjects = examsData.filter(
        e => e.year == year && e.semester == semester
    );

    subjectSelect.innerHTML = `<option value="">Select Subject</option>`;

    subjects.forEach(e => {
        subjectSelect.innerHTML += `
            <option value="${e.subject}">
                ${e.subject}
            </option>
        `;
    });
});

loadDropdowns();

document.getElementById("checkExamBtn")
.addEventListener("click", async () => {

    const year = Number(document.getElementById("year").value);
    const semester = Number(document.getElementById("semester").value);
    const subject = document.getElementById("subject").value;

    if (!year || !semester || !subject) {
        document.getElementById("message").innerText =
            "Please select all fields.";
        return;
    }

    const q = query(
        collection(db, "exams"),
        where("year", "==", year),
        where("semester", "==", semester),
        where("subject", "==", subject)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {

    const examDoc = querySnapshot.docs[0];
    const examId = examDoc.id;

    const user = auth.currentUser;

    if (!user) {
        document.getElementById("message").innerText =
            "Please login again.";
        return;
    }

    // 🔍 Check if already attempted
    const resultQuery = query(
        collection(db, "results"),
        where("userId", "==", user.uid),
        where("examId", "==", examId)
    );

    const resultSnapshot = await getDocs(resultQuery);

    if (!resultSnapshot.empty) {
        document.getElementById("message").innerText =
            "You have already attended this exam ❌";

        document.getElementById("startSection").style.display = "none";
        return;
    }

    // ✅ If not attempted
    document.getElementById("message").innerText =
        "Exam Available ✅";

    document.getElementById("startSection").style.display = "block";

    document.getElementById("startExamBtn")
        .onclick = () => {
            localStorage.setItem("examId", examId);
            window.location.href = "exam.html";
        };

} else {
    document.getElementById("message").innerText =
        "No Exam Available ❌";

    document.getElementById("startSection").style.display = "none";
}


});
