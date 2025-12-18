import { useGetTransactionsQuery } from "../api/apiSlice";
import { FaBoxOpen, FaArrowLeft, FaPrint } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import PrintSlip from "../components/PrintSlip";

export default function TransactionHistory() {
  const { data: transactions = [], isLoading } = useGetTransactionsQuery();
  const [printTransaction, setPrintTransaction] = useState(null);

  const getTransactionBadge = (type) => {
    const badges = {
      IN: { bg: "bg-green-100", text: "text-green-800", label: "Added" },
      OUT: { bg: "bg-red-100", text: "text-red-800", label: "Issued" },
      BORROW: { bg: "bg-purple-100", text: "text-purple-800", label: "Borrowed" },
      RETURN: { bg: "bg-blue-100", text: "text-blue-800", label: "Returned" },
    };
    return badges[type] || badges.IN;
  };

  const handlePrint = (transaction) => {
    setPrintTransaction(transaction);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse text-gray-500">
        Loading transactions...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaBoxOpen /> Transaction History
        </h1>
        <Link
          to="/transactions"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700"
        >
          <FaArrowLeft /> Back to Stock Actions
        </Link>
      </div>

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
                    Person/Dept
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => {
                  const badge = getTransactionBadge(tx.type);
                  const canPrint = tx.type === 'OUT' || tx.type === 'BORROW';
                  
                  return (
                    <tr key={tx._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {tx.item.name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {tx.quantity} {tx.item.unit}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {tx.receiver || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {tx.type === 'BORROW' && tx.status && (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            tx.status === 'RETURNED' 
                              ? 'bg-green-100 text-green-800'
                              : tx.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tx.status}
                          </span>
                        )}
                        {tx.type === 'BORROW' && tx.expectedReturnDate && tx.status !== 'RETURNED' && (
                          <div className="text-xs text-gray-500 mt-1">
                            Due: {new Date(tx.expectedReturnDate).toLocaleDateString()}
                          </div>
                        )}
                        {tx.type === 'RETURN' && tx.returnedAt && (
                          <div className="text-xs text-gray-500">
                            Returned: {new Date(tx.returnedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {canPrint && (
                          <button
                            onClick={() => handlePrint(tx)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
                            title="Print Slip"
                          >
                            <FaPrint /> Print
                          </button>
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

      {/* PRINT SLIP MODAL */}
      {printTransaction && (
        <PrintSlip
          transaction={printTransaction}
          onClose={() => setPrintTransaction(null)}
        />
      )}
    </div>
  );
}