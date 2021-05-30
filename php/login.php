<?php
    include 'common.php';
    $connection = connect_database();
    $kind       = $_POST['kind'];

    print match ($kind) {
        'session' => (function () use ($connection) {
            start_session();
            return json_encode($_SESSION);
        })(),

        'signin' => (function () use ($connection) {
            $username = $_POST['username'];
            $password = hash('sha512', $_POST['password']);
            $query    = "select * from Utenti where username = ? and password = ?";
            $result   = safe_query($connection, $query, $username, $password)->get_result();

            if ($result->num_rows === 0) {
                print json_encode([
                    'message' => 'unknown_user',
                    'error'   => 403
                ]);
            } else {
                session_start();
                $_SESSION = [
                    'username' => $username,
                ];
                print json_encode($_SESSION);
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
                    'error'   => 401
                ]));
            }
            return json_empty();
        })(),

        'destroy' => (function () use ($connection) {
            destroy_session();
            return json_empty();
        })()
    };
