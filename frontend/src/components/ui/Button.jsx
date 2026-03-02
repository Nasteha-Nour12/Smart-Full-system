// src/components/ui/Button.jsx
const Button = ({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) => {
  const base =
    "px-4 py-2 rounded font-medium transition focus:outline-none disabled:opacity-50";

  const variants = {
    primary: "bg-black text-white hover:bg-black",
    danger: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
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
