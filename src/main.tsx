import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./i18n.ts"; // Import i18n setup
import React, { Suspense } from "react";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading application...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);