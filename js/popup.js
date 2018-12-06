(function () {
    //bind event
    document.getElementById("say-hello").addEventListener('click', function () {
        chrome.tabs.executeScript(null, {
            file: '/js/boss.js'
        });
    });

    document.getElementById("main-panel").addEventListener('click', function (e) {
        console.log(e.target);
    });

})();


