<?php

namespace Tests\Unit;

use App\Support\Filesystem;
use PHPUnit\Framework\TestCase;

class FilesystemTest extends TestCase
{
    public function test_defaults_to_local_when_unset(): void
    {
        $this->assertSame('local', Filesystem::resolveDefaultDisk(null, null, null, null));
        $this->assertSame('local', Filesystem::resolveDefaultDisk('', null, null, null));
    }

    public function test_non_s3_disks_are_kept_verbatim(): void
    {
        $this->assertSame('public', Filesystem::resolveDefaultDisk('public', null, null, null));
        $this->assertSame('local', Filesystem::resolveDefaultDisk('local', null, null, null));
    }

    public function test_s3_is_kept_when_all_credentials_are_present(): void
    {
        $this->assertSame('s3', Filesystem::resolveDefaultDisk('s3', 'key', 'secret', 'bucket'));
    }

    public function test_s3_falls_back_to_public_when_any_credential_is_missing(): void
    {
        $this->assertSame('public', Filesystem::resolveDefaultDisk('s3', null, 'secret', 'bucket'));
        $this->assertSame('public', Filesystem::resolveDefaultDisk('s3', 'key', null, 'bucket'));
        $this->assertSame('public', Filesystem::resolveDefaultDisk('s3', 'key', 'secret', null));
        $this->assertSame('public', Filesystem::resolveDefaultDisk('s3', '', 'secret', 'bucket'));
        $this->assertSame('public', Filesystem::resolveDefaultDisk('s3', 'key', '', 'bucket'));
        $this->assertSame('public', Filesystem::resolveDefaultDisk('s3', 'key', 'secret', ''));
    }
}
