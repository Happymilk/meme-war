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
        percent = 0
    dir = 0,
        doreq = true;

    setInterval(() => {
        if (dir == 0)
            if (percent == -200)
                dir = 1
            else
                percent--;
        else
        if (percent == 0)
            dir = 0
        else
            percent++;

        document.getElementById("background").style.top = `${percent}%`
        document.getElementById("background").style.left = `${percent}%`
    }, 75);

    if (document.cookie == '') {
        id = (new URLSearchParams(window.location.search)).get('id');
        if (id != null)
            setCookie('user', id, { 'max-age': 432000 });
        else
            location.href = '/';
    } else {
        id = getCookie('user');
        if (id == undefined) {
            id = (new URLSearchParams(window.location.search)).get('id');
            if (id != null)
                setCookie('user', id, { 'max-age': 432000 });
            else
                location.href = '/';
        }
    }

    $.get(`/background${window.location.search}`).done((data) => {
        if (data != '-1')
            document.getElementById("background").style.backgroundImage = `url('${data}')`;
        else
            document.getElementById("background").style.backgroundImage = 'none';
    });

    setInterval(() => {
        if (doreq) {
            doreq = false;
            $.get(`/clienttick${window.location.search}`)
                .always(() => {
                    doreq = true;
                })
                .done((data) => {
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
                            in_text = "<h1 style='text-align: center;'>Карты</h1>";
                            for (let i = 0; i < data[1].length; i++) {
                                in_text += `<div class="container"><div class='overlay' hidden id='${i}' onclick="$('#${i}')[0].className = 'overlay';setTimeout(() => {$('#${i}').addClass('animate__animated animate__slideOutRight');setTimeout(() => {$('#${i}').hide();},1000);}, 200);"><input type="button" class="overlaybtn anim" onclick="location.href='/sendcard?id=${id}&card=${data[1][i].path}';" value="Выбрать" /></div><img src="${data[1][i].fullpath}" style="box-shadow: 0 0 10px rgba(0,0,0,0.5);" onclick="$('#${i}')[0].className = 'overlay';setTimeout(() => {$('#${i}').addClass('animate__animated animate__slideInLeft');$('#${i}').show();}, 200);"/></div>`;
                            }
                            in_text += `<input type="button" class="overlaybtn anim" onclick="location.href='/newcards?id=${id}';" value="Перераздать (-1 балл)" />`

                            $('#my').html(in_text);
                            break;

                        case 3:
                            if (last == data[0])
                                return

                            $('#loading').hide();
                            in_text = `<h1>Твой выбор:</h1><img id="pic" src="${data[1]}" />`
                            in_text += `<input type="button" class="overlaybtn anim" onclick="location.href='/revert?id=${id}&card=${data[1]}';" value="Переизбрать" />`
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
                });
        }
    }, 1000);
});