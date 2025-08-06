import React, { useMemo } from 'react';
import { DataPreviewProps } from '../../types/python.types';

const DataPreview: React.FC<DataPreviewProps> = ({
  data,
  maxRows = 100,
  maxCols = 10
}) => {
  const { previewData, totalRows, totalCols, columns, hasMoreRows, hasMoreCols } = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        previewData: [],
        totalRows: 0,
        totalCols: 0,
        columns: [],
        hasMoreRows: false,
        hasMoreCols: false
      };
    }

    const totalRows = data.length;
    const firstRow = data[0];
    const allColumns = Object.keys(firstRow);
    const totalCols = allColumns.length;
    
    // Limit columns displayed
    const columns = allColumns.slice(0, maxCols);
    const hasMoreCols = allColumns.length > maxCols;
    
    // Limit rows displayed
    const previewData = data.slice(0, maxRows);
    const hasMoreRows = data.length > maxRows;

    return {
      previewData,
      totalRows,
      totalCols,
      columns,
      hasMoreRows,
      hasMoreCols
    };
  }, [data, maxRows, maxCols]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'number') {
      // Format numbers with reasonable precision
      if (Number.isInteger(value)) {
        return value.toString();
      } else {
        return parseFloat(value.toPrecision(6)).toString();
      }
    }
    
    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    }
    
    if (typeof value === 'string') {
      // Truncate very long strings
      return value.length > 100 ? `${value.substring(0, 100)}...` : value;
    }
    
    return String(value);
  };

  const getColumnType = (column: string): string => {
    if (previewData.length === 0) return 'unknown';
    
    const sampleValues = previewData
      .slice(0, 10)
      .map(row => row[column])
      .filter(val => val !== null && val !== undefined);
    
    if (sampleValues.length === 0) return 'null';
    
    const firstValue = sampleValues[0];
    const valueType = typeof firstValue;
    
    if (valueType === 'number') {
      const hasDecimals = sampleValues.some(val => !Number.isInteger(val));
      return hasDecimals ? 'float' : 'int';
    }
    
    return valueType;
  };

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-2 bg-gray-100 border-b">
          <span className="text-sm font-medium text-gray-700">Data Preview</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No data to display
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 bg-gray-100 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Data Preview</span>
          <span className="text-xs text-gray-500">
            {totalRows} rows × {totalCols} columns
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 border-b">
                #
              </th>
              {columns.map(column => (
                <th
                  key={column}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b min-w-24"
                >
                  <div className="flex flex-col">
                    <span className="truncate" title={column}>
                      {column}
                    </span>
                    <span className="text-xs text-gray-400 font-normal">
                      {getColumnType(column)}
                    </span>
                  </div>
                </th>
              ))}
              {hasMoreCols && (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 border-b">
                  +{totalCols - maxCols} more...
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-2 py-2 text-xs text-gray-400 border-b">
                  {index + 1}
                </td>
                {columns.map(column => (
                  <td
                    key={column}
                    className="px-3 py-2 border-b text-gray-900 max-w-xs"
                  >
                    <div className="truncate" title={formatValue(row[column])}>
                      {formatValue(row[column])}
                    </div>
                  </td>
                ))}
                {hasMoreCols && (
                  <td className="px-3 py-2 text-gray-400 border-b text-xs">
                    ...
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {hasMoreRows && (
          <div className="p-3 text-center bg-gray-50 border-t">
            <span className="text-sm text-gray-500">
              ... and {totalRows - maxRows} more rows
            </span>
          </div>
        )}
      </div>

      {(hasMoreRows || hasMoreCols) && (
        <div className="p-2 bg-yellow-50 border-t border-yellow-200 text-xs text-yellow-700">
          <span className="font-medium">Preview limited:</span>
          {hasMoreRows && ` showing first ${maxRows} rows`}
          {hasMoreRows && hasMoreCols && ', '}
          {hasMoreCols && ` showing first ${maxCols} columns`}
        </div>
      )}
    </div>
  );
};

export default DataPreview;