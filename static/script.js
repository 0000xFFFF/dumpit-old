const infoElement = document.getElementById('info');
const fileTableBody = document.querySelector('#fileTable tbody');

function humanFileSize(bytes, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
  
    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
    return bytes.toFixed(dp) + ' ' + units[u];
}

function info(message) {
    console.log(message);
    if (infoElement) {
        infoElement.innerHTML += message + "<br>";
    }
}

function updateFileTable(files) {
    fileTableBody.innerHTML = ''; // Clear existing rows

    Array.from(files).forEach((file, index) => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = file.name;

        const pathCell = document.createElement('td');
        pathCell.textContent = file.webkitRelativePath || '/'; // Path might not be available

        const sizeCell = document.createElement('td');
        sizeCell.textContent = (humanFileSize(file.size) + " (" + file.size + ")") || '/';

        const modifiedCell = document.createElement('td');
        modifiedCell.textContent = file.lastModifiedDate;

        const progressCell = document.createElement('td');
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.id = `progressBar${index}`;
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        progressCell.appendChild(progressBar);

        row.appendChild(nameCell);
        row.appendChild(pathCell);
        row.appendChild(sizeCell);
        row.appendChild(modifiedCell);
        row.appendChild(progressCell);

        fileTableBody.appendChild(row);
    });
}

async function uploadFiles() {
    const files = document.getElementById('fileInput').files;
    if (files.length === 0) return;

    updateFileTable(files); // Update table with selected files

    infoElement.innerHTML = "";

    const uploadFile = (file, index) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('files', file);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/upload', true);

            xhr.upload.onprogress = function(event) {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    const progressBar = document.getElementById(`progressBar${index}`);
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

    for (const [index, file] of Array.from(files).entries()) {
        await uploadFile(file, index);
    }

    info('All files uploaded successfully');
}

document.getElementById('fileInput').addEventListener('change', (event) => {
    updateFileTable(event.target.files); // Update table when files are selected
});
