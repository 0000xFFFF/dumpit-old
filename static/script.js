const infoElement = document.getElementById('info');
const filesDisplay = document.getElementById('filesdisplay');

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


function human_readable_bytes(bytes) {
    return (humanFileSize(bytes) + " (" + bytes + " bytes)");
}

function info(message) {
    console.log(message);
    if (infoElement) {
        infoElement.innerHTML += message + "<br>";
    }
}

function date2str(input_date) {
    const date = new Date(input_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDateTime;
}

function updateFileTable(files) {
    filesDisplay.innerHTML = ''; // Clear existing rows

    Array.from(files).forEach((file, index) => {
        
        const div_file = document.createElement('div');
        div_file.className = "div_file";
        
        const div1 = document.createElement('div');
        div1.className = "div_file_div1";
        const p1 = document.createElement('p');
        p1.className = "p_index";
        p1.innerHTML = (index+1) + "/" + files.length;
        const p2 = document.createElement('p');
        p2.className = "p_name";
        p2.innerHTML = file.name;
        div1.appendChild(p2);
        div1.appendChild(p1);
        div_file.appendChild(div1);

        const div2 = document.createElement('div');
        div2.className = "div_file_div2";
        const p3 = document.createElement('p');
        p3.className = "p_size";
        p3.innerHTML = human_readable_bytes(file.size);
        const p4 = document.createElement('p');
        p4.className = "p_date";
        p4.innerHTML = date2str(file.lastModifiedDate);
        div2.appendChild(p3);
        div2.appendChild(p4);
        div_file.appendChild(div2);

        const progressCont = document.createElement('div');
        progressCont.className = "progressCont";
        const progressDiv = document.createElement('div');
        progressDiv.className = "progress";
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.id = `progressBar${index}`;
        progressBar.style.width = '0%';
        progressDiv.appendChild(progressBar);
        const progressLabel = document.createElement('p');
        progressLabel.className = "progress-label";
        progressLabel.id = `progressBar${index}_label`;
        progressLabel.innerHTML = "....";
        progressCont.appendChild(progressDiv);
        progressCont.appendChild(progressLabel);
        div_file.appendChild(progressCont);
        
        filesDisplay.appendChild(div_file);
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
                    const progressLabel = document.getElementById(`progressBar${index}_label`);
                    if (progressBar) {
                        progressBar.style.width = percentComplete + '%';
                        progressLabel.textContent = percentComplete + '%';
                    }
                }
            };

            xhr.onload = function() {
                if (xhr.status === 200) {
                    info(`✅ [${index+1}/${files.length}] ${file.name}`);
                    resolve();
                } else {
                    info(`❌ [${index+1}/${files.length}] ${file.name}`);
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
