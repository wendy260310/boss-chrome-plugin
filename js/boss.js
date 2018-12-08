(function () {
    //get job id
    let jobId;
    let message;
    let config = undefined;
    let waiter = function (intervel, breakCondition, doAfterBreak) {
        if (!intervel)
            intervel = 1000;

        let checker = setInterval(doCheck, intervel);

        function doCheck() {
            if (breakCondition()) {
                clearInterval(checker);
                doAfterBreak();
            }
        }
    }

    let loadConfig = function () {
        let keyArray = ['salary', 'experience', 'degree', 'max-age', 'min-exp', 'max-exp'
            , 'min-salary', 'job-index', 'message-index', 'page-count'];

        chrome.storage.local.get(keyArray, function (result) {
            config = result;
        });
    }


    let getJob = function (i) {
        let jobRequest = new XMLHttpRequest();
        let url = 'https://www.zhipin.com/bossweb/joblist/data.json?' +
            'page=1&type=0&status=0&_=1543980515163';
        jobRequest.onreadystatechange = () => {
            if (jobRequest.readyState == XMLHttpRequest.DONE
                && jobRequest.status == 200) {
                let ret = JSON.parse(jobRequest.response);
                let doc = document.createElement("div");
                doc.innerHTML = ret.html;
                jobId = doc.getElementsByClassName('link-recommend')[i].dataset.jobid;
            }
        }
        jobRequest.open("GET", url, true);
        jobRequest.send();

    }

    let getReply = function () {
        let r = new XMLHttpRequest();
        let url = 'https://www.zhipin.com/setting/replyword/list.json';

        r.onreadystatechange = () => {
            if (r.readyState == XMLHttpRequest.DONE && r.status == 200) {
                message = JSON.parse(r.response).replyWords[config['message-index'] - 1];
            }
        }
        r.open('GET', url, true);
        r.send();
    };


    let filter = function (greetAnchor) {
        let maxAge = config['max-age'];
        let maxWorkAge = config['max-exp'];
        let minWorkAge = config['min-exp'];
        let minSalary = config['min-salary'];

        //取到现在的公司
        let exp = greetAnchor.getElementsByClassName('experience')[0];
        let skipCompanyStr = config['company'];
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

        return (!maxAge || maxAge >= currentAge) && (!minWorkAge || minWorkAge <= workAge)
            && (!maxWorkAge || maxWorkAge >= workAge) && (!minSalary || currentSalary >= minSalary);

    }

    loadConfig();
    waiter(500, () => config, () => {
        getJob(config['job-index'] - 1);
        waiter(500, () => jobId, () => {
            getReply();
            let greetArray = [];
            let totalPage = config['page-count']
            if (!totalPage) {
                alert("没有设置候选人页数，默认是1");
                totalPage = 1;
            }

            let finishPage = 0;
            for (let m = 1; m <= totalPage; ++m) {
                let getGeekHttpRequest = new XMLHttpRequest();
                let geekUrl = 'https://www.zhipin.com/boss/recommend/geeks.json?status=0&jobid=' + jobId
                    + '&salary=' + (config['salary'] || 0) + '&experience=' + (config['experience'] || 0) +
                    '&degree=' + (config['degree'] || 0) + '&_=1543914502205&page=' + m;
                getGeekHttpRequest.onreadystatechange = function () {
                    if (getGeekHttpRequest.readyState == XMLHttpRequest.DONE
                        && getGeekHttpRequest.status == 200) {
                        let response = JSON.parse(getGeekHttpRequest.response);
                        if (response.hasMore) {
                            let doc = document.createElement("div");
                            doc.innerHTML = response.htmlList;
                            //取到所有的待打招呼的节点
                            let greet = doc.getElementsByClassName('btn-greet');
                            for (let n = 0; n < greet.length; ++n) {
                                let a = greet[n].closest('.sider-op').nextElementSibling;
                                if (!filter(a)) {
                                    continue;
                                }
                                greetArray.push(a);
                            }
                            finishPage++;
                        }
                    }
                }
                getGeekHttpRequest.open("GET", geekUrl, true);
                getGeekHttpRequest.send();
            }
            waiter(500, () => finishPage == totalPage, () => {
                let btnGreetUrl = "https://www.zhipin.com/chat/batchAddRelation.json";
                //记录下多少人成功的打招呼了
                let btnGreetSuccessNum = 0;
                //网络请求完成了多少个
                let btnGreetFinish = 0;
                for (let i = 0; i < greetArray.length; ++i) {
                    let a = greetArray[i];
                    let param = 'gids=' + a.dataset.uid + "&jids=" + a.dataset.jid
                        + '&expectIds=' + a.dataset.expect + "&lids=" + a.dataset.lid;


                    let btnGreetHttpRequest = new XMLHttpRequest();

                    btnGreetHttpRequest.open("POST", btnGreetUrl, false);
                    btnGreetHttpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    btnGreetHttpRequest.onreadystatechange = () => {
                        if (btnGreetHttpRequest.readyState == XMLHttpRequest.DONE &&
                            btnGreetHttpRequest.status == 200) {
                            let btnGreetResponse = JSON.parse(btnGreetHttpRequest.response);
                            if (btnGreetResponse.rescode == 1) {
                                btnGreetSuccessNum++;
                            }
                            btnGreetFinish++;
                        }
                    }
                    btnGreetHttpRequest.send(param);
                }

                waiter(500, () => greetArray.length == btnGreetFinish, () => {

                    let communicate = document.querySelectorAll("[ka='menu-im']")[0];
                    communicate.click();
                    //找到chat room
                    let chatContainer = document.getElementsByClassName('chat-container')[0];
                    let chatMessage = chatContainer.getElementsByClassName('chat-message')[0];
                    let btnSend = chatContainer.getElementsByClassName('btn-send')[0];

                    waiter(500, () => chatContainer.style.display === 'block'
                        , () => {
                            //进到聊天了，然后要点开具体的某个人
                            let mainList = document.getElementsByClassName('main-list')[0]
                                .getElementsByTagName('li');

                            sendMessageOneByOne(0, btnGreetSuccessNum, mainList, chatMessage, btnSend);
                        });

                    function sendMessageOneByOne(curIndex, maxIndex, mainList, chatMessage, btnSend) {
                        if (curIndex >= maxIndex)
                            return;
                        let li = mainList[curIndex];
                        li.getElementsByTagName('a')[0].click();
                        waiter(500, () => Object.values(li.classList).indexOf("cur") > -1,
                            () => {
                                chatMessage.textContent = message;
                                btnSend.click();
                                setTimeout(() => {
                                }, 1000);
                                sendMessageOneByOne(curIndex + 1, maxIndex, mainList, chatMessage, btnSend);
                            });
                    }
                })
            });
        });
    });
})();


