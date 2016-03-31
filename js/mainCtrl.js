/**
 * Created by bowen on 16/3/12.
 */
'use strict';
function activateCase(oneCase) {
    chrome.browserAction.setBadgeText({text: oneCase.name});
    chrome.extension.sendRequest({action: "activateCase", caseStr: angular.toJson(oneCase)}, (response) => {
    })
}
angular.module('mainCtrl', [])
    .controller('mainCtrl', ($scope) => {
        $scope.cases = [];

        $scope.isActive = false;
        $scope.showCase = $scope.cases[0];
        $scope.activeCase = $scope.cases[0];

        init();

        function init() {
            chrome.extension.sendRequest({action: "getAllCases"}, (response) => {
                console.log(response);
                $scope.cases = response.cases;

                //force refresh
                $scope.$apply();
            });
        }

        $scope.changeCaseId = function (c) {
            $scope.showCase = c;
        };

        $scope.activate = function (c) {
            $scope.isActive = true;
            $scope.activeCase = c;
            activateCase($scope.activeCase);
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
            });

            persistAllCases($scope);
        }
    });

//持久化数据到后台
function persistAllCases($scope) {
    chrome.extension.sendRequest({
        action: "saveAllCases",
        casesStr: angular.toJson($scope.cases)  //序列化
    }, (response) => {
    });
}