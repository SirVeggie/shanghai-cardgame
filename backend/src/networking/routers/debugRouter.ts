import { Router } from 'express';
import { log } from '../../tools/log';

export const debugRouter = Router();

debugRouter.post('/error', (req, res) => {
    log(req.body, 'error');
    res.status(200).end();
});