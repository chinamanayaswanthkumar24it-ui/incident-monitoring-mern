import { useState } from "react";
import { useAuth } from "../context/auth-context";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Map,
  Building2,
  Siren,
  LayoutDashboard,
  LogIn
} from "lucide-react";

export default function Navbar({ app = false }) {

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showProfile, setShowProfile] = useState(false);

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard#map", label: "Live Map", icon: Map },
    { to: "/police", label: "Police", icon: Siren },
    { to: "/hospitals", label: "Hospitals", icon: Building2 },
  ];

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="topbar">

      <Link to={app ? "/dashboard" : "/"} className="brand">
        <span className="brand-mark">
          <ShieldAlert size={21} />
        </span>

        <span>
          Incident<span>Watch</span>
        </span>
      </Link>

      {!app ? (

        <nav className="nav-links">

          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#how">How it works</a>

          <Link className="btn btn-outline small" to="/login">
            <LogIn size={16} />
            Sign in
          </Link>

          <Link className="btn btn-primary small" to="/signup">
            Get started
          </Link>

        </nav>

      ) : (

        <nav className="nav-links app-nav">

          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          <button
            className="text-link"
            onClick={handleLogout}
            title="Sign out"
          >
            Sign out
          </button>

          {/* USER AVATAR */}
          <button
            className="avatar"
            onClick={() => setShowProfile(!showProfile)}
            title="Account"
          >
            {initials}
          </button>

          {/* USER DETAILS */}
          {showProfile && (
            <div className="profile-popup">

              <div className="profile-popup-head">

                <div className="profile-avatar">
                  {initials}
                </div>

                <div>
                  <strong>
                    {user?.name || "User"}
                  </strong>

                  <small>
                    {user?.role || "user"}
                  </small>
                </div>

              </div>

              <div className="profile-details">

                <div>
                  <span>Name</span>
                  <b>
                    {user?.name || "Not available"}
                  </b>
                </div>

                <div>
                  <span>Email</span>
                  <b>
                    {user?.email || "Not available"}
                  </b>
                </div>

                <div>
                  <span>Role</span>
                  <b>
                    {user?.role || "user"}
                  </b>
                </div>

              </div>

            </div>
          )}

        </nav>

      )}

    </header>
  );
}
