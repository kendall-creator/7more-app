/**
 * Generates standalone HTML for the participant intake form
 * This HTML can be hosted on any web server and will submit data to your app's API
 */

export const generateIntakeFormHTML = (apiEndpoint: string = "https://your-api-endpoint.com/api/intake") => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Participant Intake Form - 7MORE</title>
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
        select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #E5E7EB;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.2s;
            background: #F9FAFB;
        }

        input:focus,
        select:focus {
            outline: none;
            border-color: #4F46E5;
            background: white;
        }

        .gender-group {
            display: flex;
            gap: 12px;
        }

        .gender-option {
            flex: 1;
            padding: 12px;
            border: 2px solid #E5E7EB;
            border-radius: 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            background: white;
        }

        .gender-option:hover {
            border-color: #4F46E5;
        }

        .gender-option.selected {
            border-color: #4F46E5;
            background: #EEF2FF;
            color: #4F46E5;
            font-weight: 600;
        }

        .gender-option input {
            display: none;
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

        .success-message {
            display: none;
            background: #D1FAE5;
            border: 2px solid #10B981;
            color: #065F46;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            text-align: center;
        }

        .success-message.show {
            display: block;
        }

        .error-message {
            display: none;
            background: #FEE2E2;
            border: 2px solid #EF4444;
            color: #991B1B;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            text-align: center;
        }

        .error-message.show {
            display: block;
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
            <h1>Participant Intake Form</h1>
            <p>Please complete all fields to begin your journey with us</p>
        </div>

        <div class="form-content">
            <div id="successMessage" class="success-message">
                <h3>✓ Form Submitted Successfully!</h3>
                <p>Thank you! Your information has been received. Our Bridge Team will contact you soon.</p>
            </div>

            <div id="errorMessage" class="error-message"></div>

            <form id="intakeForm">
                <div class="form-group">
                    <label>Participant Number <span class="required">*</span></label>
                    <input type="text" id="participantNumber" name="participantNumber" required placeholder="Enter your participant number">
                </div>

                <div class="form-group">
                    <label>First Name <span class="required">*</span></label>
                    <input type="text" id="firstName" name="firstName" required placeholder="First name">
                </div>

                <div class="form-group">
                    <label>Last Name <span class="required">*</span></label>
                    <input type="text" id="lastName" name="lastName" required placeholder="Last name">
                </div>

                <div class="form-group">
                    <label>Date of Birth <span class="required">*</span></label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth" required>
                </div>

                <div class="form-group">
                    <label>Gender <span class="required">*</span></label>
                    <div class="gender-group">
                        <label class="gender-option">
                            <input type="radio" name="gender" value="Male" required>
                            <span>Male</span>
                        </label>
                        <label class="gender-option">
                            <input type="radio" name="gender" value="Female" required>
                            <span>Female</span>
                        </label>
                        <label class="gender-option">
                            <input type="radio" name="gender" value="Other" required>
                            <span>Other</span>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label>Release Date <span class="required">*</span></label>
                    <input type="date" id="releaseDate" name="releaseDate" required>
                </div>

                <div class="form-group">
                    <label>Facility Released From <span class="required">*</span></label>
                    <input type="text" id="releasedFrom" name="releasedFrom" required placeholder="Facility name">
                </div>

                <button type="submit" class="submit-btn">Submit Form</button>
            </form>
        </div>
    </div>

    <script>
        // Gender selection styling
        document.querySelectorAll('.gender-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.gender-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                this.querySelector('input').checked = true;
            });
        });

        // Form submission
        document.getElementById('intakeForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            // Calculate age
            const dob = new Date(data.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            // Calculate time out
            const releaseDate = new Date(data.releaseDate);
            const diffTime = Math.abs(today.getTime() - releaseDate.getTime());
            const timeOut = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Prepare submission data
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
                status: "pending_bridge",
                submittedAt: new Date().toISOString()
            };

            try {
                // Submit to your API endpoint
                const response = await fetch('${apiEndpoint}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submissionData)
                });

                if (response.ok) {
                    // Show success message
                    document.getElementById('successMessage').classList.add('show');
                    document.getElementById('errorMessage').classList.remove('show');

                    // Reset form
                    this.reset();
                    document.querySelectorAll('.gender-option').forEach(opt => opt.classList.remove('selected'));

                    // Scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                // Show error message
                document.getElementById('errorMessage').textContent = 'There was an error submitting your form. Please try again or contact us directly.';
                document.getElementById('errorMessage').classList.add('show');
                document.getElementById('successMessage').classList.remove('show');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    </script>
</body>
</html>`;
};

// Function to export the HTML to a shareable format
export const exportIntakeFormHTML = () => {
  const html = generateIntakeFormHTML();
  return {
    html,
    filename: "participant-intake-form.html",
    instructions: `
To use this intake form on your website:

1. OPTION A - Host as standalone page:
   - Save the HTML file to your web server
   - Access it at: https://your-domain.com/intake-form.html
   - Share this URL with participants

2. OPTION B - Embed in existing page:
   - Use an iframe:
     <iframe src="https://your-domain.com/intake-form.html" width="100%" height="900px" frameborder="0"></iframe>

3. OPTION C - Direct integration:
   - Copy the HTML content into your existing website
   - Customize the styling to match your brand

4. API Setup Required:
   - Update the API endpoint in the HTML (line with fetch())
   - Create a backend endpoint to receive form submissions
   - The endpoint should accept POST requests with participant data
   - Data will be sent in JSON format

Note: Currently, the form will attempt to submit to a placeholder API.
You need to set up a proper backend endpoint to receive submissions.
    `.trim(),
  };
};
