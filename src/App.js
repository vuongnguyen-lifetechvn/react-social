import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login.js'
import Register from './pages/Login/Register.js'
import HomePage from './pages/Home/HomePage.js'
import NotFound from './pages/Error/404.js'
import {  } from "../public/";
function App() {
  return (
    <Router>
      <Routes>
        <Route exact path='/' Component={HomePage}></Route>
        <Route exact path='/login' Component={Login}></Route>
        <Route exact path='/register' Component={Register}></Route>
        <Route exact path='/nganluong_da1f773387b6e901b9cc6ce07a6a0bde.html' render={()=> window.location.href = "../public/nganluong_da1f773387b6e901b9cc6ce07a6a0bde.html"}></Route>
        <Route path='*' Component={NotFound}></Route>
      </Routes>
    </Router>
  );
}

export default App;