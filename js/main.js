$(function () {
    const category_handler = function (ctg) {
        if ($(ctg).attr('aria-label') !== 'active') {
            fetch({
                kind: 'objects',
                categoria: $(ctg).data('id')
            }, (response) => {
                const items = $('div[class="items"]');
                items.html('');
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
                items.append('<div class="item" id="obj-insert">&plus;</div>');
            });
            $('#ctg-items div[class="item"]')
                .attr('aria-label', '')
                .css({
                    'background': ''
                })
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
                $('#ctg-items').append(`<div class="item" data-id="${each['id_categoria']}">${each['nome']}</div>`);
            }
            $('#ctg-items div[class="item"]')
                .on('click', function () {
                    category_handler(this);
                });
        });
    })();

    $('#ctg-search')
        .on('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
            // TODO: Something.
        });
    $('#ctg-insert')
        .on('click', function () {
            const backbone = $('.back-layer');
            backbone
                .css({
                    'z-index': '1',
                    'opacity': '1'
                })
                .children('.category-insert')
                .css({
                    'height': '300px'
                });
            backbone
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
                                            .css({
                                                'z-index': ''
                                            })
                                            .children('.category-insert')
                                            .css({
                                                'height': ''
                                            });
                                    });
                            }
                        });
                });
        });
    $('#ctg-input')
        .on('keydown', function (event) {
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