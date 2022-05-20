$(document).ready(() => {
    let players = [];

    $.get('/mvt').done((data) => {
        $('#mvt').html(`<audio autoplay controls src="${data}" id="main"></audio> `);
    });

    $('#next').click(() => {
        $.get('/nextmvt').done((data) => {
            $('#mvt').html(`<audio autoplay controls src="${data}" id="main"></audio> `);
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

    setInterval(() => {
        $.get('/servertick').done((data) => {
            switch (data[0]) {
                case 0:
                    show();
                    if (players != data[1]) {
                        players = data[1];
                        let in_text = "<table><th><h1>Игроки:</h1></th>";
                        data[1].forEach(e => {
                            in_text += `<tr><td><h1>${e.name}</h1></td><td style="padding-left: 20px;"><h1>${e.points}</h1></td></tr>`;
                        });
                        in_text += '</table>'
                        $('#players').html(in_text);
                    }
                    break;
            
                case 1:
                    hide();
                    break;

                case 2:
                    hide();
                    $('#mem').html('');
                    $('#roundhead').html('');
                    $('#caption').html(`${data[1]}`);
                    let in_text = "<table><th><h1>Игроки:</h1></th>";
                    data[2].forEach(e => {
                        in_text += `<tr><td><h1>${e.name}</h1></td><td style="padding-left: 20px;"><h1>${e.points}</h1></td></tr>`;
                    });
                    in_text += '</table>'
                    $('#players').html(in_text);
                    break;

                case 3:
                    hide();
                    break;

                case 4:
                    hide();
                    $('#mvp').html(`<audio autoplay controls src="${data[1]}" id='mvpm' onpause='$("#main").trigger("play");'></audio>`);
                    $('#main').trigger("pause");
                    break;

                case 5:
                    hide();
                    let iin_text = "<table><th><h1>Голоса:</h1></th>";
                    data[1].forEach(e => {
                        iin_text += `<tr><td><h1>${e['name']}</h1></td><td style="padding-left: 20px;"><h1>${e.points}</h1></td></tr>`;
                    });
                    iin_text += '</table>'
                    $('#players').html(iin_text);
                    break;

                case 6:
                    hide();
                    $('#mvp').html(`<audio autoplay controls src="${data[1]}" id='mvpm' onpause='$("#main").trigger("play");'></audio>`);
                    $('#main').trigger("pause");
                    break;

                case 7:
                    hide();
                    let res = data[1].split('|||');
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
        });
    }, 1000);
});