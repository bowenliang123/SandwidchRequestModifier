/**
 * Created by bowen on 16/3/31.
 */

'use strict';

console.log('background.js');

// 监听 Browser Actions 按钮点击事件
chrome.browserAction.onClicked.addListener(function (tab) {
    //打开选项页
    chrome.tabs.create({'url': chrome.extension.getURL('html/options.html')}, function (tab) {
    });
});


//监听所有请求，发出前对请求进行修改
chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        //增加header
        addHeaders(details.requestHeaders, {aaaaa: 'bowen'});

        return {requestHeaders: details.requestHeaders};
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]);


function addHeaders(requestHeaders, additionalHeaders) {
    let keys = Object.keys(additionalHeaders);
    keys.forEach((key)=> {
        requestHeaders.push({name: key, value: additionalHeaders[key]});
    })
}