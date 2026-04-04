const Button = ({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary: "bg-slate-900 text-white shadow-sm hover:-translate-y-0.5 hover:bg-slate-800",
    danger: "bg-red-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-700",
    secondary: "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50",
  };

  return (
    <button
      type={type}
      disabled={loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;
