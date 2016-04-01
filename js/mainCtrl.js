/**
 * Created by bowen on 16/3/12.
 */
'use strict';
function activateCase(oneCase) {
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

        $scope.deActivate = function () {
            $scope.isActive = false;
            chrome.extension.sendRequest({action: "deactivateCase"}, (response) => {
            })
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

            //持久化用例
            persistAllCases($scope);
        }
    });

//持久化所有用例数据到后台
function persistAllCases($scope) {
    chrome.extension.sendRequest({
        action: "saveAllCases",
        casesStr: angular.toJson($scope.cases)  //序列化
    }, (response) => {
    });
}