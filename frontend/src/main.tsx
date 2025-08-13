import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Search from "./pages/Search";
import Results from "./pages/Results";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import SavedLayout from "./pages/Saved";
import SavedCollections from "./components/SavedCollections";
import SavedReelsPage from "./components/SavedReelsPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/results" element={<Results />} />
          <Route path="/auth" element={<Login />} />
          <Route path="/saved" element={<SavedLayout />}>
            <Route index element={<SavedCollections />} />
            <Route path=":city" element={<SavedReelsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
