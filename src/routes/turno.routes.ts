import { Router } from 'express';
import {
  getTurnos,
  getTurnoById,
  createTurno,
  updateTurno,
  deleteTurno,
} from '../controllers/turno.controller.js';
import { validateBody, validateQuery } from '../middlewares/validate.js';
import {
  turnoCreateSchema,
  turnoUpdateSchema,
  turnoQuerySchema,
} from '../schemas/turno.schema.js';

const router = Router();

router.get('/', validateQuery(turnoQuerySchema), getTurnos);
router.get('/:id', getTurnoById);
router.post('/', validateBody(turnoCreateSchema), createTurno);
router.put('/:id', validateBody(turnoUpdateSchema), updateTurno);
router.delete('/:id', deleteTurno);

export default router;
