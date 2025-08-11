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
const db = firebase.firestore();

const registerForm = document.getElementById('register-form');
const loginInput = document.getElementById('login');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordReverseInput = document.getElementById('password_reverse');
const finalCheckbox = document.getElementById('final_checkbox');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');

// Basic validation for button enabling
const validateForm = () => {
    const passwordsMatch = passwordInput.value === passwordReverseInput.value && passwordInput.value.length > 0;
    const isChecked = finalCheckbox.checked;
    const emailIsValid = emailInput.value.includes('@');
    submitBtn.disabled = !(passwordsMatch && isChecked && emailIsValid && loginInput.value.length > 0);
};

passwordInput.addEventListener('input', validateForm);
passwordReverseInput.addEventListener('input', validateForm);
finalCheckbox.addEventListener('change', validateForm);
emailInput.addEventListener('input', validateForm);
loginInput.addEventListener('input', validateForm);


registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    const email = emailInput.value;
    const password = passwordInput.value;
    const login = loginInput.value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // Now store additional info in Firestore
            return db.collection('users').doc(user.uid).set({
                login: login,
                email: email
            });
        })
        .then(() => {
            console.log('User registered and data stored in Firestore');
            window.location.href = 'login.html';
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        });
});