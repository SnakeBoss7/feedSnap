// src/index.widget.js
import React from "react";
import "./index.css";
import './App.css'

import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { FeedbackBox } from "./components/feedbackUi/feedback";

ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<FeedbackBox />} />
    </Routes>
  </HashRouter>
);
