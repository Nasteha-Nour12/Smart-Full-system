import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProgramsRequest } from "../../api/programs.api";

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoading(true);
        const res = await getProgramsRequest({ status: "OPEN" });
        setPrograms(res.data || []);
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          setRequiresLogin(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicTopbar />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Programs</p>
            <h1 className="mt-2 text-4xl font-black text-slate-900">Available learning tracks</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Explore training programs designed to build employable skills and prepare job seekers for real opportunities.
            </p>
          </div>
          <Link to="/Register" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Join to Enroll
          </Link>
        </div>

        {loading ? <p className="mt-10 text-slate-500">Loading programs...</p> : null}

        {requiresLogin ? (
          <GateCard
            title="Programs are available after login"
            text="Backend-ku hadda wuxuu u baahan yahay account si list-ka buuxa loo helo. Samee account ama login si aad u aragto open programs oo aad isu diiwaangeliso."
          />
        ) : null}

        {!loading && !requiresLogin ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => (
              <div key={program._id} className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">{program.type}</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">{program.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{program.description || "No description"}</p>
                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p>Seats: {program.seats}</p>
                  <p>Fee: ${Number(program.fee || 0).toLocaleString()}</p>
                  <p>Status: {program.status}</p>
                </div>
                <Link
                  to="/Register"
                  className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Register to Enroll
                </Link>
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
};

const PublicTopbar = () => (
  <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <Link to="/" className="text-xl font-bold text-slate-900">
        Smart Employment System
      </Link>
      <div className="flex items-center gap-3">
        <Link to="/opportunities" className="text-sm font-medium text-slate-600">
          Opportunities
        </Link>
        <Link to="/login" className="text-sm font-medium text-slate-600">
          Login
        </Link>
      </div>
    </div>
  </header>
);

const GateCard = ({ title, text }) => (
  <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">
    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    <p className="mt-3 max-w-2xl text-slate-600">{text}</p>
    <div className="mt-6 flex gap-3">
      <Link to="/login" className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold">
        Login
      </Link>
      <Link to="/Register" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
        Register
      </Link>
    </div>
  </div>
);

export default Programs;
