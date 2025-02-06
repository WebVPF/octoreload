let btnClear = document.getElementById('btn_clear'),
    btnSave = document.getElementById('btn_save'),
    inputImport = document.getElementById('btn_import');

function clearInput() {
    inputImport.value = '';
    btnSave.setAttribute('disabled', 'disabled');
    btnClear.classList.add('d-none');
}

function saveImportSettings() {
    let file = inputImport.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function() {
        let params = JSON.parse(reader.result);

        chrome.storage.sync.set(params, function() {
            let msg = new FlashMessage({
                type: 'success',
                text: chrome.i18n.getMessage('settingsSaveStatus'),
                btn: true
            });

            document.querySelector('.block-import').append(msg);

            setTimeout(() => {
                document.location.assign('/pages/options.html')
            }, 1000);
        });
    }

    reader.onerror = function() {
        console.log(reader.error);

        let msg = new FlashMessage({
            type: 'error',
            text: 'Произошла ошибка при чтении файла. Настройки не были сохранены.',
            btn: true
        });

        document.querySelector('.block-import').append(msg);
    }
}

btnClear.addEventListener('click', clearInput);

btnSave.addEventListener('click', saveImportSettings);

inputImport.addEventListener('change', () => {
    btnClear.classList.remove('d-none');
    btnSave.removeAttribute('disabled');
});
