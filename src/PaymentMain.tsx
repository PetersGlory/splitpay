import React from "react"
import { createRoot } from "react-dom/client";
import PaymentApp from "./PaymentApp.tsx";
import "./index.css";

const container = document.getElementById("payment-root");
if (container) {
  createRoot(container).render(<PaymentApp />);
}
