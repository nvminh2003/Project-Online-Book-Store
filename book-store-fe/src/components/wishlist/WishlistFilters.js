// import React from "react";

// const WishlistFilters = ({ filters, onFiltersChange }) => {
//   const handleFilterChange = (key, value) => {
//     onFiltersChange({ [key]: value });
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         {/* <div className="flex items-center space-x-4">
//           <label className="flex items-center">
//             <input
//               type="checkbox"
//               checked={filters.filterAvailable}
//               onChange={(e) =>
//                 handleFilterChange("filterAvailable", e.target.checked)
//               }
//               className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
//             />
//             <span className="ml-2 text-sm text-gray-700">
//               Show only available items
//             </span>
//           </label>
//         </div> */}

//         <div className="flex items-center space-x-4">
//           <label className="text-sm text-gray-700">Sort by:</label>
//           <select
//             value={filters.sortBy}
//             onChange={(e) => handleFilterChange("sortBy", e.target.value)}
//             className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
//           >
//             <option value="dateAdded">Date Added</option>
//             <option value="price">Price</option>
//             <option value="name">Name</option>
//           </select>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WishlistFilters;
