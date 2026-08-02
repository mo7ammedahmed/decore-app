<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Shop Email Template Defaults
    |--------------------------------------------------------------------------
    |
    | Built-in fallbacks for the contact-notification and auto-reply emails.
    | Admins can override these in Profile settings; when the stored template
    | is empty the localized default below is used, so a fresh Arabic shop
    | shows Arabic default copy.
    |
    */

    'notification_subject' => 'New enquiry: {subject}',
    'notification_body' => "You received a new enquiry.\n\nName: {name}\nEmail: {email}\nSubject: {subject}\n\n{message}",
    'auto_reply_subject' => 'Thanks for your message about {subject}',
    'auto_reply_body' => "Hi {name},\n\nThanks for reaching out. I received your message and will get back to you soon.\n\nBest,\n{shop_name}",

];
