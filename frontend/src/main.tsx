import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import ErrorBoundary from "@/components/ErrorBoundary";

console.log("API base:", import.meta.env.VITE_API_BASE); // hjälplogg

const Router =
  import.meta.env.MODE === "production" ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router basename={import.meta.env.BASE_URL}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Router>
  </React.StrictMode>
);