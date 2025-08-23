
import './App.css';
import { Login } from './pages/login/index';
import { Home } from './pages/landing/index';
import { Dashboard } from './pages/dashboard/index';
import { DashboardHome } from './pages/dashboard/outlets/dashboard';
import { ScriptGen } from './pages/dashboard/outlets/scriptGen';
import { Analytics } from './pages/dashboard/outlets/analytics';
import { Feedback } from './pages/dashboard/outlets/feedback';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FeedbackBox } from './components/feedbackUi/feedback';
import "@copilotkit/react-ui/styles.css";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/widget" element={<FeedbackBox />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome/>}/>
          <Route path="feedbacks" element={<Feedback/>} />
          <Route path="analytics" element={<Analytics/>} />
          <Route path="scriptGen" element={<ScriptGen/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
