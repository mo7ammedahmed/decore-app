<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Shop Email Template Defaults (Arabic)
    |--------------------------------------------------------------------------
    |
    | Built-in fallbacks for the contact-notification and auto-reply emails.
    | Admins can override these in Profile settings; when the stored template
    | is empty the localized default below is used.
    |
    */

    'notification_subject' => 'استفسار جديد: {subject}',
    'notification_body' => "استلمت استفسارًا جديدًا.\n\nالاسم: {name}\nالبريد الإلكتروني: {email}\nالموضوع: {subject}\n\n{message}",
    'auto_reply_subject' => 'شكرًا لرسالتك حول {subject}',
    'auto_reply_body' => "مرحبًا {name}،\n\nشكرًا لتواصلك معنا. استلمت رسالتك وسأعود إليك قريبًا.\n\nمع التحية،\n{shop_name}",

];
