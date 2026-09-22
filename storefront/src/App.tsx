import { Route, Routes } from "react-router-dom"
import { BookingPage } from "@/pages/BookingPage"
import { InstallAppPage } from "@/pages/InstallAppPage"
import { NotFoundPage } from "@/pages/NotFoundPage"

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <NotFoundPage
            title="KirvoAgenda"
            message="Acesse o agendamento pelo link enviado pela barbearia."
          />
        }
      />
      <Route path="/:slug/instalar" element={<InstallAppPage />} />
      <Route path="/:slug" element={<BookingPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
