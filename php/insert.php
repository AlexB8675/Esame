<?php
    require 'common.php';
    $connection = connect_database();
    $kind       = $_POST['kind'];

    print match ($kind) {
        'category' => (function () use ($connection) {
            $category = $_POST['categoria'];
            $query    = "insert into Categorie value (default, ?)";
            $result   = safe_query($connection, $query, $category);
            if (!$result) {
                die(json_encode([
                    'message' => 'category_insert',
                    'error'   => '500'
                ]));
            }
            return json_encode([
                'id'   => $result->insert_id,
                'nome' => $category
            ]);
        })()
    };


