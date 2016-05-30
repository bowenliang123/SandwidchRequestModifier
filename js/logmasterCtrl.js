'use strict';

angular.module('logmasterCtrl', [])
    .controller('logmasterCtrl', ['$scope', ($scope, dataService) => {
        console.log('logmasterCtrl');
        $scope.logText = 'lt=pk`dt=`nt=`tm=2016-05-30 13:43:51`real_port=41008`isforbiddenip=false`illegal_sn_ds_pair=true`votes=122`ver=`starid=1994`lang=`nw=`ck_id=vote`arelevel=HIGH`pfid=`vote_success=true`fr=`ss=`dn=`actname=superstar`bid=`mi=`ds=11507250315388023872`sn=11507250315388023872`it=10`imei=`code=null`sessionid=G70G64jhMPn8ONTt`period=50`msg=null`ip=117.169.66.105`pg=index`cp=`sessionid=G70G64jhMPn8ONTt`real_ip=117.169.66.105`entry=`is_skipped=true`ua=Mozilla/5.0 (Linux; U; Android 4.4.2; zh-CN; SM-G355H Build/KOT49H) AppleWebKit/528.5+ (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1 UCBrowser/9.5.1.494 Mobile`day=1`imsi=`ch=`user=31511268`success=true`pi=`visit_time=1464587031883\nlt=pk`dt=`nt=`tm=2016-05-30 13:43:51`real_port=41008`isforbiddenip=false`illegal_sn_ds_pair=true`votes=122`ver=`starid=1994`lang=`nw=`ck_id=vote`arelevel=HIGH`pfid=`vote_success=true`fr=`ss=`dn=`actname=superstar`bid=`mi=`ds=11507250315388023872`sn=11507250315388023872`it=10`imei=`code=null`sessionid=G70G64jhMPn8ONTt`period=50`msg=null`ip=117.169.66.105`pg=index`cp=`sessionid=G70G64jhMPn8ONTt`real_ip=117.169.66.105`entry=`is_skipped=true`ua=Mozilla/5.0 (Linux; U; Android 4.4.2; zh-CN; SM-G355H Build/KOT49H) AppleWebKit/528.5+ (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1 UCBrowser/9.5.1.494 Mobile`day=1`imsi=`ch=`user=31511268`success=true`pi=`visit_time=1464587031883';

        let MAIN_SEPERATOR = '`';
        let SUB_SEPERATOR = '=';


        //响应
        $scope.updateLogText = ()=> {
            $scope.logCases = parseLogText($scope.logText);
        };


        //私有函数

        function breakLines(text) {
            if (!text) {
                return [];
            }
            let lines = text.split('\n');
            let tempArr = []
            lines.forEach((line)=> {
                tempArr.push({
                    lineArr: line.split(MAIN_SEPERATOR)
                })
            });
            return tempArr;
        }

        function parseLogCase(logCase) {
            //是否排序
            if ($scope.isSort) {
                logCase.lineArr.sort()
            }

            let newArr = [];
            logCase.lineArr.forEach((line)=> {
                let index = line.indexOf(SUB_SEPERATOR);
                newArr.push({
                    key: line.slice(0, index),
                    value: line.slice(index + 1, line.length)
                });
            });
            return {params: newArr};

        }

        function parseLogText(text) {
            if (!text) {
                return [];
            }


            let linesArrs = breakLines(text);

            let tempArr = []
            linesArrs.forEach((logCase) => {
                tempArr.push(parseLogCase(logCase));
            });
            return tempArr;

        }

        function init() {
            $scope.isSort = true;
            $scope.updateLogText();

        }

        init();

    }]);