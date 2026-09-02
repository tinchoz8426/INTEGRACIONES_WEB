import { Router } from 'express';
import {
  getMedicos,
  getMedicoById,
  createMedico,
  updateMedico,
  deleteMedico,
} from '../controllers/medico.controller.js';
import { validateBody, validateQuery } from '../middlewares/validate.js';
import {
  medicoCreateSchema,
  medicoUpdateSchema,
  medicoQuerySchema,
} from '../schemas/medico.schema.js';

const router = Router();

router.get('/', validateQuery(medicoQuerySchema), getMedicos);
router.get('/:id', getMedicoById);
router.post('/', validateBody(medicoCreateSchema), createMedico);
router.put('/:id', validateBody(medicoUpdateSchema), updateMedico);
router.delete('/:id', deleteMedico);

export default router;
