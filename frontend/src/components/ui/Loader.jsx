// src/components/ui/Loader.jsx
const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-cyan-500/70 border-t-transparent" />
      <p className="mt-3 text-sm font-medium text-slate-600">{text}</p>
    </div>
  );
};

export default Loader;
