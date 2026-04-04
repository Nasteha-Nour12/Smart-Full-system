// src/layouts/AuthLayout.jsx
const AuthLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#07142F] via-[#0A1F46] to-[#0C2D61] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-10 top-8 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-8 h-52 w-52 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-cyan-100/20 bg-slate-950/75 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
