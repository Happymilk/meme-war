$(document).ready(() => {
    var clear = (new URLSearchParams(window.location.search)).get('clear');
    if (clear != null) {
        var cookies = document.cookie.split(";");

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }

    if (document.cookie != '') {
        function getCookie(name) {
            let matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        }

        var user = getCookie('user');
        if (user != undefined)
            location.href = `/client?id=${user}`;
    }

    let percent = 0,
        dir = 0;

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

    $("#motivs").change(function() {
        if (this.value != '-1')
            document.getElementById("background").style.backgroundImage = `url('${this.value}')`;
        else
            document.getElementById("background").style.backgroundImage = 'none';
    });
});