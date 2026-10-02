import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, User, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/auth-context";

export default function Signup(){
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [role,setRole]=useState("user");
 const [error,setError]=useState("");
 const [submitting,setSubmitting]=useState(false);
 const { signup } = useAuth();
 const nav=useNavigate();

 const submit = async e => {
   e.preventDefault();
   setError("");
   setSubmitting(true);
   try {
     await signup(name, email, password, role);
     nav("/login");
   } catch(err) {
     setError(err.message || "Could not create your account. Please try again.");
   } finally {
     setSubmitting(false);
   }
 };

 return <div className="auth-page"><div className="auth-side"><Link to="/" className="brand light"><span className="brand-mark"><ShieldAlert/></span>IncidentWatch</Link><div><div className="eyebrow"><span className="live-dot"></span> JOIN THE NETWORK</div><h2>Build a safer<br/><em>community together.</em></h2><p>Create an account and access the tools designed for your role in emergency response.</p></div><small>Secure role-based access</small></div><div className="auth-panel"><div className="auth-box signup-box"><div className="auth-logo"><ShieldAlert/></div><h1>Create your account</h1><p>Start monitoring with IncidentWatch.</p>
 <form className="auth-form" onSubmit={submit}>
  {error && <div className="form-error">{error}</div>}
  <label>Full name<input required placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)}/><User className="input-icon"/></label>
  <label>Email address<input required type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/><Mail className="input-icon"/></label>
  <label>Password<input required type="password" placeholder="Create a password (min 6 characters)" minLength={6} value={password} onChange={e=>setPassword(e.target.value)}/><Lock className="input-icon"/></label>
  <label>Role<select value={role} onChange={e=>setRole(e.target.value)}><option value="user">User</option><option value="police">Police</option><option value="hospital">Hospital</option><option value="admin">Admin</option></select></label>
  <button className="btn btn-primary full" disabled={submitting}>{submitting?"Creating account...":"Create account"} <ArrowRight size={18}/></button>
 </form>
 <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p></div></div></div>
}
