import { db, auth } from "./firebase-config.js";

// 🔹 Firestore imports
import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// 🔹 Auth imports
import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
async function loadResults(userId) {

    const q = query(
        collection(db, "results"),
        where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);

    const tableBody = document.querySelector("#resultsTable tbody");

    tableBody.innerHTML = "";
    const labels = [];
    const percentages = [];

    snapshot.forEach(doc => {

        const data = doc.data();

        tableBody.innerHTML += `
            <tr>
                <td>${data.examId}</td>
                <td>${data.total}</td>
                <td>${data.correct}</td>
                <td>${data.percentage}%</td>
            </tr>
        `;
        labels.push(data.examId);
        percentages.push(data.percentage);
    });
     // 🔥 Create Chart
    const ctx = document.getElementById("performanceChart");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Percentage",
                data: percentages,
                backgroundColor: "rgba(108, 92, 231, 0.7)"
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

}

// Protect page
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("welcomeText").innerText =
            "Welcome, " + user.email + " 👋";
            loadResults(user.uid);

    } else {
        window.location.href = "index.html";
    }
});

// Logout


document.getElementById("logoutBtn2").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
});
