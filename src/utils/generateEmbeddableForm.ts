import { IntakeFormConfig } from "../types/intakeForm";

/**
 * Generates a standalone HTML form that can be embedded in your website
 * This form will POST data to your backend API endpoint
 */
export function generateEmbeddableIntakeForm(formConfig: IntakeFormConfig, apiEndpoint: string): string {
  const fieldsHTML = formConfig.fields
    .filter((f) => f.enabled)
    .sort((a, b) => a.order - b.order)
    .map((field) => {
      const requiredAttr = field.required ? 'required' : '';
      const requiredLabel = field.required ? '<span style="color: red;">*</span>' : '';

      switch (field.type) {
        case "text":
          return `
            <div class="form-group">
              <label for="${field.id}">${field.label} ${requiredLabel}</label>
              <input
                type="text"
                id="${field.id}"
                name="${field.id}"
                placeholder="${field.placeholder || ''}"
                ${requiredAttr}
              />
            </div>`;

        case "textarea":
          return `
            <div class="form-group">
              <label for="${field.id}">${field.label} ${requiredLabel}</label>
              <textarea
                id="${field.id}"
                name="${field.id}"
                placeholder="${field.placeholder || ''}"
                rows="4"
                ${requiredAttr}
              ></textarea>
            </div>`;

        case "date":
          return `
            <div class="form-group">
              <label for="${field.id}">${field.label} ${requiredLabel}</label>
              <input
                type="date"
                id="${field.id}"
                name="${field.id}"
                ${requiredAttr}
              />
            </div>`;

        case "select":
          const selectOptions = field.options?.map(opt =>
            `<option value="${opt}">${opt}</option>`
          ).join('') || '';

          return `
            <div class="form-group">
              <label for="${field.id}">${field.label} ${requiredLabel}</label>
              <select id="${field.id}" name="${field.id}" ${requiredAttr}>
                <option value="">Select an option</option>
                ${selectOptions}
              </select>
              <input
                type="text"
                id="${field.id}_other"
                name="${field.id}_other"
                placeholder="Please specify"
                style="display: none; margin-top: 8px;"
              />
            </div>`;

        case "radio":
          const radioOptions = field.options?.map((opt, idx) =>
            `<label class="radio-label">
              <input type="radio" name="${field.id}" value="${opt}" ${requiredAttr}>
              ${opt}
            </label>`
          ).join('') || '';

          return `
            <div class="form-group">
              <label>${field.label} ${requiredLabel}</label>
              <div class="radio-group">
                ${radioOptions}
              </div>
            </div>`;

        default:
          return '';
      }
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formConfig.title}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #1a202c;
      font-size: 28px;
      margin-bottom: 12px;
      font-weight: 700;
    }

    .description {
      color: #4a5568;
      font-size: 16px;
      margin-bottom: 32px;
      line-height: 1.5;
    }

    .form-group {
      margin-bottom: 24px;
    }

    label {
      display: block;
      color: #2d3748;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }

    input[type="text"],
    input[type="date"],
    textarea,
    select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.2s;
      font-family: inherit;
    }

    input:focus,
    textarea:focus,
    select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .radio-label {
      display: flex;
      align-items: center;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: normal;
    }

    .radio-label:hover {
      border-color: #cbd5e0;
      background: #f7fafc;
    }

    .radio-label input {
      margin-right: 12px;
    }

    button {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 32px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-top: 16px;
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    }

    button:active {
      transform: translateY(0);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .success-message {
      background: #48bb78;
      color: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: none;
    }

    .error-message {
      background: #f56565;
      color: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: none;
    }

    @media (max-width: 640px) {
      .container {
        padding: 24px 16px;
      }

      h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-message" id="successMessage">
      Thank you! Your form has been submitted successfully.
    </div>

    <div class="error-message" id="errorMessage">
      There was an error submitting your form. Please try again.
    </div>

    <h1>${formConfig.title}</h1>
    <p class="description">${formConfig.description}</p>

    <form id="intakeForm">
      ${fieldsHTML}

      <button type="submit" id="submitBtn">Submit Form</button>
    </form>
  </div>

  <script>
    const form = document.getElementById('intakeForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Handle "Other" option for select fields
    document.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', function() {
        const otherId = this.id + '_other';
        const otherInput = document.getElementById(otherId);
        if (otherInput) {
          if (this.value === 'Other') {
            otherInput.style.display = 'block';
            otherInput.required = true;
          } else {
            otherInput.style.display = 'none';
            otherInput.required = false;
            otherInput.value = '';
          }
        }
      });
    });

    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      successMessage.style.display = 'none';
      errorMessage.style.display = 'none';

      // Collect form data
      const formData = new FormData(form);
      const data = {};

      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }

      try {
        const response = await fetch('${apiEndpoint}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          successMessage.style.display = 'block';
          form.reset();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          throw new Error('Submission failed');
        }
      } catch (error) {
        console.error('Error:', error);
        errorMessage.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Form';
      }
    });
  </script>
</body>
</html>`;
}

export function getEmbedCode(formUrl: string): string {
  return `<!-- Embed this code in your website -->
<iframe
  src="${formUrl}"
  width="100%"
  height="800"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>`;
}
