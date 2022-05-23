$(document).ready(() => {
    let players = [],
        last = -1,
        doreq = true;

    window.onbeforeunload = function(event) {
        let audio = document.getElementById('main');
        $.get(`/savetime?timee=${audio.currentTime}`).done();
    };

    $.get('/mvt').done((data) => {
        $('#mvt').html(`<audio autoplay controls src="${data[0]}" id="main"></audio> `);
        let audio = document.getElementById('main');
        audio.currentTime = data[1]
    });

    $('#next').click(() => {
        $.get('/nextmvt').done((data) => {
            $('#mvt').html(`<audio autoplay controls src="${data[0]}" id="main"></audio> `);
        });
    });

    $('#start').click(() => {
        $.get(`/start?cc=${$('#cards').val()}`);
    });

    function hide() {
        $('#start').hide();
        $('#cards').hide();
        $('#cardscap').hide();
    }

    function show() {
        $('#start').show();
        $('#cards').show();
        $('#cardscap').show();
    }

    function setplayers(list, mode = 0) {
        let title = '';
        if (mode == 0)
            title = 'Игроки';
        else
            title = 'Голоса';

        if (mode == 1 || (players.length != list.length && mode == 0)) {
            players = list;
            let in_text = `<table><th><h1>${title}:</h1></th>`;
            for (let i = 0; i < list.length; i++) {
                in_text += `<tr><td><h1>${list[i].name}</h1></td><td style="padding-left: 20px;"><h1>${list[i].points}</h1></td></tr>`;
            }
            in_text += '</table>'
            $('#players').html(in_text);
        }
    }

    function setcaption(cap) {
        $('#caption').html(`${cap}`);
    }

    function setmvp(mvp) {
        $('#mvp').html(`<audio autoplay controls src="${mvp}" id='mvpm' onpause='$("#main").trigger("play");'></audio>`);
        setTimeout(() => {
            $('#main').trigger("pause");
        }, 200);
    }

    function checkescape(data) {
        if (last == data[0])
            return;
    }

    setInterval(() => {
        if (doreq) {
            doreq = false;
            $.get('/servertick').done((data) => {
                switch (data[0]) {
                    case -1:
                        location.href = '/create'
                        break;
                    case 0:
                        show();
                        setplayers(data[1]);
                        break;

                    case 1:
                        hide();
                        break;

                    case 2:
                        checkescape(data);

                        hide();
                        $('#mem').html('');
                        $('#roundhead').html('');
                        setplayers(data[1]);
                        setcaption(data[2]);
                        break;

                    case 3:
                        hide();
                        setplayers(data[1]);
                        setcaption(data[2]);
                        if (data[3] != 6)
                            $('#mem').html(`${data[3]}`);
                        else
                            $('#mem').html('');
                        break;

                    case 4:
                        checkescape(data);

                        hide();
                        setplayers(data[1]);
                        setcaption(data[2]);
                        setmvp(data[4]);
                        break;

                    case 5:
                        hide();
                        setcaption(data[2]);
                        setplayers(data[5], 1);
                        break;

                    case 6:
                        checkescape(data);

                        hide();
                        setcaption(data[2]);
                        setplayers(data[5], 1);
                        setmvp(data[6]);
                        break;

                    case 7:
                        checkescape(data);

                        hide();
                        setcaption(data[2]);
                        setplayers(data[5], 1);
                        let res = data[7].split('|||');
                        $('#roundhead').html(res[0]);
                        $('#mem').html(res[1]);

                        $('#supermem').css('min-width', 'unset');
                        let hh = $(window).height() - $('#head').height() - $('#roundhead').height() - $('#capthead').height() - 30;
                        $('#supermem').css('min-height', hh);
                        $('#supermem').css('max-height', hh);
                        break;

                    default:
                        break;
                }

                if (last != data[0])
                    last = data[0]

                doreq = true;
            });
        }
    }, 1000);
});