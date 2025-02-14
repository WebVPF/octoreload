/**
 * Создаёт Flash-сообщение
 *
 * <p class="success flash-message fade in">
 *     The record has been successfully saved.<button type="button" class="close" aria-hidden="true">×</button>
 * </p>
 */
class FlashMessage {
    /**
     * @param {Object} params
     * @param {string} params.type - Тип сообщения: success, info, warning, error. По умолчанию: info
     * @param {string} params.text - Текст сообщения.
     * @param {boolean} params.btn - С кнопкой закрытия или без.
     * @param {number} params.interval - 
     * @returns NodeElement - Flash-сообщение, готовое для вставки в DOM.
     */
    constructor(params) {
        if (params.hasOwnProperty('type')) {
            this.type = params.type;
        } else {
            this.type = 'info';
        }

        if (params.hasOwnProperty('text')) {
            this.text = params.text;
        }

        if (params.hasOwnProperty('btn')) {
            this.btn = params.btn;
        } else {
            this.btn = false;
        }

        return this.createFlashMessage();
    }

    createFlashMessage() {
        let message = document.createElement('p');
        message.classList.add('flash-message', this.type, 'fade', 'in');

        if (this.text) {
            message.textContent = this.text;
        }

        if (this.btn) {
            let closeBtn = document.createElement('button');
            closeBtn.classList.add('close');
            closeBtn.setAttribute('aria-hidden', 'true');
            closeBtn.textContent = '×';

            message.append(closeBtn);

            closeBtn.addEventListener('click', () => {
                message.remove();
            });
        }


        return message;
    }
}
