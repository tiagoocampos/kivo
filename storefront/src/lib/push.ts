// Converte a VAPID public key (base64url, como o backend manda) pro formato
// Uint8Array que a Push API exige em applicationServerKey. Snippet padrão,
// ver https://github.com/mozilla/serviceworker-cookbook (web-push-demo).
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
