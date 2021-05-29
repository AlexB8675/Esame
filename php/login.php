<?php
    include 'common.php';
    $connection = connect_database();
    $kind       = $_POST['kind'];

    print match ($kind) {
        'signin' => (function () use ($connection) {
            $username = $_POST['username'];
            $password = hash('sha512', $_POST['password']);
            $query    = "select * from Utenti where username = ? and password = ?";
            $result   = safe_query($connection, $query, $username, $password)->get_result();

            if ($result->num_rows === 0) {
                print json_encode([
                    'message' => 'unknown_user',
                    'error'   => '403'
                ]);
            } else {
                print json_encode([
                    'username' => $username,
                ]);
            }
        })(),

        'signup' => (function () use ($connection) {
            $username = $_POST['username'];
            $password = hash('sha512', $_POST['password']);
            $query    = "insert into Utenti value (?, ?)";
            $result   = safe_query($connection, $query, $username, $password);

            if (!$result) {
                die(json_encode([
                    'message' => 'fatal_found',
                    'error'   => '401'
                ]));
            }
            return json_empty();
        })(),
    };
