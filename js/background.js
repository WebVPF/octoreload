chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.updateOctoberPage) {
            chrome.tabs.query({url: request.url}, function (tabs) {
                tabs.forEach(tab => chrome.tabs.update(tab.id, {url: request.url}));
            });
        }
    }
);
