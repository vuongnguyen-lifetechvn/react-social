import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login.js'
import Register from './pages/Login/Register.js'
import HomePage from './pages/Home/HomePage.js'
import NotFound from './pages/Error/404.js'
function App() {
  return (
    <Router>
      <Routes>
        <Route exact path='/' Component={HomePage}></Route>
        <Route exact path='/login' Component={Login}></Route>
        <Route exact path='/register' Component={Register}></Route>
        <Route path='*' Component={NotFound}></Route>
      </Routes>
    </Router>
  );
}

export default App;