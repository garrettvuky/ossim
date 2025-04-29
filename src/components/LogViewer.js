/**
 * LogViewer acts like a terminal window to display system logs.
 * Scrolls automatically on update.
 * 
 * @param {string} log Log string separated by newline characters
 */
export function LogViewer({ log }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Log</h2>
      <div className="bg-gray-200 h-[30vh] w-full overflow-scroll p-2 text-sm rounded">
        {log.split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
}
