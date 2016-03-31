/**
 * Created by bowen on 16/3/12.
 */
'use strict';

angular.module('mainCtrl', [])
    .controller('mainCtrl', ($scope) => {
        $scope.cases = [];

        $scope.isActive = false;
        $scope.showCase = $scope.cases[0];
        $scope.activeCase = $scope.cases[0];

        init();

        function init (){
            chrome.extension.sendRequest({action: "getAllCases"}, (response) => {
                console.log(response);
                $scope.cases = response.cases;

                //force refresh
                $scope.$apply();
            });
        };

        $scope.changeCaseId = function (c) {
            $scope.showCase = c;
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