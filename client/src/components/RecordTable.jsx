const WORK_TYPE_COLORS = {
  'Servicing': 'bg-blue-100 text-blue-700',
  'Tyre Replacement': 'bg-purple-100 text-purple-700',
  'Oil Change': 'bg-amber-100 text-amber-700',
  'Battery Replacement': 'bg-yellow-100 text-yellow-700',
  'Repair': 'bg-red-100 text-red-700',
  'Insurance Renewal': 'bg-green-100 text-green-700',
  'Fuel': 'bg-orange-100 text-orange-700',
  'Cleaning': 'bg-cyan-100 text-cyan-700',
  'Other': 'bg-gray-100 text-gray-700',
};

const RecordTable = ({ records, onView, onEdit, onDelete, isAdmin, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading records...</p>
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="material-symbols-outlined text-5xl mb-3">inbox</span>
        <p className="font-medium">No records found</p>
        <p className="text-sm">Try adjusting your filters or add a new record</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="table-header text-left rounded-tl-lg">#</th>
            <th className="table-header text-left">Date</th>
            <th className="table-header text-left">Bus No.</th>
            <th className="table-header text-left">Work Type</th>
            <th className="table-header text-left">Vendor</th>
            <th className="table-header text-right">Amount (₹)</th>
            <th className="table-header text-center">Bill</th>
            <th className="table-header text-center rounded-tr-lg">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr key={record._id} className="table-row">
              <td className="py-3 px-4 text-gray-400 text-xs">{idx + 1}</td>
              <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                {new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-bold text-xs px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-sm">directions_bus</span>
                  {record.busNumber}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`badge ${WORK_TYPE_COLORS[record.workType] || 'bg-gray-100 text-gray-700'}`}>
                  {record.workType}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-700">{record.vendorName}</td>
              <td className="py-3 px-4 text-right font-semibold text-gray-800">
                ₹{Number(record.amount).toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-4 text-center">
                {record.billImage ? (
                  <button
                    onClick={() => onView && onView(record)}
                    className="inline-flex items-center gap-1 text-secondary hover:text-primary transition-colors text-xs font-medium"
                  >
                    <span className="material-symbols-outlined text-base">receipt</span>
                    View
                  </button>
                ) : (
                  <span className="text-gray-300 text-xs">—</span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit && onEdit(record)}
                    className="p-1.5 text-gray-400 hover:text-secondary hover:bg-blue-50 rounded transition-all"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => onDelete && onDelete(record)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordTable;
