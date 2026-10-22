<?php
namespace App\Support;

/**
 * Punto único para leer/fijar la compañía activa del request actual.
 * La resuelve ResolveCompania (middleware) a partir del usuario autenticado;
 * los controllers/modelos la consultan vía Tenant::companiaId() en vez de
 * leer $request->user()->compania_id en cada lugar.
 */
class Tenant {
    private static ?int $companiaId = null;
    private static bool $resuelta = false;

    public static function set(?int $companiaId): void {
        self::$companiaId = $companiaId;
        self::$resuelta = true;
    }

    public static function companiaId(): ?int {
        return self::$companiaId;
    }

    public static function resuelta(): bool {
        return self::$resuelta;
    }
}
