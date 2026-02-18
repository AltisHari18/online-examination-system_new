import { db, auth } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const tableBody = document.querySelector("#examTable tbody");

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    loadExams();
    loadStats();
});

// 🔥 Load Exams
async function loadExams() {
    console.log("Loading Exams...");


    const snapshot = await getDocs(collection(db, "exams"));
    const tableBody = document.querySelector("#examTable tbody");

    tableBody.innerHTML = "";

    const now = new Date();
    let activeCount = 0;

    snapshot.forEach(doc => {
        console.log("Exam count:", snapshot.size);
        console.log("Exam data:", doc.data());



        const data = doc.data();

       

        let start;
let end;

if (data.startDate?.toDate) {
    start = data.startDate.toDate();
} else {
    start = new Date(data.startDate);
}

if (data.endDate?.toDate) {
    end = data.endDate.toDate();
} else {
    end = new Date(data.endDate);
}

if (isNaN(start) || isNaN(end)) return;



        let statusText = "";
        let statusClass = "";

        if (now < start) {
            statusText = "Scheduled";
            statusClass = "scheduled";
        }
        else if (now > end) {
            statusText = "Expired";
            statusClass = "expired";
        }
        else {
            statusText = "Active";
            statusClass = "active";
            activeCount++;
        }

        tableBody.innerHTML += `
            <tr>
                <td>${data.subject}</td>
                <td>${data.year}</td>
                <td>${data.semester}</td>
                <td>${start.toLocaleString()}</td>
                <td>${end.toLocaleString()}</td>
                <td>${data.duration} mins</td>
                <td>
                    <span class="badge ${statusClass}">
                        ${statusText}
                    </span>
                </td>
            </tr>
        `;
    });

    document.getElementById("activeExams").innerText = activeCount;
}




// 🔥 Load Statistics
async function loadStats() {

    const examSnap = await getDocs(collection(db, "exams"));
    const resultSnap = await getDocs(collection(db, "results"));

    document.getElementById("totalExams").innerText = examSnap.size;
    document.getElementById("totalStudents").innerText = resultSnap.size;

    let totalScore = 0;

    resultSnap.forEach(doc => {
        const percent = doc.data().percentage || 0;
        totalScore += percent;
    });

    const avg = resultSnap.size > 0
        ? (totalScore / resultSnap.size).toFixed(1)
        : 0;

    document.getElementById("avgScore").innerText = avg + "%";
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
});window.logout = function() {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
};

