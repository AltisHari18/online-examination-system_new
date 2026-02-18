import { db, auth } from "./firebase-config.js";
import { doc, getDoc }
    from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
const resultData = JSON.parse(localStorage.getItem("resultData"));

if (!resultData) {
    window.location.href = "student.html";
}

document.getElementById("total").innerText = resultData.total;
document.getElementById("correct").innerText = resultData.correct;
document.getElementById("wrong").innerText = resultData.wrong;
document.getElementById("notAttempted").innerText = resultData.notAttempted;
document.getElementById("percentage").innerText = resultData.percentage;

document.getElementById("downloadBtn")
    .addEventListener("click", generatePDF);



async function generatePDF() {

    const { jsPDF } = window.jspdf;
    const docPDF = new jsPDF();

    const resultData = JSON.parse(localStorage.getItem("resultData"));
    const examId = localStorage.getItem("examId");

    const user = auth.currentUser;

    // 🔥 Fetch student info from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    const studentName = userData.name;
    const registerNo = userData.registerNo;

    const percentage = resultData.percentage;
    const status = percentage >= 40 ? "PASS" : "FAIL";
    const date = new Date().toLocaleDateString();

    // 🔥 College Logo (Add your logo path)
    const logo = new Image();
    logo.src = "./js/logo.png"; // Put your logo file in root folder

    logo.onload = function () {

        docPDF.addImage(logo, "PNG", 15, 10, 25, 25);

        // Header
        // 🔥 Add Logo
        docPDF.addImage(logo, "PNG", 20, 12, 25, 25);

        // 🔥 College Name
        docPDF.setFont("helvetica", "bold");
        docPDF.setFontSize(20);
        docPDF.text("VIGNESH POLYTECHNIC COLLEGE", 105, 20, null, null, "center");

        // Affiliation (move slightly down)
        docPDF.setFont("helvetica", "normal");
        docPDF.setFontSize(10);
        docPDF.text("Affiliated to State Board of Technical Education", 105, 28, null, null, "center");

        // Add more gap before next title
        docPDF.setFontSize(14);
        docPDF.text("ONLINE EXAMINATION SYSTEM", 105, 40, null, null, "center");

        docPDF.setFontSize(12);
        docPDF.text("Official Marksheet", 105, 48, null, null, "center");

        // Line
        docPDF.line(20, 55, 190, 55);



        // Student Info
        docPDF.setFontSize(12);
        docPDF.text("Student Name: " + studentName, 20, 60);
        docPDF.text("Register No: " + registerNo, 20, 70);
        docPDF.text("Exam ID: " + examId, 20, 80);
        docPDF.text("Exam Date: " + date, 20, 90);

        docPDF.line(20, 95, 190, 95);

        // Marks
        docPDF.text("Total Questions: " + resultData.total, 20, 110);
        docPDF.text("Correct Answers: " + resultData.correct, 20, 120);
        docPDF.text("Wrong Answers: " + resultData.wrong, 20, 130);
        docPDF.text("Not Attempted: " + resultData.notAttempted, 20, 140);

        // Percentage Box
        docPDF.setFillColor(240, 240, 240);
        docPDF.rect(120, 110, 60, 30, "F");

        docPDF.setFontSize(16);
        docPDF.text(percentage + "%", 150, 130, null, null, "center");

        // PASS / FAIL Badge
        if (status === "PASS") {
            docPDF.setFillColor(0, 150, 0);
        } else {
            docPDF.setFillColor(200, 0, 0);
        }

        docPDF.rect(70, 160, 70, 20, "F");

        docPDF.setTextColor(255, 255, 255);
        docPDF.text(status, 105, 173, null, null, "center");

        // Signature
        docPDF.setTextColor(0, 0, 0);
        docPDF.line(140, 200, 190, 200);
        docPDF.text("Controller of Examinations", 140, 210);

        docPDF.save("Official_Marksheet.pdf");
    };
}

