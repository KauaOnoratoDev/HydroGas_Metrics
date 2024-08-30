import { Router } from 'express'

import uploadController from '../controllers/uploadController'
import listController from '../controllers/listController'
import confirmController from '../controllers/confirmController'

const router = Router()

router.get('/:customer_code/list', listController)
router.post('/upload', uploadController)
router.patch('/confirm', confirmController)

export default router
