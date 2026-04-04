const StatCard = ({ label, value, hint }) => {
  return (
    <div className="ses-card rounded-2xl bg-gradient-to-b from-white to-slate-50/60 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
};

export default StatCard;
