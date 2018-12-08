(function () {
    //bind event
    document.getElementById("say-hello").addEventListener('click', function () {
        chrome.tabs.executeScript(null, {
            file: '/js/boss.js'
        });
    });
    //radio config
    let salary = document.getElementById("salary");
    let experience = document.getElementById("experience");
    let degree = document.getElementById("degree");
    let radioConfig = [salary, experience, degree];
    for (let index in radioConfig) {
        //添加事件
        radioConfig[index].addEventListener('click', (event) => saveBossConfig(event))
        //加载之前的配置
        let keyId = radioConfig[index].dataset.keyid;
        chrome.storage.local.get([keyId], function (result) {
            if (result && result[keyId]) {
                loadRadioConfig(result[keyId], radioConfig[index]);
            }
        });
    }
    let filter = document.getElementById("filter");
    let basicConfig = document.getElementById("basic-config");

    let inputConfig = [filter, basicConfig];
    for (let key in inputConfig) {
        inputConfig[key].addEventListener("change", (event) => saveInputConfig(event));
        loadInputConfig(inputConfig[key]);
    }

    function saveBossConfig(e) {
        let keyId = e.currentTarget.dataset.keyid;
        let keyValue = e.target.dataset.keyvalue;
        chrome.storage.local.set({[keyId]: keyValue}, undefined);
    }

    function saveInputConfig(e) {
        let keyId = e.target.dataset.keyid;
        let keyValue = e.target.value;
        chrome.storage.local.set({[keyId]: keyValue}, undefined);
    }


    function loadRadioConfig(storeValue, dom) {
        let radios = dom.getElementsByTagName('input');
        for (let i = 0; i < radios.length; ++i) {
            if (radios[i].dataset.keyvalue === storeValue) {
                radios[i].checked = true;
                break;
            }
        }
    }

    function loadInputConfig(dom) {
        let input = dom.getElementsByTagName('input');
        for (let i = 0; i < input.length; ++i) {
            let key = input[i].dataset.keyid;
            chrome.storage.local.get([key], function (result) {
                if (result && result[key]) {
                    input[i].value = result[key];
                }
            })
        }
    }

})();


