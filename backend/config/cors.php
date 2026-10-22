<?php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173', 'http://127.0.0.1:5173',
        'http://localhost:5174', 'http://127.0.0.1:5174',
        'http://localhost:3000',
        'https://medadvance360.com', 'https://www.medadvance360.com',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
