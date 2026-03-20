import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e2e8f0,_#f8fafc_55%)] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          Smart Employment System
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/programs"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
          >
            Programs
          </Link>
          <Link
            to="/opportunities"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
          >
            Opportunities
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Login
          </Link>
          <Link
            to="/Register"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section>
          <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            Training, jobs, internships, and placement support in one platform
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight">
            Build skills, apply faster, and connect job seekers with real employers.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            Smart Employment System helps job seekers discover programs and opportunities,
            while institutions manage enrollments, internships, certificates, and job placement.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/Register"
              className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15"
            >
              Create Job Seeker Account
            </Link>
            <Link
              to="/opportunities"
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow"
            >
              Explore Opportunities
            </Link>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <FeatureCard title="Programs" text="Discover hospitality and smart-skills programs with structured learning paths." />
            <FeatureCard title="Opportunities" text="Browse jobs and internships from approved companies and apply quickly." />
            <FeatureCard title="Go To Work" text="Job seekers can request placement support and track progress with the admin team." />
          </div>
        </section>

        <aside className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Why teams use it</p>
          <div className="mt-6 space-y-5">
            <Metric title="All-in-one flow" value="Programs to placement" />
            <Metric title="Role-based access" value="Admin, CEO, ICT, Job Seeker, Employer" />
            <Metric title="Job Seeker Support" value="Enroll, apply, internship, certificates" />
          </div>
          <div className="mt-10 rounded-3xl bg-white/10 p-5">
            <p className="text-sm text-slate-200">
              Ready to get started? Register as a job seeker, wait for approval, and unlock the full platform.
            </p>
            <Link
              to="/Register"
              className="mt-4 inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
            >
              Start Now
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
};

const FeatureCard = ({ title, text }) => (
  <div className="rounded-3xl bg-white p-5 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
  </div>
);

const Metric = ({ title, value }) => (
  <div className="rounded-3xl bg-white/5 p-5">
    <p className="text-sm text-slate-300">{title}</p>
    <p className="mt-2 text-2xl font-bold">{value}</p>
  </div>
);

export default Home;
