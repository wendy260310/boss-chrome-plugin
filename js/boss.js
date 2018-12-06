(function () {
    //get job id
    let job = document.querySelectorAll('[ka="recommend-job-1"]')[0];
    let message;

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

    let getReply = function () {
        let r = new XMLHttpRequest();
        let url = 'https://www.zhipin.com/setting/replyword/list.json';

        r.onreadystatechange = () => {
            if (r.readyState == XMLHttpRequest.DONE && r.status == 200) {
                message = JSON.parse(r.response).replyWords[2];
            }
        }
        r.open('GET', url, true);
        r.send();
    };


    let filter = function (greetAnchor) {
        let maxAge = 30;
        let maxWorkAge = 5;
        let minWorkAge = 3;
        let minSalary = 25;
        let labelText = greetAnchor.getElementsByClassName('label-text');

        let currentAge = labelText[3].textContent.substr(0, labelText[3].textContent.length - 1);
        console.log(currentAge);

        let workAge = labelText[1].textContent.substr(0, labelText[1].textContent.length - 1);

        console.log(workAge);

        let currentSalarySpan = greetAnchor.getElementsByClassName('badge-salary')[0].textContent;

        console.log(currentSalarySpan);

        if (currentSalarySpan.indexOf("-") == -1) {
            return false;
        }

        let currentSalaryStr = currentSalarySpan.split("-")[0];

        let currentSalary = currentSalaryStr.substr(0, currentSalaryStr.length - 1);
        console.log(currentSalary);

        return maxAge >= currentAge && minWorkAge <= workAge
            && maxWorkAge >= workAge && currentSalary >= minSalary;

    }


    if (!job) {
        alert("没有找到岗位，请先发布一个岗位！");
    } else {
        //拿到job id
        let jobId = job.dataset.jobid;
        //取到打招呼的消息
        getReply();

        let getGeekHttpRequest = new XMLHttpRequest();
        let geekUrl = 'https://www.zhipin.com/boss/recommend/geeks.json?status=0&jobid=' + jobId
            + '&salary=406&experience=105&degree=203&_=1543914502205&page=1';

        getGeekHttpRequest.onreadystatechange = function () {
            if (getGeekHttpRequest.readyState == XMLHttpRequest.DONE) {
                if (getGeekHttpRequest.status == 200) {
                    let response = JSON.parse(getGeekHttpRequest.response);
                    if (response.hasMore) {
                        let doc = document.createElement("div");
                        doc.innerHTML = response.htmlList;
                        //取到所有的待打招呼的节点
                        let greet = doc.getElementsByClassName('btn-greet');
                        //准备http 请求
                        let btnGreetUrl = "https://www.zhipin.com/chat/batchAddRelation.json";

                        //记录下多少人成功的打招呼了
                        let btnGreetSuccessNum = 0;
                        //总共发起了多少个打招呼
                        let btnGreetTotal = 0;
                        //网络请求完成了多少个
                        let btnGreetFinish = 0;

                        //打完招呼，这里是同步请求
                        for (let i = 0; i < greet.length; ++i) {

                            let a = greet[i].closest('.sider-op').nextElementSibling;
                            if (!filter(a)) {
                                continue;
                            }

                            btnGreetTotal++;

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

                        //等待打招呼完成
                        waiter(500, () => btnGreetTotal == btnGreetFinish, () => {

                            //找到沟通这个按钮
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
                                        }, 500);
                                        sendMessageOneByOne(curIndex + 1, maxIndex, mainList, chatMessage, btnSend);
                                    });
                            }

                        });
                    }
                }
            }
        }
        getGeekHttpRequest.open("GET", geekUrl, true);
        getGeekHttpRequest.send();
    }
})();


