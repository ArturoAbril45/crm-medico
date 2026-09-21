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
    MedicoController,
    DepartamentoController,
    ConsultaController,
    ModuloRegistroController,
    WhatsappController,
    AuthController,
    UsuarioController,
};

Route::post('/login', [AuthController::class, 'login']);
Route::apiResource('usuarios', UsuarioController::class)->except(['show']);

Route::get('/dashboard', [DashboardController::class, 'index']);

Route::apiResource('pacientes', PacienteController::class);

Route::apiResource('citas', CitaController::class);
Route::get('/citas-calendario', [CitaController::class, 'calendario']);

Route::apiResource('flujos', FlujoController::class);
Route::post('/flujos/{flujo}/bloques', [FlujoController::class, 'guardarBloques']);
Route::post('/flujos/{flujo}/bloques-nuevo', [FlujoController::class, 'crearBloque']);
Route::patch('/bloques/{bloque}', [FlujoController::class, 'actualizarBloque']);
Route::patch('/bloques/{bloque}/mover', [FlujoController::class, 'moverBloque']);
Route::delete('/bloques/{bloque}', [FlujoController::class, 'eliminarBloque']);
Route::post('/bloque-conexiones', [FlujoController::class, 'crearConexion']);
Route::delete('/bloque-conexiones/{conexion}', [FlujoController::class, 'eliminarConexion']);

Route::apiResource('automatizaciones', AutomatizacionController::class);
Route::patch('/automatizaciones/{automatizacion}/toggle', [AutomatizacionController::class, 'toggle']);

Route::apiResource('procedimientos', ProcedimientoController::class);

Route::apiResource('pagos', PagoController::class)->only(['index', 'store', 'update']);

Route::apiResource('campanhas', CampanhaController::class)->except(['show']);
Route::apiResource('transmisiones', TransmisionController::class)->except(['show']);
Route::apiResource('modelos-mensajes', ModeloMensajeController::class)->except(['show']);

Route::apiResource('medicos', MedicoController::class)->except(['show']);
Route::apiResource('departamentos', DepartamentoController::class)->except(['show']);
Route::apiResource('consultas', ConsultaController::class)->except(['show']);

Route::apiResource('registros', ModuloRegistroController::class)->except(['show']);

Route::get('/whatsapp/conversaciones', [WhatsappController::class, 'conversaciones']);
Route::get('/whatsapp/conversaciones/{conversacion}/mensajes', [WhatsappController::class, 'mensajes']);
Route::post('/whatsapp/enviar', [WhatsappController::class, 'enviar']);
Route::get('/whatsapp/estado', [WhatsappController::class, 'estado']);
Route::post('/whatsapp/conectar', [WhatsappController::class, 'conectar']);
Route::post('/whatsapp/desconectar', [WhatsappController::class, 'desconectar']);
Route::post('/whatsapp/webhook', [WhatsappController::class, 'webhook']);
