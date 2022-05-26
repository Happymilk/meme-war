$(document).ready(() => {
    let players = [],
        last = -1,
        doreq = true,
        caption = '',
        result = '',
        doaudio = true,
        sshow = true,
        hhide = true;

    window.onbeforeunload = function(event) {
        let audio = document.getElementById('main');
        $.get(`/savetime?timee=${audio.currentTime}`).done();
    };

    document.getElementById("here").style.height = `${window.innerHeight - 110}px`;
    $(window).resize(() => {
        document.getElementById("here").style.height = `${window.innerHeight - 110}px`;
    });

    function rennnder(audio, canvas) {
        var context = new AudioContext();
        var src = context.createMediaElementSource(audio);
        var analyser = context.createAnalyser();

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var ctx = canvas.getContext("2d");

        src.connect(analyser);
        analyser.connect(context.destination);

        analyser.fftSize = 256;

        var bufferLength = analyser.frequencyBinCount;

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

    $('#start').click(() => {
        $.get(`/start?cc=${$('#cards').val()}`);
    });

    function nnextads() {
        $('#aaads').on('ended', () => {
            $.get('/ads').done((data) => {
                $('#ads').html(`<audio autoplay controls src="${data}" id='aaads'></audio>`);

                nnextads();
            });
        });
    }

    $('#smoke').click(() => {
        if ($('#smoke').val() == 'Перекур') {
            $('#smoke').val('Продолжить');
            $('#ads').html(`<audio autoplay controls src="/static/music/ads.mp3" id='aaads' ></audio>`);
            nnextads();
            setTimeout(() => {
                $('#main').trigger("pause");
            }, 200);
        } else {
            $('#smoke').val('Перекур');
            $('#ads').html('');
            setTimeout(() => {
                $('#main').trigger("play");
            }, 200);
        }
    });

    function hide() {
        $('#start').addClass('animate__animated animate__fadeOutRight');
        $('#cards').addClass('animate__animated animate__fadeOutRight');
        $('#cardscap').addClass('animate__animated animate__fadeOutRight');
        setTimeout(() => {
            $('#start').hide();
            $('#cards').hide();
            $('#cardscap').hide();
            $('#smoke').show();
        }, 1000);

        if (hhide) {
            hhide = false;
            $('#smoke')[0].className = 'button-53';
            setTimeout(() => {
                $("#smoke").addClass('animate__animated animate__fadeInRight');
            }, 200);
        }
    }

    function show() {
        $('#start').addClass('animate__animated animate__fadeInRight');
        $('#cards').addClass('animate__animated animate__fadeInRight');
        $('#cardscap').addClass('animate__animated animate__fadeInRight');
        setTimeout(() => {
            $('#start').show();
            $('#cards').show();
            $('#cardscap').show();
            $('#smoke').hide();
        }, 1000);

        if (sshow) {
            sshow = false;            
            $('#smoke')[0].className = 'button-53';
            setTimeout(() => {
                $("#smoke").addClass('animate__animated animate__fadeOutRight');
            }, 200);
        }
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

    $.get('/checkaudio').done((data) => {
        $('#audio').html(data);
    });

    function auudio() {
        $.get('/audio').done((data) => {
            $('#audio').html(`<audio autoplay controls src="${data}" id="audiotag" hidden></audio>`);

            setTimeout(() => {
                $('#audiotag').on('ended', () => {
                    setTimeout(() => {
                        auudio();
                    }, 2000);
                });
            }, 2000);
        });
    }

    setTimeout(() => {
        auudio();
    }, 30000);

    function nnext() {
        $('#main').on('ended', () => {
            $.get('/nextmvt').done((data) => {
                $('#mvt').html(`<audio class="animate__animated animate__bounceIn" autoplay controls src="${data[0]}" id="main"></audio> `);
                let audio = document.getElementById('main');
                rennnder(audio, document.getElementById("canvas"));

                nnext();
            });
        });
    }

    setInterval(() => {
        if (doreq) {
            doreq = false;
            $.get('/servertick')
                .always(() => {
                    doreq = true;
                })
                .done((data) => {
                    if (data[0] > 0 && doaudio) {
                        doaudio = false;

                        $('#next').show();
                            $.get('/mvt').done((data) => {
                                $('#mvt').html(`<audio class="animate__animated animate__bounceIn" autoplay controls src="${data[0]}" id="main"></audio> `);
                                let audio = document.getElementById('main');
                                audio.currentTime = data[1];
                                rennnder(audio, document.getElementById("canvas"));

                                nnext();
                            });
                        
                            $('#next').click(() => {
                                $('#next')[0].className = '';
                                setTimeout(() => {
                                    $("#next").addClass('animate__animated animate__flip');
                                }, 200);
                                $.get('/nextmvt').done((data) => {
                                    $('#mvt').html(`<audio class="animate__animated animate__bounceIn" autoplay controls src="${data[0]}" id="main"></audio> `);
                                    let audio = document.getElementById('main');
                                    rennnder(audio, document.getElementById("canvas"));

                                    nnext();
                                });
                            });
                    }
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
                            $('#audio').html("");
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
                            if (result != data[7]) {
                                result = data[7]
                                let res = data[7].split('|||');
                                $('#roundhead').html(res[0]);
                                $('#mem').html(res[1]);
                            }

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
                            h1s[i].style.fontSize = `30px`;
                        }
                    }

                    let h2s = document.getElementsByTagName('h2');
                    for (let i = 0; i < h2s.length; i++) {
                        if (h2s[i].clientHeight > 180) {
                            h2s[i].style.fontSize = `30px`;
                        }
                    }

                    if (last != data[0])
                        last = data[0]
                });
        }
    }, 1000);
});