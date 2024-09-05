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

function tr_create(th_text, td_text) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = th_text;
    const td = document.createElement("td");
    td.textContent = td_text;
    tr.appendChild(th);
    tr.appendChild(td);
    return tr;
}

function tr_create2(th_text, elem) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = th_text;
    tr.appendChild(th);
    tr.appendChild(elem);
    return tr;
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
    fileTableBody.innerHTML = ''; // Clear existing rows

    Array.from(files).forEach((file, index) => {
        const tr = document.createElement('tr');

        const table = document.createElement('table');
        table.className = "filetable";
        const tbody = document.createElement('tbody')

        const row = document.createElement('tr');
        row.appendChild(tr_create("INDEX:", (index+1) + "/" + files.length));
        row.appendChild(tr_create("FILE NAME:", file.name));
        row.appendChild(tr_create("FULL PATH:", file.webkitRelativePath || '/'));
        row.appendChild(tr_create("SIZE IN BYTES:", (humanFileSize(file.size) + " (" + file.size + ")") || '/'));
        row.appendChild(tr_create("LAST MODIFIED:", date2str(file.lastModifiedDate)));
        console.log(file.lastModifiedDate);

        const progressCell = document.createElement('td');
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.id = `progressBar${index}`;
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        progressCell.appendChild(progressBar);

        row.appendChild(tr_create2("UPLOADED:", progressCell));
        
        tbody.appendChild(row);
        table.appendChild(tbody);
        tr.appendChild(table);
        fileTableBody.appendChild(tr);
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
