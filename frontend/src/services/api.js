import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

export default api

export const dashboard = () => api.get('/dashboard')
export const getPacientes = (params) => api.get('/pacientes', { params })
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
export const createFlujo = (d) => api.post('/flujos', d)
export const updateFlujo = (id, d) => api.put(`/flujos/${id}`, d)
export const deleteFlujo = (id) => api.delete(`/flujos/${id}`)
export const guardarBloques = (id, bloques) => api.post(`/flujos/${id}/bloques`, { bloques })

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
