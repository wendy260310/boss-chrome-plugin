class BossApp {

    static message;
    static city;

    static waiter(interval, breakCondition, paramToTransfer) {
        if (!interval) {
            interval = 1000;
        }
        return new Promise(function (resolve) {
            setTimeout(wait, 1000);

            function wait() {
                if (breakCondition()) {
                    return resolve(paramToTransfer);
                } else {
                    setTimeout(wait, interval)
                }
            };
        });
    }


    static filterCv(greetAnchor, config, city) {
        let maxAge = config['max-age-' + city] || 100;
        let maxWorkAge = config['max-exp-' + city] || 100;
        let minWorkAge = config['min-exp-' + city] || 0;
        let minSalary = config['min-salary-' + city] || 0;
        let universityFilter = config['uni-filter-' + city];

        //取到现在的公司
        let exp = greetAnchor.getElementsByClassName('experience')[0];
        let skipCompanyStr = config['company' + "-" + city];
        let skipCompany;
        if (skipCompanyStr) {
            skipCompany = JSON.parse(skipCompanyStr);
        }
        if (exp && skipCompany) {
            for (let c in skipCompany) {
                if (exp.innerText.indexOf(skipCompany[c]) > -1) {
                    return false;
                }
            }
        }
        if (universityFilter) {
            if (exp.nextElementSibling) {
                let university = [].reduce.call(exp.nextElementSibling.childNodes, function (a, b) {
                    return a.trim() + (b.nodeType === 3 ? b.textContent : '');
                }, '').split(" ");
                //包含了专业,university 例子：["西北大学", "软件工程"]
                if (university.length > 1) {
                    let majorArray = ['计算机', '软件', '电子', '信息', '自动化', '通信', '控制'];
                    let passMajor = false;
                    for (let i = 0; i < majorArray.length; ++i) {
                        if (university[1].indexOf(majorArray[i]) > -1) {
                            passMajor = true;
                            break;
                        }
                    }
                    if (!passMajor) {
                        return false;
                    }
                }
                let uniArray = ['清华', '北大', '北航', '北京航空航天', '北京理工', '北京师范', '北京邮电', '中国人民大学', "哈工大", "中科院", "中国科学院"
                    , '哈尔滨工业', '吉林大学', '东北大学', '东北师范', '大连理工', '西安交通大学', '西北工业', '湖南大学', '中南大学', "华科", "武大"
                    , '西安电子科技', '电子科技', '四川大学', '重庆大学', '重庆邮电', '北京科技', '北京交通', '武汉大学', '华中科技', '武汉理工'
                    , '复旦', '南开', '天津大学', '南京大学', '东南大学', '厦门大学', '中山大学', '华南理工', '浙江大学', '上海交通大学', '同济']
                let passUni = false;
                for (let i = 0; i < uniArray.length; ++i) {
                    if (university[0].indexOf(uniArray[i]) > -1) {
                        passUni = true;
                        break;
                    }
                }
                if (!passUni) {
                    return false;
                }
            } else {
                return false;
            }
        }


        let labelText = greetAnchor.getElementsByClassName('label-text');
        let currentAge = labelText[3].textContent.substr(0, labelText[3].textContent.length - 1);
        let workAge = labelText[1].textContent.substr(0, labelText[1].textContent.length - 1);
        //取到待遇
        let currentSalarySpan = greetAnchor.getElementsByClassName('badge-salary')[0].textContent;
        if (currentSalarySpan.indexOf("-") == -1) {
            return false;
        }

        let currentSalaryStr = currentSalarySpan.split("-")[0];
        let currentSalary = currentSalaryStr.substr(0, currentSalaryStr.length - 1);

        return (parseInt(maxAge) >= parseInt(currentAge)) && (parseInt(minWorkAge) <= parseInt(workAge))
            && (parseInt(maxWorkAge) >= parseInt(workAge)) && (parseInt(currentSalary) >= parseInt(minSalary));

    }


    static getJob(config, city) {
        let jobIndex = config['job-index-' + city];
        let jobRequest = new XMLHttpRequest();
        let url = 'https://www.zhipin.com/bossweb/joblist/data.json?' +
            'page=1&type=0&status=0&_=1543980515163';
        return new Promise((resolve, reject) => {
            jobRequest.onreadystatechange = () => {
                if (jobRequest.readyState === XMLHttpRequest.DONE) {
                    if (jobRequest.status == 200) {
                        let ret = JSON.parse(jobRequest.response);
                        let doc = document.createElement("div");
                        doc.innerHTML = ret.html;
                        resolve([doc.getElementsByClassName('link-recommend')[jobIndex - 1].dataset.jobid
                            , config]);

                    } else {
                        reject("http status in get job");
                    }
                }
            }
            jobRequest.onerror = () => reject("http error in get job ");
            jobRequest.open("GET", url, true);
            jobRequest.send();
        });
    }

    static loadCity() {
        return new Promise((resolve => {
            chrome.storage.local.get("city", resolve);
        }));
    }

    static loadConfig(city) {
        let keyArray = ['salary', 'experience', 'degree', 'max-age', 'min-exp', 'max-exp'
            , 'min-salary', 'job-index', 'page-count', 'company', 'message', 'uni-filter'];
        keyArray.forEach((item, i, t) => t[i] = item + "-" + city);
        return new Promise((resolve => chrome.storage.local.get(keyArray, resolve)));
    }

    static getGeek(geekUrl, config, city) {
        let getGeekHttpRequest = new XMLHttpRequest();
        let that = this;
        return new Promise(resolve => {
            getGeekHttpRequest.onreadystatechange = function () {
                if (getGeekHttpRequest.readyState == XMLHttpRequest.DONE
                    && getGeekHttpRequest.status == 200) {
                    let response = JSON.parse(getGeekHttpRequest.response);
                    if (response["hasMore"]) {
                        let doc = document.createElement("div");
                        doc.innerHTML = response["htmlList"];
                        //取到所有的待打招呼的节点
                        let greet = doc.getElementsByClassName('btn-greet');
                        let ret = []
                        for (let n = 0; n < greet.length; ++n) {
                            let a = greet[n].closest('.sider-op').nextElementSibling;
                            if (!that.filterCv(a, config, city)) {
                                continue;
                            }
                            ret.push(a);
                        }
                        resolve(ret);
                    } else {
                        resolve([]);
                    }
                }
            }
            getGeekHttpRequest.onerror = () => resolve([])
            getGeekHttpRequest.open("GET", geekUrl, true);
            getGeekHttpRequest.send();
        });
    }

    static greet(greetElement) {
        let btnGreetUrl = "https://www.zhipin.com/chat/batchAddRelation.json";
        //记录下多少人成功的打招呼了
        let param = 'gids=' + greetElement.dataset.uid + "&jids=" + greetElement.dataset.jid
            + '&expectIds=' + greetElement.dataset.expect + "&lids=" + greetElement.dataset.lid;


        let btnGreetHttpRequest = new XMLHttpRequest();
        btnGreetHttpRequest.open("POST", btnGreetUrl, false);
        btnGreetHttpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        return new Promise((resolve, reject) => {
            btnGreetHttpRequest.onreadystatechange = () => {
                if (btnGreetHttpRequest.readyState === XMLHttpRequest.DONE) {
                    if (btnGreetHttpRequest.status === 200) {
                        let btnGreetResponse = JSON.parse(btnGreetHttpRequest.response);
                        if (btnGreetResponse.rescode == 1) {
                            resolve(greetElement.dataset.uid);
                        } else {
                            reject("rescode not equal 1")
                        }

                    } else {
                        reject("http error in greet")
                    }
                }
            }
            btnGreetHttpRequest.onerror = () => reject("http error in greet")
            btnGreetHttpRequest.send(param);
        })
    }

    static process() {
        let that = this;
        this.loadCity().then((ret) => {
            this.city = ret.city || 0;
            return this.loadConfig(this.city);
        }).then((config) => {
            this.message = config['message-' + this.city];
            return this.getJob(config, this.city)
        }).then(([jobId, config]) => {
            chrome.runtime.sendMessage({"msg": "获取职位完成"});
            let totalPage = config['page-count-' + this.city]
            if (!totalPage) {
                alert("没有设置候选人页数，默认是1");
                totalPage = 1;
            }
            let promiseArray = [];
            let geekUrl = 'https://www.zhipin.com/boss/recommend/geeks.json?status=0&jobid=' + jobId
                + '&salary=' + (config['salary' + "-" + this.city] || 0) + '&experience=' +
                (config['experience' + "-" + this.city] || 0) +
                '&degree=' + (config['degree' + "-" + this.city] || 0) + '&page=';

            for (let m = 1; m <= totalPage; ++m) {
                promiseArray.push(this.getGeek(geekUrl + m, config, this.city))
            }
            return Promise.all(promiseArray);
        }).then((t) => {
            chrome.runtime.sendMessage({"msg": "获取候选人完成"});
            let greetArray = [];
            for (let i = 0; i < t.length; ++i) {
                if (t[i].length > 0) {
                    greetArray = greetArray.concat(t[i]);
                }
            }
            if (greetArray.length === 0) {
                alert("没有合适的候选人了");
                return Promise.reject("empty");
            }

            return greetArray;

        }).then(
            (greetArray) => {
                let p = greetArray.map((value) => {
                    return that.greet(value);
                })
                return Promise.all(p);
            }
        ).then((uidArray) => {
            chrome.runtime.sendMessage({"msg": "打招呼完成"});
            let uidCollection = {};
            uidArray.forEach((value) => {
                uidCollection[value] = 1;
            });
            let communicate = document.querySelectorAll("[ka='menu-im']")[0];
            if (Object.values(communicate.closest('.menu-chat').classList)
                    .indexOf("cur") == -1) {
                communicate.click();
            }
            return this.waiter(1000,
                (function () {
                    let tmp = undefined;
                    return function () {
                        if (Object.values(communicate.closest('.menu-chat').classList)
                                .indexOf("cur") > -1) {
                            if (tmp === undefined) {
                                tmp = document.getElementsByClassName('main-list')[0]
                                    .getElementsByTagName('li')[0].getElementsByTagName('a')[0]
                                    .dataset.uid;
                                return false;
                            }

                            let cur = document.getElementsByClassName('main-list')[0]
                                .getElementsByTagName('li')[0].getElementsByTagName('a')[0]
                                .dataset.uid;
                            if (cur === tmp) {
                                return true;
                            }
                            tmp = cur;
                            return false;
                        } else {
                            return false;
                        }
                    }
                })()
                , uidCollection);
        }).then((uidCollection) => {
            chrome.runtime.sendMessage({"msg": "正在发送常用语..."});
            let chatContainer = document.getElementsByClassName('chat-container')[0];
            let chatMessage = chatContainer.getElementsByClassName('chat-message')[0];
            let btnSend = chatContainer.getElementsByClassName('btn-send')[0];
            let mainList = document.getElementsByClassName('main-list')[0]
                .getElementsByTagName('li');

            let p = Promise.resolve();

            for (let i = 0; i < Object.keys(uidCollection).length; ++i) {
                p = p.then(() => {
                    let li = mainList[i];
                    let clickA = li.getElementsByTagName('a')[0];
                    if (uidCollection.hasOwnProperty(clickA.dataset.uid)) {
                        delete uidCollection[clickA.dataset.uid];
                        clickA.click();
                        return this.waiter(1000, () => Object.values(li.classList).indexOf("cur") > -1)
                            .then(() => {
                                    chatMessage.textContent = this.message;
                                    btnSend.click();
                                    return new Promise(resolve => {
                                        setTimeout(resolve, 1000);
                                    })
                                }
                            );
                    }
                    return Promise.resolve();
                })
            }
            return p;
        }).then(null, (err) => {
            console.log(err);
        }).finally(() => {
            chrome.runtime.sendMessage({"msg": "success"});
        });
    }
}

BossApp.process();

