$(document).ready(() => {
    function setCookie(name, value, options = {}) {
        options = {
            path: '/',
            ...options
        };

        if (options.expires instanceof Date) {
            options.expires = options.expires.toUTCString();
        }

        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

        for (let optionKey in options) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[optionKey];
            if (optionValue !== true) {
                updatedCookie += "=" + optionValue;
            }
        }

        document.cookie = updatedCookie;
    }

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    let id;
    let last = -1,
        doreq = true;

    if (document.cookie == '') {
        id = (new URLSearchParams(window.location.search)).get('id');
        if (id != null)
            setCookie('user', id, { 'max-age': 432000 });
        else
            location.href = '/';
    } else {
        id = getCookie('user');
        if (id == undefined)
            location.href = `/`;
    }

    setInterval(() => {
        if (doreq) {
            doreq = false;
            $.get(`/clienttick${window.location.search}`).done((data) => {
                let in_text = '';
                switch (data[0]) {
                    case 0:
                        location.href = '/join?clear=true';
                        break;
                    case 1:
                    case 7:
                        $('#loading').show();
                        break;

                    case 2:
                        if (last == data[0])
                            return

                        $('#loading').hide();
                        in_text = "<h1>Карты:</h1>";
                        for (let i = 0; i < data[1].length; i++) {
                            in_text += `<div class="container"><div class='overlay' hidden id='${i}' onclick="$('#${i}').hide();"><input type="button" class="overlaybtn" style="background-color: darkgreen;" onclick="location.href='/sendcard?id=${id}&card=${e.path}';" value="Выбрать" /></div><img src="${e.fullpath}" onclick="$('#${i}').show();"/>${e.path}</div>`;
                        }

                        $('#my').html(in_text);
                        break;

                    case 3:
                        if (last == data[0])
                            return

                        $('#loading').hide();
                        in_text = `<h1>Твой выбор:</h1><img id="pic" src="${data[1]}" />`
                        $('#my').html(in_text);
                        break;

                    case 4:
                        if (last == data[0])
                            return

                        $('#loading').hide();
                        in_text = `<h1>Голосование:</h1>${data[1]}`
                        $('#my').html(in_text);
                        break;

                    case 5:
                        break;

                    case 6:
                        break;

                    default:
                        break;
                }

                if (last != data[0] && data[0] != '')
                    last = data[0]

                doreq = true;
            });
        }
    }, 1000);
});