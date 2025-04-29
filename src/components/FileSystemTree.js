/**
 * Renders a visual file system tree with selectable nodes.
 * Highlights the selected node.
 * 
 * @param {Object} fileSystem The root node of the file system
 * @param {string} selectedPath The currently selected path
 * @param {Function} setSelectedPath Function to update the selected path
 */
export function FileSystemTree({ fileSystem, selectedPath, setSelectedPath }) {
  const renderFileTree = (node, path = '', depth = 0) => ( 
    <div key={path} className="ml-4">
      <div
        style={{ marginLeft: depth * 16, cursor: 'pointer' }}
        className={`p-1 rounded ${selectedPath === path ? 'bg-blue-100 text-indigo-700 font-bold' : ''}`}
        onClick={() => setSelectedPath(path)}
      >
        {node.type === 'folder' ? '📁' : '📄'} {node.name}
      </div>
      {node.children && node.children.map(child =>
        renderFileTree(child, `${path}/${child.name}`, depth + 1)
      )}
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">File System</h2>
      <div className="text-sm text-gray-700">
        {renderFileTree(fileSystem, '')}
      </div>
    </div>
  );
}
