from flask import Flask, request, jsonify, send_from_directory
from flask_sslify import SSLify
import os

app = Flask(__name__)
sslify = SSLify(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'}), 400

    files = request.files.getlist('files')
    if not files:
        return jsonify({'error': 'No selected files'}), 400

    filenames = []
    for file in files:
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        filename = file.filename
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        filenames.append(filename)

    return jsonify({'filenames': filenames}), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80, ssl_context='adhoc')

