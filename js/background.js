/**
 * Created by bowen on 16/3/31.
 */

'use strict';

console.log('background.js');

let activeCase;

let modifiedUrlCount = 0;

const manifest = chrome.runtime.getManifest();  //插件manifest信息

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

    //监听所有请求，header发出前对请求进行修改
    //https://developer.chrome.com/extensions/webRequest#event-onBeforeRequest
    const onBeforeRequestHandler = (details) => {
        if (isIgnoredRequest(details)) {
            return;
        }

        //应用GET参数修改规则
        let newUrl = modifyGetParams(details);
        if (newUrl && newUrl != details.url) {

            modifiedUrlCount++;
            // console.log(`[${modifiedUrlCount}] mofify url:  ${details.url} => ${newUrl}`);  //log

            console.group(`[${modifiedUrlCount}] modify url: (${new Date()})`);
            console.log('from:', details.url);
            console.log('to:', newUrl);
            console.groupEnd();

            return {redirectUrl: newUrl};
        }
    };
    chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestHandler);
    chrome.webRequest.onBeforeRequest.addListener(
        onBeforeRequestHandler,
        {urls: ["<all_urls>"]},
        ["blocking"]);


    //监听所有请求，header发出前对请求进行修改
    //https://developer.chrome.com/extensions/webRequest#event-onBeforeSendHeaders
    const onBeforeSendHeadersHandler = (details) => {
        //console.log(details);

        if (isIgnoredRequest(details)) {
            return;
        }

        modifyHeaders(details);
        modifyUserAgent(details);

        return {requestHeaders: details.requestHeaders};
    };
    chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeadersHandler);
    chrome.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeadersHandler,
        {urls: ["<all_urls>"]},
        ["blocking", "requestHeaders"]);

//监听请求
    chrome.extension.onRequest.addListener(
        (request, sender, sendResponse) => {
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
    chrome.storage.onChanged.addListener(
        (changes, namespace) => {
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

        //解析activeCase字段

        // - targetDomains
        activeCase.targetDomainKeywordsArr = activeCase.targetDomains.replace(/ /g, '').split(',');

        if (activeCase) {
            //设置 badge 文本
            chrome.browserAction.setBadgeText({text: activeCase.name});

            //组装 browser action title
            let title =
                `Case: ${activeCase.name}`;

            if (activeCase.ua) {
                title += `\n\nUser Agent:\n${decorateUa(activeCase.ua)}`;
            }

            if (activeCase.headers) {
                title += `\n\nHeaders:\n${activeCase.headers}`;
            }

            if (activeCase.params) {
                title += `\n\nParams:\n${activeCase.params}`;
            }

            //设置 browser action title
            chrome.browserAction.setTitle(
                {
                    title: title
                });

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

/**
 * 修改headers
 * @param details
 */
function modifyHeaders(details) {
    if (!activeCase || !activeCase.parsedHeaders || activeCase.parsedHeaders == {}) {
        return;
    }

    //增加到请求的 header
    let keys = Object.keys(activeCase.parsedHeaders);
    keys.forEach((key)=> {
        //添加到真正的header
        details.requestHeaders.push({name: key, value: activeCase.parsedHeaders[key]});
    })
}

/**
 * 修改ua
 * @param details
 */
function modifyUserAgent(details) {
    if (!activeCase || !activeCase.ua) {
        return;
    }

    let decoratedUserAgentStr = decorateUa(activeCase.ua);

    for (let i = 0; i < details.requestHeaders.length; i++) {
        let requestHeader = details.requestHeaders[i];
        let headerName = requestHeader.name.toLowerCase();

        //修改user agent
        if (headerName && headerName.startsWith('user') && headerName.indexOf('agent') > 0) {

            requestHeader.value = decoratedUserAgentStr;
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
        (newQueryString, pair)=>
            newQueryString.concat(encodeURIComponent(pair.key), '=', encodeURIComponent(pair.value), '&')
        , '');

    //组装新URL
    aNode.search = '?' + newQueryString.slice(0, newQueryString.length - 1);   //删除结尾多余的'&'
    let newUrl = aNode.href;

    //cleanup
    document.body.removeChild(aNode);

    return newUrl;
}

/**
 * 从URL获取域名
 * @param url
 * @returns {string|ArrayBuffer|Blob}
 */
function getDomain(url) {
    let tmp = url.slice(url.indexOf('//') + 2);
    return tmp.slice(0, tmp.indexOf('/'));
}


/**
 * 判断是否需要忽略的请求
 * @param details
 * @returns {boolean}
 */
function isIgnoredRequest(details) {
    let url = details.url;


    //只对http和https协议修改请求
    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
        return false;
    }

    if (!activeCase) {
        return false;
    }

    if (!activeCase.targetDomains || activeCase.targetDomains == '') {
        return true;
    }

    // 判断是否在作用的域名范围内
    let domain = getDomain(url);
    console.log(domain);
    let isHitTargetDomains = false;
    let domainArr = activeCase.targetDomainKeywordsArr;
    for (let i = 0; i < domainArr.length; i++) {
        //关键字匹配
        if (domain.indexOf(domainArr[i]) >= 0) {
            //命中指定域名关键字
            isHitTargetDomains = true;
            break;
        }
    }

    return !isHitTargetDomains; //返回
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

                    let key = customHeaderLine.slice(0, index);
                    let value = customHeaderLine.slice(index + 1, customHeaderLine.length);

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

function decorateUa(ua) {
    return `${ua} ${manifest.short_name}/${manifest.version}`;
}