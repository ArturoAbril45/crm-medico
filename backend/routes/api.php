<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    AuthController,
    UserController,
    RoleController,
    DashboardController,
    PacienteController,
    CitaController,
    MedicoController,
    HorarioMedicoController,
    WhatsappController,
    SalaEsperaController,
    CostoConsultaController,
    DepartamentoController,
    InformeImagenController,
    PsiquiatriaController,
    PsicologiaController,
    ConvenioController,
    PrestacionController,
    PracticaFacturableController,
    PresentacionController,
    HonorarioController,
    CierreCajaController,
    ProveedorMktController,
    ProductoMarketplaceController,
    CarritoController,
    PedidoMktController,
    CotizacionController,
    MetodoPagoController,
    EmpleadoController,
    LicenciaEmpleadoController,
    ConfiguracionAfipController,
    ComprobanteAfipController,
    SiniestroArtController,
    ConfiguracionIaBotController,
    PlantillaInformeController,
    AcademyController,
    ConversacionController,
    MensajeController,
    RespuestaRapidaController,
    CompaniaController,
    FlujoController,
    AutomatizacionController,
    ProcedimientoController,
    PagoController,
    CampanhaController,
    TransmisionController,
    ModeloMensajeController,
    NotaPacienteController,
    CarpetaFlujoController,
};

// Publicas: login de usuarios, y el webhook de WhatsApp (lo llama el microservicio
// Node/Baileys servidor-a-servidor, no un usuario con token de sesion).
Route::post('/login', [AuthController::class, 'login']);
Route::post('/whatsapp/webhook', [WhatsappController::class, 'webhook']);

// Tambien publicas: el navegador navega directo a Google y Google vuelve directo
// aca, ninguna de las dos manda el header Authorization — el token de sesion se
// valida a mano adentro de googleConnect() via query string.
Route::get('/medicos/{medico}/google-connect', [MedicoController::class, 'googleConnect']);
Route::get('/medicos/google-callback', [MedicoController::class, 'googleCallback']);

Route::middleware(['auth.token', 'resolve.compania'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('usuarios', UserController::class)->except(['show']);
    Route::apiResource('roles', RoleController::class)->except(['show']);
    Route::get('/permisos', [RoleController::class, 'permisos']);

    Route::apiResource('companias', CompaniaController::class)->except(['show', 'destroy'])->parameters(['companias' => 'compania']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('pacientes', PacienteController::class);
    Route::post('/pacientes/{paciente}/archivos', [PacienteController::class, 'subirArchivo']);
    Route::delete('/pacientes/{paciente}/archivos/{archivo}', [PacienteController::class, 'eliminarArchivo']);

    Route::apiResource('citas', CitaController::class);
    Route::get('/citas-calendario', [CitaController::class, 'calendario']);

    Route::apiResource('medicos', MedicoController::class);
    Route::get('/medicos-especialidades', [MedicoController::class, 'especialidades']);
    Route::get('/medicos/{medico}/disponibilidad', [MedicoController::class, 'disponibilidad']);
    Route::post('/medicos/{medico}/google-disconnect', [MedicoController::class, 'googleDisconnect']);
    Route::apiResource('horarios-medicos', HorarioMedicoController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['horarios-medicos' => 'horario_medico']);

    Route::get('/whatsapp/estado', [WhatsappController::class, 'estado']);
    Route::get('/whatsapp/qr', [WhatsappController::class, 'qr']);
    Route::post('/whatsapp/desconectar', [WhatsappController::class, 'desconectar']);

    Route::get('/sala-espera', [SalaEsperaController::class, 'index']);
    Route::get('/monitor-tv', [SalaEsperaController::class, 'monitorTv']);

    Route::apiResource('costos-consulta', CostoConsultaController::class)->except(['show'])->parameters(['costos-consulta' => 'costo']);

    Route::apiResource('departamentos', DepartamentoController::class)->except(['show']);

    Route::apiResource('informes-imagen', InformeImagenController::class)->except(['show'])->parameters(['informes-imagen' => 'informe']);

    Route::get('/psiquiatria/pacientes', [PsiquiatriaController::class, 'pacientes']);
    Route::get('/psiquiatria/pacientes/{paciente}/registros', [PsiquiatriaController::class, 'registros']);
    Route::post('/psiquiatria/pacientes/{paciente}/registros', [PsiquiatriaController::class, 'store']);
    Route::put('/psiquiatria/registros/{registro}', [PsiquiatriaController::class, 'update']);
    Route::delete('/psiquiatria/registros/{registro}', [PsiquiatriaController::class, 'destroy']);

    Route::get('/psicologia/pacientes', [PsicologiaController::class, 'pacientes']);
    Route::get('/psicologia/pacientes/{paciente}/registros', [PsicologiaController::class, 'registros']);
    Route::post('/psicologia/pacientes/{paciente}/registros', [PsicologiaController::class, 'store']);
    Route::put('/psicologia/registros/{registro}', [PsicologiaController::class, 'update']);
    Route::delete('/psicologia/registros/{registro}', [PsicologiaController::class, 'destroy']);
    Route::apiResource('convenios', ConvenioController::class)->except(['show']);
    Route::apiResource('prestaciones', PrestacionController::class)->except(['show'])->parameters(['prestaciones' => 'prestacion']);
    Route::apiResource('practicas-facturables', PracticaFacturableController::class)->except(['show'])->parameters(['practicas-facturables' => 'practica']);
    Route::get('/presentaciones', [PresentacionController::class, 'index']);
    Route::post('/presentaciones/generar', [PresentacionController::class, 'generar']);
    Route::delete('/presentaciones/{presentacion}', [PresentacionController::class, 'destroy']);
    Route::get('/honorarios', [HonorarioController::class, 'index']);
    Route::put('/honorarios/{medico}/porcentaje', [HonorarioController::class, 'actualizarPorcentaje']);
    Route::get('/cierres-caja', [CierreCajaController::class, 'index']);
    Route::get('/cierres-caja/hoy', [CierreCajaController::class, 'hoy']);
    Route::post('/cierres-caja/{cierre}/cerrar', [CierreCajaController::class, 'cerrar']);
    Route::post('/cierres-caja/{cierre}/reabrir', [CierreCajaController::class, 'reabrir']);

    Route::get('/marketplace/proveedores', [ProveedorMktController::class, 'index']);
    Route::post('/marketplace/proveedores', [ProveedorMktController::class, 'store']);
    Route::put('/marketplace/proveedores/{proveedor}', [ProveedorMktController::class, 'update']);
    Route::delete('/marketplace/proveedores/{proveedor}', [ProveedorMktController::class, 'destroy']);

    Route::get('/marketplace/productos', [ProductoMarketplaceController::class, 'index']);
    Route::get('/marketplace/mi-tienda', [ProductoMarketplaceController::class, 'miTienda']);
    Route::get('/marketplace/mi-proveedor', [ProductoMarketplaceController::class, 'miProveedor']);
    Route::post('/marketplace/productos', [ProductoMarketplaceController::class, 'store']);
    Route::put('/marketplace/productos/{producto}', [ProductoMarketplaceController::class, 'update']);
    Route::delete('/marketplace/productos/{producto}', [ProductoMarketplaceController::class, 'destroy']);

    Route::get('/marketplace/carrito', [CarritoController::class, 'index']);
    Route::post('/marketplace/carrito', [CarritoController::class, 'agregar']);
    Route::put('/marketplace/carrito/{item}', [CarritoController::class, 'actualizar']);
    Route::delete('/marketplace/carrito/{item}', [CarritoController::class, 'eliminar']);
    Route::post('/marketplace/carrito/checkout', [CarritoController::class, 'checkout']);

    Route::get('/marketplace/pedidos', [PedidoMktController::class, 'index']);
    Route::get('/marketplace/biblioteca', [PedidoMktController::class, 'biblioteca']);

    Route::get('/marketplace/cotizaciones', [CotizacionController::class, 'index']);
    Route::post('/marketplace/cotizaciones', [CotizacionController::class, 'store']);
    Route::put('/marketplace/cotizaciones/{cotizacion}', [CotizacionController::class, 'update']);
    Route::delete('/marketplace/cotizaciones/{cotizacion}', [CotizacionController::class, 'destroy']);

    Route::get('/metodos-pago', [MetodoPagoController::class, 'index']);
    Route::post('/metodos-pago/inicializar', [MetodoPagoController::class, 'inicializar']);
    Route::post('/metodos-pago', [MetodoPagoController::class, 'store']);
    Route::put('/metodos-pago/{metodo}', [MetodoPagoController::class, 'update']);
    Route::delete('/metodos-pago/{metodo}', [MetodoPagoController::class, 'destroy']);

    Route::apiResource('empleados', EmpleadoController::class)->except(['show']);
    Route::apiResource('licencias-empleado', LicenciaEmpleadoController::class)->except(['show'])->parameters(['licencias-empleado' => 'licencia']);

    Route::get('/afip/configuracion', [ConfiguracionAfipController::class, 'show']);
    Route::put('/afip/configuracion', [ConfiguracionAfipController::class, 'update']);
    Route::get('/afip/comprobantes', [ComprobanteAfipController::class, 'index']);
    Route::post('/afip/comprobantes', [ComprobanteAfipController::class, 'store']);
    Route::post('/afip/comprobantes/{comprobante}/emitir', [ComprobanteAfipController::class, 'emitir']);
    Route::post('/afip/comprobantes/{comprobante}/anular', [ComprobanteAfipController::class, 'anular']);
    Route::delete('/afip/comprobantes/{comprobante}', [ComprobanteAfipController::class, 'destroy']);

    Route::apiResource('siniestros-art', SiniestroArtController::class)->except(['show'])->parameters(['siniestros-art' => 'siniestro']);

    Route::get('/ia-bot/configuracion', [ConfiguracionIaBotController::class, 'show']);
    Route::put('/ia-bot/configuracion', [ConfiguracionIaBotController::class, 'update']);

    Route::apiResource('plantillas-informe', PlantillaInformeController::class)->except(['show'])->parameters(['plantillas-informe' => 'plantilla']);

    Route::get('/academy', [AcademyController::class, 'index']);
    Route::get('/academy/{slug}', [AcademyController::class, 'show']);
    Route::post('/academy', [AcademyController::class, 'store']);
    Route::post('/academy/{publicacion}/votar', [AcademyController::class, 'votar']);
    Route::patch('/academy/{publicacion}/moderar', [AcademyController::class, 'moderar']);

    Route::post('/citas/{cita}/checkin', [SalaEsperaController::class, 'checkin']);
    Route::post('/citas/{cita}/atender', [SalaEsperaController::class, 'atender']);
    Route::post('/citas/{cita}/completar', [SalaEsperaController::class, 'completar']);

    Route::apiResource('flujos', FlujoController::class);
    Route::post('/flujos/{flujo}/guardar', [FlujoController::class, 'guardarFlujo']);
    Route::apiResource('carpetas-flujo', CarpetaFlujoController::class)->parameters(['carpetas-flujo' => 'carpeta'])->except(['show']);

    Route::apiResource('automatizaciones', AutomatizacionController::class)->parameters(['automatizaciones' => 'automatizacion']);
    Route::patch('/automatizaciones/{automatizacion}/toggle', [AutomatizacionController::class, 'toggle']);

    Route::get('/conversaciones', [ConversacionController::class, 'index']);
    Route::get('/conversaciones/{conversacion}', [ConversacionController::class, 'show']);
    Route::patch('/conversaciones/{conversacion}/tomar', [ConversacionController::class, 'tomar']);
    Route::patch('/conversaciones/{conversacion}/devolver', [ConversacionController::class, 'devolver']);
    Route::patch('/conversaciones/{conversacion}/resolver', [ConversacionController::class, 'resolver']);
    Route::get('/conversaciones/{conversacion}/mensajes', [MensajeController::class, 'index']);
    Route::post('/conversaciones/{conversacion}/mensajes', [MensajeController::class, 'store']);
    Route::post('/conversaciones/{conversacion}/sugerir-ia', [ConversacionController::class, 'sugerirIa']);
    Route::post('/conversaciones/{conversacion}/enviar-flujo', [ConversacionController::class, 'enviarFlujo']);
    Route::patch('/conversaciones/{conversacion}/automatizacion', [ConversacionController::class, 'toggleAutomatizacion']);

    Route::get('/pacientes/{paciente}/notas', [NotaPacienteController::class, 'index']);
    Route::post('/pacientes/{paciente}/notas', [NotaPacienteController::class, 'store']);
    Route::patch('/pacientes/{paciente}/etiquetas', [PacienteController::class, 'actualizarEtiquetas']);

    Route::apiResource('respuestas-rapidas', RespuestaRapidaController::class)->except(['show']);

    Route::apiResource('procedimientos', ProcedimientoController::class);

    Route::apiResource('pagos', PagoController::class)->only(['index', 'store', 'update']);

    Route::apiResource('campanhas', CampanhaController::class)->except(['show']);
    Route::apiResource('transmisiones', TransmisionController::class)->except(['show'])->parameters(['transmisiones' => 'transmision']);
    Route::apiResource('modelos-mensajes', ModeloMensajeController::class)->except(['show'])->parameters(['modelos-mensajes' => 'modeloMensaje']);
});
