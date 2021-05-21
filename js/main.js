$(function () {
    (() => { // Fetch & Set all the categories.
        fetch({
            kind: 'category'
        }, (response) => {
            for (const each of response) {
                $('#ctg-items').append(`<div class="item" aria-label="${each['id']}">${each['nome']}</div>`);
            }
            $('#ctg-items div[class="item"]')
                .on('click', function () {
                    fetch({
                        kind: 'objects',
                        category: $(this).attr('aria-label')
                    }, (response) => {
                        // TODO: Fill right hand side with objects.
                    });
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
            // TODO: Something.
        });
    $('#ctg-submit')
        .on('click', function () {
            const category = $('#ctg-input').text().trim();
            if (category.length !== 0) {
                insert({
                    kind: 'category',
                    category: category
                }, (_) => {
                    $('#ctg-input').html('');
                    $('.back-layer').trigger('mousedown');
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