// --- DOM Elements ---
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toggleText = document.getElementById('toggle-text');
const toggleLink = document.getElementById('toggle-link');
const rocketContainer = document.getElementById('rocket-container');
const rocketBody = document.getElementById('rocket-body');
const messageBox = document.getElementById('message-box');
const launchStatus = document.getElementById('launch-status');

// Inputs
const loginUsername = document.getElementById('username');
const loginPassword = document.getElementById('password');
const regEmail = document.getElementById('email');
const regUsername = document.getElementById('reg-username');
const regPassword = document.getElementById('reg-password');

// Global state
let isLoginMode = true;

// --- Helpers ---
function hideMessage() {
    messageBox.classList.add('hidden');
    messageBox.textContent = '';
    messageBox.classList.remove('bg-red-800', 'bg-green-800');
}

function showMessage(message, isError = true) {
    hideMessage();
    messageBox.textContent = message;
    messageBox.classList.remove('hidden');
    messageBox.classList.add(isError ? 'bg-red-800' : 'bg-green-800');
}

function resetUI(clearInput = true) {
    rocketContainer.classList.remove('launching', 'tremor');
    rocketBody.classList.remove('active', 'fueled');
    launchStatus.classList.add('hidden');

    launchStatus.classList.remove('bg-red-800', 'text-red-200', 'border-red-500');
    launchStatus.classList.add('bg-gray-700', 'text-teal-400', 'border-teal-500');

    if (clearInput) {
        loginUsername.value = '';
        loginPassword.value = '';
        regEmail.value = '';
        regUsername.value = '';
        regPassword.value = '';
    }
}

// --- Input Tremor + Glow sequence ---
function attachInputSequence(firstInput, secondInput) {
    firstInput.addEventListener('input', () => {
        rocketContainer.classList.add('tremor');
        rocketBody.classList.add('fueled');
    });

    secondInput.addEventListener('input', () => {
        rocketContainer.classList.add('tremor');
        rocketBody.classList.add('fueled');
    });
}

// Attach to forms
attachInputSequence(loginUsername, loginPassword);
attachInputSequence(regEmail, regUsername);
attachInputSequence(regUsername, regPassword);

// --- Launch / Animation / API ---
async function handleAuth(event, form, isLogin) {
    event.preventDefault();
    hideMessage();

    // Validation
    if (isLogin) {
        if (!loginUsername.value || !loginPassword.value) {
            showMessage("Username and password are required.");
            return;
        }
    } else {
        if (!regEmail.value || !regUsername.value || !regPassword.value) {
            showMessage("All fields are required for registration.");
            return;
        }
    }

    // Step 1: Glow rocket (fuel)
    rocketContainer.classList.remove('tremor');
    rocketBody.classList.add('fueled');
    launchStatus.textContent = "Preparing Launch...";
    launchStatus.classList.remove('hidden');
    showMessage("🚀 Launching...", false);

    // Step 2: API request
    const url = isLogin ? '/user/login' : '/user/register';
    const bodyData = isLogin ?
        { username: loginUsername.value, password: loginPassword.value } :
        { email: regEmail.value, username: regUsername.value, password: regPassword.value };

    let apiResponse;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });
        apiResponse = await response.json();
        if (!response.ok) throw new Error(apiResponse.message || 'Server error');
    } catch (err) {
        apiResponse = { error: true, message: err.message || "Server error" };
    }

    // Step 3: Animate rocket launch
    rocketBody.classList.add('active');       // full flame
    rocketContainer.classList.add('launching'); // move up

    // Wait for CSS animation to finish before redirect
    const animationDuration = 3000; // match your CSS transform duration
    setTimeout(() => {
        if (apiResponse.error) {
            showMessage(apiResponse.message || "Authentication failed.", true);
            rocketBody.classList.remove('active', 'fueled');
            rocketContainer.classList.remove('launching');
            launchStatus.classList.add('hidden');
        } else {
            launchStatus.textContent = "Liftoff! 🚀 Reaching orbit...";
            showMessage("Success! 🚀", false);

            // Redirect after animation completes
            window.location.href = apiResponse.redirect;
        }
    }, animationDuration);
}

// --- Event bindings ---
loginForm.addEventListener('submit', (e) => handleAuth(e, loginForm, true));
registerForm.addEventListener('submit', (e) => handleAuth(e, registerForm, false));

toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
    toggleText.textContent = isLoginMode ? "New to the Vioma?" : "Already in orbit?";
    toggleLink.textContent = isLoginMode ? "Create Account" : "Sign In";
    hideMessage();
    resetUI(false);
});

window.onload = () => {
    console.log("🚀 Vioma Auth System Loaded");
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
};
