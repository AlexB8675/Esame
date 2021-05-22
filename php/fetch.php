<?php
    require 'common.php';
    $connection = connect_database();
    $kind       = $_GET['kind'];

    print match ($kind) {
        'category' => (function () use ($connection) {
            $query  = "select * from Categorie";
            $result = safe_query($connection, $query);
            if (!$result) {
                die(json_encode([
                    'message' => 'category_fetch',
                    'error'   => '500'
                ]));
            }
            return json_encode($result->get_result()->fetch_all(MYSQLI_ASSOC));
        })(),

        'objects' => (function () use ($connection) {
            $query    = "select * from Oggetti where e_id_categoria = ?";
            $category = $_GET['categoria'];
            $result   = safe_query($connection, $query, $category);
            if (!$result) {
                die(json_encode([
                    'message' => 'object_fetch',
                    'error'   => '500'
                ]));
            }
            return json_encode($result->get_result()->fetch_all(MYSQLI_ASSOC));
        })()
    };