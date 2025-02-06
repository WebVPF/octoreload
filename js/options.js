const optionsApp = {
    sidenav:    document.querySelector('.sidenav'),
    listSites:  document.getElementById('list_sites'),
    btnAddHost: document.getElementById('btn_addHost'),
    btnSave:    document.getElementById('save'),

    event() {
        this.sidenav.addEventListener('click', this.navigation);

        this.btnAddHost.addEventListener('click', this.addHost.bind(this));
        this.listSites.addEventListener('input', this.editHostname);

        document.addEventListener('click', this.routeMethods.bind(this));

        document.addEventListener('input', this.modelTypeSelection);

        this.btnSave.addEventListener('click', this.saveOptions.bind(this));
        document.addEventListener('keydown', this.keyboard.bind(this));
    },

    activeBtnSave() {
        if (this.btnSave.hasAttribute('disabled')) {
            this.btnSave.removeAttribute('disabled');

            window.addEventListener('beforeunload', this.warningUnsavedSettings);
        }
    },

    disableBtnSave() {
        this.btnSave.setAttribute('disabled', '');

        window.removeEventListener('beforeunload', this.warningUnsavedSettings);
    },

    /**
     * Предупреждение о несохраненных настройках
     */
    warningUnsavedSettings(event) {
        event.preventDefault();
    },

    routeMethods(e) {
        let el = e.target;

        if (el.classList.contains('btn_deleteHost')) {
            this.deleteHost(el);
            this.activeBtnSave();
        }
        else if (el.classList.contains('btn_addModel')) {
            this.addModel(el);
        }
        else if (el.classList.contains('btn_deleteModel')) {
            this.deleteModel(el);
            this.activeBtnSave();
        }
        else if (el.classList.contains('btn_addCategory')) {
            this.addCategory(el);
        }
        else if (el.classList.contains('btn_deleteCategory')) {
            this.deleteCategory(el);
            this.activeBtnSave();
        }
    },

    navigation(e) {
        let el = e.target;

        let navItems = [...this.children];
        let index = navItems.indexOf(el);

        if (index >= 0) {
            navItems.forEach((item, i) => {
                if (item == el) {
                    index = i;
                    item.classList.add('active');
                }
                else item.classList.remove('active');
            });

            document.querySelectorAll('.container').forEach((item, i) => {
                if (i == index) item.classList.remove('hide');
                else item.classList.contains('hide') ? 0 : item.classList.add('hide');
            });
        }
    },

    createHostBlock(hostname, index, vkl) {
        let blockHost = document.createElement('div');

        blockHost.className = 'block_domens__item';

        blockHost.innerHTML = `
            <label class="custom-switch">
                <input type="checkbox" id="item_host_${index}" name="domen_${index}" ${vkl ? 'checked' : ''}>
                <span>
                    <span>${chrome.i18n.getMessage("on")}</span>
                    <span>${chrome.i18n.getMessage("off")}</span>
                </span>
                <a class="slide-button"></a>
            </label>
            <input type="text" name="hostname" value="${typeof hostname == 'string' ? hostname : ''}">
            <button class="btn_deleteHost btn btn-danger" title="${chrome.i18n.getMessage("delete")}">×</button>
        `;

        return blockHost;
    },

    createModelContainer(hostname, backend) {
        let container = document.createElement('div');
        container.classList = 'container hide';
        container.innerHTML = `
            <h1 class="domen-name">${hostname}</h1>
            <div>
                <span class="label_name">${chrome.i18n.getMessage("txtBackendUrl")}:</span>
                <input type="text" name="backendURL" value="${backend}">
            </div>
            <h3 class="model-name">${chrome.i18n.getMessage("txtModelsSite")}</h3>
            <button class="btn_addModel btn btn-default btn-lg btn-block">${chrome.i18n.getMessage("btnAddModel")}</button>
        `;

        return container;
    },

    addHost(hostname, index, backend, vkl) {
        hostname = typeof hostname == 'string' ? hostname : '';
        backend = typeof backend == 'string' ? backend : 'backend';

        !index ? index = document.querySelectorAll('.block_domens__item').length + 1 : 0;

        /**
         * Добавление блока сайта
         */
        let blockHost = this.createHostBlock(hostname, index, vkl);

        document.querySelector('#list_sites').appendChild(blockHost);

        /**
         * Добавление блока настроек для сайта
         */
        let container = this.createModelContainer(hostname, backend);

        document.querySelector('.body').insertBefore(container, document.getElementById('block_btn_save'));


        /**
         * Добавление пункта меню
         */
        let itemNav = document.createElement('li');
        itemNav.innerText = typeof hostname == 'string' ? hostname : '';
        optionsApp.sidenav.appendChild(itemNav);
    },

    editHostname(e) {
        let el = e.target;

        if (el.type == 'text') {

            /**
             * Определение индекса хоста у которого редактируется название
             */
            let hostBlocks = document.querySelectorAll('.block_domens__item');
            let indexEditNameDomen = [...hostBlocks].indexOf(el.parentNode);

            /**
             * Название пункта меню
             */
            let siteName = el.value;

            document.querySelectorAll('.sidenav li')[indexEditNameDomen + 1].innerText = siteName;

            document.querySelectorAll('.domen-name')[indexEditNameDomen].innerText = siteName;
        }
    },

    deleteHost(el) {
        if (confirm(chrome.i18n.getMessage('confirmDeleteSite'))) {
            /**
             * Определение индекса удаляемого домена
             */
            let hostBlocks = document.querySelectorAll('.block_domens__item');
            let indexDeletedDomen = [...hostBlocks].indexOf(el.parentNode);

            /**
             * Удалить блок настроек для этого домена
             */
            document.querySelectorAll('.container')[indexDeletedDomen + 1].remove();

            /**
             * Удалить пункт меню для этого домена
             */
            document.querySelectorAll('.sidenav li')[indexDeletedDomen + 1].remove();

            /**
             * Удалить сам блок хоста
             */
            el.parentNode.remove();
        }
    },

    createModelBlock(model) {
        let name = model ? model.name : '';
        let slugId = model ? model.slugId : '';

        let selectItem = model ? model.modelType === 'modelItem' ? 'selected' : '' : '';
        let selectCateg = model ? model.modelType === 'modelCategory' ? 'selected' : '' : '';
        let selectPath = model ? model.modelType === 'modelPath' ? 'selected' : '' : '';

        let txt;

        if (model) {
            switch (model.modelType) {
                case 'modelItem':     txt = chrome.i18n.getMessage("labelIdSlugCat"); break;
                case 'modelCategory': txt = ''; break;
                case 'modelPath':     txt = chrome.i18n.getMessage("labelPathFront"); break;
            }
        }
        else txt = chrome.i18n.getMessage("labelIdSlugCat");

        let categorySlugIdOrPath = model ? model.categorySlugIdOrPath : '';

        let tableHide = model ? model.modelType != 'modelCategory' ? 'hide' : '' : 'hide';

        let relationCategory = model ? model.modelType === 'modelItem' ? model.relationCategory : '' : '';

        let modelBlock = document.createElement('div');
        modelBlock.className = 'model_settings';
        modelBlock.innerHTML = `
            <button class="btn_deleteModel btn btn-danger" title="${chrome.i18n.getMessage("deleteModel")}">×</button>
            <div class="model-options">
                <div class="model-item-option">
                    <span class="label_name">${chrome.i18n.getMessage("type")}:</span>
                    <select name="modelType">
                        <option value="modelItem" ${selectItem}>${chrome.i18n.getMessage("typeItem")}</option>
                        <option value="modelCategory"${selectCateg}>${chrome.i18n.getMessage("typeCategory")}</option>
                        <option value="modelPath"${selectPath}>${chrome.i18n.getMessage("typePath")}</option>
                    </select>
                </div>
                <div class="model-item-option">
                    <span class="label_name">${chrome.i18n.getMessage("txtModel")}:</span>
                    <div>
                        <input type="text" value="${name}" name="modelName">
                        <p class="note_text">authorName/pluginName/modelName</p>
                    </div>
                </div>
                <div class="model-item-option">
                    <span class="label_name">${chrome.i18n.getMessage("txtIdFieldSlug")}:</span>
                    <div>
                        <input type="text" value="${slugId}" name="slugId">
                        <p class="note_text">Пример: Form-field-Item-slug</p>
                    </div>
                </div>
                <div class="model-item-option ${model ? model.modelType === 'modelCategory' ? 'hide' : '' : ''}" name="slugIdOrPath-block">
                    <span class="label_name">${txt}:</span>
                    <input type="text" value="${categorySlugIdOrPath}" name="categorySlugIdOrPath">
                </div>
                <div class="model-item-option ${model ? model.modelType != 'modelItem' ? 'hide' : '' : ''}" name="relation-block">
                    <span class="label_name">${chrome.i18n.getMessage("labelRelationCategory")}:</span>
                    <input type="text" value="${relationCategory}" name="relationCategory">
                </div>
                <div class="model-item-option">
                    <input type="checkbox" name="linkToolbar" ${model ? model.linkToolbar ? 'checked' : '' : 'checked'}>
                    <label>${chrome.i18n.getMessage("labelLinkToolbar")}</label>
                </div>
            </div>

            <table class="table table-bordered table-striped ${tableHide}">
                <thead>
                    <tr>
                        <th>${chrome.i18n.getMessage("thIdCategory")}</th>
                        <th>${chrome.i18n.getMessage("thPathCategory")}</th>
                        <th style="width: 50px;"></th>
                    </tr>
                </thead>
                <tfoot>
                    <tr>
                        <td colspan="3">
                            <button class="btn_addCategory btn btn-primary">${chrome.i18n.getMessage("btnAddCategory")}</button>
                        </td>
                    </tr>
                </tfoot>
                <tbody></tbody>
            </table>
        `;

        return modelBlock;
    },

    addModel(el) {
        let modelSettingsBlock = optionsApp.createModelBlock();
        el.parentNode.insertBefore(modelSettingsBlock, el);
    },

    deleteModel(el) {
        if (confirm(chrome.i18n.getMessage("confirmDeleteModel"))) {
            el.parentNode.remove();
        }
    },

    modelTypeSelection(e) {
        let el = e.target;

        if (el.name === 'modelType') {
            let v = el.value;

            let blockRelation = el.parentNode.parentNode.querySelector('[name="relation-block"]');
            v != 'modelItem' ? blockRelation.classList.add('hide') : blockRelation.classList.remove('hide');

            let table = el.parentNode.parentNode.nextElementSibling;
            v != 'modelCategory' ? table.classList.add('hide') : table.classList.remove('hide');

            let txt;
            let blockCatOrPath = el.parentNode.parentNode.querySelector('[name="slugIdOrPath-block"]');

            if (v === 'modelItem') {
                txt = chrome.i18n.getMessage("labelIdSlugCat");
                blockCatOrPath.classList.remove('hide');
            }
            else if ( v === 'modelCategory') {
                txt = '';
                blockCatOrPath.classList.add('hide');
            }
            else if ( v === 'modelPath') {
                txt = chrome.i18n.getMessage("labelPathFront");
                blockCatOrPath.classList.remove('hide');
            }

            blockCatOrPath.querySelector('.label_name').textContent = txt;
        }

        optionsApp.activeBtnSave();
    },

    addCategory(el) {
        let categoryBlock = document.createElement('tr');
        categoryBlock.innerHTML = `
            <td><input type="number"></td>
            <td><input type="text"></td>
            <td><button class="btn_deleteCategory btn btn-danger" title="${chrome.i18n.getMessage("delete")}">×</button></td>
        `;
        el.parentNode.parentNode.parentNode.nextElementSibling.appendChild(categoryBlock);
    },

    deleteCategory(el) {
        if (confirm(chrome.i18n.getMessage('delete'))) {
            el.parentNode.parentNode.remove();
        }
    },

    getOptions() {
        let params = {
            hostnames: []
        }

        let containers = document.querySelectorAll('.container');

        document.querySelectorAll('[name="hostname"]').forEach((el, i) => {
            if (el.value != '') {
                params.hostnames.push(el.value);

                params[el.value] = {
                    vkl: document.querySelector(`#item_host_${i + 1}`).checked,
                    backend: document.querySelectorAll('[name="backendURL"]')[i].value,
                    models: []
                };

                let models = containers[i+1].querySelectorAll('.model_settings');

                models.forEach((mdl, index) => {
                    params[el.value].models.push(mdl.querySelector('[name="modelName"]').value);

                    let mdlParams = {
                        modelType:  mdl.querySelector('[name="modelType"]').value,
                        name:       mdl.querySelector('[name="modelName"]').value,
                        slugId:     mdl.querySelector('[name="slugId"]').value,
                        linkToolbar: mdl.querySelector('[name="linkToolbar"]').checked
                    }

                    if (mdlParams.modelType == 'modelCategory') {
                        mdlParams.categories = {};

                        let mdlCategories = mdl.querySelectorAll('tbody tr');
                        mdlCategories.forEach(ctg => mdlParams.categories[ctg.querySelector('input[type="number"]').value] = ctg.querySelector('input[type="text"]').value);
                    } else {
                        mdlParams.categorySlugIdOrPath = mdl.querySelector('[name="categorySlugIdOrPath"]').value;
                    }


                    if (mdlParams.modelType == 'modelItem') {
                        mdlParams.relationCategory = mdl.querySelector('[name="relationCategory"]').value;
                    }

                    params[el.value]['model_' + index] = mdlParams;
                });
            }
        });

        return params;
    },

    setOptions(params) {
        chrome.storage.sync.set(params, function() {
            let msg = new FlashMessage({
                type: 'success',
                text: chrome.i18n.getMessage('settingsSaveStatus'),
                btn: true
            });

            document.querySelector('.body').append(msg);

            window.setTimeout(() => {
                msg.remove();
            }, 1000);
        });
    },

    saveOptions() {
        let params = this.getOptions();

        this.setOptions(params);

        this.disableBtnSave();
    },

    keyboard(e) {
        let isMac = navigator.platform ?
            navigator.platform.toUpperCase().indexOf("MAC")>-1
            :navigator.appVersion.toUpperCase().indexOf("MAC")>-1;

        if (e.code == 'KeyS' && ( isMac && e.metaKey || e.ctrlKey)) {
            e.preventDefault();

            this.saveOptions();
        }
    },

    install() {
        chrome.storage.sync.get(['hostnames'], sites => {
            chrome.storage.sync.get(sites.hostnames, params => {
                sites.hostnames.forEach((domen, i) => {
                    this.addHost(domen, i + 1, params[domen].backend, params[domen].vkl);

                    params[domen].models.forEach((mdl, index) => {
                        let modelItem = params[domen]['model_' + index];

                        let modelSettingsBlock = optionsApp.createModelBlock(modelItem);

                        document.querySelectorAll('.container')[i + 1].insertBefore(modelSettingsBlock, document.querySelectorAll('.container')[i + 1].querySelector('.btn_addModel'));

                        let categories = params[domen]['model_' + index].categories;

                        for (let key in categories) {
                            let categoryBlock = document.createElement('tr');
                            categoryBlock.innerHTML = `
                                <td><input type="number" value="${key}"></td>
                                <td><input type="text" value="${categories[key]}"></td>
                                <td><button class="btn_deleteCategory btn btn-danger" title="${chrome.i18n.getMessage("delete")}">×</button></td>
                            `;

                            modelSettingsBlock.querySelector('tbody').appendChild(categoryBlock);
                        }
                    })
                })
            })
        })
    },

    init() {
        this.install();
        this.event();
    }
}

optionsApp.init();
