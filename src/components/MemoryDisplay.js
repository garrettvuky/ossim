/**
 * Displays the system memory slots with process identifiers or empty states.
 * 
 * @param {Array} memory Array representing memory slots (filled with process IDs or null)
 */
export function MemoryDisplay({ memory }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Memory</h2>
      <div className="grid grid-cols-5 gap-3">
        {memory.map((slot, i) => (
          <div key={i} className="p-2 border rounded text-center bg-white text-sm">
            {slot ? slot.slice(0, 4) : "Empty"}
          </div>
        ))}
      </div>
    </div>
  );
}
