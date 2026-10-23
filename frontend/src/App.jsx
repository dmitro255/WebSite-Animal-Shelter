import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./componnets/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AnimalCatalog from "./pages/AnimalCatalog.jsx";
import AnimalDetail from "./pages/AnimalDetail.jsx";
import AnimalForm from "./pages/AnimalForm.jsx";
import ApplicationsCRUD from "./pages/ApplicationsCRUD.jsx";

function App() {
  return (
    
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="animal" element={<AnimalCatalog />} />
          <Route path="animal/new" element={<AnimalForm />} />
          <Route path="animal/animalId" element={<AnimalDetail />} />
          <Route path="animal/animalId/edit" element={<AnimalForm />} />
          <Route path="adoption" element={<ApplicationsCRUD />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

  );
}

export default App;