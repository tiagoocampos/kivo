export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// "09:30" -> 570. Minutos desde a meia-noite são a forma mais simples de
// comparar e somar horários do expediente (o motor de disponibilidade usa isso).
export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours! * 60 + minutes!;
}

// 570 -> "09:30"
export function minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
