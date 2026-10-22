<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloqueEdge extends Model {
    protected $fillable = ['flujo_id', 'from_client_id', 'to_client_id', 'from_handle', 'label'];

    public function flujo() { return $this->belongsTo(Flujo::class); }
}
