/**
 * Created by bowen on 16/3/31.
 */

'use strict';

console.log('background.js');

let activeCase;

let demoCases = [
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

//初始化
(function init() {
    //获取激活的用例
    fetchActiveCase();


    //// 监听 Browser Actions 按钮点击事件
    //chrome.browserAction.onClicked.addListener(function (tab) {
    //    //打开选项页
    //    chrome.tabs.create({'url': chrome.extension.getURL('html/main.html')}, function (tab) {
    //    });
    //});

    //监听所有请求，header发出前对请求进行修改
    //https://developer.chrome.com/extensions/webRequest#event-onBeforeRequest
    chrome.webRequest.onBeforeRequest.addListener(
        function (details) {
            if (isIgnoredRequest(details)) {
                return;
            }

            //应用GET参数修改规则
            let newUrl = modifyGetParams(details);
            if (newUrl != details.url) {
                return {redirectUrl: newUrl};
            }
        },
        {urls: ["<all_urls>"]},
        ["blocking"]);


    //监听所有请求，header发出前对请求进行修改
    //https://developer.chrome.com/extensions/webRequest#event-onBeforeSendHeaders
    chrome.webRequest.onBeforeSendHeaders.addListener(
        function (details) {
            //console.log(details);

            if (isIgnoredRequest(details)) {
                return;
            }

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
                getAllCases((cases)=> {
                    sendResponse({cases: cases});
                });

            }

            else if (request.action == "saveAllCases") {
                let cases = JSON.parse(request.casesStr);
                saveAllCases(cases);
            }

            //激活用例
            else if (request.action == "activateCase") {
                let simCase = parseActiveCase(request.caseStr);
                saveActiveCase(simCase);
            }

            //关闭用例
            else if (request.action == "deactivateCase") {
                saveActiveCase(null);
            }

            //获取激活的用例
            else if (request.action == "getActiveCase") {
                fetchActiveCase((simCase)=> {
                    sendResponse({activeCase: simCase});
                });
            }

            else
                sendResponse({}); // snub them.
        });

//监听chrome storage 变化
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (let key in changes) {
            if (key == 'activeCase') {
                fetchActiveCase();
            }

            else if (key == 'allCases') {
            }
        }
    });
})();

function getAllCases(callback) {
    //https://developer.chrome.com/extensions/storage#property-sync
    chrome.storage.sync.get('allCases', (items) => {
        callback && callback(items['allCases']);
    });
}

function saveAllCases(cases) {
    if (!cases) {
        return;
    }

    // Save it using the Chrome extension storage API.
    //https://developer.chrome.com/extensions/storage#property-sync
    chrome.storage.sync.set({'allCases': cases}, () => {
        console.log('saveAllCases finished.');
    });
}

function fetchActiveCase(callback) {
    chrome.storage.sync.get('activeCase', (items) => {
        activeCase = items['activeCase'];

        if (activeCase) {
            //设置 badge 文本
            chrome.browserAction.setBadgeText({text: activeCase.name});

            //清除 browser action title
            chrome.browserAction.setTitle({title: `Name:  ${activeCase.name}\n\nUser Agent:\n${activeCase.ua}\n\nHeaders:\n${activeCase.headers}`});

            callback && callback(items['activeCase']);
        } else {
            //设置 badge 文本
            chrome.browserAction.setBadgeText({text: ''});

            //清除 browser action title
            chrome.browserAction.setTitle({title: ''});

            callback && callback(null);
        }
    });
}

function saveActiveCase(simCase) {
    chrome.storage.sync.set({'activeCase': simCase}, () => {
        console.log('saveActiveCase finished.');
    });
}

function modifyHeaders(details) {
    if (!activeCase || !activeCase.parsedHeaders || activeCase.parsedHeaders == {}) {
        return;
    }

    //增加到请求的 header
    $.extend(details.requestHeaders, activeCase.parsedHeaders);
}

function modifyUserAgent(details) {
    if (!activeCase || !activeCase.ua) {
        return;
    }

    for (let i = 0; i < details.requestHeaders.length; i++) {
        let requestHeader = details.requestHeaders[i];
        let headerName = requestHeader.name.toLowerCase();

        //修改user agent
        if (headerName && headerName.startsWith('user') && headerName.indexOf('agent') > 0) {
            requestHeader.value = activeCase.ua;
            break;
        }
    }
}

function modifyGetParams(details) {
    if (!activeCase || !activeCase.parsedParams || activeCase.parsedParams == {}) {
        return;
    }

    let currentUrl = details.url;

    let aNode = document.createElement('a');
    aNode.style.display = 'none';
    document.body.appendChild(aNode);
    aNode.href = currentUrl;

    let queryString = '' + aNode.search.slice(1, aNode.search.length);

    //拆解 query string 为键值对
    let pairs = queryString.split('&').reduce((pairs, paramLine)=> {
            let pair = paramLine.split('=');
            if (pair && pair[0] && pair[1]) {
                pairs.push({key: decodeURIComponent(pair[0]), value: decodeURIComponent(pair[1])});
            }
            return pairs;
        }
        , []);


    pairs = Object.keys(activeCase.parsedParams).reduce((pairs, key)=> {
            let value = activeCase.parsedParams[key];
            let foundPair = pairs.find((pair)=> pair.key == key);

            if (foundPair) {
                foundPair.value = value;
                return pairs;
            } else {
                pairs.push({key: key, value: value});
                return pairs;
            }
        }
        , pairs);

    //组装新query string
    let newQueryString = pairs.reduce(
        (result, pair)=>
            result.concat(encodeURIComponent(pair.key), '=', encodeURIComponent(pair.value), '&')
        , '?');
    newQueryString = newQueryString.slice(0, newQueryString.length - 1);    //删除结尾多余的&

    //组装新URL
    let newUrl = aNode.protocol.concat('//', aNode.host, aNode.pathname, newQueryString, aNode.hash);

    //cleanup
    document.body.removeChild(aNode);

    return newUrl;
}

function isIgnoredRequest(details) {
    let url = details.url;

    //只对http和https协议修改请求
    return !(url.startsWith('http://') || url.startsWith('https://'));
}

/**
 * 解析激活用例
 */
function parseActiveCase(simCaseStr) {

    function parseHeaders(simCase) {
        //parse headers
        if (!simCase.headers || simCase.headers == '') {
            simCase.headers = undefined;
        } else {
            let customHeaderLines = simCase.headers.split('\n');
            simCase.parsedHeaders = customHeaderLines.reduce((headers, customHeaderLine)=> {
                    let index = customHeaderLine.indexOf(':');
                    if (index <= 0 || index == customHeaderLine.length - 1) {
                        return headers;
                    }

                    let key = decodeURIComponent(customHeaderLine.slice(0, index));
                    let value = decodeURIComponent(customHeaderLine.slice(index + 1, customHeaderLine.length));

                    headers[key] = value;
                    return headers;
                }
                , {});
        }
    }

    function parseParams(simCase) {
        //params
        if (!simCase.params || simCase.params == '') {
            simCase.params = undefined;
        } else {
            let customParamLines = simCase.params.split('\n');
            simCase.parsedParams = customParamLines.reduce((params, customParamLine)=> {
                    let index = customParamLine.indexOf('=');
                    if (index <= 0 || index == customParamLine.length - 1) {
                        return params;
                    }

                    let key = decodeURIComponent(customParamLine.slice(0, index));
                    let value = decodeURIComponent(customParamLine.slice(index + 1, customParamLine.length));

                    params[key] = value;
                    return params;
                }
                , {});
        }
    }

    let simCase;
    try {
        simCase = JSON.parse(simCaseStr);
    } catch (e) {
        return;
    }

    //UA
    if (simCase.ua == '') {
        simCase.ua = undefined;
    }

    //解析 headers
    parseHeaders(simCase);

    //解析 params
    parseParams(simCase);

    return simCase;

}