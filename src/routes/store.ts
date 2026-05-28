import { Router } from 'express';
import * as storeController from '../features/store/controller';

const router = Router();

router.get('/', storeController.getAllStores);
router.get('/:name', storeController.getStoreByName);
router.post('/', storeController.createStore);
router.put('/:name', storeController.updateStore);
router.delete('/:name', storeController.deleteStore);

export default router;
