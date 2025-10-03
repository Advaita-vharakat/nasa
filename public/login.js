<script>
        // Global state
        let isLoginMode = true;

        // DOM elements
        const formTitle = document.getElementById('form-title');
        const formSubtitle = document.getElementById('form-subtitle');
        const submitButton = document.getElementById('submit-button');
        const confirmPasswordGroup = document.getElementById('confirm-password-group');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const toggleText = document.getElementById('toggle-text');
        const toggleLinkText = document.getElementById('toggle-link-text');
        const rocketContainer = document.getElementById('rocket-container');
        const rocketBody = document.getElementById('rocket-body');
        const messageBox = document.getElementById('message-box');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const launchStatus = document.getElementById('launch-status'); 

        // Define the sequential steps for the launch simulation
        const LAUNCH_STEPS = [
            { message: "Step 1/3: Validating Access Keys...", delay: 1000, isTremor: true },
            { message: "Step 2/3: Establishing Orbital Connection...", delay: 1500, isTremor: true },
            { message: "Step 3/3: Firing Test Igniters...", delay: 1000, isTremor: false }
        ];

        /**
         * Toggles between Login and Register modes.
         */
        function toggleMode(event) {
            event.preventDefault();
            isLoginMode = !isLoginMode;

            if (isLoginMode) {
                // Switch to Login
                formTitle.textContent = 'Welcome Stellar Traveler';
                formSubtitle.textContent = 'Sign in to dock your starship.';
                submitButton.textContent = 'Initiate Launch Sequence';
                toggleText.textContent = 'New to the cosmos?';
                toggleLinkText.textContent = 'Create Account';
                confirmPasswordGroup.classList.add('hidden');
                confirmPasswordInput.required = false;
            } else {
                // Switch to Register
                formTitle.textContent = 'New Mission Briefing';
                formSubtitle.textContent = 'Register a new orbital identity.';
                submitButton.textContent = 'Assemble and Launch';
                toggleText.textContent = 'Already in orbit?';
                toggleLinkText.textContent = 'Sign In';
                confirmPasswordGroup.classList.remove('hidden');
                confirmPasswordInput.required = true;
            }
            // Clear any previous messages and reset UI
            hideMessage();
            resetUI(false);
            updateRocketState();
        }

        /**
         * Hides the message box.
         */
        function hideMessage() {
            messageBox.classList.add('hidden');
            messageBox.textContent = '';
            messageBox.classList.remove('bg-red-800', 'bg-green-800');
        }

        /**
         * Displays a message in the message box.
         */
        function showMessage(message, isError = true) {
            hideMessage();
            messageBox.textContent = message;
            messageBox.classList.remove('hidden');
            messageBox.classList.add(isError ? 'bg-red-800' : 'bg-green-800');
        }
        
        /**
         * Updates the orbiter's visual state based on input
         */
        function updateRocketState() {
            const emailFilled = emailInput.value.length > 0;
            const passwordFilled = passwordInput.value.length > 0;
            const isReadyToFuel = isLoginMode ? passwordFilled : (passwordFilled && confirmPasswordInput.value.length > 0);

            // Step 1: Orbiter starts subtly trembling/powering up (Email entered)
            if (emailFilled) {
                rocketContainer.classList.add('tremor');
            } else {
                rocketContainer.classList.remove('tremor');
            }

            // Step 2: Orbiter is fueled/ready (All fields required for mode are filled)
            if (emailFilled && isReadyToFuel) {
                rocketBody.classList.add('fueled');
            } else {
                rocketBody.classList.remove('fueled');
            }
            
            // Ensure final launch classes are managed only by the launch sequence
            rocketBody.classList.remove('active');
            rocketContainer.classList.remove('launching');
        }

        /**
         * Resets the UI elements after a launch attempt.
         * @param {boolean} clearInput - If true, clears the input fields. Default is true (on success).
         */
        function resetUI(clearInput = true) {
            // Stop animations and hide status
            rocketContainer.classList.remove('launching', 'tremor');
            rocketBody.classList.remove('active', 'fueled'); // Resetting both states
            launchStatus.classList.add('hidden');
            
            // Reset status box styling
            launchStatus.classList.remove('bg-red-800', 'text-red-200', 'border-red-500');
            launchStatus.classList.add('bg-gray-700', 'text-teal-400', 'border-teal-500');

            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = isLoginMode ? 'Initiate Launch Sequence' : 'Assemble and Launch';
            
            // Clear inputs if required (typically on success)
            if (clearInput) {
                emailInput.value = '';
                passwordInput.value = '';
                confirmPasswordInput.value = '';
            }
            updateRocketState();
        }
        
        /**
         * Simulates the final network request for authentication after visual steps are complete.
         */
        function simulateAuthentication() {
            // 70% chance of success
            const success = Math.random() < 0.7; 

            // Update status to show we're waiting for backend
            launchStatus.textContent = "Awaiting Server Response...";
            rocketContainer.classList.remove('tremor'); // Stop tremor while waiting for response

            setTimeout(() => {
                if (success) {
                    // --- SUCCESS PATH: FULL LAUNCH ---
                    const successMessage = isLoginMode 
                        ? 'Docking successful: Welcome back, Commander!' 
                        : 'New Identity Established: Orbital access granted!';
                    
                    // Update final status text and style
                    launchStatus.textContent = "Liftoff! Successfully Reached Orbit.";
                    launchStatus.classList.remove('bg-gray-700', 'text-teal-400', 'border-teal-500');
                    launchStatus.classList.add('bg-green-800', 'text-green-200', 'border-green-400');
                    
                    // Initiate final visual launch (CSS transition handles 3s movement)
                    rocketContainer.classList.add('launching');
                    rocketBody.classList.add('active'); // Start full power plasma thruster animation

                    showMessage(successMessage, false);

                    // Wait for visual launch to complete (3s transition + 2s buffer) before full reset
                    setTimeout(() => resetUI(true), 5000); 

                } else {
                    // --- FAILURE PATH: ABORTED LAUNCH ---
                    const errorMessage = isLoginMode 
                        ? "Authentication failed. Invalid Access Key or Stellar Email."
                        : "Registration failed. That Stellar Email is already claimed.";

                    launchStatus.textContent = "Launch Aborted: Access Key Failure!";
                    launchStatus.classList.remove('bg-gray-700', 'text-teal-400', 'border-teal-500');
                    launchStatus.classList.add('bg-red-800', 'text-red-200', 'border-red-500');
                    
                    showMessage(errorMessage, true);
                    resetUI(false); // Reset animations immediately but keep error message and inputs
                }
            }, 1000); // Simulated network latency of 1 second
        }

        /**
         * Executes the step-by-step launch sequence recursively.
         */
        function runLaunchSequence(stepIndex) {
            // Check if all visual steps are completed
            if (stepIndex >= LAUNCH_STEPS.length) {
                // All visual steps are done, proceed to simulated authentication
                simulateAuthentication();
                return;
            }

            // --- INTERMEDIATE STEP EXECUTION ---
            const step = LAUNCH_STEPS[stepIndex];

            // Update status UI
            launchStatus.textContent = step.message;
            launchStatus.classList.remove('hidden');

            // Apply or remove tremor effect during intermediate steps
            if (step.isTremor) {
                rocketContainer.classList.add('tremor');
            } else {
                rocketContainer.classList.remove('tremor');
            }
            
            // Ensure the smaller flame/glow is active during the sequence until liftoff
            rocketBody.classList.add('fueled');


            // Move to the next step after the defined delay
            setTimeout(() => runLaunchSequence(stepIndex + 1), step.delay);
        }


        /**
         * Handles the form submission and triggers the step-by-step launch animation.
         */
        function handleLaunch(event) {
            event.preventDefault(); // Stop form from submitting normally
            hideMessage(); // Clear any previous general error messages

            // 0. Simple client-side validation
            if (!emailInput.value || !passwordInput.value) {
                showMessage("Email and password fields are required for launch.");
                return;
            }

            if (!isLoginMode) {
                if (passwordInput.value !== confirmPasswordInput.value) {
                    showMessage("Access keys do not match. Recheck your payload.");
                    return;
                }
            }
            
            // Check if rocket is fueled before launch (UX check)
            if (!rocketBody.classList.contains('fueled')) {
                 showMessage("Orbiter thrusters are not primed. Please ensure all required access keys are entered.", true);
                 return;
            }


            // 1. Disable the form and start the step-by-step sequence
            submitButton.disabled = true;
            submitButton.textContent = "Sequence Initiated...";
            
            // Start the recursive launch sequence
            runLaunchSequence(0);
        }

        // Add event listeners to trigger state updates on input for the orbiter effects
        emailInput.addEventListener('input', updateRocketState);
        passwordInput.addEventListener('input', updateRocketState);
        confirmPasswordInput.addEventListener('input', updateRocketState);


        // Initialize to Login mode on load
        window.onload = () => {
             console.log("Stellar Authentication System Loaded.");
             toggleMode({preventDefault: () => {}}); // Run toggle to set initial state correctly
        };

    </script>