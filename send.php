<?php

error_reporting(-1);
header('Content-Type: text/html; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: POST');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(403);
    echo json_encode([['message' => 'Request method is not allowed']], JSON_UNESCAPED_UNICODE);
    exit(1);
}

$name = '';
$phone = '';
$msg = '';
$email = '';
if(isset($_POST['name'])&&trim($_POST['name'])!=""){
    $name = $_POST['name'];
}
if(isset($_POST['phone'])&&trim($_POST['phone'])!=""){
    $phone = $_POST['phone'];
}
if(isset($_POST['email'])&&trim($_POST['email'])!=""){
    $email = $_POST['email'];
}
if(isset($_POST['message'])&&trim($_POST['message'])!=""){
    $msg = "Сообщение:" . "\n" . $_POST['message'];
}

$recepientAddress = '';
$title = 'Заявка на Мастер-класс по приготовлению барбекю от Weber';
$message = (($name == '') ? '' : "Имя: " . $name. "\n")
    . (validatePhone($phone) ?  "Телефон: " . $phone . "\n" : '')
    . (validateEmail($email) ?  "Email: " . $email . "\n" : '')
    . $msg;
if ( ($name != '' && validatePhone($phone))                 // Form
    || (!isset($_POST['name']) && validateEmail($email))    // type
    || ($name != '' && validateEmail($email)) ){            // cases here
    if ( $recepientAddress && mail( $recepientAddress, $title, $message ) ) {
        http_response_code(200);
        $resp = [];
        if ($email) $resp['email'] = $_POST['email'];
        if ($name) $resp['name'] = $_POST['name'];
        if ($phone) $resp['phone'] = $_POST['phone'];
        if ($msg) $resp['message'] = $_POST['message'];
        $resp['title'] = 'Ваша заявка успешно отправлена';
        $resp['message'] = 'Наш менеджер свяжется с вам в ближайшее время';
        echo json_encode($resp, JSON_UNESCAPED_UNICODE);
        exit(0);
    } else {
        http_response_code(500);
        echo json_encode([['message' => 'Почта не отправлена'],['title' => 'При отправке запроса произошла ошибка']], JSON_UNESCAPED_UNICODE);
        exit(1);
    }
} else {
    http_response_code(400);
    $err = [];
    if ( isset($_POST['name']) && $name == '' ) {
        array_push($err, [
            'name' => 'name',
            'message' => 'Введите имя',
        ]);
    }
    if ( isset($_POST['email']) && !validateEmail($email)) {
        array_push($err, [
            'name' => 'email',
            'message' => 'Введите email',
        ]);
    }
    if ( isset($_POST['phone']) && !validatePhone($phone)) {
        array_push($err, [
            'name' => 'phone',
            'message' => 'Введите телефон',
        ]);
    }
    array_push($err, [
        'title' => 'При отправке запроса произошла ошибка'
    ]);
    echo json_encode($err, JSON_UNESCAPED_UNICODE);
    exit(1);
}

function validatePhone($str) {
    return (
        $str
        && preg_match("/^\d+$/i", $str)
        && (strlen('' . $str) === 10)
    );
}
function validateEmail($str) {
    return (
        $str
        && preg_match("/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,}$/i", $str)
    );
}
?>