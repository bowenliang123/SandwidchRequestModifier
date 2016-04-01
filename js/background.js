/**
 * Created by bowen on 16/3/31.
 */

'use strict';

console.log('background.js');

// 监听 Browser Actions 按钮点击事件
chrome.browserAction.onClicked.addListener(function (tab) {
    //打开选项页
    chrome.tabs.create({'url': chrome.extension.getURL('html/main.html')}, function (tab) {
    });
});

//监听所有请求，header发出前对请求进行修改
//https://developer.chrome.com/extensions/webRequest#event-onBeforeRequest
chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        //console.log(details);

        //检查 URL 参数并加入
        //if (details.url.indexOf('#34567') < 0) {
        //    return {redirectUrl: details.url + '#34567'}
        //}
    },
    {urls: ["<all_urls>"]},
    ["blocking"]);


//监听所有请求，header发出前对请求进行修改
//https://developer.chrome.com/extensions/webRequest#event-onBeforeSendHeaders
chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        //console.log(details);

        modifyHeaders(details);
        modifyUserAgent(details);

        return {requestHeaders: details.requestHeaders};
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]);

//监听请求
chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        if (request.action == "getAllCases") {
            var allCases = getAllCases();
            sendResponse({cases: allCases});
        }

        else if (request.action == "saveAllCases") {
            saveAllCases(request.casesStr);
        }

        else if (request.action == "activateCase") {
            activateCase(request.caseStr);
        }

        else if (request.action == "deactivateCase") {
            deactivateCase(request.caseStr);
        }

        else
            sendResponse({}); // snub them.
    });

function appendHeaders(requestHeaders, additionalHeaders) {
    if (!additionalHeaders || additionalHeaders.length < 1) {
        return;
    }

    //遍历自定义headers
    let keys = Object.keys(additionalHeaders);
    keys.forEach((key)=> {
        //添加到真正的header
        requestHeaders.push({name: key, value: additionalHeaders[key]});
    })
}

let activeCase;
let allCases = [
    {
        caseId: 0,
        name: 'UC',
        ua: 'Mozilla/5.0 (Linux; U; Android 4.4.4; zh-CN; MI 4LTE Build/KTU84P) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/10.9.2.712 U3/0.8.0 Mobile',
        headers: "headerKey:headerValue0"
    },
    {
        caseId: 1,
        name: 'Wechat',
        ua: 'mozilla/5.0 (linux; u; android 4.1.2; zh-cn; mi-one plus build/jzo54k) applewebkit/534.30 (khtml, like gecko) version/4.0 mobile safari/534.30 micromessenger/5.0.1.352                ',
        headers: "headerKey:headerValue1"
    },
    {
        caseId: 2,
        name: 'Weibo',
        ua: 'Mozilla/5.0 (Linux; U; Android 4.0.4; zh-cn; HTC Sensation XE with Beats Audio Z715e Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        headers: "key1:value1\nkey2:value2"
    }
];
function getAllCases() {
    return allCases;
}

function saveAllCases(casesStr) {
    allCases = JSON.parse(casesStr);
}

function activateCase(caseStr) {
    activeCase = JSON.parse(caseStr);

    //设置 badge 文本
    chrome.browserAction.setBadgeText({text: activeCase.name});
}

function deactivateCase() {
    activeCase = undefined;

    //清除 badge 文本
    chrome.browserAction.setBadgeText({text: ''});
}

function modifyHeaders(details) {
    if (!activeCase || !activeCase.headers) {
        return;
    }

    //准备自定义header
    let modHeaderLines = activeCase.headers.split('\n');
    if (!modHeaderLines || modHeaderLines.length < 1) {
        return;
    }

    let customHeaders = {};
    modHeaderLines.forEach((modHeaderStr)=> {
        if (!modHeaderStr || modHeaderStr.indexOf(':') < 0) {
            return;
        }

        let headerKeyValue = modHeaderStr.split(':');
        if (headerKeyValue && headerKeyValue.length == 2) {
            //加入自定义header
            customHeaders[headerKeyValue[0]] = headerKeyValue[1].concat();
        }
    });

    //增加到请求的 header
    appendHeaders(details.requestHeaders, customHeaders);
}


function modifyUserAgent(details) {
    if (!activeCase || !activeCase.ua) {
        return;
    }

    details.requestHeaders.forEach((requestHeader)=> {
        let headerName = requestHeader.name.toLowerCase();
        if (!headerName || headerName.indexOf('user') < 0 || headerName.indexOf('agent') < 0) {
            return;
        }

        requestHeader.value = activeCase.ua;
    });
}