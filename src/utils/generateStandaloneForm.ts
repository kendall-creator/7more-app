import { IntakeFormConfig } from "../types/intakeForm";

/**
 * Generates a standalone HTML intake form that can be hosted anywhere
 * This creates a fully functional, self-contained form with API integration
 */
export const generateStandaloneIntakeForm = (
  formConfig: IntakeFormConfig,
  apiEndpoint: string = "YOUR_API_ENDPOINT_HERE"
): string => {
  const fieldsJson = JSON.stringify(formConfig.fields.filter(f => f.enabled).sort((a, b) => a.order - b.order));

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formConfig.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
            padding: 40px 30px;
            color: white;
        }

        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }

        .header p {
            font-size: 16px;
            opacity: 0.9;
        }

        .form-content {
            padding: 30px;
        }

        .form-group {
            margin-bottom: 24px;
        }

        label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }

        .required {
            color: #EF4444;
        }

        input[type="text"],
        input[type="date"],
        textarea,
        select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #E5E7EB;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.2s;
            background: #F9FAFB;
            font-family: inherit;
        }

        textarea {
            min-height: 100px;
            resize: vertical;
        }

        input:focus,
        textarea:focus,
        select:focus {
            outline: none;
            border-color: #4F46E5;
            background: white;
        }

        .radio-group,
        .select-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .option-button {
            padding: 12px 16px;
            border: 2px solid #E5E7EB;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
        }

        .option-button:hover {
            border-color: #4F46E5;
        }

        .option-button.selected {
            border-color: #4F46E5;
            background: #EEF2FF;
            color: #4F46E5;
        }

        .other-input {
            margin-top: 12px;
            display: none;
        }

        .other-input.show {
            display: block;
        }

        .submit-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s;
            margin-top: 10px;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
        }

        .submit-btn:active {
            transform: translateY(0);
        }

        .submit-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .message {
            display: none;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            text-align: center;
        }

        .message.show {
            display: block;
        }

        .success-message {
            background: #D1FAE5;
            border: 2px solid #10B981;
            color: #065F46;
        }

        .error-message {
            background: #FEE2E2;
            border: 2px solid #EF4444;
            color: #991B1B;
        }

        @media (max-width: 640px) {
            body {
                padding: 10px;
            }

            .header {
                padding: 30px 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .form-content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${formConfig.title}</h1>
            <p>${formConfig.description}</p>
        </div>

        <div class="form-content">
            <div id="successMessage" class="message success-message">
                <h3>✓ Form Submitted Successfully!</h3>
                <p>Thank you! Your information has been received. Our Bridge Team will contact you soon.</p>
            </div>

            <div id="errorMessage" class="message error-message"></div>

            <form id="intakeForm">
                <div id="formFields"></div>

                <button type="submit" class="submit-btn" id="submitBtn">Submit Form</button>
            </form>
        </div>
    </div>

    <script>
        // Form configuration - automatically updated from your app
        const formFields = ${fieldsJson};
        const apiEndpoint = '${apiEndpoint}';

        // Render form fields dynamically
        function renderFormFields() {
            const container = document.getElementById('formFields');
            container.innerHTML = '';

            formFields.forEach(field => {
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'form-group';
                fieldDiv.id = 'field-' + field.id;

                const label = document.createElement('label');
                label.innerHTML = field.label + (field.required ? ' <span class="required">*</span>' : '');
                fieldDiv.appendChild(label);

                switch (field.type) {
                    case 'text':
                    case 'textarea':
                        const input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
                        if (field.type === 'text') input.type = 'text';
                        input.name = field.id;
                        input.placeholder = field.placeholder || '';
                        input.required = field.required;
                        fieldDiv.appendChild(input);
                        break;

                    case 'date':
                        const dateInput = document.createElement('input');
                        dateInput.type = 'date';
                        dateInput.name = field.id;
                        dateInput.required = field.required;
                        if (field.id === 'dateOfBirth') {
                            dateInput.max = new Date().toISOString().split('T')[0];
                        }
                        fieldDiv.appendChild(dateInput);
                        break;

                    case 'radio':
                        const radioGroup = document.createElement('div');
                        radioGroup.className = 'radio-group';
                        field.options.forEach(option => {
                            const btn = document.createElement('button');
                            btn.type = 'button';
                            btn.className = 'option-button';
                            btn.textContent = option;
                            btn.onclick = function() {
                                radioGroup.querySelectorAll('.option-button').forEach(b => b.classList.remove('selected'));
                                btn.classList.add('selected');
                                const hiddenInput = document.querySelector('input[name="' + field.id + '"]');
                                if (hiddenInput) hiddenInput.value = option;
                            };
                            radioGroup.appendChild(btn);
                        });
                        const hiddenRadio = document.createElement('input');
                        hiddenRadio.type = 'hidden';
                        hiddenRadio.name = field.id;
                        hiddenRadio.required = field.required;
                        radioGroup.appendChild(hiddenRadio);
                        fieldDiv.appendChild(radioGroup);
                        break;

                    case 'select':
                        const selectGroup = document.createElement('div');
                        selectGroup.className = 'select-group';

                        field.options.forEach(option => {
                            const btn = document.createElement('button');
                            btn.type = 'button';
                            btn.className = 'option-button';
                            btn.textContent = option;
                            btn.onclick = function() {
                                selectGroup.querySelectorAll('.option-button').forEach(b => b.classList.remove('selected'));
                                btn.classList.add('selected');
                                const hiddenInput = document.querySelector('input[name="' + field.id + '"]');
                                if (hiddenInput) {
                                    hiddenInput.value = option;
                                }

                                // Handle "Other" option
                                const otherDiv = document.getElementById('other-' + field.id);
                                if (option === 'Other' && otherDiv) {
                                    otherDiv.classList.add('show');
                                } else if (otherDiv) {
                                    otherDiv.classList.remove('show');
                                    const otherInput = otherDiv.querySelector('input');
                                    if (otherInput) otherInput.value = '';
                                }
                            };
                            selectGroup.appendChild(btn);
                        });

                        const hiddenSelect = document.createElement('input');
                        hiddenSelect.type = 'hidden';
                        hiddenSelect.name = field.id;
                        hiddenSelect.required = field.required;
                        selectGroup.appendChild(hiddenSelect);
                        fieldDiv.appendChild(selectGroup);

                        // Add "Other" input if "Other" is an option
                        if (field.options.includes('Other')) {
                            const otherDiv = document.createElement('div');
                            otherDiv.id = 'other-' + field.id;
                            otherDiv.className = 'other-input';
                            const otherLabel = document.createElement('label');
                            otherLabel.textContent = 'Please specify:';
                            otherDiv.appendChild(otherLabel);
                            const otherInput = document.createElement('input');
                            otherInput.type = 'text';
                            otherInput.name = field.id + '_other';
                            otherInput.placeholder = 'Enter ' + field.label.toLowerCase();
                            otherDiv.appendChild(otherInput);
                            fieldDiv.appendChild(otherDiv);
                        }
                        break;
                }

                container.appendChild(fieldDiv);
            });
        }

        // Form submission
        document.getElementById('intakeForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            // Validate "Other" fields
            formFields.forEach(field => {
                if (field.type === 'select' && data[field.id] === 'Other') {
                    const otherValue = data[field.id + '_other'];
                    if (!otherValue || !otherValue.trim()) {
                        alert('Please specify ' + field.label.toLowerCase());
                        throw new Error('Missing other value');
                    }
                    data[field.id] = otherValue;
                }
            });

            // Calculate age and time out
            const dob = new Date(data.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            const releaseDate = new Date(data.releaseDate);
            const diffTime = Math.abs(today.getTime() - releaseDate.getTime());
            const timeOut = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Prepare submission
            const submissionData = {
                participantNumber: data.participantNumber,
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: new Date(data.dateOfBirth).toISOString(),
                age: age,
                gender: data.gender,
                releaseDate: new Date(data.releaseDate).toISOString(),
                timeOut: timeOut,
                releasedFrom: data.releasedFrom,
                status: 'pending_bridge',
                submittedAt: new Date().toISOString()
            };

            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            try {
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submissionData)
                });

                if (response.ok) {
                    document.getElementById('successMessage').classList.add('show');
                    document.getElementById('errorMessage').classList.remove('show');
                    this.reset();
                    document.querySelectorAll('.option-button').forEach(btn => btn.classList.remove('selected'));
                    document.querySelectorAll('.other-input').forEach(div => div.classList.remove('show'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                document.getElementById('errorMessage').textContent = 'There was an error submitting your form. Please try again or contact us directly.';
                document.getElementById('errorMessage').classList.add('show');
                document.getElementById('successMessage').classList.remove('show');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Form';
            }
        });

        // Initialize form
        renderFormFields();
    </script>
</body>
</html>`;
};

// Generate instructions for deploying the form
export const getDeploymentInstructions = () => {
  return `
# How to Deploy Your Intake Form

## Option 1: Free Hosting with GitHub Pages (Recommended)

1. Create a GitHub account at https://github.com
2. Create a new repository (name it "intake-form")
3. Upload the HTML file (name it "index.html")
4. Go to Settings > Pages
5. Select "Deploy from main branch"
6. Your form will be live at: https://[your-username].github.io/intake-form/

## Option 2: Netlify Drop (Super Easy)

1. Go to https://app.netlify.com/drop
2. Drag and drop your HTML file
3. Get instant live URL (e.g., https://random-name.netlify.app)
4. Optional: Claim site to customize URL

## Option 3: Vercel (Professional)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Upload your HTML file
5. Get instant deployment with custom domain support

## Option 4: Your Own Web Server

1. Upload the HTML file to your web hosting
2. Access it at: https://your-domain.com/intake-form.html

## Important: API Setup

After deploying, you need to update the API endpoint in the HTML file:

1. Open the HTML file in a text editor
2. Find: const apiEndpoint = 'YOUR_API_ENDPOINT_HERE';
3. Replace with your actual API URL
4. Re-upload the file

Your API endpoint should accept POST requests with this JSON format:
{
  "participantNumber": "string",
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "ISO date string",
  "age": number,
  "gender": "string",
  "releaseDate": "ISO date string",
  "timeOut": number,
  "releasedFrom": "string",
  "status": "pending_bridge",
  "submittedAt": "ISO date string"
}

## Tips

- The form automatically updates with your field changes
- Works on mobile and desktop
- No backend required until you're ready
- Free options work great for nonprofits
`;
};
