<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['name', 'email', 'message'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Trường '$field' là bắt buộc"]);
        exit;
    }
}

// Sanitize input data
$name = htmlspecialchars(strip_tags($input['name']));
$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$phone = isset($input['phone']) ? htmlspecialchars(strip_tags($input['phone'])) : 'Không cung cấp';
$service = isset($input['service']) ? htmlspecialchars(strip_tags($input['service'])) : 'Không chọn';
$message = htmlspecialchars(strip_tags($input['message']));

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email không hợp lệ']);
    exit;
}

// Map service codes to Vietnamese names
$service_names = [
    'food' => 'Dịch vụ ăn uống',
    'tour' => 'Tour du lịch',
    'flight' => 'Vé máy bay',
    'visa' => 'Visa & Passport'
];
$service_name = isset($service_names[$service]) ? $service_names[$service] : 'Không chọn';

// Email configuration
$to_email = 'dulichnhienviet@gmail.com'; // Replace with your Gmail address
$subject = "Tin nhắn mới từ website - " . $name;

// Email content
$email_content = "
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2d5a27; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .field { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #2d5a27; }
        .label { font-weight: bold; color: #2d5a27; }
        .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>🌟 Tin nhắn mới từ website Nhiên Việt Inspired</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <span class='label'>👤 Họ và tên:</span><br>
                $name
            </div>
            <div class='field'>
                <span class='label'>📧 Email:</span><br>
                $email
            </div>
            <div class='field'>
                <span class='label'>📱 Số điện thoại:</span><br>
                $phone
            </div>
            <div class='field'>
                <span class='label'>🔧 Dịch vụ quan tâm:</span><br>
                $service_name
            </div>
            <div class='field'>
                <span class='label'>📅 Thời gian gửi:</span><br>
                " . date('d/m/Y H:i:s') . "
            </div>
            <div class='field'>
                <span class='label'>💬 Nội dung tin nhắn:</span><br>
                " . nl2br($message) . "
            </div>
        </div>
        <div class='footer'>
            <p>Email này được gửi tự động từ form liên hệ trên website.<br>
            Vui lòng không trả lời trực tiếp email này.</p>
        </div>
    </div>
</body>
</html>
";

// Email headers
$headers = [
    'MIME-Version' => '1.0',
    'Content-type' => 'text/html; charset=UTF-8',
    'From' => "Website Nhiên Việt Inspired <noreply@nhienvietnspired.com>",
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion()
];

// Convert headers array to string
$headers_string = '';
foreach ($headers as $key => $value) {
    $headers_string .= "$key: $value\r\n";
}

// Send email
try {
    $mail_sent = mail($to_email, $subject, $email_content, $headers_string);
    
    if ($mail_sent) {
        // Log successful submission (optional)
        error_log("Contact form submission from: $email - $name");
        
        echo json_encode([
            'success' => true,
            'message' => 'Email đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.'
        ]);
    } else {
        throw new Exception('Mail function failed');
    }
} catch (Exception $e) {
    error_log("Email sending failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau hoặc liên hệ trực tiếp qua điện thoại.'
    ]);
}
?>