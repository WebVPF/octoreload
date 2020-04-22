const host       = window.location.host;
const pathURLs   = window.location.pathname.split('/');
const backend    = pathURLs[1];
const modelName  = pathURLs[2] + '/' + pathURLs[3] + '/' + pathURLs[4];

if (pathURLs[pathURLs.length - 2] == 'update') {
    chrome.storage.sync.get(['hostnames'], sites => {
        if (sites.hostnames.indexOf(host) != -1) {
            let settings = {
                hostnames: sites.hostnames
            }

            chrome.storage.sync.get(sites.hostnames, params => {
                sites.hostnames.forEach(el => settings[el] = params[el]);

                if ( settings[host].vkl ) {
                    if (settings[host].models.indexOf(modelName) != -1) {
                        const protocol = window.location.protocol;

                        let objHost = settings[host];
                        let indexMdl = objHost.models.indexOf(modelName);
                        let objMdl = objHost['model_' + indexMdl];
                        let slugId = '#' + objHost['model_' + indexMdl]['slugId'];
                        
                        let urlFrontPage;

                        if (objMdl.modelType === 'modelItem') {
                            let idSelector = objMdl.categorySlugIdOrPath;
                            let idCategory = document.querySelector('#' + idSelector).value;
                            let relationModel = objMdl.relationCategory;
                            let indexRelationModel = objHost.models.indexOf(relationModel);
                            let categorySlug = objHost['model_' + indexRelationModel].categories[idCategory];
                            let itemSlug = document.querySelector(slugId).value;
                            
                            urlFrontPage = protocol + '//' + host + '/' + categorySlug + '/' + itemSlug;
                        }
                        else if (objMdl.modelType === 'modelCategory') {
                            let action = document.querySelector('form.layout').getAttribute('action');
                            let arr = action.split('/');
                            let indexCategory = arr[arr.length - 1];

                            urlFrontPage = protocol + '//' + host + '/' + objMdl.categories[indexCategory];                            
                        }
                        else if (objMdl.modelType === 'modelPath') {
                            let itemSlug = document.querySelector(slugId).value;

                            urlFrontPage = protocol + '//' + host + '/' + objMdl.categorySlugIdOrPath + '/' + itemSlug;
                        }


                        if (objMdl.linkToolbar) {
                            let link = document.createElement('li');
                            link.className = "mainmenu-preview with-tooltip";
                            link.innerHTML = `<a href="${urlFrontPage}" target="_blank" title="${chrome.i18n.getMessage("linkToolbarText")}" rel="noreferrer noopener">
                                    <i class="icon-external-link"></i>
                                </a>`;
                            
                            let mainmenu_toolbar = document.querySelector('ul.mainmenu-toolbar');

                            mainmenu_toolbar.insertBefore(link, mainmenu_toolbar.firstChild);
                        }

                        var mutationObserver = new MutationObserver(function(mutations) {
                            mutations.forEach(function(mutation) {
                                if(mutation.oldValue == 'flash-message fade success') {
                                    chrome.runtime.sendMessage({
                                        url: urlFrontPage,
                                        updateOctoberPage: true
                                    });
                                }
                            });
                        });

                        mutationObserver.observe(document.documentElement, {
                            attributes: true,
                            characterData: true,
                            childList: true,
                            subtree: true,
                            attributeOldValue: true,
                            characterDataOldValue: true
                        });
                    }
                }
            })
        }
    })
}
