(function () {
    //bind event
    document.getElementById("say-hello").addEventListener('click', function () {
        chrome.tabs.executeScript(null, {
            file: '/js/boss.js'
        });
    });
    let cityIndex = 0;

    function bindEvent() {
        let salary = document.getElementById("salary");
        let experience = document.getElementById("experience");
        let degree = document.getElementById("degree");
        let filter = document.getElementById("filter");
        let basicConfig = document.getElementById("basic-config");
        let citySelection = document.getElementById("city");
        //city event
        citySelection.addEventListener('change', event => {
            cityIndex = citySelection.selectedIndex;
            chrome.storage.local.set({"city": cityIndex}, undefined);
            loadCityConfig(cityIndex);
        });

        //radio config
        let radioConfig = [salary, experience, degree];
        for (let index in radioConfig) {
            //添加事件
            radioConfig[index].addEventListener('click',
                (event) => saveBossConfig(event));
        }
        //input config
        let inputConfig = [filter, basicConfig];
        for (let key in inputConfig) {
            inputConfig[key].addEventListener("change",
                (event) => saveInputConfig(event));
        }

    }

    function loadCityConfig(cityIndex) {
        let salary = document.getElementById("salary");
        let experience = document.getElementById("experience");
        let degree = document.getElementById("degree");
        let filter = document.getElementById("filter");
        let basicConfig = document.getElementById("basic-config");
        clearAllConfig(salary, experience, degree, filter, basicConfig);
        //radio config
        let radioConfig = [salary, experience, degree];
        for (let index in radioConfig) {
            //加载之前的配置
            let keyId = radioConfig[index].dataset.keyid + "-" + cityIndex;
            chrome.storage.local.get([keyId], function (result) {
                if (result && result[keyId]) {
                    loadRadioConfig(result[keyId], radioConfig[index]);
                }
            });
        }
        //input config
        let inputConfig = [filter, basicConfig];
        for (let key in inputConfig) {
            loadInputConfig(inputConfig[key], 'input');
        }
    }


    bindEvent()

    //load selection config
    chrome.storage.local.get("city", function (result) {
        if (result && result["city"]) {
            cityIndex = result["city"];
        }
        let citySelection = document.getElementById("city");
        citySelection.selectedIndex = cityIndex;
        loadCityConfig(cityIndex);
    });


    function saveBossConfig(e) {
        let keyId = e.currentTarget.dataset.keyid + "-" + cityIndex;
        let keyValue = e.target.dataset.keyvalue;
        chrome.storage.local.set({[keyId]: keyValue}, undefined);
    }

    function saveInputConfig(e) {
        let keyId = e.target.dataset.keyid + "-" + cityIndex;
        let keyValue = e.target.value || e.target.checked;
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

    function clearAllConfig(salary, experience, degree,
                            filter, basicConfig) {
        document.getElementById("s1").checked = true;
        document.getElementById("s8").checked = true;
        document.getElementById("s15").checked = true;

        let filterInput = filter.getElementsByTagName('input');
        for (let i = 0; i < filterInput.length; ++i) {
            filterInput[i].value = '';
        }

        let basicInput = basicConfig.getElementsByTagName('input');
        for (let i = 0; i < basicInput.length; ++i) {
            basicInput[i].value = '';
        }

    }

    function loadInputConfig(dom, tag) {
        let input = dom.getElementsByTagName(tag);
        for (let i = 0; i < input.length; ++i) {
            let key = input[i].dataset.keyid + "-" + cityIndex;
            chrome.storage.local.get([key], function (result) {
                if (result && result[key]) {
                    if (input[i].type === 'checkbox') {
                        input[i].checked = result[key];
                    } else {
                        input[i].value = result[key];
                    }
                }
            })
        }

    }

})();


