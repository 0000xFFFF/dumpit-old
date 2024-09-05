const infoElement = document.getElementById('info');

function info(message) {
    console.log(message);
    if (infoElement) {
        infoElement.innerHTML = message;
    }
}

async function uploadFiles() {
    const files = document.getElementById('fileInput').files;
    if (files.length === 0) return;

    const uploadFile = (file) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('files', file);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/upload', true);

            xhr.upload.onprogress = function(event) {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    const progressBar = document.getElementById('progressBar');
                    if (progressBar) {
                        progressBar.style.width = percentComplete + '%';
                        progressBar.textContent = percentComplete + '%';
                    }
                }
            };

            xhr.onload = function() {
                if (xhr.status === 200) {
                    info(`File ${file.name} uploaded successfully`);
                    resolve();
                } else {
                    info(`Error uploading file ${file.name}`);
                    reject();
                }
            };

            xhr.onerror = function() {
                info(`Network error while uploading file ${file.name}`);
                reject();
            };

            xhr.send(formData);
        });
    };

    for (const file of files) {
        await uploadFile(file);
    }

    info('All files uploaded successfully');
}