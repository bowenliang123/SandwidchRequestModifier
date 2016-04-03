/**
 * Created by bowen on 16/3/12.
 */
'use strict';

angular.module('mainCtrl', [])
    .controller('mainCtrl', ($scope) => {


        //初始化
        init();

        function getAllCases() {
            //getAllCases
            chrome.extension.sendRequest({action: "getAllCases"}, (response) => {
                let cases = response.cases;
                if (cases && cases.length > 0) {
                    $scope.cases = cases;

                    if (!$scope.showCase) {
                        $scope.showCase = $scope.cases[0];

                        $scope.parseAndUpdateUaInfo();

                        $scope.updateHeadersInfo();
                    }

                    //force refresh
                    $scope.$apply();
                }
            });
        }

        //getActiveCase
        function getActiveCase() {

            chrome.extension.sendRequest({action: "getActiveCase"}, (response) => {
                let activeCase = response.activeCase;
                if (!activeCase) {
                    $scope.activeCase = undefined;
                    return;
                }

                $scope.activeCase = activeCase;
                $scope.showCase = activeCase;

                $scope.parseAndUpdateUaInfo();

                //force refresh
                $scope.$apply();

            });
        }

        /**
         * 触发下载二维码文件
         * @param base64img
         */
        function invokeDownload(content) {
            //初始化链接
            let downloadLink = document.createElement("a");

            //用 base64 生成 url
            downloadLink.href = 'data:text/plain,' + content;

            //文件名
            downloadLink.download = 'export-' + new Date().getTime() + '.json';

            //加入到文档中
            document.body.appendChild(downloadLink);

            //下载
            downloadLink.click();

            //清理节点
            document.body.removeChild(downloadLink);
        }

        /**
         * 初始化
         */
        function init() {

            $scope.cases = [];
            $scope.showCase = undefined;
            $scope.activeCase = undefined;

            $scope.headersInfo = [
                {
                    headerName: 'ucpara',
                    headerDescription: 'UC公参',
                    subFields: [
                        {
                            fieldName: 'sn',
                            fieldValue: '123456789',
                            fieldDescription: 'sn 就是一个 sn'
                        }
                    ]
                }
            ];

            getAllCases();

            getActiveCase();

            addInputLIstener();
        }

        //导入所有用例
        $scope.importCases = ()=> {
            $('#uploadInput')[0].click();
        };

        //导出所有用例
        $scope.exportCases = ()=> {
            invokeDownload(angular.toJson($scope.cases));
        };

        $scope.changeShowCase = (simCase)=> {
            $scope.showCase = simCase;
            $scope.parseAndUpdateUaInfo();
        };

        $scope.activateCase = (simCase) => {
            //update local
            $scope.activeCase = simCase;

            //update remote
            chrome.extension.sendRequest({action: "activateCase", caseStr: angular.toJson(simCase)}, (response) => {
            })
        };

        $scope.deactivateCase = ()=> {
            //update local
            $scope.activeCase = undefined;

            //update remote
            chrome.extension.sendRequest({action: "deactivateCase"}, (response) => {
            })
        };

        $scope.removeCase = (simCaseId)=> {
            if (!simCaseId) {
                return;
            }
            if (!$scope.cases) {
                return;
            }

            $scope.cases = $scope.cases.reduce((pre, next)=> {
                if (next.caseId != simCaseId) {
                    pre.push(next);
                }
                return pre;
            }, []);

            //持久化所有用例
            $scope.persistAllCases($scope.cases);
        };

        $scope.saveCase = (simCaseId)=> {
            if (!$scope.cases) {
                return;
            }

            let targetCase = $scope.cases.filter((item)=>(item.caseId == simCaseId));
            if (!targetCase) {
                return;
            }

            targetCase[0] = $scope.showCase;

            //持久化所有用例
            $scope.persistAllCases($scope.cases);


            if (simCaseId == $scope.activeCase.caseId) {
                $scope.activateCase($scope.showCase);
            }
        };

        $scope.createNewCase = () => {
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

            //持久化所有用例
            $scope.persistAllCases($scope.cases);
        };

        //local methods

        //解析并更新 UA 信息
        $scope.parseAndUpdateUaInfo = () => {
            let uaStr = $scope.showCase.ua;

            let uaParser = new UAParser();
            uaParser.setUA(uaStr);

            $scope.uaInfo = uaParser.getResult();
        };

        //持久化所有用例数据到后台
        $scope.persistAllCases = (simCases) => {
            chrome.extension.sendRequest({
                action: "saveAllCases",
                casesStr: angular.toJson(simCases)  //序列化
            }, (response) => {
            });
        };

        $scope.updateHeadersInfo = ()=> {
            let demoHeaderDescriptors = [
                {
                    headerName: 'UCPARA',
                    headerDescription: 'UC 公参',
                    subFieldsSeparator: '`',
                    subFields: [
                        {
                            fieldName: 'sessionid',
                            fieldDescription: '就是SESSION的编号咯'
                        }
                    ]
                }
            ];
            let headersInfo = parseHeaders($scope.showCase.headers, demoHeaderDescriptors);

            $scope.headersInfo = headersInfo;
        };

        function parseHeaders(headersStr, headerDescriptors) {
            if (!headersStr || headersStr == ''
                || !headerDescriptors || headerDescriptors == []) {
                return [];
            }

            let headersInfo = [];
            let headerLines = headersStr.split('\n');
            headerLines.forEach((headerLine)=> {

                let index = headerLine.indexOf(':');
                if (index <= 0 || index == headerLine.length - 1) {
                    return;
                }

                let headerKey = headerLine.slice(0, index);
                let headerValue = headerLine.slice(index + 1, headerLine.length);

                let targetDescriptors = headerDescriptors.filter((descriptor)=> (descriptor.headerName == headerKey));

                //未找到对应的 header 描述
                if (!targetDescriptors && targetDescriptors.length >= 1) {
                    return;
                } else {
                    let targetHeaderDescriptor = targetDescriptors[0];

                    let headerInfo = {
                        headerName: headerKey,
                        headerValue: headerValue,
                        headerDescription: targetHeaderDescriptor.headerDescription
                    };

                    //找到对应的 header 描述
                    let separator = targetHeaderDescriptor.subFieldsSeparator;
                    let subFields = targetHeaderDescriptor.subFields;
                    if (!separator || !subFields || subFields == []) {
                        headersInfo.push(headerInfo);
                    } else {
                        headerInfo.subFields = [];

                        let subFieldsArr = headerValue.split(separator);
                        let parsedSubFieldsArr = [];
                        if (subFieldsArr && subFieldsArr != []) {
                            subFieldsArr.forEach((subFieldStr)=> {
                                if (!subFieldStr || subFieldStr == '') {
                                    return;
                                }

                                let index = subFieldStr.indexOf('=');
                                if (index < 0) {
                                    return;
                                }

                                let subFieldKey = subFieldStr.slice(0, index);
                                let subFieldValue = subFieldStr.slice(index + 1, subFieldStr.length);
                                parsedSubFieldsArr.push({fieldName: subFieldKey, fieldValue: subFieldValue});
                            });
                        }

                        parsedSubFieldsArr.forEach((subField)=> {
                            let targetSubFieldArr = subFields.filter((field)=> ( field.fieldName == subField.fieldName));
                            if (targetSubFieldArr.length == 0) {

                                headerInfo.subFields.push(subField);
                                return;
                            }

                            let targetSubField = targetSubFieldArr[0];
                            subField.fieldDescription = targetSubField.fieldDescription;

                            headerInfo.subFields.push(subField);
                        });

                        headersInfo.push(headerInfo);
                    }
                }


            });

            return headersInfo;
        }


        //响应JSON上传input 元素点击事件
        function addInputLIstener() {
            $('#uploadInput').change((e) => {
                console.log(e);
                let filePath = $('#uploadInput')[0].files[0];
                let reader = new FileReader();

                if (filePath) {
                    //响应事件 -  文件读取完成
                    reader.addEventListener("load", ()=> {
                        let fileContent = reader.result;
                        //parse json and update cases
                        $scope.cases = JSON.parse(fileContent);

                        //persist data
                        $scope.persistAllCases($scope.cases);

                        //deactivate all cases
                        $scope.deactivateCase();

                        //force refresh
                        $scope.$apply();
                    }, false);


                    //将文件读取为 Base64格式
                    reader.readAsText(filePath);
                }
            });
        }

        addInputLIstener();

    })
;



