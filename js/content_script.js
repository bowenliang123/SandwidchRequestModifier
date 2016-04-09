/**
 * Created by bowen on 16/4/10.
 */
'use strict';

let activeCase;

(function init() {
    //prepare data
    getActiveCase(()=> {
        //modify userAgent property
        modifyUserAgent();
    });


})();

//getActiveCase
function getActiveCase(callback) {

    chrome.extension.sendRequest({action: "getActiveCase"}, (response) => {
        activeCase = response.activeCase;

        callback && callback();
    });
}

function modifyUserAgent() {
    if (!activeCase || !activeCase.ua || activeCase.ua == '') {
        return;
    }

    //refer:
    //http://stackoverflow.com/questions/23202136/changing-navigator-useragent-using-chrome-extension
    var actualCode = '(' + `function () {
            'use strict';
            var navigator = window.navigator;
            var modifiedNavigator;
            if ('userAgent' in Navigator.prototype) {
                // Chrome 43+ moved all properties from navigator to the prototype,
                // so we have to modify the prototype instead of navigator.
                modifiedNavigator = Navigator.prototype;

            } else {
                // Chrome 42- defined the property on navigator.
                modifiedNavigator = Object.create(navigator);
                Object.defineProperty(window, 'navigator', {
                    value: modifiedNavigator,
                    configurable: false,
                    enumerable: false,
                    writable: false
                });
            }
            // Pretend to be custom use agent
            Object.defineProperties(modifiedNavigator, {
                userAgent: {
                    value: "${activeCase.ua}",
                    configurable: false,
                    enumerable: true,
                    writable: false
                }
            });
        }` + ')();';

    document.documentElement.setAttribute('onreset', actualCode);
    document.documentElement.dispatchEvent(new CustomEvent('reset'));
    document.documentElement.removeAttribute('onreset');
}