const optionsApp = {
    navbar:     document.querySelector('.navbar'),
    listSites:  document.querySelector('#list_sites'),
    btnAddHost: document.querySelector('#btn_addHost'),
    btnSave:    document.querySelector('#save'),
    btnExport:  document.querySelector('#btn_export'),
    btnImport:  document.querySelector('#btn_import'),
    btns:       document.querySelectorAll('.panel-btn'),
    overlay:    document.querySelector('.overlay'),
    modal:      document.querySelector('.modal'),

    event() {
        this.navbar.addEventListener('click', this.navigation);

        this.btnAddHost.addEventListener('click', this.addHost.bind(this));
        this.listSites.addEventListener('input', this.editHostname);

        document.addEventListener('click', this.routeMethods.bind(this));

        document.addEventListener('input', this.modelTypeSelection);

        this.btnSave.addEventListener('click', this.saveOptions.bind(this));
        document.addEventListener('keydown', this.keyboard.bind(this));

        this.btns.forEach(btn => btn.addEventListener('click', this.modalShow.bind(this, btn)));
        this.btnExport.addEventListener('click', this.export);
        this.btnImport.addEventListener('input', this.import);
        this.overlay.addEventListener('click', this.overlayHide.bind(this));
    },

    routeMethods(e) {
        let el = e.target;

        if (el.className == 'btn_deleteHost') {
            this.deleteHost(el);
        }
        else if (el.className == 'btn_addModel') {
            this.addModel(el);
        }
        else if (el.className == 'btn_deleteModel') {
            this.deleteModel(el);
        }
        else if (el.className == 'btn_addCategory') {
            this.addCategory(el);
        }
        else if (el.className == 'btn_deleteCategory') {
            this.deleteCategory(el);
        }
    },

    translate(el) {
        el.querySelectorAll('[data-lang]').forEach(str => str.textContent = chrome.i18n.getMessage(str.dataset.lang));
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
            <div class="switch">
                <input id="item_host_${index}_on" class="switch-input" type="radio" name="domen_${index}" data-item="on" ${vkl ? 'checked' : ''}>
                <label for="item_host_${index}_on" class="switch-label switch-label-on">${chrome.i18n.getMessage("on")}</label>
                <input id="item_host_${index}_off" class="switch-input" type="radio" name="domen_${index}" data-item="off" ${vkl ? '' : 'checked'}>
                <label for="item_host_${index}_off" class="switch-label switch-label-off">${chrome.i18n.getMessage("off")}</label>
                <span class="switch-selection"></span>
            </div>
            <input type="text" name="hostname" value="${typeof hostname == 'string' ? hostname : ''}">
            <div class="btn_deleteHost" title="${chrome.i18n.getMessage("delete")}">×</div>
        `;

        return blockHost;
    },

    createModelContainer(hostname, backend) {
        let container = document.createElement('div');
        container.classList = 'container hide';
        container.innerHTML = `
            <h2 class="domen-name">${hostname}</h2>
            <div>
                <span class="label_name">${chrome.i18n.getMessage("txtBackendUrl")}:</span>
                <input type="text" name="backendURL" value="${backend}">
            </div>
            <h3 class="model-name">${chrome.i18n.getMessage("txtModelsSite")}</h3>
            <div class="btn_addModel">${chrome.i18n.getMessage("btnAddModel")}</div>
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

        document.querySelector('.body').insertBefore(container, document.querySelector('#status'));


        /**
         * Добавление пункта меню
         */
        let itemNav = document.createElement('li');
        itemNav.innerText = typeof hostname == 'string' ? hostname : '';
        optionsApp.navbar.appendChild(itemNav);
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

            document.querySelectorAll('.navbar li')[indexEditNameDomen + 1].innerText = siteName;

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
            document.querySelectorAll('.navbar li')[indexDeletedDomen + 1].remove();

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
                    <input type="text" value="${name}" name="modelName">
                    <div class="btn_deleteModel" title="${chrome.i18n.getMessage("deleteModel")}">×</div>
                    <p class="note_text">autorName/pluginName/modelName</p>
                </div>
                <div class="model-item-option">
                    <span class="label_name">${chrome.i18n.getMessage("txtIdFieldSlug")}:</span>
                    <input type="text" value="${slugId}" name="slugId">
                    <p class="note_text">Пример: Form-field-Item-slug</p>
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
                            <div class="btn_addCategory">${chrome.i18n.getMessage("btnAddCategory")}</div>
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
            el.parentNode.parentNode.parentNode.remove();
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
    },

    addCategory(el) {
        let categoryBlock = document.createElement('tr');
        categoryBlock.innerHTML = `
            <td><input type="number"></td>
            <td><input type="text"></td>
            <td><div class="btn_deleteCategory" title="${chrome.i18n.getMessage("delete")}">×</div></td>
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
                    vkl: document.querySelector('#item_host_' + (i + 1) + '_on').checked,
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
            let status = document.querySelector('#status');
            status.textContent = chrome.i18n.getMessage('settingsSaveStatus');
            status.style.display = 'block';

            window.setTimeout( function() {status.style.display = 'none'}, 750 );
        });
    },

    saveOptions() {
        let params = this.getOptions();
        this.setOptions(params);
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

    import() {
        function onReaderLoad(event){
            var params = JSON.parse(event.target.result);

            let btnImportSave = document.createElement('button');
            btnImportSave.className = 'btnImportSave';
            btnImportSave.textContent = 'Установить настройки';
            document.querySelector('.block-import').append(btnImportSave);

            function saveImportSettings() {
                optionsApp.setOptions(params);

                btnImportSave.removeEventListener('click', saveImportSettings);
                btnImportSave.remove();

                location.reload();
            }

            btnImportSave.addEventListener('click', saveImportSettings);
        }

        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
    },

    export() {
        let params = optionsApp.getOptions();

        let file = new Blob([JSON.stringify(params)], {type: 'text/json'});

        let a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = 'livereload_' + new Date().getTime() + '.json';
        a.click();
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
                                <td><div class="btn_deleteCategory" title="${chrome.i18n.getMessage("delete")}">×</div></td>
                            `;

                            modelSettingsBlock.querySelector('tbody').appendChild(categoryBlock);
                        }
                    })
                })
            })
        })
    },

    overlayHide() {
        this.modalHide();
        this.overlay.style.display = 'none';
    },

    modalHide() {
        this.modal.style.display = 'none';
    },

    modalShow(btn) {
        if (btn.dataset.option) {
            let importBlock = document.querySelector('.block-import');
            let exportBlock = document.querySelector('.block-export');

            optionsApp.overlay.style.display = 'block';

            let name = btn.dataset.option;
            [importBlock, exportBlock].forEach(block => block.classList.contains('block-' + name) ? block.classList.remove('hide') : block.classList.add('hide'));

            optionsApp.modal.style.display = 'block';
        }
    },

    init() {
        this.translate(document);
        this.install();
        this.event();
    }
}

optionsApp.init();
