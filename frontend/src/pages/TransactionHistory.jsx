// src/pages/TransactionHistory.jsx
import { useGetTransactionsQuery } from "../api/apiSlice";
import { FaBoxOpen, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function TransactionHistory() {
  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useGetTransactionsQuery();

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse text-gray-500">
        Loading transactions...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load transactions.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaBoxOpen />
          Transaction History
        </h1>

        <Link
          to="/transactions"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700"
        >
          <FaArrowLeft />
          Back to Stock Actions
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaBoxOpen className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-lg">No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Item
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Issued To
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr
                    key={tx._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>
                        {new Date(tx.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleTimeString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {tx.item?.name || "Deleted Item"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${
                          tx.type === "IN"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tx.type === "IN" ? "Added" : "Issued"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {tx.quantity} {tx.item?.unit || ""}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {tx.receiver || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
