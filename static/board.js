$(document).ready(() => {
    var pplayers;

    function getPlayers() {
        $.get('/players').done((data) => {
            pplayers = data;
            var in_text = "<table><th><h1>Игроки:</h1></th>";

            data.forEach(e => {
                in_text += `<tr><td><h1>${e.name}</h1></td><td style="padding-left: 20px;"><h1>${e.points}</h1></td></tr>`;
            });

            in_text += '</table>'

            $('#players').html(in_text);
        });
    }

    function capti() {
        $.get('/caption').done((caption) => {
            $('#caption').html(`${caption}`);
        });
    }

    function startRound() {
        $.get('/reset').done((data) => {
            if (data == 'reseted') {
                $('#roundhead').html('');
                getPlayers();
                capti();
            }
        });
    }

    function vvv() {
        var ssss, sssss;
        ssss = setInterval(() => {
            $.get('/round').done((data) => {
                if (data.length == pplayers.length) {
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

    var timee = setInterval(() => {
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
    }, 1000);

    var refreshIntervalId;
    $.get('/start').done((data) => {
        if (data != 'started') {
            refreshIntervalId = setInterval(() => {
                getPlayers();
            }, 1000);
        } else {
            $('#start').hide();
            $('#cards').hide();

            getPlayers();
            capti();
        }
    });

    $('#start').click(() => {
        clearInterval(refreshIntervalId);
        $('#start').hide();
        $('#cards').hide();
        $.get(`/start?start=true&cc=${$('#cards').val()}`);
        startRound();
    });
});