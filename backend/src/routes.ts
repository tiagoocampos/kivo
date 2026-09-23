import { Router } from "express";
import multer from "multer";
import uploadConfig from "./config/multer.js";

import { validateSchema } from "./middlewares/ValidateSchema.js";
import { authenticate } from "./middlewares/Authenticate.js";
import { authenticateCustomer } from "./middlewares/AuthenticateCustomer.js";
import { optionalAuthenticateCustomer } from "./middlewares/OptionalAuthenticateCustomer.js";
import { requireTenant } from "./middlewares/RequireTenant.js";
import { requireActiveSubscription } from "./middlewares/RequireActiveSubscription.js";
import { authorize } from "./middlewares/Authorize.js";
import { authRateLimiter, availabilityRateLimiter, publicBookingRateLimiter } from "./middlewares/RateLimit.js";

import { RegisterTenantController } from "./controllers/tenant/RegisterTenantController.js";
import { LoginTenantController } from "./controllers/tenant/LoginTenantController.js";
import { GetMyTenantController } from "./controllers/tenant/GetMyTenantController.js";
import { UpdateMyTenantController } from "./controllers/tenant/UpdateMyTenantController.js";
import { CreateProfessionalController } from "./controllers/professional/CreateProfessionalController.js";
import { ListProfessionalsController } from "./controllers/professional/ListProfessionalsController.js";
import { UpdateProfessionalController } from "./controllers/professional/UpdateProfessionalController.js";
import { DeleteProfessionalController } from "./controllers/professional/DeleteProfessionalController.js";
import { SetProfessionalWorkingHoursController } from "./controllers/professional/SetProfessionalWorkingHoursController.js";
import { CreateServiceController } from "./controllers/service/CreateServiceController.js";
import { ListServicesController } from "./controllers/service/ListServicesController.js";
import { UpdateServiceController } from "./controllers/service/UpdateServiceController.js";
import { DeleteServiceController } from "./controllers/service/DeleteServiceController.js";
import { GetPublicBookingController } from "./controllers/booking/GetPublicBookingController.js";
import { GetAvailableSlotsController } from "./controllers/availability/GetAvailableSlotsController.js";
import { CreateAppointmentController } from "./controllers/appointment/CreateAppointmentController.js";
import { ListAppointmentsController } from "./controllers/appointment/ListAppointmentsController.js";
import { GetAppointmentController } from "./controllers/appointment/GetAppointmentController.js";
import { UpdateAppointmentStatusController } from "./controllers/appointment/UpdateAppointmentStatusController.js";
import { CancelAppointmentByStoreController } from "./controllers/appointment/CancelAppointmentByStoreController.js";
import { RegisterCustomerController } from "./controllers/customer/RegisterCustomerController.js";
import { LoginCustomerController } from "./controllers/customer/LoginCustomerController.js";
import { GetCustomerMeController } from "./controllers/customer/GetCustomerMeController.js";
import { ListCustomerAppointmentsController } from "./controllers/customer/ListCustomerAppointmentsController.js";
import { CancelCustomerAppointmentController } from "./controllers/customer/CancelCustomerAppointmentController.js";
import { ListCustomersController } from "./controllers/customer/ListCustomersController.js";
import { GetCustomerAppointmentsController } from "./controllers/customer/GetCustomerAppointmentsController.js";
import { GetDashboardSummaryController } from "./controllers/dashboard/GetDashboardSummaryController.js";
import { GetDashboardRevenueController } from "./controllers/dashboard/GetDashboardRevenueController.js";
import { ForgotPasswordController } from "./controllers/auth/ForgotPasswordController.js";
import { ResetPasswordController } from "./controllers/auth/ResetPasswordController.js";
import { GetVapidPublicKeyController } from "./controllers/push/GetVapidPublicKeyController.js";
import { SubscribeUserPushController } from "./controllers/push/SubscribeUserPushController.js";
import { SubscribeAppointmentPushController } from "./controllers/appointment/SubscribeAppointmentPushController.js";
import { ListNotificationsController } from "./controllers/notification/ListNotificationsController.js";
import { GetUnreadNotificationCountController } from "./controllers/notification/GetUnreadNotificationCountController.js";
import { MarkAllNotificationsReadController } from "./controllers/notification/MarkAllNotificationsReadController.js";

import { registerTenantSchema, updateMyTenantSchema } from "./schemas/tenantSchema.js";
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
import {
    getPublicBookingSchema,
    getAvailabilitySchema,
    createAppointmentSchema
} from "./schemas/bookingSchema.js";
import {
    registerCustomerSchema,
    loginCustomerSchema,
    getCustomerMeSchema,
    listCustomerAppointmentsSchema,
    cancelCustomerAppointmentSchema,
    getCustomerAppointmentsSchema
} from "./schemas/customerSchema.js";
import {
    listAppointmentsSchema,
    getAppointmentSchema,
    updateAppointmentStatusSchema,
    cancelAppointmentByStoreSchema
} from "./schemas/appointmentSchema.js";
import { getDashboardRevenueSchema } from "./schemas/dashboardSchema.js";
import { forgotPasswordSchema, resetPasswordSchema } from "./schemas/authSchema.js";
import { subscribeUserPushSchema, subscribeAppointmentPushSchema } from "./schemas/pushSchema.js";
import { listNotificationsSchema } from "./schemas/notificationSchema.js";

const router = Router();
const upload = multer(uploadConfig);

/* ---------------------------------------------------------------------------
 * Autenticação
 * ------------------------------------------------------------------------ */
router.post("/register", authRateLimiter, validateSchema(registerTenantSchema), new RegisterTenantController().handle);
router.post("/login", authRateLimiter, validateSchema(loginSchema), new LoginTenantController().handle);
router.post("/auth/forgot-password", authRateLimiter, validateSchema(forgotPasswordSchema), new ForgotPasswordController().handle);
router.post("/auth/reset-password", validateSchema(resetPasswordSchema), new ResetPasswordController().handle);

/* ---------------------------------------------------------------------------
 * Painel da barbearia — tenantId sempre vem do JWT (req.auth), nunca da request
 * ------------------------------------------------------------------------ */
router.get("/tenant/me", authenticate, requireTenant, requireActiveSubscription, new GetMyTenantController().handle);
router.put(
    "/tenant/me",
    authenticate,
    requireTenant,
    requireActiveSubscription,
    authorize("store_owner"),
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
        { name: "favicon", maxCount: 1 }
    ]),
    validateSchema(updateMyTenantSchema),
    new UpdateMyTenantController().handle
);

router.post("/professionals", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), upload.single("photo"), validateSchema(createProfessionalSchema), new CreateProfessionalController().handle);
router.get("/professionals", authenticate, requireTenant, requireActiveSubscription, new ListProfessionalsController().handle);
router.put("/professionals/:id", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), upload.single("photo"), validateSchema(updateProfessionalSchema), new UpdateProfessionalController().handle);
router.delete("/professionals/:id", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), validateSchema(deleteProfessionalSchema), new DeleteProfessionalController().handle);
router.put("/professionals/:id/working-hours", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), validateSchema(setWorkingHoursSchema), new SetProfessionalWorkingHoursController().handle);

router.post("/services", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), validateSchema(createServiceSchema), new CreateServiceController().handle);
router.get("/services", authenticate, requireTenant, requireActiveSubscription, new ListServicesController().handle);
router.put("/services/:id", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), validateSchema(updateServiceSchema), new UpdateServiceController().handle);
router.delete("/services/:id", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), validateSchema(deleteServiceSchema), new DeleteServiceController().handle);

router.get("/appointments", authenticate, requireTenant, requireActiveSubscription, validateSchema(listAppointmentsSchema), new ListAppointmentsController().handle);
router.get("/appointments/:id", authenticate, requireTenant, requireActiveSubscription, validateSchema(getAppointmentSchema), new GetAppointmentController().handle);
router.patch("/appointments/:id/status", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner", "store_staff"), validateSchema(updateAppointmentStatusSchema), new UpdateAppointmentStatusController().handle);
router.patch("/appointments/:id/cancel", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner", "store_staff"), validateSchema(cancelAppointmentByStoreSchema), new CancelAppointmentByStoreController().handle);

router.get("/customers", authenticate, requireTenant, requireActiveSubscription, new ListCustomersController().handle);
router.get("/customers/:id/appointments", authenticate, requireTenant, requireActiveSubscription, validateSchema(getCustomerAppointmentsSchema), new GetCustomerAppointmentsController().handle);

router.get("/dashboard/summary", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), new GetDashboardSummaryController().handle);
router.get("/dashboard/revenue", authenticate, requireTenant, requireActiveSubscription, authorize("store_owner"), validateSchema(getDashboardRevenueSchema), new GetDashboardRevenueController().handle);

/* ---------------------------------------------------------------------------
 * Push — mesmas chaves VAPID pro painel (por usuário) e pro cliente final
 * (por agendamento, seção pública mais abaixo).
 * ------------------------------------------------------------------------ */
router.get("/push/vapid-public-key", new GetVapidPublicKeyController().handle);
router.post("/push/subscription", authenticate, requireTenant, requireActiveSubscription, validateSchema(subscribeUserPushSchema), new SubscribeUserPushController().handle);

/* ---------------------------------------------------------------------------
 * Notificações — feed de atividade do painel (sino), separado do
 * PushSubscription: um é o histórico dentro do app, o outro é o push do SO.
 * ------------------------------------------------------------------------ */
router.get("/notifications", authenticate, requireTenant, requireActiveSubscription, validateSchema(listNotificationsSchema), new ListNotificationsController().handle);
router.get("/notifications/unread-count", authenticate, requireTenant, requireActiveSubscription, new GetUnreadNotificationCountController().handle);
router.patch("/notifications/read-all", authenticate, requireTenant, requireActiveSubscription, new MarkAllNotificationsReadController().handle);

/* ---------------------------------------------------------------------------
 * Fluxo público de agendamento (cliente final, sem login) — barbearia
 * identificada pelo slug, nunca por id vindo do corpo/query da requisição
 * ------------------------------------------------------------------------ */
router.get("/booking/:slug", validateSchema(getPublicBookingSchema), new GetPublicBookingController().handle);
router.get("/booking/:slug/availability", availabilityRateLimiter, validateSchema(getAvailabilitySchema), new GetAvailableSlotsController().handle);
router.post(
    "/booking/:slug/appointments",
    publicBookingRateLimiter,
    optionalAuthenticateCustomer,
    validateSchema(createAppointmentSchema),
    new CreateAppointmentController().handle
);
router.post(
    "/booking/:slug/appointments/:id/push-subscription",
    validateSchema(subscribeAppointmentPushSchema),
    new SubscribeAppointmentPushController().handle
);

/* ---------------------------------------------------------------------------
 * Conta do cliente final — login opcional. Convidado continua agendando sem
 * conta; quem quiser pode se cadastrar e logar pra ver/cancelar pelo app.
 * Barbearia sempre resolvida pelo slug da URL.
 * ------------------------------------------------------------------------ */
router.post("/booking/:slug/customer/register", authRateLimiter, validateSchema(registerCustomerSchema), new RegisterCustomerController().handle);
router.post("/booking/:slug/customer/login", authRateLimiter, validateSchema(loginCustomerSchema), new LoginCustomerController().handle);
router.get("/booking/:slug/customer/me", authenticateCustomer, validateSchema(getCustomerMeSchema), new GetCustomerMeController().handle);
router.get("/booking/:slug/customer/appointments", authenticateCustomer, validateSchema(listCustomerAppointmentsSchema), new ListCustomerAppointmentsController().handle);
router.patch("/booking/:slug/customer/appointments/:id/cancel", authenticateCustomer, validateSchema(cancelCustomerAppointmentSchema), new CancelCustomerAppointmentController().handle);

export { router };
