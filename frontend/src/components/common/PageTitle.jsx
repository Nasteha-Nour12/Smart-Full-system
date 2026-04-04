// src/components/common/PageTitle.jsx
const PageTitle = ({ title, subtitle, children }) => {
  return (
    <div className="ses-page-title mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/60 bg-white/75 px-5 py-4 shadow-sm backdrop-blur">
      <div>
        <h1 className="ses-title text-2xl font-black text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-600">
            {subtitle}
          </p>
        )}
      </div>

      {children && <div>{children}</div>}
    </div>
  );
};

export default PageTitle;
