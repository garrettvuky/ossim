import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

const generateProcess = (priority = Math.floor(Math.random() * 10)) => ({
  pid: uuidv4(),
  state: "Ready",
  memory: Math.floor(Math.random() * 100) + 50,
  file: null,
  device: null,
  priority,
  pc: 0,
  registers: {},
  creationTime: Date.now(),
});

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-gray-300 p-5 shadow-md bg-white ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children }) => <div>{children}</div>;

const Button = ({ children, onClick, variant = "default", size = "md" }) => {
  const styles = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-full ${styles[variant]} ${sizes[size]} font-medium transition duration-200`}
    >
      {children}
    </button>
  );
};

const Modal = ({ title, placeholder, isOpen, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isOpen) setInputValue("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded p-2 mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            onSubmit(inputValue);
            onClose();
          }}>Submit</Button>
        </div>
      </div>
    </div>
  );
};




const OSComponent = () => {
  const [processes, setProcesses] = useState([]);
  const [memory, setMemory] = useState(Array(10).fill(null));
  const [fileSystem, setFileSystem] = useState({ name: '/', type: 'folder', children: [] });
  const [selectedPath, setSelectedPath] = useState('/');
  const [devices, setDevices] = useState({ keyboard: null, printer: null });
  const schedulerIndex = useRef(0);
  const [modal, setModal] = useState({ type: null, isOpen: false });
  const [log, setLog] = useState('...');

  useEffect(() => {
    const interval = setInterval(() => {
      setProcesses(prev => {
        const newProcs = [...prev];
        const runningIndex = newProcs.findIndex(p => p.state === "Running");
        if (runningIndex !== -1) newProcs[runningIndex].state = "Ready";
        const readyProcs = newProcs.filter(p => p.state === "Ready");
        if (readyProcs.length > 0) {
          const nextProc = readyProcs.reduce((a, b) => a.creationTime < b.creationTime ? a : b);
          const idx = newProcs.findIndex(p => p.pid === nextProc.pid);
          newProcs[idx].state = "Running";
        }
        return newProcs;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const createProcess = () => {
    const newProc = generateProcess();
    setLog(`${log}\nCreating process ${newProc?.pid}`)
    setProcesses(prev => [...prev, newProc]);
    allocateMemory(newProc.pid);
  };

  const terminateProcess = (pid) => {
    setLog(`${log}\nTerminating process ${pid}`)
    if (Object.values(devices).includes(pid)) {
      setDevices({ ...devices, keyboard: null }) // todo: set specific
    }
    setProcesses(prev => prev.filter(p => p.pid !== pid));
    setMemory(mem => mem.map(m => (m === pid ? null : m)));
  };

  const handleRename = () => setModal({ type: "rename", isOpen: true });
  const handleMove = () => setModal({ type: "move", isOpen: true });

  const allocateMemory = (pid) => {
    setMemory(prev => {
      const newMemory = [...prev];
      for (let i = 0; i < newMemory.length; i++) {
        if (newMemory[i] === null) {
          newMemory[i] = pid;
          break;
        }
      }
      return newMemory;
    });
  };

  const traverseAndAct = (node, segments, action) => {
    if (segments.length === 0) return action(node);
    const next = node.children?.find(c => c.name === segments[0]);
    if (next) traverseAndAct(next, segments.slice(1), action);
  };

  const addFileOrFolder = (path, item) => {
    setLog(`${log}\nAdding ${item.name} at path ${path}`)
    setFileSystem(prev => {
      const newFS = JSON.parse(JSON.stringify(prev));
      traverseAndAct(newFS, path.split('/').filter(Boolean), (node) => {
        if (!node.children) node.children = [];
        node.children.push(item);
      });
      return newFS;
    });
  };

  const renameItem = (path, newName) => {
    setLog(`${log}\nRenaming ${path} to ${newName}`)
    setFileSystem(prev => {
      const newFS = JSON.parse(JSON.stringify(prev));
      const segments = path.split('/').filter(Boolean);
      const itemName = segments.pop();
      traverseAndAct(newFS, segments, (node) => {
        const item = node.children?.find(c => c.name === itemName);
        if (item) item.name = newName;
      });
      return newFS;
    });
  };

  const deleteItem = (path) => {
    setLog(`${log}\nDeleting item at ${path}`)
    setFileSystem(prev => {
      const newFS = JSON.parse(JSON.stringify(prev));
      const segments = path.split('/').filter(Boolean);
      const itemName = segments.pop();
      traverseAndAct(newFS, segments, (node) => {
        node.children = node.children?.filter(c => c.name !== itemName);
      });
      return newFS;
    });
  };

  const moveItem = (sourcePath, targetPath) => {
    setLog(`${log}\nMoving ${sourcePath} to ${targetPath}`)
    let movingItem = null;
    const updatedFS = JSON.parse(JSON.stringify(fileSystem));
    const srcSegments = sourcePath.split('/').filter(Boolean);
    const tgtSegments = targetPath.split('/').filter(Boolean);
    const itemName = srcSegments.pop();

    traverseAndAct(updatedFS, srcSegments, (node) => {
      const index = node.children?.findIndex(c => c.name === itemName);
      if (index !== -1) movingItem = node.children.splice(index, 1)[0];
    });

    if (movingItem) {
      traverseAndAct(updatedFS, tgtSegments, (node) => {
        if (!node.children) node.children = [];
        node.children.push(movingItem);
      });
    }

    setFileSystem(updatedFS);
  };

  const renderFileTree = (node, path = '', depth = 0) => (
    <div key={path} className="ml-4">
      <div
        style={{ marginLeft: depth * 16, cursor: 'pointer' }}
        className={`cursor-pointer ${selectedPath === path ? 'text-indigo-600 font-semibold' : ''}`}
        onClick={(e) => {
          setSelectedPath(path)
        }}
      >
        {node.type === 'folder' ? '📁' : '📄'} {node.name}
      </div>
      {node.children && node.children.map(child =>
        renderFileTree(child, `${path}/${child.name}`, depth + 1)
      )}
    </div>
  );

  const requestDevice = (pid, device) => {
    setLog(`${log}\nProcess ${pid} requested ${device}`)
    setDevices(prev => {
      if (prev[device] === null) return { ...prev, [device]: pid };
      return prev;
    });
  };

  const releaseDevice = (device) => {
    setLog(`${log}\nReleased ${device}`)
    setDevices(prev => ({ ...prev, [device]: null }));
  };

  return (
    
    <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 min-h-screen">
      <Modal
        title={modal.type === "rename" ? "Rename Item" : "Move Item"}
        placeholder={modal.type === "rename" ? "Enter new name" : "Enter target path (e.g., /folder)"}
        isOpen={modal.isOpen}
        onClose={() => setModal({ type: null, isOpen: false })}
        onSubmit={(value) => {
          if (modal.type === "rename") renameItem(selectedPath, value);
          else if (modal.type === "move") moveItem(selectedPath, value);
        }}
      />
      <Card className="col-span-2">
        <CardContent>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={createProcess}>Create Process</Button>
            <Button onClick={() => addFileOrFolder(selectedPath, { name: 'new-folder', type: 'folder', children: [] })}>Add Folder</Button>
            <Button onClick={() => addFileOrFolder(selectedPath, { name: 'new-file.txt', type: 'file' })}>Add File</Button>
            <Button onClick={handleRename}>Rename</Button>
            <Button onClick={() => deleteItem(selectedPath)}>Delete</Button>
            <Button onClick={handleMove}>Move</Button>
            <Button onClick={() => requestDevice(processes[0]?.pid, "keyboard")}>Request Keyboard</Button>
            <Button onClick={() => releaseDevice("keyboard")}>Release Keyboard</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-3">Processes</h2>
          <AnimatePresence>
            {processes.map(proc => (
              <motion.div
                key={proc.pid}
                className="p-3 border rounded-xl mb-3 bg-indigo-50 shadow-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col">
                  <div className="font-medium">
                    PID: {proc.pid.slice(0, 6)} | State: {proc.state} | Mem: {proc.memory}MB | Prio: {proc.priority}
                  </div>
                  <div className="text-sm text-gray-600">
                    PC: {proc.pc} | Registers: {JSON.stringify(proc.registers)}
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button size="sm" variant="destructive" onClick={() => terminateProcess(proc.pid)}>Kill</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-3">Memory (Paging)</h2>
          <div className="grid grid-cols-5 gap-3">
            {memory.map((slot, i) => (
              <div key={i} className="p-2 border rounded text-center bg-white text-sm">
                {slot ? slot.slice(0, 4) : "Empty"}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-3">File System</h2>
          <div className="text-sm text-gray-700">
            {renderFileTree(fileSystem, '')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-3">I/O Devices</h2>
          <ul className="text-sm">
            {Object.entries(devices).map(([device, user]) => (
              <li key={device}>
                {device.toUpperCase()}: {user ? `Used by ${user.slice(0, 6)}` : "Available"}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card style={{backgroundColor: 'grey', borderWidth: '1px', borderColor: 'black', height: '30vh', width: '50%', overflow: 'scroll'}}>
        <CardContent>
          <h2 className="text-xl font-semibold mb-3">Log</h2>
          <div className="bg-gray-200 h-[30vh] w-full overflow-scroll p-2 text-sm">
            {log.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSComponent;