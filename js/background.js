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
        console.log(details);
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


function addHeaders(requestHeaders, additionalHeaders) {
    let keys = Object.keys(additionalHeaders);
    keys.forEach((key)=> {
        requestHeaders.push({name: key, value: additionalHeaders[key]});
    })
}