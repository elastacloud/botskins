import * as server_content from './server_content';
import * as dl from "../node_modules/botframework-directlinejs/built/directLine";
import * as Nightmare from 'nightmare';
import * as express from 'express';

const path = require('path');
declare let module: any;

interface ISendActivity {
    (conversationId: string, activity: dl.Message): void;
}

interface CommandValues {
    client: () => (boolean | Promise<boolean>),
    server?: (conversationId: string, sendActivity: ISendActivity, json?: JSON) => void,
    do?: (nightmare: Nightmare) => any,
    alternateText?: string,
    urlAppend?: { [paramName: string]: any }
}

interface CommandValuesMap {
    [key: string]: CommandValues
}

/*
 * 1. Add command following CommandValues interface
 *
 * 2. Create a DirectLineActivity in server_content.ts
 *
 * 3. Import variable to this file and use it as param.
 *
 * Note: if it is needed to change index.js, so index.ts must be
 * updated and compiled. (use: npm run build-test)
 *
*/
var commands_map: CommandValuesMap = {
    "hi": {
        client: function () {
            return document.querySelector('.wc-message-wrapper:last-child .wc-message.wc-message-from-bot').innerHTML.indexOf('hi') != -1;
        }
    },
    "options.showHeader=false": {
        urlAppend: { "formatOptions": { showHeader: false } },
        client: function () {
            var top = document.querySelector('.wc-message-groups').getClientRects()[0].top;
            return top === 0;
        }
    },
    "options.showHeader=default": {
        client: function () {
            var top = document.querySelector('.wc-message-groups').getClientRects()[0].top;
            return top > 0;
        }
    },
    "animation": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return source.indexOf("surface_anim.gif") >= 0;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.ani_card);
        }
    },
    "audio": {
        client: function () {
            var source = document.querySelectorAll('audio')[0].src;
            return source.indexOf("bftest.mp3") >= 0;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.audio_raw);
        }
    },
    "audiocard": {
        client: function () {
            var source = document.querySelectorAll('audio')[0].src;
            return source.indexOf("bftest.mp3") >= 0;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.audio_card);
        }
    },
    "button-imback": {
        client: () => new Promise((resolve) => {
            var buttons = document.querySelectorAll('button');
            var imBackBtn = buttons[1] as HTMLButtonElement;

            imBackBtn.click();
            setTimeout(() => {
                var echos = document.querySelectorAll('.format-plain');
                var lastEcho = echos.length - 1;

                var bot_echos = document.querySelectorAll('.format-markdown');
                var lastBotEcho = bot_echos.length - 1;

                resolve(echos[lastEcho].innerHTML.indexOf('imBack Button') != -1 &&
                    bot_echos[lastBotEcho].innerHTML.indexOf('echo: imBack Button') != -1);
            }, 1000);
        }),
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.hero_card);
        }
    },
    "button-postback": {
        client: () => new Promise((resolve) => {
            var buttons = document.querySelectorAll('button');
            var postBackBtn = buttons[2] as HTMLButtonElement;

            postBackBtn.click();
            setTimeout(() => {
                var echos = document.querySelectorAll('.format-plain');
                var lastEcho = echos.length - 1;

                var bot_echos = document.querySelectorAll('.format-markdown');
                var lastBotEcho = bot_echos.length - 1;

                resolve(echos[lastEcho].innerHTML.indexOf('button-postback') != -1 &&
                    bot_echos[lastBotEcho].innerHTML.indexOf('echo: postBack Button') != -1);
            }, 1000);
        }),
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.hero_card);
        }
    },
    "carousel": {
        client: function () {
            return document.querySelectorAll('.scroll.next').length > 0;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.car_card);
        }
    },
    "carousel-to-right": {
        client: () => new Promise((resolve) => {
            var right_arrow = document.querySelectorAll('.scroll.next')[0] as HTMLButtonElement;

            // Carousel made of 4 cards.
            // 3-Clicks are needed to move all carousel to right.
            // Note: Electron browser width size must not be changed.
            right_arrow.click();
            setTimeout(() => {
                right_arrow.click();
                setTimeout(() => {
                    right_arrow.click();
                    setTimeout(() => {
                        resolve(right_arrow.getAttribute('disabled') != null);
                    }, 2000);
                }, 1000);   //make sure time is longer than animation time in .wc-animate-scroll
            }, 1000);
        }),
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.car_card);
        }
    },
    "carousel-to-left": {
        client: () => new Promise((resolve) => {
            var right_arrow = document.querySelectorAll('.scroll.next:not([disabled])')[0] as HTMLButtonElement;
            // One-Click to the right
            right_arrow.click();
            setTimeout(() => {
                // One-click to the left
                var left_arrow = document.querySelectorAll(".scroll.previous")[0] as HTMLButtonElement;
                left_arrow.click();
                setTimeout(() => {
                    resolve(left_arrow.getAttribute('disabled') != null);
                }, 800);
            }, 500);
        }),
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.car_card);
        }
    },
    "carousel-fit-width": {
        client: function () {
            var left_arrow = document.querySelectorAll(".scroll.previous")[0] as HTMLButtonElement;
            var right_arrow = document.querySelectorAll('.scroll.next')[0] as HTMLButtonElement;
            return left_arrow.getAttribute('disabled') != null && right_arrow.getAttribute('disabled') != null;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.smallcar_card);
        }
    },
    "carousel-scroll": {
        client: () => new Promise((resolve) => {
            var right_arrow = document.querySelectorAll('.scroll.next')[0] as HTMLButtonElement;

            // Scrolling the carousel simulating touch action
            var car_items = document.querySelectorAll('.wc-carousel-item').length;
            for (var i = 0; i < car_items; i++) {
                var element = document.querySelectorAll('.wc-carousel-item')[i];
                element.scrollIntoView();
            }
            setTimeout(() => {
                resolve(right_arrow.getAttribute('disabled') != null);
            }, 500);
        }),
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.car_card);
        }
    },
    "herocard": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return source.indexOf("surface1.jpg") >= 0;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.hero_card);
        }
    },
    "html-disabled": {
        alternateText: '<a href="http://dev.botframework.com">Bot Framework</a>',
        client: function () {
            return document.querySelector('.wc-message-wrapper:last-child .wc-message.wc-message-from-bot').innerHTML.indexOf('<a href=') != -1;
        }
    },
    "image": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return source.indexOf("surface1.jpg") >= 0;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.image_raw);
        }
    },
    "markdown": {
        client: function () {
            return document.querySelectorAll('h3').length > 5;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.mar_card);
        }
    },
    "markdown-url-needs-encoding": {
        client: function () {
            var links = document.querySelectorAll('.wc-message-wrapper:last-child .wc-message.wc-message-from-bot a');
            if (!links || links.length === 0) return false;

            for (var i = 0; i < links.length; i++) {
                var link = links[i] as HTMLAnchorElement;

                //check if value is encoded
                if (link.href !== "https://bing.com/?q=some%20value") return false;
            }
            return true;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.mar_encode_card);
        }
    },
    "markdown-links-open-in-new-window": {
        do: function (nightmare) {
            nightmare.click('a')
                .wait(4000)
        },
        client: function () {
            return window.location.href.indexOf("localhost") !== -1;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.mar_card);
        }
    },
    "signin": {
        client: function () {
            return document.querySelectorAll('button')[0].textContent == "Signin";
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.si_card);
        }
    },
    "suggested-actions": {
        client: function () {
            var ul_object = document.querySelectorAll('ul')[0];
            var show_actions_length = document.querySelectorAll('.show-actions').length;

            // Validating if the the 3 buttons are displayed and suggested actions are visibile
            return ul_object.childNodes[0].textContent == "Blue" &&
                ul_object.childNodes[1].textContent == "Red" &&
                ul_object.childNodes[2].textContent == "Green" &&
                show_actions_length == 1;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.suggested_actions_card);
        }
    },
    "suggested-actions-away": {
        client: () => new Promise((resolve) => {
            var green_button = document.querySelectorAll('button[title="Green"]')[0] as HTMLButtonElement;
            green_button.click();
            setTimeout(() => {
                var show_actions_length = document.querySelectorAll('.show-actions').length;
                resolve(show_actions_length == 0);
            }, 2000);
        }),
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.suggested_actions_card);
        }
    },
    "suggested-actions-click": {
        client: () => new Promise((resolve) => {
            var red_button = document.querySelectorAll('button[title="Red"]')[0] as HTMLButtonElement;
            red_button.click();
            setTimeout(() => {
                // Waiting more time
                setTimeout(() => {
                    // Getting for bot response
                    var response_text = document.querySelector('.wc-message-wrapper:last-child .wc-message.wc-message-from-bot').innerHTML.indexOf('Red') != -1;
                    resolve(response_text);
                }, 2000);
            }, 2000);
        }),
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.suggested_actions_card);
        }
    },
    "receiptcard": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return source.indexOf("surface1.jpg") >= 0;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.receipt_card);
        }
    },
    "thumbnailcard": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return source.indexOf("surface1.jpg") >= 0;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.thumbnail_card);
        }
    },
    "upload": {
        do: function (nightmare) {
            try {
                const upload = <(selector: string, paths: string[]) => Nightmare>(<any> nightmare.upload.bind(nightmare));

                upload('#wc-upload-input', [
                    path.resolve(__dirname, 'assets', 'surface1.jpg'),
                    path.resolve(__dirname, 'assets', 'surface2.jpg')
                ])
                    .wait(3000)
            } catch (err) {
                console.log(err);
                throw err;
            }
        },
        client: function () {
            var img = document.querySelectorAll('.wc-message-wrapper:last-child .wc-message.wc-message-from-bot img')[0] as HTMLImageElement;
            return img.src.indexOf('/uploads') >= 0;
        },
        server: function(conversationId, sendActivity){
            sendActivity(conversationId, server_content.upload_txt);
        }
    },
    "video": {
        client: function () {
            var source = document.querySelectorAll('video')[0].src;
            return source.indexOf("msband.mp4") >= 0;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.video_raw);
        }
    },
    "videocard": {
        client: function () {
            var source = document.querySelectorAll('video')[0].src;
            return source.indexOf("msband.mp4") >= 0;
        },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, server_content.video_card);
        }
    },
    "xml": {
        client: function () {
            var spans = document.querySelectorAll('.wc-message-from-bot span.format-plain span');
            return spans[0].innerHTML.indexOf('# markdown h1 &lt;h1&gt;xml h1&lt;/h1&gt;') != -1 &&
                spans[1].innerHTML.indexOf('*markdown italic* &lt;i&gt;xml italic&lt;/i&gt;') != 1 &&
                spans[2].innerHTML.indexOf('**markdown bold** &lt;b&gt;xml bold&lt;/b&gt;') != 1 &&
                spans[3].innerHTML.indexOf('~~markdown strikethrough~~ &lt;s&gt;xml strikethrough&lt;/s&gt;') != 1;
        },
        server: function (res, sendActivity) {
            sendActivity(res, server_content.xml_card);
        }
    },
    "card Weather": {
        client: function () {
            var source = document.querySelectorAll('img')[0].src;
            return (source.indexOf("Mostly%20Cloudy-Square.png") >= 0);
        },
        server: function (conversationId, sendActivity, json) {
            sendActivity(conversationId, server_content.adaptive_cardsFn(json));
        }
    },
    "card BingSports": {
        client: function () {
            return (document.querySelector('.wc-adaptive-card .ac-container p').innerHTML === 'Seattle vs Panthers');
        },
        server: function (conversationId, sendActivity, json) {
            sendActivity(conversationId, server_content.adaptive_cardsFn(json));
        }
    },
    "card CalendarReminder": {
        client: () => new Promise((resolve) => {
            setTimeout(() => {
                var selectPullDown = document.querySelector('.wc-adaptive-card .ac-container select') as HTMLSelectElement;
                selectPullDown.selectedIndex = 3;
                resolve(selectPullDown.value === '30');
            }, 1000);
        }),
        server: function (conversationId, sendActivity, json) {
            sendActivity(conversationId, server_content.adaptive_cardsFn(json));
        }
    },
    "card Inputs": {
        client: function () {
            return (document.querySelector('.wc-adaptive-card .ac-container p').innerHTML === 'Input.Text elements');
        },
        server: function (res, sendActivity, json) {
            sendActivity(res, server_content.adaptive_cardsFn(json));
        }
    },
    "speech mic-button": {
        client: function () {
            return (document.querySelector('.wc-mic') !== null);
        }
    },
    "speech clicking-mic-starts-speaking": {
        do: function (nightmare) {
            nightmare.click('.wc-mic')
                .wait(1000);
        },
        client: function () {
            debugger;
            return (((document.querySelector('.wc-shellinput') as HTMLInputElement).placeholder === 'Listening...'));
        }
    },
    "speech click-mic-click-to-stop": {
        do: function (nightmare) {
            nightmare.click('.wc-mic')
                .wait(1000)
                .click('.wc-mic')
                .wait(1000);
        },
        client: function () {
            return (((document.querySelector('.wc-shellinput') as HTMLInputElement).placeholder === 'Type your message...'));
        }
    },
    "speech click-mic-type-to-stop": {
        do: function (nightmare) {
            nightmare.click('.wc-mic')
                .wait(1000)
                .type('.wc-textbox input', '')
                .wait(2000);
        },
        client: function () {
            return (((document.querySelector('.wc-shellinput') as HTMLInputElement).placeholder === 'Type your message...'));
        }
    },
    "focus on type": {
        do: function (nightmare) {
            nightmare
                .type('.wc-chatview-panel', 'Hi!')
                .wait(1000);
        },
        client: function () {
            return (((document.querySelector('.wc-shellinput') as HTMLInputElement).value === 'Hi!'));
        }
    },
    "type on Adaptive Cards": {
        do: function (nightmare) {
            nightmare
                .type('.wc-chatview-panel', 'card Inputs')
                .click('.wc-send')
                .wait('.ac-input[placeholder="Name"]')
                .type('.ac-input[placeholder="Name"]', 'John Doe');
        },
        client: function () {
            return (((document.querySelector('.ac-input') as HTMLInputElement).value === 'John Doe'));
        }
    }
    /*
     ** Add your commands to test here **
    "command": {
        client: function () { JavaScript evaluation syntax },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, sever_content DirectLineActivity);
        }
    }

    ** For adaptive cards, your command will be starting with card <space> command **
    "card command": {
        client: function () { JavaScript evaluation syntax },
        server: function (conversationId, sendActivity) {
            server_content.adaptive_cards.attachments = [{"contentType": "application/vnd.microsoft.card.adaptive", "content": json}];
            sendActivity(conversationId, server_content.adaptive_cards);
        }
    }

    ** For speech specific command, it will be starting with speech <space> command **
        "speech command": {
        client: function () { JavaScript evaluation syntax },
        server: function (conversationId, sendActivity) {
            sendActivity(conversationId, sever_content DirectLineActivity);
        }
    }
    */
};

//use this to run only specified tests
var testOnly = [];    //["carousel", "herocard"];

if (testOnly && testOnly.length > 0) {
    for (var key in commands_map) if (testOnly.indexOf(key) < 0) delete commands_map[key];
}

module.exports = commands_map;