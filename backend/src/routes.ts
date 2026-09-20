import { Router } from "express";
import multer from "multer";
import uploadConfig from "./config/multer.js";

import { validateSchema } from "./middlewares/ValidateSchema.js";
import { authenticate } from "./middlewares/Authenticate.js";
import { requireTenant } from "./middlewares/RequireTenant.js";
import { requireActiveSubscription } from "./middlewares/RequireActiveSubscription.js";
import { authorize } from "./middlewares/Authorize.js";
import { authRateLimiter } from "./middlewares/RateLimit.js";

import { RegisterTenantController } from "./controllers/tenant/RegisterTenantController.js";
import { LoginTenantController } from "./controllers/tenant/LoginTenantController.js";
import { GetMyTenantController } from "./controllers/tenant/GetMyTenantController.js";
import { CreateProfessionalController } from "./controllers/professional/CreateProfessionalController.js";
import { ListProfessionalsController } from "./controllers/professional/ListProfessionalsController.js";
import { UpdateProfessionalController } from "./controllers/professional/UpdateProfessionalController.js";
import { DeleteProfessionalController } from "./controllers/professional/DeleteProfessionalController.js";
import { SetProfessionalWorkingHoursController } from "./controllers/professional/SetProfessionalWorkingHoursController.js";
import { CreateServiceController } from "./controllers/service/CreateServiceController.js";
import { ListServicesController } from "./controllers/service/ListServicesController.js";
import { UpdateServiceController } from "./controllers/service/UpdateServiceController.js";
import { DeleteServiceController } from "./controllers/service/DeleteServiceController.js";

import { registerTenantSchema } from "./schemas/tenantSchema.js";
import { loginSchema } from "./schemas/loginShema.js";
import {
    createProfessionalSchema,
    updateProfessionalSchema,
    deleteProfessionalSchema,
    setWorkingHoursSchema
} from "./schemas/professionalSchema.js";
import {
    createServiceSchema,
    updateServiceSchema,
    deleteServiceSchema
} from "./schemas/serviceSchema.js";

const router = Router();
const upload = multer(uploadConfig);

/* ---------------------------------------------------------------------------
 * Autenticação
 * ------------------------------------------------------------------------ */
router.post("/register", authRateLimiter, validateSchema(registerTenantSchema), new RegisterTenantController().handle);
router.post("/login", authRateLimiter, validateSchema(loginSchema), new LoginTenantController().handle);

/* ---------------------------------------------------------------------------
 * Painel da barbearia — tenantId sempre vem do JWT (req.auth), nunca da request
 * ------------------------------------------------------------------------ */
router.get("/tenant/me", authenticate, requireTenant, requireActiveSubscription, new GetMyTenantController().handle);

router.post("/professionals", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), upload.single("photo"), validateSchema(createProfessionalSchema), new CreateProfessionalController().handle);
router.get("/professionals", authenticate, requireTenant, requireActiveSubscription, new ListProfessionalsController().handle);
router.put("/professionals/:id", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), upload.single("photo"), validateSchema(updateProfessionalSchema), new UpdateProfessionalController().handle);
router.delete("/professionals/:id", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), validateSchema(deleteProfessionalSchema), new DeleteProfessionalController().handle);
router.put("/professionals/:id/working-hours", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), validateSchema(setWorkingHoursSchema), new SetProfessionalWorkingHoursController().handle);

router.post("/services", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), validateSchema(createServiceSchema), new CreateServiceController().handle);
router.get("/services", authenticate, requireTenant, requireActiveSubscription, new ListServicesController().handle);
router.put("/services/:id", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), validateSchema(updateServiceSchema), new UpdateServiceController().handle);
router.delete("/services/:id", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), validateSchema(deleteServiceSchema), new DeleteServiceController().handle);

export { router };
