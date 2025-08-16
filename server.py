#!/usr/bin/env python3

import os
import pwd
import argparse
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

parser = argparse.ArgumentParser(description='HTTP(s) web file server for just uploading files')

parser.add_argument('-u', '--user', metavar='user', type=str, help="user that should own the uploaded files")
parser.add_argument('-i', '--ip', metavar='string', type=str, default="0.0.0.0", help="IP for the server (default: '0.0.0.0' - all ips)")
parser.add_argument('-p', '--port', metavar='string', type=str, default="443", help="port for the server (default: '443' - https)")
parser.add_argument('-v', '--verbose', action="store_true", help="verbose output")
parser.add_argument('-d', '--directory', type=str, help="directory to save files to")
parser.add_argument('-n', '--nossl', action="store_true", help="don't use https")
args = parser.parse_args()

if not args.nossl:
    from flask_sslify import SSLify

if args.verbose:
    print(args)

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
if not args.nossl:
    sslify = SSLify(app)

UPLOAD_FOLDER = '.'
if args.directory is not None:
    UPLOAD_FOLDER = args.directory

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')


@app.route('/upload', methods=['POST'])
def upload_files():
    if not request.content_length:
        return jsonify({'error': 'No content length provided'}), 411

    if request.content_length > 0:
        filenames = []
        failed_files = []

        CHUNK_SIZE = 8192  # Define the chunk size to write in small parts

        try:
            # Save the file directly from the stream, without holding the file in memory
            filename = request.headers.get('X-File-Name', 'uploaded_file')
            filename = secure_filename(filename)  # Sanitize the filename
            filepath = os.path.join(UPLOAD_FOLDER, filename)

            if args.verbose:
                print(f"saving: {filename}")

            # Write the file in chunks
            with open(filepath, 'wb') as f:
                while True:
                    chunk = request.stream.read(CHUNK_SIZE)
                    if not chunk:
                        break
                    f.write(chunk)

            if args.verbose:
                print(f"saved: {filename}")

            # Change ownership of the file to the specified user
            if args.verbose:
                print(f"chown[{args.user}] {filepath}")
            os.chown(filepath, user_uid, user_gid)

            filenames.append(filename)
        except Exception as e:
            failed_files.append(str(e))

        if failed_files:
            return jsonify({'filenames': filenames, 'errors': failed_files}), 500

        return jsonify({'filenames': filenames}), 200
    else:
        return jsonify({'error': 'File too large or no file uploaded'}), 413

if __name__ == '__main__':
    if not args.nossl:
        app.run(host=args.ip, port=args.port, ssl_context='adhoc')
    else:
        app.run(host=args.ip, port=args.port)

