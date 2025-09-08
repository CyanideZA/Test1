<?php
// Enable CORS for all origins
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error reporting for debugging (remove in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Get the raw POST data
$input = json_decode(file_get_contents('php://input'), true);

// Log the received data for debugging
file_put_contents('order_log.txt', date('Y-m-d H:i:s') . " - " . print_r($input, true) . "\n", FILE_APPEND);

// Validate input
if (!$input || !is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input data']);
    exit();
}

$requiredFields = ['to', 'customer_name', 'customer_email', 'order_ref', 'order_date', 'order_items', 'order_total'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

if (!filter_var($input['to'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid customer email']);
    exit();
}

if (!filter_var($input['customer_email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid customer email in order data']);
    exit();
}

// ======== EMAIL TEMPLATE ========
function buildEmailTemplate($title, $content, $isAdmin = false) {
    $adminStyle = $isAdmin ? '.admin-note { background: #fff8e1; padding: 10px; border-left: 3px solid #ffc107; }' : '';

    return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
        .email-container { background: white; border-radius: 10px; padding: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #4a6fa5; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
        .logo { max-width: 180px; height: auto; }
        h1 { color: #4a6fa5; font-family: 'Playfair Display', serif; font-size: 24px; margin-top: 15px; }
        .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4cb5ae; }
        .item { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; font-size: 18px; border-top: 2px solid #4a6fa5; padding-top: 15px; margin-top: 20px; color: #166088; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; padding-top: 20px; border-top: 1px solid #eee; }
        .button { display: inline-block; background: #4cb5ae; color: white; padding: 12px 25px; text-decoration: none; border-radius: 30px; margin-top: 15px; }
        $adminStyle
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Intuitive Healing & Astrology</h1>
            <h2>$title</h2>
        </div>

        $content

        <div class="footer">
            <p>Sarah Lawry - Intuitive Healing and Astrology</p>
            <p>Johannesburg, South Africa | WhatsApp: +27 72 808 7795</p>
            <p>&copy; 2025 All rights reserved</p>
        </div>
    </div>
</body>
</html>
HTML;
}

// Customer Email Content
$customerContent = <<<HTML
<div>
    <p>Dear {$input['customer_name']},</p>
    <p>Thank you for your order from Intuitive Healing and Astrology! We're honored to support your healing journey.</p>

    <div class="order-details">
        <p><strong>Order Reference #:</strong> {$input['order_ref']}</p>
        <p><strong>Order Date:</strong> {$input['order_date']}</p>
        <p><strong>Payment Method:</strong> {$input['payment_method']}</p>

        <h3 style="color: #4a6fa5; margin-top: 20px;">Order Items:</h3>
        {$input['order_items']}

        <p class="total">Order Total: R{$input['order_total']}</p>
    </div>

    <p>We will process your order within 24-48 hours. You will receive a notification once your items have been shipped.</p>

    <p>If you have any questions about your order or need support with any products, please don't hesitate to reply to this email or contact us directly on WhatsApp.</p>

    <p>With healing energy,<br><strong>Sarah Lawry</strong><br>Intuitive Healing and Astrology</p>
</div>
HTML;

// Admin Email Content
$adminContent = <<<HTML
<div>
    <div class="admin-note">
        <p>📌 <strong>NEW ORDER RECEIVED!</strong> - Requires processing</p>
    </div>

    <div class="order-details">
        <p><strong>Order Reference #:</strong> {$input['order_ref']}</p>
        <p><strong>Customer Name:</strong> {$input['customer_name']}</p>
        <p><strong>Email:</strong> {$input['customer_email']}</p>
        <p><strong>Phone:</strong> {$input['customer_phone']}</p>
        <p><strong>Shipping Address:</strong><br>{$input['customer_address']}</p>
        <p><strong>Payment Method:</strong> {$input['payment_method']}</p>

        <h3 style="color: #4a6fa5; margin-top: 20px;">Order Items:</h3>
        {$input['order_items']}

        <p class="total">Order Total: R{$input['order_total']}</p>
    </div>

    <p><strong>Special Instructions:</strong><br>{$input['customization']}</p>
</div>
HTML;

// Headers for HTML emails
$headers = "From: Sarah Lawry Healing <a.lawry98@gmail.com>\r\n";
$headers .= "Reply-To: Sarah Lawry <a.lawry98@gmail.com>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Admin email (use configured email or default)
$adminEmail = $input['admin_email'] ?? 'a.lawry98@gmail.com';

// Send emails
$customerSent = mail(
    $input['to'],
    "Your Healing Order #{$input['order_ref']} - Sarah Lawry",
    buildEmailTemplate("Order Confirmation", $customerContent),
    $headers
);

$adminSent = mail(
    $adminEmail,
    "[HEALING ORDER] #{$input['order_ref']} - {$input['customer_name']}",
    buildEmailTemplate("New Healing Product Order", $adminContent, true),
    $headers
);

// Log email sending results
file_put_contents('email_log.txt',
    "[" . date('Y-m-d H:i:s') . "] Customer email sent to {$input['to']}: " . ($customerSent ? 'YES' : 'NO') . "\n" .
    "[" . date('Y-m-d H:i:s') . "] Admin email sent to $adminEmail: " . ($adminSent ? 'YES' : 'NO') . "\n",
FILE_APPEND);

if (!$customerSent || !$adminSent) {
    error_log("Failed to send emails. Customer: $customerSent, Admin: $adminSent");
    http_response_code(500);
    die(json_encode(['error' => 'Failed to send one or more emails. Please check your server configuration.']));
}

echo json_encode([
    'success' => true,
    'message' => 'Order confirmed! Emails sent successfully.',
    'order_ref' => $input['order_ref']
]);
?>