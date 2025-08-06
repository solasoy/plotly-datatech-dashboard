import React, { useState, useMemo } from 'react';

interface DataTableProps {
  data: any[];
  title: string;
  maxRows?: number;
  searchable?: boolean;
  sortable?: boolean;
  exportable?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  title,
  maxRows = 100,
  searchable = true,
  sortable = true,
  exportable = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  // Get columns from first row
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let processedData = [...data];

    // Apply search filter
    if (searchTerm) {
      processedData = processedData.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn) {
      processedData.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        // Handle different data types
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    return processedData;
  }, [data, searchTerm, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleExport = () => {
    const csvContent = [
      columns.join(','), // Header
      ...filteredAndSortedData.map(row =>
        columns.map(col => `"${String(row[col]).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    
    if (typeof value === 'number') {
      // Format numbers with appropriate precision
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      } else {
        return parseFloat(value.toFixed(2)).toLocaleString();
      }
    }
    
    return String(value);
  };

  const getColumnType = (column: string): string => {
    if (filteredAndSortedData.length === 0) return 'text';
    
    const sampleValues = filteredAndSortedData
      .slice(0, 10)
      .map(row => row[column])
      .filter(val => val !== null && val !== undefined);
    
    if (sampleValues.length === 0) return 'text';
    
    const firstValue = sampleValues[0];
    
    if (typeof firstValue === 'number') {
      const hasDecimals = sampleValues.some(val => !Number.isInteger(val));
      return hasDecimals ? 'decimal' : 'integer';
    }
    
    if (typeof firstValue === 'boolean') return 'boolean';
    
    // Check if it looks like a date
    if (typeof firstValue === 'string' && !isNaN(Date.parse(firstValue))) {
      return 'date';
    }
    
    return 'text';
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{filteredAndSortedData.length} of {data.length} records</span>
            {exportable && (
              <button
                onClick={handleExport}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                📥 Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        {searchable && (
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search all columns..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                #
              </th>
              {columns.map(column => (
                <th
                  key={column}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b ${
                    sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={sortable ? () => handleSort(column) : undefined}
                >
                  <div className="flex items-center space-x-1">
                    <div className="flex flex-col">
                      <span className="truncate" title={column}>
                        {column.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-normal text-gray-400">
                        {getColumnType(column)}
                      </span>
                    </div>
                    {sortable && (
                      <div className="text-gray-400">
                        {sortColumn === column ? (
                          sortDirection === 'asc' ? '↑' : '↓'
                        ) : (
                          '↕'
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-400 font-medium">
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </td>
                {columns.map(column => (
                  <td key={column} className="px-4 py-3 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={formatValue(row[column])}>
                      {formatValue(row[column])}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else {
                const start = Math.max(1, currentPage - 2);
                pageNum = Math.min(start + i, totalPages);
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;