let btnClear = document.getElementById('btn_clear'),
    btnSave = document.getElementById('btn_save'),
    inputImport = document.getElementById('btn_import');

function clearInput() {
    inputImport.value = '';
    btnSave.setAttribute('disabled', 'disabled');
    btnClear.classList.add('d-none');
}

/**
 * Создаёт Flash-сообщение
 * <p class="success flash-message fade in">
 *     The record has been successfully saved.<button type="button" class="close" aria-hidden="true">×</button>
 * </p>
 *
 * @param {Object} params 
 * @param {string} params.type - . success, info, warning, error.
 * @param {string} params.text - Текст сообщения.
 * @param {string} params.time - Время в миллисекундах, через которое сообщение будет удалено из DOM.
 * @returns NodeElement - Flash сообщение, готовое для вставки в DOM.
 */
function createFlashMessage(params) {
    let flashMessage = document.createElement('p');
    flashMessage.classList.add('flash-message', 'fade', 'in');

    if (params.hasOwnProperty('type')) {
        flashMessage.classList.add(params.type);
    }

    if (params.hasOwnProperty('text')) {
        flashMessage.textContent = params.text;
    }

    let closeBtn = document.createElement('button');
    closeBtn.classList.add('close');
    closeBtn.setAttribute('aria-hidden', 'true');
    closeBtn.textContent = '×';

    flashMessage.append(closeBtn);

    closeBtn.addEventListener('click', () => {
        flashMessage.remove();
    });

    return flashMessage;
}

function saveImportSettings() {
    let file = inputImport.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function() {
        let params = JSON.parse(reader.result);

        chrome.storage.sync.set(params, function() {
            let msg = createFlashMessage({
                type: 'success',
                text: chrome.i18n.getMessage('settingsSaveStatus')
            });

            document.querySelector('.block-import').append(msg);

            setTimeout(() => {
                document.location.assign('/pages/options.html')
            }, 1000);
        });

        // clearInput();
    }

    reader.onerror = function() {
        console.log(reader.error);

        let msg = createFlashMessage({
            type: 'error',
            text: 'Произошла ошибка при чтении файла. Настройки не были сохранены.'
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
