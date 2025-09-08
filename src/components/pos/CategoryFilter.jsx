import React from "react";

const CategoryFilter = React.memo(function CategoryFilter({
  categories,
  selectedFilter,
  setFilter,
  label,
}) {
  return (
    <div className="py-2 px-2 ">
      <div className="overflow-x-auto">
        <div className="flex space-x-2 w-ma">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 text-sm font-medium rounded-full border transition-all duration-200 whitespace-nowrap
              ${
                selectedFilter === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default CategoryFilter;
