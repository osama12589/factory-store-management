// src/pages/TransactionHistory.jsx
import { useRef } from "react";
import { useGetTransactionsQuery } from "../api/apiSlice";
import { FaBoxOpen, FaArrowLeft, FaPrint } from "react-icons/fa";
import { Link } from "react-router-dom";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString();
}

/** Stable 8-char ref number derived from the Mongo _id */
function slipRef(id = "") {
  return id.slice(-8).toUpperCase();
}

// Helper to get transaction type configuration
function getTxTypeConfig(type) {
  switch (type) {
    case "IN":
      return { 
        text: "▲ STOCK IN (Added)", 
        bg: "#dcfce7", 
        color: "#166534", 
        label: "Added", 
        badgeBg: "bg-green-100 text-green-800" 
      };
    case "BORROW":
      return { 
        text: "⬈ BORROWED", 
        bg: "#f3e8ff", 
        color: "#6b21a8", 
        label: "Borrowed", 
        badgeBg: "bg-purple-100 text-purple-800" 
      };
    case "RETURN":
      return { 
        text: "⬊ RETURNED", 
        bg: "#e0f2fe", 
        color: "#0369a1", 
        label: "Returned", 
        badgeBg: "bg-blue-100 text-blue-800" 
      };
    case "OUT":
    default:
      return { 
        text: "▼ STOCK OUT (Issued)", 
        bg: "#fee2e2", 
        color: "#991b1b", 
        label: "Issued", 
        badgeBg: "bg-red-100 text-red-800" 
      };
  }
}

// ─── Print Slip Component ────────────────────────────────────────────────────

function PrintSlip({ tx }) {
  const config = getTxTypeConfig(tx.type);

  return (
    <div
      style={{
        width: "72mm",
        padding: "16px 20px",
        fontFamily: "'Courier New', Courier, monospace",
        background: "#fff",
        color: "#1a1a2e",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        fontSize: "11px",
        lineHeight: "1.5",
      }}
    >
      {/* Header band */}
      <div
        style={{
          background: "#1a1a2e",
          color: "#fff",
          textAlign: "center",
          padding: "10px 8px",
          marginBottom: "12px",
          borderRadius: "4px",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: "bold", letterSpacing: "0.08em" }}>
          WALCHEM INDUSTRIES PVT LTD.
        </div>
        <div style={{ fontSize: "9px", opacity: 0.7, marginTop: "2px", letterSpacing: "0.05em" }}>
          STOCK TRANSACTION SLIP
        </div>
      </div>

      {/* Ref + date */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "8px", color: "#6b7280", textTransform: "uppercase" }}>Ref #</div>
          <div style={{ fontWeight: "bold", letterSpacing: "0.12em", color: "#1a1a2e" }}>
            {slipRef(tx._id)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "8px", color: "#6b7280", textTransform: "uppercase" }}>Date</div>
          <div>{formatDate(tx.createdAt)}</div>
          <div style={{ fontSize: "9px", color: "#6b7280" }}>{formatTime(tx.createdAt)}</div>
        </div>
      </div>

      {/* Dashed divider */}
      <div style={{ borderTop: "1.5px dashed #d1d5db", margin: "10px 0" }} />

      {/* Transaction type pill */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "3px 16px",
            borderRadius: "999px",
            fontSize: "10px",
            fontWeight: "bold",
            background: config.bg,
            color: config.color,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {config.text}
        </span>
      </div>

      {/* Item + Qty */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <div>
          <div style={{ fontSize: "8px", color: "#6b7280", textTransform: "uppercase" }}>Item</div>
          <div style={{ fontWeight: "bold", fontSize: "13px" }}>
            {tx.item?.name || "Deleted Item"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "8px", color: "#6b7280", textTransform: "uppercase" }}>Qty</div>
          <div style={{ fontWeight: "bold", fontSize: "13px" }}>
            {tx.quantity} {tx.item?.unit || ""}
          </div>
        </div>
      </div>

      {/* Receiver */}
      {tx.receiver && (
        <div style={{ marginBottom: "6px" }}>
          <div style={{ fontSize: "8px", color: "#6b7280", textTransform: "uppercase" }}>
            {tx.type === "BORROW" ? "Borrowed By" : tx.type === "RETURN" ? "Returned By" : "Issued To"}
          </div>
          <div style={{ fontWeight: "600" }}>{tx.receiver}</div>
        </div>
      )}

      {/* Dashed divider */}
      <div style={{ borderTop: "1.5px dashed #d1d5db", margin: "10px 0" }} />

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "8px", color: "#9ca3af" }}>
        <div>Generated by StockManager</div>
        <div style={{ marginTop: "2px", letterSpacing: "0.15em" }}>{slipRef(tx._id)}</div>
      </div>
    </div>
  );
}

// ─── Print helpers ────────────────────────────────────────────────────────────

function printSlip(slipHTML) {
  const win = window.open("", "_blank", "width=400,height=600");
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Transaction Slip</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #f3f4f6; display: flex; justify-content: center;
                 padding: 24px; font-family: 'Courier New', Courier, monospace; }
          @media print {
            body { background: white; padding: 0; }
            .no-print { display: none; }
            @page { margin: 8mm; size: 80mm auto; }
          }
        </style>
      </head>
      <body>
        ${slipHTML}
        <div class="no-print" style="margin-top:16px;text-align:center;">
          <button onclick="window.print()" 
            style="padding:8px 24px;background:#1a1a2e;color:#fff;border:none;
                   border-radius:6px;cursor:pointer;font-size:13px;">
            🖨️ Print
          </button>
        </div>
      </body>
    </html>
  `);
  win.document.close();
}

function getSlipHTML(tx) {
  const config = getTxTypeConfig(tx.type);
  const ref = slipRef(tx._id);
  const date = formatDate(tx.createdAt);
  const time = formatTime(tx.createdAt);
  const userLabel = tx.type === "BORROW" ? "Borrowed By" : tx.type === "RETURN" ? "Returned By" : "Issued To";

  return `
    <div style="width:72mm;padding:16px 20px;font-family:'Courier New',Courier,monospace;
                background:#fff;color:#1a1a2e;border:1px solid #e5e7eb;
                border-radius:6px;font-size:11px;line-height:1.5;">
      <div style="background:#1a1a2e;color:#fff;text-align:center;padding:10px 8px;
                  margin-bottom:12px;border-radius:4px;">
        <div style="font-size:13px;font-weight:bold;letter-spacing:0.08em;">WALCHEM INDUSTRIES PVT LTD.</div>
        <div style="font-size:9px;opacity:0.7;margin-top:2px;letter-spacing:0.05em;">STOCK TRANSACTION SLIP</div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <div>
          <div style="font-size:8px;color:#6b7280;text-transform:uppercase;">Ref #</div>
          <div style="font-weight:bold;letter-spacing:0.12em;">${ref}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:8px;color:#6b7280;text-transform:uppercase;">Date</div>
          <div>${date}</div>
          <div style="font-size:9px;color:#6b7280;">${time}</div>
        </div>
      </div>
      <div style="border-top:1.5px dashed #d1d5db;margin:10px 0;"></div>
      <div style="text-align:center;margin-bottom:10px;">
        <span style="display:inline-block;padding:3px 16px;border-radius:999px;font-size:10px;
                     font-weight:bold;background:${config.bg};
                     color:${config.color};letter-spacing:0.1em;text-transform:uppercase;">
          ${config.text}
        </span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <div>
          <div style="font-size:8px;color:#6b7280;text-transform:uppercase;">Item</div>
          <div style="font-weight:bold;font-size:13px;">${tx.item?.name || "Deleted Item"}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:8px;color:#6b7280;text-transform:uppercase;">Qty</div>
          <div style="font-weight:bold;font-size:13px;">${tx.quantity} ${tx.item?.unit || ""}</div>
        </div>
      </div>
      ${tx.receiver
        ? `<div style="margin-bottom:6px;">
             <div style="font-size:8px;color:#6b7280;text-transform:uppercase;">${userLabel}</div>
             <div style="font-weight:600;">${tx.receiver}</div>
           </div>`
        : ""
      }
      <div style="border-top:1.5px dashed #d1d5db;margin:10px 0;"></div>
      <div style="text-align:center;font-size:8px;color:#9ca3af;">
        <div>Generated by StockManager</div>
        <div style="margin-top:2px;letter-spacing:0.15em;">${ref}</div>
      </div>
    </div>
  `;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransactionHistory() {
  const { data: transactions = [], isLoading, isError } = useGetTransactionsQuery();

  function handlePrintSingle(tx) {
    printSlip(getSlipHTML(tx));
  }

  function handlePrintAll() {
    if (transactions.length === 0) return;

    const allSlips = transactions
      .map(
        (tx, i) =>
          `<div style="page-break-after:${i < transactions.length - 1 ? "always" : "avoid"};">
            ${getSlipHTML(tx)}
          </div>`
      )
      .join("");

    printSlip(allSlips);
  }

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaBoxOpen />
          Transaction History
        </h1>

        <div className="flex items-center gap-3">
          {transactions.length > 0 && (
            <button
              onClick={handlePrintAll}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] hover:bg-[#16213e]
                         text-white rounded-lg transition text-sm font-medium"
            >
              <FaPrint className="text-xs" />
              Print All Slips
            </button>
          )}

          <Link
            to="/transactions"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200
                       rounded-lg transition text-gray-700"
          >
            <FaArrowLeft />
            Back to Stock Actions
          </Link>
        </div>
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
                    Party / Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Slip
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => {
                  const config = getTxTypeConfig(tx.type);
                  return (
                    <tr key={tx._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>{formatDate(tx.createdAt)}</div>
                        <div className="text-xs text-gray-500">{formatTime(tx.createdAt)}</div>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {tx.item?.name || "Deleted Item"}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${config.badgeBg}`}>
                          {config.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {tx.quantity} {tx.item?.unit || ""}
                      </td>

                      <td className="px-6 py-4 text-gray-600">{tx.receiver || "—"}</td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handlePrintSingle(tx)}
                          title="Print slip"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                     bg-[#1a1a2e] hover:bg-[#16213e] text-white rounded-lg
                                     transition"
                        >
                          <FaPrint className="text-xs" />
                          Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}