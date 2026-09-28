import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Map, Siren, Building2, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/auth-context";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    ["/dashboard","Overview",LayoutDashboard],
    ["/dashboard#map","Live incident map",Map],
    ["/police","Police response",Siren],
    ["/hospitals","Hospitals",Building2],
  ];
  if (user?.role === "admin") links.push(["/admin","Admin control",Users]);

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  return <aside className="sidebar">
    <div className="side-title">COMMAND CENTER</div>
    {links.map(([to,label,Icon]) => <NavLink key={label} to={to} className="side-link"><Icon size={18}/><span>{label}</span></NavLink>)}
    <div className="side-bottom">
      <button className="side-link"><Settings size={18}/> Settings</button>
      <button className="side-link danger" onClick={handleSignOut}><LogOut size={18}/> Sign out</button>
    </div>
    <div className="status-mini"><span className="pulse"></span><div><b>System online</b><small>Signed in as {user?.name || "..."}</small></div></div>
  </aside>;
}
