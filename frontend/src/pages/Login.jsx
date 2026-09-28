import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/auth-context";

export default function Login(){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
 const [error,setError]=useState(""); const [submitting,setSubmitting]=useState(false);
 const { login } = useAuth();
 const nav=useNavigate();
 const submit=async e=>{
   e.preventDefault();
   setError("");
   if(!email||!password){ setError("Please enter email and password."); return; }
   setSubmitting(true);
   try {
     await login(email,password);
     nav("/dashboard");
   } catch(err){
     setError(err.message || "Could not sign in. Please try again.");
   } finally {
     setSubmitting(false);
   }
 };
 return <AuthShell title="Welcome back" subtitle="Sign in to your emergency command center.">
  <form className="auth-form" onSubmit={submit}>
  {error && <div className="form-error">{error}</div>}
  <label>Email address<input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/><Mail className="input-icon"/></label>
  <label>Password<input type="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required/><Lock className="input-icon"/></label>
  <div className="form-row"><label className="check"><input type="checkbox"/> Remember me</label><a href="#forgot">Forgot password?</a></div>
  <button className="btn btn-primary full" disabled={submitting}>{submitting?"Signing in...":"Sign in"} <ArrowRight size={18}/></button></form>
  <p className="auth-switch">New to IncidentWatch? <Link to="/signup">Create an account</Link></p>
  <p className="auth-hint">Demo admin: admin@incidentwatch.dev / admin1234</p>
 </AuthShell>
}
function AuthShell({title,subtitle,children}){
 return <div className="auth-page"><div className="auth-side"><Link to="/" className="brand light"><span className="brand-mark"><ShieldAlert/></span>IncidentWatch</Link><div><div className="eyebrow"><span className="live-dot"></span> ALWAYS CONNECTED</div><h2>Clarity when<br/><em>every second</em> counts.</h2><p>Monitor incidents, coordinate responders and keep your community safer with one connected view.</p></div><small>© 2026 IncidentWatch</small></div><div className="auth-panel"><div className="auth-box"><div className="auth-logo"><ShieldAlert/></div><h1>{title}</h1><p>{subtitle}</p>{children}</div></div></div>
}
