import { UserError } from 'shared';

export function unknownEndpoint(req: any, res: any) {
    res.status(404).json({ error: 'unknown endpoint' });
}

export function errorHandler(error: any, req: any, res: any, next: any) {
    console.error('Error: ' + error);
    
    if (error instanceof UserError) {
        return res.status(400).send({ type: 'error', message: error.message });
    }
    
    next(error);
}