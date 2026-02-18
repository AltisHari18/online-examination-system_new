import { auth, db } from "./firebase-config.js";

import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import { 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

document.getElementById("loginBtn").addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const selectedRole = document.getElementById("role").value;

    try {

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {

            const actualRole = userDoc.data().role;

            if (actualRole === selectedRole) {

                if (actualRole === "student") {
                    window.location.href = "student.html";
                } else {
                    window.location.href = "teacher.html";
                }

            } else {
                document.getElementById("message").innerText =
                    "Incorrect role selected!";
            }

        } else {
            document.getElementById("message").innerText =
                "User data not found.";
        }

    } catch (error) {
        document.getElementById("message").innerText = error.message;
    }
});


document.getElementById("registerBtn").addEventListener("click", async () => {

    console.log("Register clicked");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            role: role
        });

        document.getElementById("message").innerText =
            "Registration Successful!";

    } catch (error) {
        document.getElementById("message").innerText = error.message;
    }
});
