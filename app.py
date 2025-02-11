from flask import Flask, request, send_file, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from pdf2image import convert_from_path
import fitz  # PyMuPDF
import pytesseract
import io
import os

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Change this to a random secret key
jwt = JWTManager(app)

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    # For simplicity, we'll just check if the username and password are both 'admin'
    if username != 'admin' or password != 'admin':
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)

@app.route('/generate_pdf', methods=['POST'])
@jwt_required()
def generate_pdf():
    data = request.json
    if not data or 'content' not in data:
        return {"error": "Please provide content to generate PDF."}, 400

    # Create PDF in memory
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    pdf.drawString(100, 750, data['content'])
    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name='generated.pdf', mimetype='application/pdf')

@app.route('/rotate_pdf', methods=['POST'])
@jwt_required()
def rotate_pdf():
    file = request.files['file']
    angle = int(request.form['angle'])

    with fitz.open(stream=file.read(), filetype='pdf') as doc:
        for page in doc:
            page.set_rotation(angle)
        rotated_pdf = io.BytesIO()
        doc.save(rotated_pdf)
        rotated_pdf.seek(0)
        return send_file(rotated_pdf, as_attachment=True, download_name='rotated.pdf', mimetype='application/pdf')

@app.route('/pdf_to_images', methods=['POST'])
@jwt_required()
def pdf_to_images():
    file = request.files['file']
    images = convert_from_path(file.stream)

    image_files = []
    for i, image in enumerate(images):
        img_io = io.BytesIO()
        image.save(img_io, 'PNG')
        img_io.seek(0)
        image_files.append(img_io)

    return send_file(image_files[0], as_attachment=True, download_name=f'page_1.png', mimetype='image/png')

@app.route('/extract_text', methods=['POST'])
@jwt_required()
def extract_text():
    file = request.files['file']
    with fitz.open(stream=file.read(), filetype='pdf') as doc:
        text = ""
        for page in doc:
            text += page.get_text()
    return jsonify({"text": text})

if __name__ == '__main__':
    app.run(debug=True)