<?php
    function connect_database(): mysqli {
        $hostname   = 'localhost';
        $username   = 'root';
        $password   = '';
        $connection = mysqli_connect($hostname, $username, $password);
        if (!$connection) {
            die(json_encode([
                'message' => 'unreachable_server',
                'error'   => '500'
            ]));
        }

        $database = 'Esame';
        if (!mysqli_select_db($connection, $database)) {
            die(json_encode([
                'message' => 'unknown_database',
                'error'   => '500'
            ]));
        }

        return $connection;
    }

    function safe_query(mysqli $connection, string $query, mixed... $args): mysqli_stmt|false {
        $statement = mysqli_prepare($connection, $query);
        $params    = [...$args];
        $types     = '';

        if (substr_count($query, '?') != count($params)) {
            die(json_encode([
                'message' => 'argument_mismatch',
                'error'   => '500'
            ]));
        }
        foreach ($params as $arg) {
            $type   = gettype($arg);
            $types .= match ($type) {
                'string'  => 's',
                'double'  => 'd',
                'integer' => 'i',
                default   => die(json_encode([
                    'message' => 'type_error',
                    'error'   => '500'
                ]))
            };
        }
        if (strlen($types) > 0) {
            $statement->bind_param($types, ...$args);
        }
        if (!$statement->execute()) {
            return false;
        }
        return $statement;
    }

    function json_empty(): string {
        return '{}';
    }

    function start_session(): void {
        session_start();
        if (count($_SESSION) === 0) {
            die(json_encode([
                'message' => 'unauthorized',
                'error'   => '401'
            ]));
        }
    }

    function destroy_session(): void {
        session_unset();
        session_destroy();
        session_write_close();
        setcookie(session_name(), '', 0, '/');
        session_regenerate_id(true);
    }
