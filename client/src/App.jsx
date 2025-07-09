import logo from './logo.svg';
import './App.css';
import { Login } from './pages/login/index';
import { Home } from './pages/landing/index';
import { BrowserRouter, Route, Routes } from "react-router-dom";
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
