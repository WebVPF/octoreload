let params = {};

chrome.storage.sync.get(['hostnames']).then((arrHostnames) => {
    if (arrHostnames.hostnames.length) {
        params.hostnames = arrHostnames.hostnames;

        arrHostnames.hostnames.forEach(hostname => {
            chrome.storage.sync.get([hostname]).then((paramsHost) => {
                params[hostname] = paramsHost[hostname];
            });
        });
    }
});

function settingsExport() {
    let file = new Blob([JSON.stringify(params)], {type: 'text/json'});

    let a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = `wn-livereload_${ new Date().getTime() }.json`;
    a.click();
}

document.getElementById('btn_export').addEventListener('click', settingsExport);
