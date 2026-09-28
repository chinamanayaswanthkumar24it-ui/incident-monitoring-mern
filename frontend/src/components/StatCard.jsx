export default function StatCard({icon:Icon,label,value,trend, tone="blue"}) {
  return <div className="stat-card">
    <div className={`stat-icon ${tone}`}><Icon size={21}/></div>
    <div className="stat-copy"><span>{label}</span><strong>{value}</strong><small className={trend?.startsWith("+") ? "positive" : ""}>{trend}</small></div>
  </div>
}
