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
                    if (players != data[1]) {
                        players = data[1];
                        var in_text = "<table><th><h1>Игроки:</h1></th>";
                        data[1].forEach(e => {
                            in_text += `<tr><td><h1>${e.name}</h1></td><td style="padding-left: 20px;"><h1>${e.points}</h1></td></tr>`;
                        });
                        in_text += '</table>'
                        $('#players').html(in_text);
                    }
                    break;
            
                default:
                    break;
            }
        });
    }, 1000);








    function capti() {
        $.get('/caption').done((caption) => {
            $('#caption').html(`${caption}`);
        });
    }

    function startRound() {
        $.get('/reset').done((data) => {
            if (data == 'reseted') {
                $('#roundhead').html('');
                capti();
            }
        });
    }

    function vvv() {
        var ssss, sssss;
        ssss = setInterval(() => {
            $.get('/voted').done((data) => {
                if (data.length == players.length) {
                    clearInterval(sssss);
                    $.get('/winner').done((d) => {
                        var res = d.split('|||');
                        $('#roundhead').html(res[0]);
                        $('#mem').html(res[1]);

                        $('#supermem').css('min-width', 'unset');
                        var hh = $(window).height() - $('.head').height() - $('#roundhead').height() - $('#capthead').height() - 30;
                        $('#supermem').css('min-height', hh);
                        $('#supermem').css('max-height', hh);
                    });
                    clearInterval(ssss);
                    clearInterval(sssss);
                }
            });
        }, 1000);
        sssss = setInterval(() => {
            $.get('/getjround').done((d) => {
                var iin_text = "<table><th><h1>Голоса:</h1></th>";
                d.forEach(e => {
                    iin_text += `<tr><td><h1>${e['name']}</h1></td><td style="padding-left: 20px;"><h1>${e.points}</h1></td></tr>`;
                });
                iin_text += '</table>'
                $('#players').html(iin_text);
            });
        }, 1000);
    }

    setInterval(() => {
        $.get('/getround').done((data) => {
            if (data == 'start_vote') {
                $.get('/mvs').done((mvs) => {
                    $('#mvp').html(`<audio autoplay controls src="${mvs}" id='mvpm' onpause='$("#main").trigger("play");'></audio>`);
                    $('#main').trigger("pause");
                    vvv();
                });
            } else if (data == 'end_vote') {
                $.get('/mve').done((mvs) => {
                    $('#mvp').html(`<audio autoplay controls src="${mvs}" id='mvpm' onpause='$("#main").trigger("play");'></audio>`);
                    setTimeout(() => {
                        $('#main').trigger("pause");
                    }, 500);
                    setTimeout(() => {
                        startRound();
                        $('#mem').html('');
                    }, 8000);
                });
            }
        });
    }, 100000);
});