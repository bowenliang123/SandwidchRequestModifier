/**
 * Created by bowen on 16/3/12.
 */
'use strict';

angular.module('mainCtrl', [])
    .controller('mainCtrl', ($scope) => {
        $scope.cases = [
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

        $scope.isActive = false;
        $scope.showCase = $scope.cases[0];
        $scope.activeCase = $scope.cases[0];

        $scope.changeCaseId = function (c) {
            $scope.showCase = c;
            console.log($scope.showCase);
        };

        $scope.activate = function (c) {
            $scope.isActive = true;
            $scope.activeCase = c;
            chrome.browserAction.setBadgeText({text: $scope.activeCase.name});
        };

        $scope.disActivate = function () {
            $scope.isActive = false;
            chrome.browserAction.setBadgeText({text: ''});
        };

        $scope.newCase = function () {
            var newCaseName = prompt('输入新建case名称', '');
            if (!newCaseName) {
                alert('呃…名称不能为空啊');
                return;
            }
            console.log(newCaseName);
            $scope.cases.push({
                caseId: new Date().getTime(),
                name: newCaseName
            })
        }
    });