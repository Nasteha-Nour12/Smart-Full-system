const Input = ({ label, type = "text", error, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}

      <input
        type={type}
        className={`rounded-xl border bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${
          error ? "border-red-400" : "border-slate-300"
        } ${className}`}
        {...props}
      />

      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
};

export default Input;
