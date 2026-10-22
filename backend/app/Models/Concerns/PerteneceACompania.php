<?php
namespace App\Models\Concerns;

use App\Support\Tenant;
use Illuminate\Database\Eloquent\Builder;

/**
 * Trait para modelos de negocio que deben aislarse por compania (Fase 2:
 * todavia no se aplica a ningun modelo). Al usarse, filtra automaticamente
 * toda query por la compania activa del request (Tenant::companiaId()) y
 * autocompleta compania_id al crear, para no tener que repetir el filtro
 * a mano en cada controller.
 */
trait PerteneceACompania {
    protected static function bootPerteneceACompania(): void {
        static::addGlobalScope('compania', function (Builder $builder) {
            if (Tenant::resuelta() && Tenant::companiaId() !== null) {
                $builder->where($builder->getModel()->getTable() . '.compania_id', Tenant::companiaId());
            }
        });

        static::creating(function ($model) {
            if (!$model->compania_id && Tenant::companiaId() !== null) {
                $model->compania_id = Tenant::companiaId();
            }
        });
    }
}
