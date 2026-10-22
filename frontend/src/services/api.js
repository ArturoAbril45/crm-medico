import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/login')) {
      localStorage.removeItem('crm_token')
      localStorage.removeItem('crm_session')
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const login = (email, password) => api.post('/login', { email, password })
export const logout = () => api.post('/logout')
export const me = () => api.get('/me')

export const getUsuarios = () => api.get('/usuarios')
export const createUsuario = (d) => api.post('/usuarios', d)
export const updateUsuario = (id, d) => api.put(`/usuarios/${id}`, d)
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`)

export const getCompanias = () => api.get('/companias')
export const createCompania = (d) => api.post('/companias', d)
export const updateCompania = (id, d) => api.put(`/companias/${id}`, d)

export const getRoles = () => api.get('/roles')
export const createRole = (d) => api.post('/roles', d)
export const updateRole = (id, d) => api.put(`/roles/${id}`, d)
export const deleteRole = (id) => api.delete(`/roles/${id}`)
export const getPermisos = () => api.get('/permisos')

export const dashboard = () => api.get('/dashboard')
export const getPacientes = (params) => api.get('/pacientes', { params })
export const getPaciente = (id) => api.get(`/pacientes/${id}`)
export const createPaciente = (d) => api.post('/pacientes', d)
export const updatePaciente = (id, d) => api.put(`/pacientes/${id}`, d)
export const deletePaciente = (id) => api.delete(`/pacientes/${id}`)
export const subirArchivoPaciente = (id, formData) => api.post(`/pacientes/${id}/archivos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const eliminarArchivoPaciente = (id, archivoId) => api.delete(`/pacientes/${id}/archivos/${archivoId}`)

export const getCitas = (params) => api.get('/citas', { params })
export const createCita = (d) => api.post('/citas', d)
export const updateCita = (id, d) => api.put(`/citas/${id}`, d)
export const deleteCita = (id) => api.delete(`/citas/${id}`)
export const getCitasCalendario = (params) => api.get('/citas-calendario', { params })

export const getMedicos = (params) => api.get('/medicos', { params })
export const getMedicosEspecialidades = () => api.get('/medicos-especialidades')
export const googleConnectUrl = (medicoId) => `${api.defaults.baseURL}/medicos/${medicoId}/google-connect?token=${encodeURIComponent(localStorage.getItem('crm_token') || '')}`
export const desconectarGoogleMedico = (medicoId) => api.post(`/medicos/${medicoId}/google-disconnect`)
export const getDisponibilidadMedico = (medicoId, fecha) => api.get(`/medicos/${medicoId}/disponibilidad`, { params: { fecha } })
export const createMedico = (d) => api.post('/medicos', d)
export const updateMedico = (id, d) => api.put(`/medicos/${id}`, d)
export const deleteMedico = (id) => api.delete(`/medicos/${id}`)

export const getHorariosMedicos = (params) => api.get('/horarios-medicos', { params })
export const createHorarioMedico = (d) => api.post('/horarios-medicos', d)
export const updateHorarioMedico = (id, d) => api.put(`/horarios-medicos/${id}`, d)
export const deleteHorarioMedico = (id) => api.delete(`/horarios-medicos/${id}`)

export const getWhatsappEstado = () => api.get('/whatsapp/estado')
export const getWhatsappQr = () => api.get('/whatsapp/qr')
export const desconectarWhatsapp = () => api.post('/whatsapp/desconectar')

export const getSalaEspera = () => api.get('/sala-espera')
export const checkinCita = (id) => api.post(`/citas/${id}/checkin`)
export const atenderCita = (id) => api.post(`/citas/${id}/atender`)
export const completarCita = (id) => api.post(`/citas/${id}/completar`)
export const getMonitorTv = () => api.get('/monitor-tv')

export const getCostosConsulta = () => api.get('/costos-consulta')
export const createCostoConsulta = (d) => api.post('/costos-consulta', d)
export const updateCostoConsulta = (id, d) => api.put(`/costos-consulta/${id}`, d)
export const deleteCostoConsulta = (id) => api.delete(`/costos-consulta/${id}`)

export const getDepartamentos = () => api.get('/departamentos')
export const createDepartamento = (d) => api.post('/departamentos', d)
export const updateDepartamento = (id, d) => api.put(`/departamentos/${id}`, d)
export const deleteDepartamento = (id) => api.delete(`/departamentos/${id}`)

export const getInformesImagen = (params) => api.get('/informes-imagen', { params })
export const createInformeImagen = (d) => api.post('/informes-imagen', d)
export const updateInformeImagen = (id, d) => api.put(`/informes-imagen/${id}`, d)
export const deleteInformeImagen = (id) => api.delete(`/informes-imagen/${id}`)

export const buscarPacientesPsiquiatria = (search) => api.get('/psiquiatria/pacientes', { params: { search } })
export const getPsiquiatriaRegistros = (pacienteId, params) => api.get(`/psiquiatria/pacientes/${pacienteId}/registros`, { params })
export const createPsiquiatriaRegistro = (pacienteId, d) => api.post(`/psiquiatria/pacientes/${pacienteId}/registros`, d)
export const updatePsiquiatriaRegistro = (id, d) => api.put(`/psiquiatria/registros/${id}`, d)
export const deletePsiquiatriaRegistro = (id) => api.delete(`/psiquiatria/registros/${id}`)

export const buscarPacientesPsicologia = (search) => api.get('/psicologia/pacientes', { params: { search } })
export const getPsicologiaRegistros = (pacienteId, params) => api.get(`/psicologia/pacientes/${pacienteId}/registros`, { params })
export const createPsicologiaRegistro = (pacienteId, d) => api.post(`/psicologia/pacientes/${pacienteId}/registros`, d)
export const updatePsicologiaRegistro = (id, d) => api.put(`/psicologia/registros/${id}`, d)
export const deletePsicologiaRegistro = (id) => api.delete(`/psicologia/registros/${id}`)

export const getConvenios = () => api.get('/convenios')
export const createConvenio = (d) => api.post('/convenios', d)
export const updateConvenio = (id, d) => api.put(`/convenios/${id}`, d)
export const deleteConvenio = (id) => api.delete(`/convenios/${id}`)

export const getPrestaciones = (params) => api.get('/prestaciones', { params })
export const createPrestacion = (d) => api.post('/prestaciones', d)
export const updatePrestacion = (id, d) => api.put(`/prestaciones/${id}`, d)
export const deletePrestacion = (id) => api.delete(`/prestaciones/${id}`)

export const getPracticasFacturables = (params) => api.get('/practicas-facturables', { params })
export const createPracticaFacturable = (d) => api.post('/practicas-facturables', d)
export const updatePracticaFacturable = (id, d) => api.put(`/practicas-facturables/${id}`, d)
export const deletePracticaFacturable = (id) => api.delete(`/practicas-facturables/${id}`)

export const getPresentaciones = () => api.get('/presentaciones')
export const generarPresentacion = (d) => api.post('/presentaciones/generar', d)
export const deletePresentacion = (id) => api.delete(`/presentaciones/${id}`)

export const getHonorarios = (params) => api.get('/honorarios', { params })
export const actualizarHonorarioPorcentaje = (medicoId, d) => api.put(`/honorarios/${medicoId}/porcentaje`, d)

export const getCierresCaja = (params) => api.get('/cierres-caja', { params })
export const getCierreCajaHoy = () => api.get('/cierres-caja/hoy')
export const cerrarCaja = (id, d) => api.post(`/cierres-caja/${id}/cerrar`, d)
export const reabrirCaja = (id) => api.post(`/cierres-caja/${id}/reabrir`)

export const getProveedoresMkt = (params) => api.get('/marketplace/proveedores', { params })
export const createProveedorMkt = (d) => api.post('/marketplace/proveedores', d)
export const updateProveedorMkt = (id, d) => api.put(`/marketplace/proveedores/${id}`, d)
export const deleteProveedorMkt = (id) => api.delete(`/marketplace/proveedores/${id}`)

export const getProductosMkt = (params) => api.get('/marketplace/productos', { params })
export const getMiTienda = () => api.get('/marketplace/mi-tienda')
export const getMiProveedor = () => api.get('/marketplace/mi-proveedor')
export const createProductoMkt = (d) => api.post('/marketplace/productos', d)
export const updateProductoMkt = (id, d) => api.put(`/marketplace/productos/${id}`, d)
export const deleteProductoMkt = (id) => api.delete(`/marketplace/productos/${id}`)

export const getCarrito = () => api.get('/marketplace/carrito')
export const agregarAlCarrito = (d) => api.post('/marketplace/carrito', d)
export const actualizarCarritoItem = (id, d) => api.put(`/marketplace/carrito/${id}`, d)
export const eliminarCarritoItem = (id) => api.delete(`/marketplace/carrito/${id}`)
export const checkoutCarrito = () => api.post('/marketplace/carrito/checkout')

export const getPedidosMkt = () => api.get('/marketplace/pedidos')
export const getBibliotecaDigital = () => api.get('/marketplace/biblioteca')

export const getCotizaciones = () => api.get('/marketplace/cotizaciones')
export const createCotizacion = (d) => api.post('/marketplace/cotizaciones', d)
export const updateCotizacion = (id, d) => api.put(`/marketplace/cotizaciones/${id}`, d)
export const deleteCotizacion = (id) => api.delete(`/marketplace/cotizaciones/${id}`)

export const getMetodosPago = () => api.get('/metodos-pago')
export const inicializarMetodosPago = () => api.post('/metodos-pago/inicializar')
export const createMetodoPago = (d) => api.post('/metodos-pago', d)
export const updateMetodoPago = (id, d) => api.put(`/metodos-pago/${id}`, d)
export const deleteMetodoPago = (id) => api.delete(`/metodos-pago/${id}`)

export const getEmpleados = (params) => api.get('/empleados', { params })
export const createEmpleado = (d) => api.post('/empleados', d)
export const updateEmpleado = (id, d) => api.put(`/empleados/${id}`, d)
export const deleteEmpleado = (id) => api.delete(`/empleados/${id}`)

export const getLicenciasEmpleado = (params) => api.get('/licencias-empleado', { params })
export const createLicenciaEmpleado = (d) => api.post('/licencias-empleado', d)
export const updateLicenciaEmpleado = (id, d) => api.put(`/licencias-empleado/${id}`, d)
export const deleteLicenciaEmpleado = (id) => api.delete(`/licencias-empleado/${id}`)

export const getConfiguracionAfip = () => api.get('/afip/configuracion')
export const updateConfiguracionAfip = (d) => api.put('/afip/configuracion', d)

export const getComprobantesAfip = (params) => api.get('/afip/comprobantes', { params })
export const createComprobanteAfip = (d) => api.post('/afip/comprobantes', d)
export const emitirComprobanteAfip = (id) => api.post(`/afip/comprobantes/${id}/emitir`)
export const anularComprobanteAfip = (id) => api.post(`/afip/comprobantes/${id}/anular`)
export const deleteComprobanteAfip = (id) => api.delete(`/afip/comprobantes/${id}`)

export const getSiniestrosArt = (params) => api.get('/siniestros-art', { params })
export const createSiniestroArt = (d) => api.post('/siniestros-art', d)
export const updateSiniestroArt = (id, d) => api.put(`/siniestros-art/${id}`, d)
export const deleteSiniestroArt = (id) => api.delete(`/siniestros-art/${id}`)

export const getConfiguracionIaBot = () => api.get('/ia-bot/configuracion')
export const updateConfiguracionIaBot = (d) => api.put('/ia-bot/configuracion', d)

export const getPlantillasInforme = (params) => api.get('/plantillas-informe', { params })
export const createPlantillaInforme = (d) => api.post('/plantillas-informe', d)
export const updatePlantillaInforme = (id, d) => api.put(`/plantillas-informe/${id}`, d)
export const deletePlantillaInforme = (id) => api.delete(`/plantillas-informe/${id}`)

export const getConversaciones = (params) => api.get('/conversaciones', { params })
export const getConversacion = (id) => api.get(`/conversaciones/${id}`)
export const tomarConversacion = (id) => api.patch(`/conversaciones/${id}/tomar`)
export const devolverConversacion = (id) => api.patch(`/conversaciones/${id}/devolver`)
export const resolverConversacion = (id) => api.patch(`/conversaciones/${id}/resolver`)
export const getMensajes = (conversacionId) => api.get(`/conversaciones/${conversacionId}/mensajes`)
export const enviarMensaje = (conversacionId, data) => {
  const esFormData = data instanceof FormData
  return api.post(`/conversaciones/${conversacionId}/mensajes`, data, esFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
}
export const sugerirRespuestaIa = (conversacionId) => api.post(`/conversaciones/${conversacionId}/sugerir-ia`)
export const toggleAutomatizacionConversacion = (id) => api.patch(`/conversaciones/${id}/automatizacion`)

export const getNotasPaciente = (pacienteId) => api.get(`/pacientes/${pacienteId}/notas`)
export const crearNotaPaciente = (pacienteId, texto) => api.post(`/pacientes/${pacienteId}/notas`, { texto })
export const actualizarEtiquetasPaciente = (pacienteId, etiquetas) => api.patch(`/pacientes/${pacienteId}/etiquetas`, { etiquetas })

export const getRespuestasRapidas = () => api.get('/respuestas-rapidas')
export const createRespuestaRapida = (d) => api.post('/respuestas-rapidas', d)
export const updateRespuestaRapida = (id, d) => api.put(`/respuestas-rapidas/${id}`, d)
export const deleteRespuestaRapida = (id) => api.delete(`/respuestas-rapidas/${id}`)

export const getAcademy = (params) => api.get('/academy', { params })
export const getAcademyArticulo = (slug) => api.get(`/academy/${slug}`)
export const createAcademyArticulo = (d) => api.post('/academy', d)
export const votarAcademyArticulo = (id, util) => api.post(`/academy/${id}/votar`, { util })
export const moderarAcademyArticulo = (id, estado) => api.patch(`/academy/${id}/moderar`, { estado })

export const getProcedimientos = () => api.get('/procedimientos')
export const createProcedimiento = (d) => api.post('/procedimientos', d)
export const updateProcedimiento = (id, d) => api.put(`/procedimientos/${id}`, d)
export const deleteProcedimiento = (id) => api.delete(`/procedimientos/${id}`)

export const getFlujos = () => api.get('/flujos')
export const getFlujo = (id) => api.get(`/flujos/${id}`)
export const createFlujo = (d) => api.post('/flujos', d)
export const updateFlujo = (id, d) => api.put(`/flujos/${id}`, d)
export const deleteFlujo = (id) => api.delete(`/flujos/${id}`)
export const guardarFlujo = (id, payload) => api.post(`/flujos/${id}/guardar`, payload)

export const getCarpetasFlujo = () => api.get('/carpetas-flujo')
export const createCarpetaFlujo = (nombre) => api.post('/carpetas-flujo', { nombre })
export const updateCarpetaFlujo = (id, nombre) => api.put(`/carpetas-flujo/${id}`, { nombre })
export const deleteCarpetaFlujo = (id) => api.delete(`/carpetas-flujo/${id}`)
export const enviarFlujoAConversacion = (conversacionId, flujoId) => api.post(`/conversaciones/${conversacionId}/enviar-flujo`, { flujo_id: flujoId })

export const getAutomatizaciones = () => api.get('/automatizaciones')
export const createAutomatizacion = (d) => api.post('/automatizaciones', d)
export const updateAutomatizacion = (id, d) => api.put(`/automatizaciones/${id}`, d)
export const toggleAutomatizacion = (id) => api.patch(`/automatizaciones/${id}/toggle`)
export const deleteAutomatizacion = (id) => api.delete(`/automatizaciones/${id}`)

export const getPagos = (params) => api.get('/pagos', { params })
export const createPago = (d) => api.post('/pagos', d)
export const updatePago = (id, d) => api.put(`/pagos/${id}`, d)

export const getCampanhas = () => api.get('/campanhas')
export const createCampanha = (d) => api.post('/campanhas', d)
export const updateCampanha = (id, d) => api.put(`/campanhas/${id}`, d)
export const deleteCampanha = (id) => api.delete(`/campanhas/${id}`)

export const getTransmisiones = (params) => api.get('/transmisiones', { params })
export const createTransmision = (d) => api.post('/transmisiones', d)
export const updateTransmision = (id, d) => api.put(`/transmisiones/${id}`, d)
export const deleteTransmision = (id) => api.delete(`/transmisiones/${id}`)

export const getModelosMensajes = (params) => api.get('/modelos-mensajes', { params })
export const createModeloMensaje = (d) => api.post('/modelos-mensajes', d)
export const updateModeloMensaje = (id, d) => api.put(`/modelos-mensajes/${id}`, d)
export const deleteModeloMensaje = (id) => api.delete(`/modelos-mensajes/${id}`)
