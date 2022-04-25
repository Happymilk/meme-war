$(document).ready(() => {
    if (document.cookie == '') {
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

        var id = (new URLSearchParams(window.location.search)).get('id');
        if (id != null)
            setCookie('user', id, { 'max-age': 432000 });
        else
            location.href = '/';
    }

    var id = (new URLSearchParams(window.location.search)).get('id');
    if (id == null)
        location.href = '/';

    var refreshIntervalId, refreshIntervalId2;

    function dosm() {
        $('.head').hide();
        $.get(`/get?id=${id}`).done((d) => {
            var in_text = "<h1>Карты:</h1>";
            var i = 0;
            d.forEach(e => {
                var format = e.path.split('.');
                format = format[format.length - 1];

                var path = '';
                if (format == 'gif')
                    path = '/static/memes/gif/';
                else
                    path = '/static/memes/img/';
                in_text += `<div class="container"><div class='overlay' hidden id='${i}' onclick="$('#${i}').hide();"><input type="button" class="overlaybtn" style="background-color: darkgreen;" onclick="location.href='/send?id=${id}&card=${e.path}';" value="Выбрать" /></div><img src="${path + e.path}" onclick="$('#${i}').show();"/>${e.path}</div>`;
                i++;
            });

            $('#my').html(in_text);
            clearInterval(refreshIntervalId2);
        });
    }

    refreshIntervalId = setInterval(() => {
        $.get('/start').done((data) => {
            if (data == 'started') {
                refreshIntervalId2 = setInterval(() => {
                    $.get('/allvoted').done((data2) => {
                        if (data2 == 'yes') {
                            dosm();
                        } else {
                            $.get(`/getvote?id=${id}`).done((data3) => {
                                if (data3 == 'not') {
                                    dosm();
                                }
                            });
                        }
                    });
                }, 1000);
                clearInterval(refreshIntervalId);
            }
        });
    }, 1000);
});