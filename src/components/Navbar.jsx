
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-inner">

        <div className="nav-left">
          <NavLink to="/">
            <img src="/logonavbar.png" className="logonavbar" />
          </NavLink>
        </div>

        <div className="nav-center">
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? "active" : ""}
            end
          >
            Αρχική
          </NavLink>

          <NavLink
            to="/poetry"
            className={({ isActive }) => isActive ? "active" : ""}
          >
            Ποίηση
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => isActive ? "active" : ""}
          >
            Ιστορία
          </NavLink>

          <NavLink
            to="/arts"
            className={({ isActive }) => isActive ? "active" : ""}
          >
            Τέχνες
          </NavLink>

          <NavLink
            to="/music"
            className={({ isActive }) => isActive ? "active" : ""}
          >
            Μουσική
          </NavLink>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;