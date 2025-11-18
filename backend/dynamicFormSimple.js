const express = require('express');
const router = express.Router();

// Serve the dynamic participant intake form
// This version fetches the form config client-side from Firebase
router.get('/forms/participant-intake', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Participant Intake Form</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-center;
        }

        .container {
            max-width: 600px;
            width: 100%;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
        }

        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }

        .description {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .form-group {
            margin-bottom: 24px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
            font-size: 14px;
        }

        .required {
            color: #e74c3c;
            margin-left: 4px;
        }

        input[type="text"],
        input[type="date"],
        input[type="email"],
        input[type="tel"],
        input[type="number"],
        select,
        textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 15px;
            transition: all 0.3s ease;
            font-family: inherit;
        }

        input:focus,
        select:focus,
        textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        textarea {
            resize: vertical;
            min-height: 100px;
        }

        .conditional-field {
            margin-left: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            margin-top: 12px;
        }

        button {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        button:active {
            transform: translateY(0);
        }

        button:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }

        .success-message {
            display: none;
            background: #d4edda;
            border: 2px solid #c3e6cb;
            color: #155724;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }

        .error-message {
            display: none;
            background: #f8d7da;
            border: 2px solid #f5c6cb;
            color: #721c24;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .loading {
            text-align: center;
            padding: 40px;
        }

        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
            .container {
                padding: 24px;
            }

            h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="loading" id="loadingDiv">
            <div class="spinner"></div>
            <p style="margin-top: 20px; color: #666;">Loading form...</p>
        </div>

        <div id="formContainer" style="display: none;">
            <h1 id="formTitle">Participant Intake Form</h1>
            <p class="description" id="formDescription">Please fill out this form to apply for our program</p>

            <div class="success-message" id="successMessage">
                ✅ Thank you! Your submission has been received successfully.
            </div>

            <div class="error-message" id="errorMessage"></div>

            <form id="intakeForm"></form>
        </div>
    </div>

    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getDatabase, ref, get, push, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyAiYOUSiYKcgn-uAGi_rMLwMmNyENMSq20",
            authDomain: "sevenmore-app-5a969.firebaseapp.com",
            databaseURL: "https://sevenmore-app-5a969-default-rtdb.firebaseio.com",
            projectId: "sevenmore-app-5a969",
            storageBucket: "sevenmore-app-5a969.firebasestorage.app",
            messagingSenderId: "110371002953",
            appId: "1:110371002953:web:79c44b39188e2649a0fd98"
        };

        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);

        // Default form configuration
        const defaultFormConfig = {
            title: 'Participant Intake Form',
            description: 'Please fill out this form to apply for our program',
            fields: [
                {
                    id: 'participantNumber',
                    label: 'Participant Number',
                    type: 'text',
                    required: true,
                    enabled: true,
                    order: 1
                },
                {
                    id: 'firstName',
                    label: 'First Name',
                    type: 'text',
                    required: true,
                    enabled: true,
                    order: 2
                },
                {
                    id: 'lastName',
                    label: 'Last Name',
                    type: 'text',
                    required: true,
                    enabled: true,
                    order: 3
                },
                {
                    id: 'dateOfBirth',
                    label: 'Date of Birth',
                    type: 'date',
                    required: true,
                    enabled: true,
                    order: 4
                },
                {
                    id: 'gender',
                    label: 'Gender',
                    type: 'select',
                    options: ['Male', 'Female', 'Other'],
                    required: true,
                    enabled: true,
                    order: 5
                },
                {
                    id: 'releaseDate',
                    label: 'Release Date',
                    type: 'date',
                    required: true,
                    enabled: true,
                    order: 6
                },
                {
                    id: 'releasedFrom',
                    label: 'Released From Facility',
                    type: 'select',
                    options: ['Pam Lychner', 'TDCJ', 'Federal', 'County', 'Other'],
                    required: true,
                    enabled: true,
                    order: 7
                }
            ]
        };

        // Load form configuration from Firebase
        async function loadFormConfig() {
            try {
                const formConfigRef = ref(database, 'formConfig/participantIntake');
                const snapshot = await get(formConfigRef);

                if (snapshot.exists()) {
                    return snapshot.val();
                } else {
                    // Use default and save it to Firebase
                    await set(formConfigRef, defaultFormConfig);
                    return defaultFormConfig;
                }
            } catch (error) {
                console.error('Error loading form config:', error);
                return defaultFormConfig;
            }
        }

        // Generate form HTML
        function generateFormHTML(formConfig) {
            const enabledFields = formConfig.fields
                .filter(f => f.enabled)
                .sort((a, b) => a.order - b.order);

            let html = '';
            enabledFields.forEach(field => {
                html += '<div class="form-group">';
                html += '<label for="' + field.id + '">' + field.label;
                if (field.required) {
                    html += '<span class="required">*</span>';
                }
                html += '</label>';

                switch (field.type) {
                    case 'text':
                    case 'email':
                    case 'tel':
                    case 'number':
                        html += '<input type="' + field.type + '" id="' + field.id + '" name="' + field.id + '" ' + (field.required ? 'required' : '') + (field.placeholder ? ' placeholder="' + field.placeholder + '"' : '') + '>';
                        break;

                    case 'date':
                        html += '<input type="date" id="' + field.id + '" name="' + field.id + '" ' + (field.required ? 'required' : '') + '>';
                        break;

                    case 'select':
                        html += '<select id="' + field.id + '" name="' + field.id + '" ' + (field.required ? 'required' : '') + '>';
                        html += '<option value="">Select...</option>';
                        if (field.options && Array.isArray(field.options)) {
                            field.options.forEach(option => {
                                html += '<option value="' + option + '">' + option + '</option>';
                            });
                        }
                        html += '</select>';

                        // Add conditional "Other" field
                        if (field.options && field.options.includes('Other')) {
                            html += '<div id="' + field.id + '_other_field" class="conditional-field" style="display: none;">';
                            html += '<label for="' + field.id + '_other">Please specify:</label>';
                            html += '<input type="text" id="' + field.id + '_other" name="' + field.id + '_other" placeholder="Enter details">';
                            html += '</div>';
                        }
                        break;

                    case 'textarea':
                        html += '<textarea id="' + field.id + '" name="' + field.id + '" ' + (field.required ? 'required' : '') + (field.placeholder ? ' placeholder="' + field.placeholder + '"' : '') + '></textarea>';
                        break;
                }

                html += '</div>';
            });

            html += '<button type="submit" id="submitBtn">Submit Application</button>';
            return html;
        }

        // Initialize form
        async function initForm() {
            const formConfig = await loadFormConfig();

            // Update title and description
            document.getElementById('formTitle').textContent = formConfig.title || 'Participant Intake Form';
            document.getElementById('formDescription').textContent = formConfig.description || 'Please fill out this form to apply for our program';

            // Generate form fields
            const formHTML = generateFormHTML(formConfig);
            document.getElementById('intakeForm').innerHTML = formHTML;

            // Show form, hide loading
            document.getElementById('loadingDiv').style.display = 'none';
            document.getElementById('formContainer').style.display = 'block';

            // Setup event handlers
            setupEventHandlers();
        }

        // Setup event handlers
        function setupEventHandlers() {
            const form = document.getElementById('intakeForm');
            const submitBtn = document.getElementById('submitBtn');
            const successMessage = document.getElementById('successMessage');
            const errorMessage = document.getElementById('errorMessage');

            // Handle conditional fields
            const releasedFromSelect = document.querySelector('select[name="releasedFrom"]');
            if (releasedFromSelect) {
                releasedFromSelect.addEventListener('change', (e) => {
                    const otherField = document.getElementById('releasedFrom_other_field');
                    if (otherField) {
                        otherField.style.display = e.target.value === 'Other' ? 'block' : 'none';
                        const otherInput = document.querySelector('input[name="releasedFrom_other"]');
                        if (otherInput) {
                            otherInput.required = e.target.value === 'Other';
                        }
                    }
                });
            }

            // Handle form submission
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                submitBtn.disabled = true;
                submitBtn.innerHTML = '<div class="spinner"></div>';
                successMessage.style.display = 'none';
                errorMessage.style.display = 'none';

                try {
                    const formData = new FormData(form);
                    const data = {};

                    for (const [key, value] of formData.entries()) {
                        data[key] = value;
                    }

                    // Calculate age
                    if (data.dateOfBirth) {
                        const dob = new Date(data.dateOfBirth);
                        const today = new Date();
                        let age = today.getFullYear() - dob.getFullYear();
                        const monthDiff = today.getMonth() - dob.getMonth();
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                            age--;
                        }
                        data.age = age;
                    }

                    // Calculate time out
                    if (data.releaseDate) {
                        const release = new Date(data.releaseDate);
                        const today = new Date();
                        const diffTime = Math.abs(today - release);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        data.timeOut = diffDays;
                    }

                    // Handle "Other" field
                    if (data.releasedFrom === 'Other' && data.releasedFrom_other) {
                        data.releasedFrom = data.releasedFrom_other;
                        delete data.releasedFrom_other;
                    }

                    // Add metadata
                    data.status = 'pending_bridge';
                    data.createdAt = new Date().toISOString();
                    data.submittedVia = 'web_form';

                    // Save to Firebase
                    const participantsRef = ref(database, 'participants');
                    const newParticipantRef = push(participantsRef);
                    await set(newParticipantRef, data);

                    // Show success
                    successMessage.style.display = 'block';
                    form.reset();
                    submitBtn.innerHTML = 'Submit Application';
                    submitBtn.disabled = false;
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                } catch (error) {
                    console.error('Submission error:', error);
                    errorMessage.textContent = 'There was an error submitting your application. Please try again or contact support.';
                    errorMessage.style.display = 'block';
                    submitBtn.innerHTML = 'Submit Application';
                    submitBtn.disabled = false;
                }
            });
        }

        // Start the application
        initForm();
    </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router;
