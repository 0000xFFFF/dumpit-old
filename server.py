#!/usr/bin/env python3

import os
import pwd
import argparse
from flask import Flask, request, jsonify, send_from_directory
from flask_sslify import SSLify

parser = argparse.ArgumentParser(description='HTTP(s) web file server for just uploading files')

parser.add_argument('-u', '--user', metavar='user', type=str, help="user that should own the uploaded files")
parser.add_argument('-i', '--ip', metavar='string', type=str, default="0.0.0.0", help="IP for the server (default: '0.0.0.0' - all ips)")
parser.add_argument('-p', '--port', metavar='string', type=str, default="443", help="port for the server (default: '443' - https)")

args = parser.parse_args()


# Get the UID and GID of the specified user
if args.user:
    try:
        pw_record = pwd.getpwnam(args.user)
        user_uid = pw_record.pw_uid
        user_gid = pw_record.pw_gid
    except KeyError:
        print(f"User {args.user} does not exist.")
        exit(1)
else:
    user_uid = os.getuid()
    user_gid = os.getgid()

app = Flask(
    __name__,
    static_url_path='',
    static_folder="static/"
)
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
    failed_files = []

    for file in files:
        if file.filename == '':
            failed_files.append('No selected file')
            continue

        try:
            filename = file.filename
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            os.chown(os.path.join(app.config['UPLOAD_FOLDER'], filename), user_uid, user_gid)

            filenames.append(filename)
        except Exception as e:
            failed_files.append(str(e))

    if failed_files:
        return jsonify({'filenames': filenames, 'errors': failed_files}), 500

    return jsonify({'filenames': filenames}), 200

if __name__ == '__main__':
    app.run(host=args.ip, port=args.port, ssl_context='adhoc')

