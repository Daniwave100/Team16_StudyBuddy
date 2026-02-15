const loginForm = document.getElementById('login-form')
const loginMsg = document.getElementById('login-msg');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const email =  document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            loginMsg.textContent = 'Please enter both email and password.';
            return;
        }

        const storedEmail = localStorage.getItem('userEmail');
        const storedPassword = localStorage.getItem('userPassword');

        if (email === storedEmail && password === storedPassword) {
            loginMsg.textContent = "Login successful!";
            loginMsg.classList.add("ok");
            loginForm.classList.remove("error");
            return;
        } else {
            loginMsg.textContent = "Invalid email or password.";
            loginMsg.classList.add("error");
            loginForm.classList.remove("ok");
        }

    });
}

const signupForm = document.getElementById('signup-form');
const signupMsg = document.getElementById('signup-msg');

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm  = document.getElementById('confirm-password').value;

        if (!email || !password || !confirm) {
            signupMsg.textContent = "Please fill in all fields.";
            signupMsg.classList.add("error");
            signupForm.classList.remove("ok");
            return;
        }

        if (password !== confirm) {
            signupMsg.textContent = "Passwords do not match.";
            signupMsg.classList.add("error");
            signupForm.classList.remove("ok");
            return;
        }

        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);

        signupMsg.textContent = "Signup successful! You can now log in.";
        signupMsg.classList.add("ok");
        signupForm.classList.remove("error");
    });
}