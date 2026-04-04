import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">
          Smart SES System
        </Link>
      </header>

      <main className="mx-auto flex max-w-7xl items-center justify-center px-6 pb-20 pt-16">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">System Login</h1>
          <p className="mt-3 text-sm text-slate-600">
            Fadlan gal si aad u gasho dashboard-ka nidaamka.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Login
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Home;
