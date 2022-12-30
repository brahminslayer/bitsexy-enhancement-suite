// ==UserScript==
// @name         Bitsexy Torrent Download Links to RuTorrent
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Making bitsexy better
// @author       You
// @match        https://bitsexy.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bitsexy.org
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @require      file:///Users/scott/src/bitsexy-enhancement-suite/bitsexy-enhancement-suite.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      swarmer.noip.me
// ==/UserScript==

const notify_error = ({ message, type = 'missing-setting', dismissable = true, onClick = null }) => {
    const notification = document.createElement('div');
    notification.classList.add('missing-setting');
    notification.classList.add('b-notification');
    notification.classList.add('b-is-error');
    notification.innerHTML = `
        <div class="b-notification-icon">⚠️</div>
        <div class="b-notification-message">${message}</div>
    `;
    if (dismissable) {
        const dismiss = document.createElement('button');
        dismiss.addEventListener('click', event => {
            event.stopPropagation();
            notification.remove();
        });
        dismiss.classList.add('b-dismiss');
        dismiss.classList.add('b-is-link');
        dismiss.innerHTML = `✖️`
        notification.append(dismiss);
    }
    if (onClick) {
        notification.classList.add('b-is-link');
        notification.addEventListener('click', onClick);
        notification.addEventListener('click', e => {
            notification.remove();
        });
    }
    b_settings_bar.append(notification);
}

const notify_warning = ({ message, dismissable = true, onClick = null }) => {
    const notification = document.createElement('div');
    notification.classList.add('b-notification')
    notification.classList.add('b-is-warning');
    notification.innerHTML = `
        <div class="b-notification-icon">⚠️</div>
        <div class="b-notification-message">${message}</div>
    `;
    if (dismissable) {
        const dismiss = document.createElement('button');
        dismiss.addEventListener('click', event => {
            event.stopPropagation();
            notification.remove();
        });
        dismiss.classList.add('b-dismiss');
        dismiss.classList.add('b-is-link');
        dismiss.innerHTML = `✖️`
        notification.append(dismiss);
    }
    if (onClick) {
        notification.classList.add('b-is-link');
        notification.addEventListener('click', onClick);
    }
    b_settings_bar.append(notification);
}

let settings = {};
const getSettings = () => {
    debugger;
    const username = GM_config?.get('rutorrent_username');
    const password = GM_config.get('rutorrent_password');
    const url = GM_config.get('rutorrent_url');
    const path = GM_config.get('rutorrent_addtorrent_path');
    const passkey = GM_config.get('rutorrent_passkey');
    const label = GM_config.get('rutorrent_label');
    const openConfig = e => {
        GM_config.open();
    };
    const missingSettings = [];
    username || missingSettings.push('rutorrent_username');
    password || missingSettings.push('rutorrent_password');
    url || missingSettings.push('rutorrent_url');
    path || missingSettings.push('rutorrent_path');
    passkey || missingSettings.push('rutorrent_passkey');
    if (missingSettings.length > 0) {
        notify_error({message: `Missing settings ${missingSettings.join(',')}`, onClick: openConfig});
    }
    settings = {
        rutorrent: {
            username,
            password,
            url,
            path,
            passkey,
            label,
        }
    }
}

(function() {
    'use strict';
    GM_addStyle(`
        .b-container {
            padding:.5rem;
            position:fixed;
            right:0;
            width: 300px;
            z-index:999;
            opacity:.9;
        }
        .b-settings-button {
            float:right;
            background: none;
            border:none;
            cursor:pointer;
            margin:1rem;
        }
        .b-settings-button img {
            width:25px;
        }
        .b-notification {
            clear:right;
            padding:1rem;
            margin:1rem;
            display:flex;
            font-family: helvetica, serif;
            font-weight:800;
            font-size:1.2rem;
        }
        .b-is-error {
            background:red;
            color:white;
            border: 1px solid dark-red;
        }
        .b-is-warning {
            background:yellow;
            color:black;
            border: 1px solid dark-yellow;
        }
        .b-notification-icon {
            flex: 15%;
            font-size:2em;
        }
        .b-notification-message {
            flex: 80%;
        }
        .b-is-link {
            cursor:pointer;
        }
        .b-dismiss {
            flex:5%;
            padding: 5px;
            background:none;
            border:0;
        }
    `);
})();

// Configure Config object
GM_config.init({
    'title': 'Bitsexy Enhancement Suite Settings',
    'id': 'bitsexy', // The id used for this instance of GM_config
    'events': {
        'save': getSettings,
        'reset': getSettings,
    },
    'fields': // Fields object
    {
        'rutorrent_username':
        {
            'label': 'Rutorrent Username',
            'type': 'text',
            'title': 'Rutorrent Username',
            'default': ''
        },
        'rutorrent_password':
        {
            'label': 'Rutorrent Password',
            'type': 'password',
            'title': 'Rutorrent Password for Username',
            'default': ''
        },
        'rutorrent_passkey':
        {
            'label': 'Bitsexy PassKey',
            'type': 'text',
            'title': 'PassKey is found on your profile page, click your username link at the top of the page',
            'default': ''
        },
        'rutorrent_url':
        {
            'label': 'RuTorrent URL',
            'type': 'text',
            'title': 'URL to RuTorrent, base Url path (e.g. https://hostname/rutorrent)',
            'default': ''
        },
        'rutorrent_addtorrent_path':
        {
            'label': 'Path to addtorrent.php from url',
            'type': 'text',
            'title': 'path to addtorrent.php relative to url above (default is probably fine.)',
            'default': '/php/addtorrent.php'
        },
        'rutorrent_label':
        {
            'label': 'Label to assign this torrent in rutorrent',
            'type': 'text',
            'title': 'The label you want to assign this torrent to, label must already exist',
        }
    }
});

// Create a sidebar to put settings icon, and notifications
const body = document.querySelector('body');
const b_settings_bar = document.createElement('div');
b_settings_bar.classList.add('b-container');
b_settings_button = document.createElement('button');
b_settings_button.classList.add('b-settings-button');
b_settings_button.addEventListener('click', e => {
    GM_config.open();
});
b_settings_button.innerHTML = `
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAADsAAAA7AF5KHG9AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAABVxJREFUWIW1l0tsXFcZx3/n3Dv3el7O2OPESSQILXSBQEI8uuymUSldIAErhEAkVYRYFSQirMDGgKIk5tGH1EVLnKTsyArBArFAVBWqhBKBqtIK0qh10mltzzjzcGY8M/eeez4WZ2auk7Fx7CZHupq5/+9x/uec73GuYo+jf+k3n9Gz06+AFXur/t3w2yff3osftRej3sWFR7xDs/+mkAsAaG9EyfLqZyeO//id3frSuzWQxXNFb1/x1dHkAIVc4BWLr8lLZ/c9UAIyP69NkPkDM9OHAZIbMclN44Sz5YMmH/5JLl/2HhgBcyR3moP7H0drpGORWoJUDdIWUAoOlB8zt5d+/kAImMWzT1HMz5GdcECySWjF/eayqMn8KXP+7FfvKwH57elZ0foSM9OjoFVJF0wf4ghlu6nu/rIS37sgi+cO3xcCIqKM9l6hPH0A33egSTCvX2PjylU2rl7BvH4NEutkvgfTpRkjcv6+EIgvLDxNED7J1OQIS968Ce0uYgWxAre72DdvpkZT+yAMnooWzxz7SATkpdOHlMivmCm5IAOk0UHeWR7TtdeWkUbHvSgFM1MoUc/KxYWDeyYQe/oMQVCiUEgneuMGCOgwTJ0EriTcsQuFAoRhKUns6T0RiC4sfEGhvkO5NKqXUm0hq028Yh6vVBzpelOTeIUcstxAausOVMBUEYFj0ctnHt01AZXYc2itKeZHmFxfAaXwp8YL3hCT65uOZ7IIWmvlqV/sikC0ePZzKI5SzIN2KtKLsR/U0dkQlfHHCWd8dG4CW6kjvXjgXUMhD8KT0fkzn79nAqDmAEU+l0KVW2AFbzKNBxH3DIdXLLii9EE9BQsDH8KP7omAvDhfUFa+BkA+m+LVdVAKL+cwMQbTjTFdg8SuH4xk1fXU4QBTqG/I736Znud2BJIg+xUUWTwNXtpXpNZCh4FLMWtJmm3a1S7t6gZJqw3WglboiRCpNlOHvgeeBkU2ic2XdySA5gm3nE3nHCVIL0aFGRAhrtZpvtug34zoNyMa7zaIVtdABBVkXAyYTc1i6MvqMQJj0SRWHh67pvRdUCnPxzTX6VQa3Ppvusr6fxqEhQw6DFHDct2NoTjYwWEaK3l4RwIoPgZAkq5A+hEAptEi6RuW/1VzJXgoF1h5Y42g4ONlg4FNjCoOOme6G0funm6LLFBuuTYBuUskQu2tOjayY1Y2stTebrpYuMsmxaR/DwSk5n6AXs9Bg2DsVLt0Vl3r7cWwtOaeYdp3Vjfo1Aat2R+47vXSXBVV3ZGAQFrKNhwBFTgCjestwHXeSsNN3IuhUk93ufWeS8FRsRr4cL5ldecdEP4++t9sOfa5ENO39NddLKw07wxyY2FlkPrdep8ksjCIBVqbagK8tiOBxJc/j15iA+ttUAoz2MVOH26PnSS0e04GEFkFWkHrNkRmpJNRmb/sSCB7/NQS8LcRsLoGcYwErv02u3dbpGMkm8i4iatrm8V/VSdO3tiRAIBYmWOYA9bC+x8SHCkBo5Kw5RjKMof2wfsfptc0ENH2p1vZbEkg+N6pK8BzIyAyBCWNzvz/G5wCdEYTlH2I72D66+Dpn/zjngkA+JXeSREuj5xrmPxUiWxmewJhxunoTZ8mgvq9X+nNbWez/YVkft5mTsx9U+CHQARQPvpxytPjxXM4ylM+M098YvhqEPlZptL9lpqfH69cw3m29bZp9C4uPOJb+wMRjsWr7fw/X77Gyq3kDp3ZsscXv/9pMvuzbYVcMvD8xIlT13fyvauvY3nhhdDk2l8ybXt06Y/vHa8ttQ+jFAceKlQe+vonL+hQXvU3ClfVM89skahbj/8B+CdTMKWYDU0AAAAASUVORK5CYII=" />
`;
b_settings_bar.append(b_settings_button);   
body.prepend(b_settings_bar);

// Check for all required settings
getSettings();

(function() {
    'use strict';
    let passkey = GM_config.get('rutorrent_passkey');
    let rutorrent_url = GM_config.get('rutorrent_url');
    let rutorrent_addtorrent_path = GM_config.get('rutorrent_addtorrent_path');
    let rutorrent_username = GM_config.get('rutorrent_username');
    let rutorrent_password = GM_config.get('rutorrent_password');
    let rutorrent_auth_hash = btoa(`${rutorrent_username}:${rutorrent_password}`);
    if(!passkey || !rutorrent_url || !rutorrent_addtorrent_path || !rutorrent_username || !rutorrent_password) {
        GM_config.open();
        alert('passkey, rutorrent_url, and rutorrent_addtorrent_path, rutorrent_username, and rutorrent_password are required');
    }
    let rutorrent_label = GM_config.get('rutorrent_label');
    
    // Create new Download button for sending torrents to configured rutorrent instance
    const download_links = document.querySelectorAll('[href*="download.php?torrent="]'); 
    download_links.forEach(download_link => {
        // Modify original link with torrent_pass (passkey)
        const torrent_download_link = new URL(download_link.href);
        torrent_download_link.searchParams.append('torrent_pass', passkey);

        // Construct new anchor for rutorrent download button
        const a = document.createElement('a');

        // Construct rutorrent icon img
        const img = document.createElement('img');
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACRklEQVR4AVzQM8AlVxgA0PPNzMPatm2jim272ipdbKsM6thmvV2MtW3bb/93Y825NuKs8366v0/vSY/s3pWqLS0k/wrlNpAXVKrpxIb1n9wXl1zRaCxfmhf79/HbBiLo0ycZOjTp1i355pumLVsq8py5c5u6d08WLkz2Hyj06rP3WLFrpz8WDxua3HZbcvbZ9O4dKpVMSrz00koPPzzUq68ULrwwE8GJEy3uvnu/b3/IW8fUGY00eybPPZup1UIEBEgp+eWXbdas6eiqq1qLICKklGzatN811+1WwPhxhxVFO+QI/zVpUu/fEhARALp1q2vdeoMscN/9xz388E9SSspSSr/9TYuyHTv22rf/iAwajV4++GCMZrOpbP78Ba655m07dx6UUvojHTt2zOOPf+X06aEKCKHRqElJmQUL9vr00/MtXrzazTfvFXHEZ59tsHrNHIOG9FcACCKUoYrW1qyZ7JFH9uGIiLN16tyOdFgBSdK6FRGhrHXrChIydP0rIRBkAD17JoSyrl1bSemU/60SADLIc665JpNloWzatL5GjGjI84SkLBM88USLefNyZREMGNDVggVdvfDCQVl2CglIBLJKJRk96qiIBFJK/0lArZYZOXKTPN8kgjynKCgqSZx5ztGThw/uqF5w/mqTJnfQrVtb1WouNTl1qmHfviMWLtzs9Td22L37FhEd/1jcuQtdu208FUOG3/VUr16333nkcKN64sQWzeZ+yUkS5Kgrii6KSh9ZtIbf6tTrB07/uvt3yw8AAJCd6+q0/6fDAAAAAElFTkSuQmCC';
        
        // Add rutorrent icon img to new anchor
        a.append(img);

        // Construct new url to send rutorrent request to
        const url = new URL(rutorrent_url + rutorrent_addtorrent_path);
        url.searchParams.append('url', torrent_download_link.href);
        if (rutorrent_label) {
            url.searchParams.append('label', rutorrent_label);
        }
        a.href = url.href;
        a.style = "margin:5px";

        // Add event listener to rutorrent button that sends GET request with AJAX.
        a.addEventListener('click', event => {
            let target = event.currentTarget;
            event.preventDefault();
            // console.log(`Sending GET to ${event.currentTarget.href}`);
            GM_xmlhttpRequest({
                context: {target},
                url: event.currentTarget.href,
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${rutorrent_auth_hash}`,
                },
                onload: response => {
                    var matches = response.responseText.match(/success/);
                    if(matches) {
                        response.context.target.innerHTML = "";
                        response.context.target.prepend(String.fromCodePoint("0x2705"));
                    } else {
                        response.context.target.innerHTML = "";
                        response.context.target.prepend(String.fromCodePoint("0x274C"));
                    }
                },
                onerror: function(response) {
                    debugger;
                    alert(response);
                },
            });
        });

        // Add anchor to span next to original download link
        let parent = download_link.parentElement;
        parent.append(a)
    })
})();