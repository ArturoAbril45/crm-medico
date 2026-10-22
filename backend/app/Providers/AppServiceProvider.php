<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // MySQL/MariaDB con utf8mb4 y row format antiguo limita las claves a 767/1000 bytes;
        // VARCHAR(255) las excede. 191 caracteres x 4 bytes queda dentro del limite.
        Schema::defaultStringLength(191);
    }
}
