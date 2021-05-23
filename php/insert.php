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
        })(),

        'object' => (function () use ($connection) {
            $query = "select count(*) as last from Oggetti";
            $last  =
                safe_query($connection, $query)
                    ->get_result()
                    ->fetch_array()['last'] + 1;

            $category = intval($_POST['categoria']);
            $target   = "assets/objects/$category";
            $image    = "$target/$last.png";
            $audio    = "$target/$last.mp3";
            $nome     = $_POST['nome'];
            $ita      = $_POST['ita'];
            $eng      = $_POST['eng'];
            $query    = "insert into Oggetti value (default, ?, ?, ?, ?, ?, ?)";
            $result   = safe_query($connection, $query, $category, $nome, $ita, $eng, $audio, $image);
            if (!is_dir("../$target")) {
                mkdir("../$target");
            }
            move_uploaded_file($_FILES['immagine']['tmp_name'], "../$image");
            move_uploaded_file($_FILES['audio']['tmp_name'], "../$audio");
            return json_encode([
                'id'       => $result->insert_id,
                'audio'    => $audio,
                'immagine' => $image,
            ]);
        })()
    };
