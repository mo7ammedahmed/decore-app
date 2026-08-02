<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Error Messages
    |--------------------------------------------------------------------------
    |
    | User-facing messages for aborted requests (403) and storage-failure
    | exceptions. Resolved via __('errors.*') so they render in the active
    | locale (SetLocale middleware sets the app locale on every request).
    |
    */

    'audit_forbidden' => 'You do not have permission to view audit logs.',
    'reports_forbidden' => 'You do not have permission to view reports.',
    'area_forbidden' => 'You do not have permission to access this area.',
    'account_disabled' => 'Your account has been disabled. Please contact an administrator.',

    'logo_store_failed' => 'Unable to store the shop logo.',
    'portrait_store_failed' => 'Unable to store the portrait.',
    'image_store_failed' => 'Unable to store the uploaded image.',
    'gallery_image_store_failed' => 'Unable to store the gallery image.',
    'gallery_image_replace_failed' => 'Unable to store the replacement image.',

];
