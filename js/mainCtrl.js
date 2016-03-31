/**
 * Created by bowen on 16/3/12.
 */
'use strict';

angular.module('mainCtrl', [])
    .controller('mainCtrl', ($scope) => {
        $scope.cases = [
            {caseId: 0, name: 'UC', ua: 'uc ua', headers: "headerKey:headerValue0", params: "paramKey=paramValue0"},
            {
                caseId: 1,
                name: 'Wechat',
                ua: 'wechat ua',
                headers: "headerKey:headerValue1",
                params: "paramKey=paramValue1"
            },
            {caseId: 2, name: 'Weibo', ua: 'weibo ua', headers: "headerKey:headerValue2", params: "paramKey=paramValue2"}
        ];
        $scope.showCase = $scope.cases[0];
        $scope.activeCaseId = 0;

        $scope.changeCaseId = function (c) {
            $scope.showCase = c;
            console.log($scope.showCase);
        }
    });