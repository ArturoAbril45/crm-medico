import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8010/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

export default api

export const dashboard = () => api.get('/dashboard')
export const getPacientes = (params) => api.get('/pacientes', { params })
export const getPaciente = (id) => api.get(`/pacientes/${id}`)
export const createPaciente = (d) => api.post('/pacientes', d)
export const updatePaciente = (id, d) => api.put(`/pacientes/${id}`, d)
export const deletePaciente = (id) => api.delete(`/pacientes/${id}`)

export const getCitas = (params) => api.get('/citas', { params })
export const createCita = (d) => api.post('/citas', d)
export const updateCita = (id, d) => api.put(`/citas/${id}`, d)
export const deleteCita = (id) => api.delete(`/citas/${id}`)
export const getCitasCalendario = (params) => api.get('/citas-calendario', { params })

export const getProcedimientos = () => api.get('/procedimientos')
export const createProcedimiento = (d) => api.post('/procedimientos', d)
export const updateProcedimiento = (id, d) => api.put(`/procedimientos/${id}`, d)
export const deleteProcedimiento = (id) => api.delete(`/procedimientos/${id}`)

export const getFlujos = () => api.get('/flujos')
export const getFlujo = (id) => api.get(`/flujos/${id}`)
export const createFlujo = (d) => api.post('/flujos', d)
export const updateFlujo = (id, d) => api.put(`/flujos/${id}`, d)
export const deleteFlujo = (id) => api.delete(`/flujos/${id}`)
export const guardarBloques = (id, bloques) => api.post(`/flujos/${id}/bloques`, { bloques })

export const crearBloque = (flujoId, d) => api.post(`/flujos/${flujoId}/bloques-nuevo`, d)
export const actualizarBloque = (id, d) => api.patch(`/bloques/${id}`, d)
export const moverBloque = (id, d) => api.patch(`/bloques/${id}/mover`, d)
export const eliminarBloque = (id) => api.delete(`/bloques/${id}`)
export const crearConexion = (d) => api.post('/bloque-conexiones', d)
export const eliminarConexion = (id) => api.delete(`/bloque-conexiones/${id}`)

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

export const getMedicos = () => api.get('/medicos')
export const createMedico = (d) => api.post('/medicos', d)
export const updateMedico = (id, d) => api.put(`/medicos/${id}`, d)
export const deleteMedico = (id) => api.delete(`/medicos/${id}`)

export const getDepartamentos = () => api.get('/departamentos')
export const createDepartamento = (d) => api.post('/departamentos', d)
export const updateDepartamento = (id, d) => api.put(`/departamentos/${id}`, d)
export const deleteDepartamento = (id) => api.delete(`/departamentos/${id}`)

export const getConsultas = () => api.get('/consultas')
export const createConsulta = (d) => api.post('/consultas', d)
export const updateConsulta = (id, d) => api.put(`/consultas/${id}`, d)
export const deleteConsulta = (id) => api.delete(`/consultas/${id}`)

export const getRegistros = (modulo) => api.get('/registros', { params: { modulo } })
export const createRegistro = (d) => api.post('/registros', d)
export const updateRegistro = (id, d) => api.put(`/registros/${id}`, d)
export const deleteRegistro = (id) => api.delete(`/registros/${id}`)

export const login = (usuario, password) => api.post('/login', { usuario, password })
export const getUsuarios = () => api.get('/usuarios')
export const createUsuario = (d) => api.post('/usuarios', d)
export const updateUsuario = (id, d) => api.put(`/usuarios/${id}`, d)
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`)

export const getConversaciones = () => api.get('/whatsapp/conversaciones')
export const getMensajesWhatsapp = (conversacionId) => api.get(`/whatsapp/conversaciones/${conversacionId}/mensajes`)
export const enviarMensajeWhatsapp = (d) => {
  const esArchivo = d instanceof FormData
  return api.post('/whatsapp/enviar', d, esArchivo ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
}
export const getEstadoBot = () => api.get('/whatsapp/estado')
export const conectarBot = () => api.post('/whatsapp/conectar')
export const desconectarBot = () => api.post('/whatsapp/desconectar')
