import { useGetItemsQuery, useGetCategoriesQuery } from "../api/apiSlice";
import { useState, useMemo } from "react";
import { FaFileAlt, FaSearch, FaDownload, FaFilter } from "react-icons/fa";

export default function Reports() {
  const { data: items = [], isLoading } = useGetItemsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem("factoryUser") || "{}");
  const isViewer = user.role === "viewer";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  const filteredItems = useMemo(() => {
    let result = items;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category.name.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      result = result.filter(item => item.category._id === selectedCategory);
    }

    if (stockFilter === "low") {
      result = result.filter(item => item.quantity <= item.minQuantity);
    } else if (stockFilter === "normal") {
      result = result.filter(item => item.quantity > item.minQuantity);
    }

    return result;
  }, [items, searchQuery, selectedCategory, stockFilter]);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const lowStockItems = items.filter(i => i.quantity <= i.minQuantity).length;
    const borrowableItems = items.filter(i => i.borrowable).length;
    const totalValue = items.reduce((sum, i) => sum + i.quantity, 0);

    return { totalItems, lowStockItems, borrowableItems, totalValue };
  }, [items]);

  const handleExportCSV = () => {
    const headers = ["Item Name", "Category", "Quantity", "Unit", "Min Quantity", "Borrowable", "Status"];
    const rows = filteredItems.map(item => [
      item.name,
      item.category.name,
      item.quantity,
      item.unit,
      item.minQuantity,
      item.borrowable ? "Yes" : "No",
      item.quantity <= item.minQuantity ? "Low Stock" : "Normal"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse text-gray-500">
        Loading report data...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header with Role Badge */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaFileAlt className="text-blue-700" /> Inventory Report
            </h1>
            {isViewer && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                View Only
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md print:hidden"
          >
            <FaDownload /> Export CSV
          </button>
          
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 print:grid-cols-4">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-3xl font-bold mb-2">{stats.totalItems}</div>
          <div className="text-blue-100">Total Items</div>
        </div>
        <div className="bg-linear-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-3xl font-bold mb-2">{stats.lowStockItems}</div>
          <div className="text-red-100">Low Stock Items</div>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-3xl font-bold mb-2">{stats.borrowableItems}</div>
          <div className="text-purple-100">Borrowable Items</div>
        </div>
        <div className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-3xl font-bold mb-2">{filteredItems.length}</div>
          <div className="text-green-100">Filtered Results</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
          <FaFilter /> Filters
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stock Levels</option>
            <option value="low">Low Stock Only</option>
            <option value="normal">Normal Stock Only</option>
          </select>
        </div>

        {(searchQuery || selectedCategory || stockFilter !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setStockFilter("all");
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaFileAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-lg">No items found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Min Qty
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Borrowable
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const isLowStock = item.quantity <= item.minQuantity;
                  const availableQty = item.borrowable ? item.quantity - (item.borrowedQuantity || 0) : item.quantity;

                  return (
                    <tr key={item._id} className={`hover:bg-gray-50 transition ${isLowStock ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl || "https://via.placeholder.com/40"}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover print:hidden"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            {item.borrowable && item.borrowedQuantity > 0 && (
                              <div className="text-xs text-orange-600">
                                {item.borrowedQuantity} borrowed
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {item.category.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                          {item.borrowable ? availableQty : item.quantity}
                        </span>
                        {item.borrowable && item.quantity !== availableQty && (
                          <div className="text-xs text-gray-500">
                            (Total: {item.quantity})
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {item.minQuantity}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.borrowable ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isLowStock ? (
                          <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print Footer */}
      <div className="hidden print:block text-center text-sm text-gray-500 mt-8">
        <p>Generated on {new Date().toLocaleString()}</p>
        <p className="mt-1">Factory Store Inventory Management System</p>
        {isViewer && <p className="mt-1 font-medium">Generated by: {user.username} (Viewer)</p>}
      </div>
    </div>
  );
}