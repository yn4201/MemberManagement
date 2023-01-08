import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/shared/Layout";
import Dashboard from "./components/Dashboard";
import Gifts from "./components/Gifts";
import History from "./components/History";
import Event from "./components/Event";
import Login from "./components/Login";
import AddRole from "./components/AddRole";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={"/login"} />} />
        <Route path="/home" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="addrole" element={<AddRole />} />
          <Route path="gifts" element={<Gifts />} />
          <Route path="histories" element={<History />} />
          <Route path="events" element={<Event />} />
        </Route>
        <Route path="login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
