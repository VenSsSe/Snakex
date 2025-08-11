const firebaseConfig = {
  apiKey: "AIzaSyBniVsX7k1dgELNUIFuPsN0fDXe2OY79Co",
  authDomain: "snakematrixai.firebaseapp.com",
  projectId: "snakematrixai",
  storageBucket: "snakematrixai.firebasestorage.app",
  messagingSenderId: "981820034809",
  appId: "1:981820034809:web:f9dd41e1d036b3ec119c28",
  measurementId: "G-LX7K63LJ2N"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    const email = emailInput.value;
    const password = passwordInput.value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            console.log('User logged in');
            window.location.href = 'app.html'; // Redirect to the main app page
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        });
});