$(function () {
    const enable_hiding = () => {
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
                                        .children('.category-insert, .object-insert')
                                        .removeAttr('style');
                                });
                        }
                    });
            });
    };

    const category_handler = function (ctg) {
        if ($(ctg).attr('aria-label') !== 'active') {
            fetch({
                kind: 'objects',
                categoria: $(ctg).data('id')
            }, (response) => {
                const items = $('#obj-items').html('');
                for (const each of response) {
                    items.append(
                        $('<div class="item">')
                            .css({
                                'background': `url("${each['percorso']}") rgb(64, 68, 75) no-repeat center center`
                            })
                            .on('click', function () {
                                // TODO: Behaviour.
                            }));
                }
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
                                    'height': 'fit-content',
                                    'visibility': 'visible'
                                });
                            enable_hiding();
                        }));
            });
            $('#ctg-items div[class="item"]')
                .attr('aria-label', '')
                .removeAttr('style')
                .filter(ctg)
                .css({
                    'background': 'rgb(50, 53, 59)'
                })
                .attr('aria-label', 'active');
        }
    };

    (() => { // Fetch & Set all the categories.
        fetch({
            kind: 'category'
        }, (response) => {
            for (const each of response) {
                $('#ctg-items').append(
                    `<div class="item" data-id="${each['id_categoria']}" aria-label>${each['nome']}</div>`);
            }
            $('#ctg-items div[class="item"]')
                .on('click', function () {
                    category_handler(this);
                });
        });
    })();

    (() => { // Stores all the data prior to inserting an object.
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
                        }
                    })
                    .trigger('click');
            });
        $('#obj-submit')
            .on('click', function () {
                const nome = $('#obj-input-nome').text().trim();
                const ita  = $('#obj-input-ita').text().trim();
                const eng  = $('#obj-input-eng').text().trim();
                if (image === null) {
                    alert('Inserire un immagine.');
                } else if (audio === null) {
                    alert('Inserire un file audio.');
                } else if (nome.length === 0) {
                    alert('Inserire il nome dell\'oggetto');
                } else if (ita.length === 0) {
                    alert('Inserire la definizione in italiano');
                } else if (eng.length === 0) {
                    alert('Inserire la definizione in inglese');
                }

                let data = new FormData();
                data.append('kind', 'object');
                data.append('image', image);
                data.append('audio', audio);
                data.append('nome', nome);
                data.append('ita', ita);
                data.append('eng', eng);
                insert(data, (response) => {
                    console.log(response);
                });
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
                $('#ctg-items div[class="item"]')
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
    $('#ctg-insert')
        .on('click', function () {
            $('.back-layer')
                .css({
                    'z-index': '1',
                    'opacity': '1'
                })
                .children('.category-insert')
                .css({
                    'height': 'fit-content',
                    'visibility': 'visible'
                });
            enable_hiding();
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
            if (category.length !== 0) {
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
            }
        });
    $('#obj-input')
        .on('keyup', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                $('#obj-submit').trigger('click');
            }
        });
    $('#obj-submit')
        .on('click', function () {
            const object = $('#obj-input').text().trim();
            if (object.length !== 0) {
                insert({
                    kind: 'object',
                    oggetto: object
                }, (response) => {
                    $('#obj-input').html('');
                    $('.back-layer').trigger('mousedown');
                    $('#obj-insert').before(
                        $('<div class="item">')
                            .css({
                                'background': `url("${response['percorso']}") rgb(64, 68, 75) no-repeat center center`
                            }));
                });
            }
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

function insert(data, callback) {
    $.ajax({
        url: 'php/insert.php',
        type: 'POST',
        data: data,
        dataType: 'json',
        processData: false,
        contentType: false,
        cache: false,
        success: (response) => {
            if ('error' in response) {
                console.error(response['message']);
            } else {
                callback(response);
            }
        }
    });
}