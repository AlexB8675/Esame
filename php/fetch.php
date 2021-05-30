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
                    'error'   => 500
                ]));
            }
            return json_encode($result->get_result()->fetch_all(MYSQLI_ASSOC));
        })(),

        'objects' => (function () use ($connection) {
            $category = intval($_GET['categoria']);
            $query    =
                "select Oggetti.*, avg(stelle) as rating
                 from Oggetti
                    left join Recensioni on id_oggetto = e_id_oggetto"
                 .($category === -1 ? " " : " where e_id_categoria = ? ").
                 "group by id_oggetto";

            $objects =
                $category === -1 ?
                    safe_query($connection, $query) :
                    safe_query($connection, $query, $category);
            if (!$objects) {
                die(json_encode([
                    'message' => 'object_fetch',
                    'error'   => 500
                ]));
            }
            return json_encode($objects->get_result()->fetch_all(MYSQLI_ASSOC));
        })(),

        'reviews' => (function () use ($connection) {
            $object = $_GET['oggetto'];
            $query  = "select avg(stelle) as recensioni from Recensioni where e_id_oggetto = ?";
            $result = safe_query($connection, $query, $object)->get_result();
            return $result->num_rows ? json_encode($result->fetch_object()) : json_empty();
        })(),

        'rating' => (function () use ($connection) {
            start_session();
            $username = $_SESSION['username'];
            $object   = $_GET['oggetto'];
            $query    = "select stelle from Recensioni where e_username = ? and e_id_oggetto = ?";
            $result   = safe_query($connection, $query, $username, $object)->get_result();
            return $result->num_rows ? json_encode($result->fetch_object()) : json_empty();
        })()
    };
