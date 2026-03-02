// src/components/ui/Loader.jsx
const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="mt-3 text-sm text-gray-600">{text}</p>
    </div>
  );
};

export default Loader;
