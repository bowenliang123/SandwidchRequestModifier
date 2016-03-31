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
        //增加header
        addHeaders(details.requestHeaders, {aaaaa: 'bowen'});

        return {requestHeaders: details.requestHeaders};
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]);

//监听请求
chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        if (request.action == "getAllCases")
            {
                var allCases = getAllCases();
                console.log(allCases);
                sendResponse({cases: allCases});
            }
        else
            sendResponse({}); // snub them.
    });

function addHeaders(requestHeaders, additionalHeaders) {
    let keys = Object.keys(additionalHeaders);
    keys.forEach((key)=> {
        requestHeaders.push({name: key, value: additionalHeaders[key]});
    })
}

function getAllCases() {
    return [
        {
            caseId: 0,
            name: 'UC',
            ua: 'Mozilla/5.0 (Linux; U; Android 4.4.4; zh-CN; MI 4LTE Build/KTU84P) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/10.9.2.712 U3/0.8.0 Mobile',
            headers: "headerKey:headerValue0",
            params: "paramKey=paramValue0"
        },
        {
            caseId: 1,
            name: 'Wechat',
            ua: 'mozilla/5.0 (linux; u; android 4.1.2; zh-cn; mi-one plus build/jzo54k) applewebkit/534.30 (khtml, like gecko) version/4.0 mobile safari/534.30 micromessenger/5.0.1.352                ',
            headers: "headerKey:headerValue1",
            params: "paramKey=paramValue1"
        },
        {
            caseId: 2,
            name: 'Weibo',
            ua: 'Mozilla/5.0 (Linux; U; Android 4.0.4; zh-cn; HTC Sensation XE with Beats Audio Z715e Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
            headers: "headerKey:headerValue2",
            params: "paramKey=paramValue2"
        }
    ];
}