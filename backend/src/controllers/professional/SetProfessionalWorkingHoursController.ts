import { Request, Response } from 'express';
import { SetProfessionalWorkingHoursService } from '../../services/professional/SetProfessionalWorkingHoursService.js';

class SetProfessionalWorkingHoursController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { intervals } = req.body;

        const setProfessionalWorkingHoursService = new SetProfessionalWorkingHoursService();
        const workingHours = await setProfessionalWorkingHoursService.execute({
            tenantId: req.auth.tenantId!,
            professionalId: id,
            intervals
        });

        return res.json(workingHours);
    }
}

export { SetProfessionalWorkingHoursController };
