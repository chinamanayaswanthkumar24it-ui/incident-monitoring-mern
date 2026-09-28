import { Link } from "react-router-dom";
import { ArrowRight, MapPinned, Radio, Siren, Building2, ShieldCheck, Activity, BellRing } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Landing(){
 return <div className="landing">
  <Navbar/>
  <main>
   <section className="hero-section">
    <div className="hero-copy">
      <div className="eyebrow"><span className="live-dot"></span> REAL-TIME INCIDENT RESPONSE</div>
      <h1>See emergencies.<br/><em>Respond faster</em>.</h1>
      <p className="hero-text">A unified monitoring platform that connects citizens, police and hospitals through one live view of what is happening around you.</p>
      <div className="hero-actions"><Link to="/signup" className="btn btn-primary">Get started <ArrowRight size={18}/></Link><Link to="/login" className="btn btn-ghost">Sign in</Link></div>
      <div className="trust-row"><span><ShieldCheck size={16}/> Secure access</span><span><Activity size={16}/> Live updates</span><span><MapPinned size={16}/> Location aware</span></div>
    </div>
    <div className="hero-visual">
      <div className="map-card">
        <div className="map-grid"></div>
        <div className="map-header"><span><span className="live-dot"></span> Live situation</span><b>● 24 active</b></div>
        <div className="radar"></div>
        <div className="map-pin pin-a">🚨<span>Accident</span></div><div className="map-pin pin-b">🏥<span>Hospital</span></div><div className="map-pin pin-c">🚓<span>Police</span></div>
        <div className="map-bottom"><div><small>Response time</small><strong>04:32 <span>min</span></strong></div><div><small>Resolved today</small><strong>128</strong></div></div>
      </div>
    </div>
   </section>

   <section className="feature-strip" id="features">
    <div><MapPinned/><div><b>Live incident map</b><span>Understand the situation at a glance.</span></div></div>
    <div><Radio/><div><b>Instant coordination</b><span>Keep responders on the same page.</span></div></div>
    <div><BellRing/><div><b>Smart alerts</b><span>Prioritize what needs attention.</span></div></div>
   </section>

   <section className="about-section" id="about">
    <div className="section-kicker">WHY INCIDENTWATCH</div><h2>One platform for the moments<br/>that matter most.</h2>
    <p>IncidentWatch turns scattered emergency information into a clear, actionable picture. Every role gets the tools they need without overwhelming them with unnecessary complexity.</p>
    <div className="role-cards">
      <div><span className="role-icon red"><Siren/></span><h3>Police teams</h3><p>Track active incidents, dispatch units and update response status.</p><Link to="/police">Explore police view <ArrowRight size={15}/></Link></div>
      <div><span className="role-icon blue"><Building2/></span><h3>Hospitals</h3><p>See incoming emergencies and coordinate capacity for faster care.</p><Link to="/hospitals">Explore hospital view <ArrowRight size={15}/></Link></div>
      <div><span className="role-icon dark"><ShieldCheck/></span><h3>Administrators</h3><p>Manage users, monitor system health and review incident activity.</p><Link to="/admin">Explore admin view <ArrowRight size={15}/></Link></div>
    </div>
   </section>

   <section className="how-section" id="how"><div className="section-kicker">HOW IT WORKS</div><h2>Simple for users. Powerful for teams.</h2><div className="steps">
    <div><b>01</b><h3>Report</h3><p>Incidents enter the system with location and priority details.</p></div>
    <div><b>02</b><h3>Monitor</h3><p>Teams see the same live map and status information.</p></div>
    <div><b>03</b><h3>Respond</h3><p>The right responders coordinate and close the incident.</p></div>
   </div></section>
  </main>
  <footer><div className="brand"><span className="brand-mark"><ShieldCheck size={19}/></span>IncidentWatch</div><span>Real-time incident monitoring system · React frontend</span></footer>
 </div>
}
