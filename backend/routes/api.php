<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    DashboardController,
    PacienteController,
    CitaController,
    FlujoController,
    AutomatizacionController,
    ProcedimientoController,
    PagoController,
    CampanhaController,
    TransmisionController,
    ModeloMensajeController,
};

Route::get('/dashboard', [DashboardController::class, 'index']);

Route::apiResource('pacientes', PacienteController::class);

Route::apiResource('citas', CitaController::class);
Route::get('/citas-calendario', [CitaController::class, 'calendario']);

Route::apiResource('flujos', FlujoController::class);
Route::post('/flujos/{flujo}/bloques', [FlujoController::class, 'guardarBloques']);

Route::apiResource('automatizaciones', AutomatizacionController::class);
Route::patch('/automatizaciones/{automatizacion}/toggle', [AutomatizacionController::class, 'toggle']);

Route::apiResource('procedimientos', ProcedimientoController::class);

Route::apiResource('pagos', PagoController::class)->only(['index', 'store', 'update']);

Route::apiResource('campanhas', CampanhaController::class)->except(['show']);
Route::apiResource('transmisiones', TransmisionController::class)->except(['show']);
Route::apiResource('modelos-mensajes', ModeloMensajeController::class)->except(['show']);
