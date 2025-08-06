import React, { useState } from 'react';
import { ScriptTemplatesProps } from '../../types/python.types';
import { TEMPLATE_CATEGORIES, searchTemplates } from '../../lib/scriptTemplates';

const ScriptTemplates: React.FC<ScriptTemplatesProps> = ({
  templates,
  onSelectTemplate,
  onSaveScript,
  selectedCategory,
  onCategoryChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewScriptModalOpen, setIsNewScriptModalOpen] = useState(false);
  const [newScriptName, setNewScriptName] = useState('');
  const [newScriptDescription, setNewScriptDescription] = useState('');

  const filteredTemplates = searchQuery 
    ? searchTemplates(searchQuery)
    : selectedCategory 
      ? templates.filter(t => t.category === selectedCategory)
      : templates;

  const handleSaveNewScript = () => {
    if (newScriptName.trim() && newScriptDescription.trim()) {
      onSaveScript(newScriptName, newScriptDescription, '# Add your custom Python code here\nprint("Hello, World!")');
      setIsNewScriptModalOpen(false);
      setNewScriptName('');
      setNewScriptDescription('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 bg-gray-100 border-b">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Script Templates</span>
          <button
            onClick={() => setIsNewScriptModalOpen(true)}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            + New Script
          </button>
        </div>
        
        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => {
              onCategoryChange?.('');
              setSearchQuery('');
            }}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              !selectedCategory 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {TEMPLATE_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => {
                onCategoryChange?.(category.id);
                setSearchQuery('');
              }}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedCategory === category.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {filteredTemplates.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-8">
            {searchQuery ? 'No templates match your search' : 'No templates available'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="border rounded p-3 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {template.name}
                  </h4>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.icon} 
                    {template.category.replace('-', ' ')}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 mb-2">
                  {template.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <span 
                      key={tag}
                      className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Script Modal */}
      {isNewScriptModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Create New Script</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Script Name
                </label>
                <input
                  type="text"
                  value={newScriptName}
                  onChange={(e) => setNewScriptName(e.target.value)}
                  placeholder="Enter script name..."
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newScriptDescription}
                  onChange={(e) => setNewScriptDescription(e.target.value)}
                  placeholder="Enter script description..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setIsNewScriptModalOpen(false);
                  setNewScriptName('');
                  setNewScriptDescription('');
                }}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewScript}
                disabled={!newScriptName.trim() || !newScriptDescription.trim()}
                className={`px-4 py-2 rounded transition-colors ${
                  newScriptName.trim() && newScriptDescription.trim()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Create Script
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptTemplates;