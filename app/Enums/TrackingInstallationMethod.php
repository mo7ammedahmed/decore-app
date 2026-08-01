<?php

namespace App\Enums;

enum TrackingInstallationMethod: string
{
    case Managed = 'managed';
    case Custom = 'custom';
}
