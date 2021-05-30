$(function () {
    const install_backlayer_hide = (pred) => {
        $('.back-layer')
            .delay(200)
            .queue(function () {
                $(this)
                    .dequeue()
                    .on('mousedown', function (event) {
                        if (event.target === this) {
                            $(this)
                                .off('mousedown')
                                .css({
                                    'opacity': ''
                                })
                                .delay(250)
                                .queue(function () {
                                    $(this)
                                        .dequeue()
                                        .removeAttr('style')
                                        .children()
                                        .removeAttr('style');
                                });
                            if (pred) {
                                pred();
                            }
                        }
                    });
            });
    };

    const object_handler = (obj) => {
        $('.back-layer')
            .css({
                'z-index': '1',
                'opacity': '1'
            })
            .children('.object-viewer')
            .css({
                'visibility': 'visible'
            });
        $('#obj-view-image').html(`<img src="${obj['immagine']}" alt>`);
        $('#obj-view-audio').html(`<source src="${obj['vocale']}" type="audio/mpeg">`);
        $('#obj-view-name').html(`Oggetto - ${obj['nome']}`);
        $('#obj-view-ita').html(`Definizione Italiano: ${obj['def_it']}`);
        $('#obj-view-eng').html(`Definizione Inglese: ${obj['def_eng']}`);
        install_backlayer_hide(() => {
            const player = $('#obj-view-audio')[0];
            player.pause();
            player.currentTime = 0;
        });
    };

    const category_handler = (ctg) => {
        if ($(ctg).attr('aria-label') !== 'active') {
            fetch({
                kind: 'objects',
                categoria: $(ctg).data('id')
            }, (response) => {
                const items = $('#obj-items').html('');
                for (const each of response) {
                    items.append(
                        $('<div class="item">')
                            .append(`<img src="${each['immagine']}" alt>`)
                            .on('click', function () {
                                object_handler(each);
                            }));
                }
                login({
                    kind: 'session'
                }, (response) => {
                    if ($(ctg).data('id') !== -1 && response['username'] === 'admin') {
                        items.append(
                            $('<div class="item" id="obj-insert">')
                                .html('&plus;')
                                .on('click', function () {
                                    $('.back-layer')
                                        .css({
                                            'z-index': '1',
                                            'opacity': '1'
                                        })
                                        .children('.object-insert')
                                        .css({
                                            'visibility': 'visible'
                                        });
                                    install_backlayer_hide();
                                }));
                    }
                });
            });
            $('#ctg-items div[class="item"]').attr('aria-label', '');
            $(ctg).attr('aria-label', 'active');
        }
    };

    const insert_login_buttons = () => {
        $('#main-header')
            .append(
                $('<div class="item" id="signin">Accedi</div>')
                    .on('click', function () {
                        $('.back-layer')
                            .css({
                                'z-index': '1',
                                'opacity': '1'
                            })
                            .children('.signin-form')
                            .css({
                                'visibility': 'visible'
                            });
                        install_backlayer_hide(() => {
                            $('#signin-username').val('');
                            $('#signin-password').val('');
                        });
                    }))
            .append(
                $('<div class="item" id="signup">Registrati</div>')
                    .on('click', function () {
                        $('.back-layer')
                            .css({
                                'z-index': '1',
                                'opacity': '1'
                            })
                            .children('.signup-form')
                            .css({
                                'visibility': 'visible'
                            });
                        install_backlayer_hide(() => {
                            $('#signin-username').val('');
                            $('#signin-password').val('');
                        });
                    }))
    };

    const login_handler = (response) => {
        if ('error' in response) {
            if (response['message'] === 'unauthorized') {
                insert_login_buttons();
            }
        } else {
            $('#main-header')
                .html(`<div class="item">Benvenuto, ${response['username']}</div>`)
                .append(
                    $('<div class="item" id="main-logout">')
                        .html('Logout')
                        .on('click', function () {
                            login({
                                kind: 'destroy'
                            }, () => {
                                $('.footer, #obj-insert').remove();
                                $('#main-header')
                                    .children()
                                    .remove();
                                insert_login_buttons();
                            });
                        }));
            if (response['username'] === 'admin') {
                $('.sidebar').append(
                    `<div class="footer">` +
                        `<div class="separator"></div>` +
                        `<div class="item" id="ctg-insert">&plus; Inserisci categoria</div>` +
                    `</div>`);
                $('#ctg-insert')
                    .on('click', function () {
                        $('.back-layer')
                            .css({
                                'z-index': '1',
                                'opacity': '1'
                            })
                            .children('.category-insert')
                            .css({
                                'visibility': 'visible'
                            });
                        install_backlayer_hide();
                    });
                if ($('#ctg-items .item[aria-label="active"]').data('id') !== -1) {
                    $('#obj-items')
                        .append(
                            $('<div class="item" id="obj-insert">')
                                .html('&plus;')
                                .on('click', function () {
                                    $('.back-layer')
                                        .css({
                                            'z-index': '1',
                                            'opacity': '1'
                                        })
                                        .children('.object-insert')
                                        .css({
                                            'visibility': 'visible'
                                        });
                                    install_backlayer_hide();
                                }));
                }
            }
        }
    };

    (() => { // Fetch & Set all the categories.
        fetch({
            kind: 'category'
        }, (response) => {
            for (const each of response) {
                $('#ctg-items').append(`<div class="item" data-id="${each['id_categoria']}" aria-label>${each['nome']}</div>`);
            }
            $('#ctg-items div[class="item"]')
                .on('click', function () {
                    category_handler(this);
                })
                .first()
                .trigger('click');
        });
    })();

    (() => { // Checks for session and privileges.
        login({ kind: 'session' }, login_handler);
    })();

    (() => { // Setup object data handlers.
        let image = null;
        let audio = null;
        $('#obj-input-image')
            .on('click', function () {
                $('<input type="file">')
                    .on('change', function (event) {
                        image = event.target.files[0];
                        if (['image/gif', 'image/jpeg', 'image/png'].includes(image['type'])) {
                            let reader    = new FileReader();
                            reader.onload = function () {
                                $('#obj-input-image').html(`<img src="${reader.result}" alt>`);
                            }
                            reader.readAsDataURL(image);
                        } else {
                            alert('Il file caricato non è un immagine.');
                        }
                    })
                    .trigger('click');
            });

        $('#obj-input-audio')
            .on('click', function () {
                $('<input type="file">')
                    .on('change', function (event) {
                        audio = event.target.files[0];
                        if (!['audio/mpeg', 'audio/ogg'].includes(audio['type'])) {
                            alert('Il file caricato non è un file audio.');
                        } else {
                            $('#obj-audio-name').html(audio.name);
                        }
                    })
                    .trigger('click');
            });

        $('#obj-submit')
            .on('click', function () {
                const category =
                    $('#ctg-items')
                        .children('div[aria-label="active"]')
                        .data('id');
                const name = $('#obj-input-name').text().trim();
                const ita  = $('#obj-input-ita').text().trim();
                const eng  = $('#obj-input-eng').text().trim();
                if (image === null) {
                    alert('Inserire un immagine.');
                } else if (audio === null) {
                    alert('Inserire un file audio.');
                } else if (name.length === 0) {
                    alert('Inserire il nome dell\'oggetto');
                } else if (ita.length === 0) {
                    alert('Inserire la definizione in italiano');
                } else if (eng.length === 0) {
                    alert('Inserire la definizione in inglese');
                } else {
                    let data = new FormData();
                    data.append('kind', 'object');
                    data.append('categoria', category);
                    data.append('immagine', image);
                    data.append('audio', audio);
                    data.append('nome', name);
                    data.append('ita', ita);
                    data.append('eng', eng);
                    insert(data, (response) => {
                        image = audio = null;
                        $('#obj-input-eng, #obj-input-ita, #obj-input-name').html('');
                        $('#obj-audio-name').html('Nessun file audio selezionato');
                        $('#obj-input-image').html('&plus;');
                        $('.back-layer').trigger('mousedown');
                        $('#obj-insert')
                            .before(
                                $('<div class="item">')
                                    .append(`<img src="${response['immagine']}" alt>`)
                                    .on('click', function () {
                                        object_handler(this, response);
                                    }));
                    });
                }
            });
    })();

    $('#ctg-search')
        .on('keyup', function (event) {
            const search = $(this);
            if (event.key === 'Enter') {
                event.preventDefault();
            }
            if (search.text() === '') {
                $('#ctg-items div[class="item"]').show();
            } else {
                $('#ctg-items div[class="item"][data-id!="-1"]')
                    .hide()
                    .each(function () {
                        const criteria = search.text().toLowerCase();
                        const current  = $(this).text().toLowerCase()
                        if (current.indexOf(criteria) !== -1){
                            $(this).show();
                        }
                    });
            }
        });

    $('#ctg-input')
        .on('keyup', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                $('#ctg-submit').trigger('click');
            }
        });

    $('#ctg-submit')
        .on('click', function () {
            const category = $('#ctg-input').text().trim();
            if (category.length === 0) {
                alert('Inserisci il nome di una categoria.');
            }
            insert({
                kind: 'category',
                categoria: category
            }, (response) => {
                $('#ctg-input').html('');
                $('.back-layer').trigger('mousedown');
                $('#ctg-items')
                    .append(`<div class="item" data-id="${response['id']}">${response['nome']}</div>`)
                    .children('div[class="item"]:last-child')
                    .on('click', function () {
                        category_handler(this);
                    })
                    .trigger('click');
            });
        });

    $('#obj-input')
        .on('keyup', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                $('#obj-submit').trigger('click');
            }
        });

    $('#signin-submit')
        .on('click', function () {
            const username = $('#signin-username').val().trim();
            const password = $('#signin-password').val().trim();
            login({
                kind: 'signin',
                username: username,
                password: password
            }, (response) => {
                if ('error' in response) {
                    if (response['message'] === 'unknown_user') {
                        alert('username o password errati.');
                    }
                } else {
                    login_handler(response);
                }
                $('.back-layer').trigger('mousedown');
            });
        });

    $('#signup-submit')
        .on('click', function () {
            const username = $('#signup-username').val().trim();
            const password = $('#signup-password').val().trim();
            login({
                kind: 'signup',
                username: username,
                password: password
            }, (response) => {
                if ('error' in response) {
                    if (response['message'] === 'fatal_found') {
                        alert('utente già registrato');
                    }
                }
                $('.back-layer').trigger('mousedown');
            });
        });
});

const fetch = (function () {
    return function (data, callback) {
        $.ajax({
            url: 'php/fetch.php',
            type: 'GET',
            data: data,
            dataType: 'json',
            cache: true,
            success: (response) => {
                if ('error' in response) {
                    console.error(response['message']);
                } else {
                    callback(response);
                }
            }
        });
    }
})();

const login = (function () {
    let session = null;
    return function (data, callback) {
        if (data['kind'] === 'destroy') {
            session = null;
        }
        if (session === null || 'error' in session) {
            $.ajax({
                url: 'php/login.php',
                type: 'POST',
                data: data,
                dataType: 'json',
                cache: true,
                success: (response) => {
                    if (response === {}) {
                        session = response;
                    }
                    callback(response);
                }
            });
        } else {
            callback(session);
        }
    };
})();

function insert(data, callback) {
    let settings = {
        url: 'php/insert.php',
        type: 'POST',
        data: data,
        dataType: 'json',
        cache: false,
        success: (response) => {
            if ('error' in response) {
                console.error(response['message']);
            } else {
                callback(response);
            }
        }
    };
    if (data.constructor === FormData) {
        settings['processData'] = false;
        settings['contentType'] = false;
    }
    $.ajax(settings);
}