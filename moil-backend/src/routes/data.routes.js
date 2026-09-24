import {Router} from 'express';
import {addGeology,addProduction,listGeology,listProduction} from '../controllers/data.controller.js';
const router=Router();
router.post('/geology',addGeology); router.post('/production',addProduction);
router.get('/geology/:mine',listGeology); router.get('/production/:mine',listProduction);
export default router;
