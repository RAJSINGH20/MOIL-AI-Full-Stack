import {Router} from 'express';
import {generatePrediction,dashboard,chat,analyzeLiveLocation} from '../controllers/analytics.controller.js';
const router=Router(); router.post('/predict',generatePrediction); router.post('/chat',chat); router.post('/location-analysis',analyzeLiveLocation); router.get('/dashboard/:mine',dashboard); export default router;
