$(document).ready(() => {
    let players = [],
        last = -1,
        doreq = true,
        caption = '';

    window.onbeforeunload = function(event) {
        let audio = document.getElementById('main');
        $.get(`/savetime?timee=${audio.currentTime}`).done();
    };

    document.getElementById("here").style.height = `${window.innerHeight - 110}px`;
    $(window).resize(() => {
        document.getElementById("here").style.height = `${window.innerHeight - 110}px`;
    });

    function rennnder(audio) {
        var context = new AudioContext();
        var src = context.createMediaElementSource(audio);
        var analyser = context.createAnalyser();

        var canvas = document.getElementById("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var ctx = canvas.getContext("2d");

        src.connect(analyser);
        analyser.connect(context.destination);

        analyser.fftSize = 256;

        var bufferLength = analyser.frequencyBinCount;
        console.log(bufferLength);

        var dataArray = new Uint8Array(bufferLength);

        var WIDTH = canvas.width;
        var HEIGHT = canvas.height;

        var barWidth = (WIDTH / bufferLength) * 2.5;
        var barHeight;
        var x = 0;

        function renderFrame() {
            requestAnimationFrame(renderFrame);

            x = 0;

            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            for (var i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];

                var r = barHeight + (25 * (i / bufferLength));
                var g = 250 * (i / bufferLength);
                var b = 50;

                ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        }

        renderFrame();
    }

    $.get('/mvt').done((data) => {
        $('#mvt').html(`<audio class="animate__animated animate__bounceIn" autoplay controls src="${data[0]}" id="main"></audio> `);
        let audio = document.getElementById('main');
        audio.currentTime = data[1];
        rennnder(audio);
    });

    $('#next').click(() => {
        $('#next')[0].className = '';
        setTimeout(() => {
            $("#next").addClass('animate__animated animate__flip');
        }, 200);
        $.get('/nextmvt').done((data) => {
            $('#mvt').html(`<audio class="animate__animated animate__bounceIn" autoplay controls src="${data[0]}" id="main"></audio> `);
            let audio = document.getElementById('main');
            rennnder(audio);
        });
    });

    $('#start').click(() => {
        $.get(`/start?cc=${$('#cards').val()}`);
    });

    function hide() {
        $('#start').addClass('animate__animated animate__fadeOutRight');
        $('#cards').addClass('animate__animated animate__fadeOutRight');
        $('#cardscap').addClass('animate__animated animate__fadeOutRight');
        setTimeout(() => {
            $('#start').hide();
            $('#cards').hide();
            $('#cardscap').hide();
        }, 1000);
    }

    function show() {
        $('#start').addClass('animate__animated animate__fadeInRight');
        $('#cards').addClass('animate__animated animate__fadeInRight');
        $('#cardscap').addClass('animate__animated animate__fadeInRight');
        setTimeout(() => {
            $('#start').show();
            $('#cards').show();
            $('#cardscap').show();
        }, 1000);
    }

    function setplayers(list, mode = 0) {
        let title = '';
        if (mode == 0)
            title = 'Игроки';
        else
            title = 'Голоса';

        if (list.length > 0) {
            if (JSON.stringify(players) != JSON.stringify(list)) {
                players = list;
                let in_text = `<div class="animate__animated animate__fadeIn"><h1>${title}:</h1>`;
                for (let i = 0; i < list.length; i++) {
                    let url = 'none';
                    if (list[i].motiv != '-1')
                        url = list[i].motiv;
                    in_text += `<div class="flex" style="background-size: contain; background-image: url(${url})"><div style="min-width: 75%; max-width: 75%; word-break: break-word;"><h1 id="nick${i}" style="vertical-align: middle; line-height: 90px;">${list[i].name}</h1></div><div style="padding-left: 20px; min-width: 25%; max-width: 25%;"><h1>${list[i].points}</h1></div></div>`;
                }
                in_text += '</div>'
                $('#players').html(in_text);
            }
        }
    }

    function setcaption(cap) {
        if (caption != cap) {
            caption = cap;
            $('#caption')[0].className = '';
            setTimeout(() => {
                $("#caption").addClass('animate__animated animate__lightSpeedInRight');
                $('#caption').html(`${cap}`);
            }, 200);
        }
    }

    function setmvp(mvp, mode = 0) {
        $('#mvp').html(`<audio class="animate__animated animate__fadeInDown" autoplay controls src="${mvp}" id='mvpm' onpause='$("#main").trigger("play");'></audio>`);
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
            $.get('/servertick')
                .always(() => {
                    doreq = true;
                })
                .done((data) => {
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
                            try {
                                $('#mvpm')[0].className = '';
                            } catch {}
                            setTimeout(() => {
                                $("#mvpm").addClass('animate__animated animate__fadeOutUp');
                            }, 200);
                            break;

                        case 3:
                            hide();
                            setplayers(data[1]);
                            setcaption(data[2]);
                            if (data[3] != 6) {
                                $('#mem').html(`<div class="animate__animated animate__jackInTheBox" id="supertimer" style="font-size: 300px;">${data[3]}</div>`);
                                if (data[3] == 0)
                                    $('#supertimer').hide();
                            } else
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
                            let hh = $(window).height() - $('#head').height() - $('#roundhead').height() - $('#caption').height() - 30;
                            $('#supermem').css('min-height', hh);
                            $('#supermem').css('max-height', hh);
                            break;

                        default:
                            break;
                    }

                    let h1s = document.getElementsByTagName('h1');
                    for (let i = 0; i < h1s.length; i++) {
                        if (h1s[i].clientHeight > 90) {
                            h1s[i].style.fontSize = `${60 / (h1s[i].clientHeight / 90)}px`;
                        }
                    }

                    let h2s = document.getElementsByTagName('h2');
                    for (let i = 0; i < h2s.length; i++) {
                        if (h2s[i].clientHeight > 180) {
                            h2s[i].style.fontSize = `${60 / (h1s[i].clientHeight / 180)}px`;
                        }
                    }

                    if (last != data[0])
                        last = data[0]
                });
        }
    }, 1000);
});