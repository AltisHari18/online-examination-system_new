import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const subjectTable = document.querySelector("#subjectTable tbody");

// 🔥 Add Subject
document.getElementById("addSubjectBtn").addEventListener("click", async () => {

    const name = document.getElementById("subjectName").value;
    const year = document.getElementById("year").value;
    const semester = document.getElementById("semester").value;

    if (!name || !year || !semester) {
        document.getElementById("message").innerText = "Fill all fields";
        return;
    }

    await addDoc(collection(db, "subjects"), {
        name,
        year: Number(year),
        semester: Number(semester)
    });

    document.getElementById("message").innerText = "Subject Added ✅";

    document.getElementById("subjectName").value = "";
    document.getElementById("year").value = "";
    document.getElementById("semester").value = "";

    loadSubjects();
});

// 🔥 Load Subjects
async function loadSubjects() {

    subjectTable.innerHTML = "";

    const snapshot = await getDocs(collection(db, "subjects"));

    snapshot.forEach(subject => {

        const data = subject.data();

        subjectTable.innerHTML += `
            <tr>
                <td>${data.name}</td>
                <td>${data.year}</td>
                <td>${data.semester}</td>
                <td>
                    <button class="delete-btn" onclick="deleteSubject('${subject.id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

// 🔥 Delete
window.deleteSubject = async function(id) {
    await deleteDoc(doc(db, "subjects", id));
    loadSubjects();
}

loadSubjects();
