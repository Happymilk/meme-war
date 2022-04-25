$(document).ready(() => {
    var id = ''
    if (document.cookie != '') {
        function getCookie(name) {
            let matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        }

        id = getCookie('user');
        if (id == undefined)
            location.href = `/`;
    } else {
        location.href = `/`;
    }

    setInterval(() => {
        $.get(`/getvote?id=${id}`).done((data) => {
            if (data == "started") {
                location.href = `/vote?id=${id}`;
            }
        });
    }, 1000);
});