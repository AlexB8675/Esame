<?php
    require 'common.php';
    $connection = connect_database();
    $kind       = $_POST['kind'];

    switch ($kind) {
        case 'category': {
            $category = $_POST['category'];
            $query    = "insert into Categorie value (default, ?)";
            $result   = safe_query($connection, $query, $category);
            if (!$result) {
                die(json_encode([
                    'message'    => 'category_insert',
                    'error'      => '500'
                ]));
            }
        } break;
    }


