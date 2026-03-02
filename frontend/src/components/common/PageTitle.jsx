// src/components/common/PageTitle.jsx
const PageTitle = ({ title, subtitle, children }) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {children && <div>{children}</div>}
    </div>
  );
};

export default PageTitle;
