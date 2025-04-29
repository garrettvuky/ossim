/**
 * Displays a list of I/O devices and their usage state.
 * 
 * @param {Object} devices Mapping of device name to process ID or null
 */
export function DeviceList({ devices }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">I/O Devices</h2>
      <ul className="text-sm">
        {Object.entries(devices).map(([device, user]) => (
          <li key={device}>
            {device.toUpperCase()}: {user ? `Used by ${user.slice(0, 6)}` : "Available"}
          </li>
        ))}
      </ul>
    </div>
  );
}
