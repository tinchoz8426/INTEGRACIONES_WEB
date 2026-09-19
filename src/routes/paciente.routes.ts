import { Router } from 'express';
import {
  getPacientes,
  getPacienteById,
  getTurnosDePaciente,
  createPaciente,
  updatePaciente,
  deletePaciente,
} from '../controllers/paciente.controller.js';
import { validateBody, validateQuery } from '../middlewares/validate.js';
import {
  pacienteCreateSchema,
  pacienteUpdateSchema,
  pacienteQuerySchema,
} from '../schemas/paciente.schema.js';

const router = Router();

router.get('/', validateQuery(pacienteQuerySchema), getPacientes);
router.get('/:id/turnos', getTurnosDePaciente);
router.get('/:id', getPacienteById);
router.post('/', validateBody(pacienteCreateSchema), createPaciente);
router.put('/:id', validateBody(pacienteUpdateSchema), updatePaciente);
router.delete('/:id', deletePaciente);

export default router;