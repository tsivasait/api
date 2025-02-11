document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const generatePdfForm = document.getElementById('generate-pdf-form');
    const rotatePdfForm = document.getElementById('rotate-pdf-form');
    const pdfToImagesForm = document.getElementById('pdf-to-images-form');
    const extractTextForm = document.getElementById('extract-text-form');
    const apiSection = document.getElementById('api-section');
    let jwtToken = '';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            jwtToken = data.access_token;
            loginForm.style.display = 'none';
            apiSection.style.display = 'block';
        } else {
            alert(data.msg);
        }
    });

    generatePdfForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('pdf-content').value;

        const response = await fetch('/generate_pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ content }),
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'generated.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert('Failed to generate PDF');
        }
    });

    rotatePdfForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = document.getElementById('rotate-file').files[0];
        const angle = document.getElementById('rotate-angle').value;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('angle', angle);

        const response = await fetch('/rotate_pdf', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: formData,
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'rotated.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert('Failed to rotate PDF');
        }
    });

    pdfToImagesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = document.getElementById('pdf-to-images-file').files[0];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/pdf_to_images', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: formData,
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'page_1.png';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert('Failed to convert PDF to images');
        }
    });

    extractTextForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = document.getElementById('extract-text-file').files[0];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/extract_text', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.text);
        } else {
            alert('Failed to extract text from PDF');
        }
    });
});