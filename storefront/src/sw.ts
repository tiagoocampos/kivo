/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

// Só precache do app (instalação como PWA). Notificação push de lembrete fica
// pra quando o backend tiver isso.
precacheAndRoute(self.__WB_MANIFEST);
