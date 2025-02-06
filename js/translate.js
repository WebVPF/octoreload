document.querySelectorAll('[data-lang]').forEach(str => {
    str.textContent = chrome.i18n.getMessage(str.dataset.lang);

    str.removeAttribute('data-lang');
});