/**
 * Created by bowen on 16/4/10.
 */
'use strict';

chrome.devtools.panels.create(
    'Sailfish Requester',
    null, // No icon path
    'html/main.html',
    null // no callback needed
);