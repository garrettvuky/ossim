// Updated App.js with LRU Paging, Better Log, and Full Documentation

import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, Button, Modal, ProcessList, MemoryDisplay, FileSystemTree, DeviceList, LogViewer } from "./index";

/**
 * Generates a new simulated process object.
 * @param {number} priority Optional priority value (default random).
 * @returns {Object} New process.
 */
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

/** Simple CardContent wrapper */
const CardContent = ({ children }) => <div>{children}</div>;

/**
 * Main OSComponent - simulates an Operating System scheduler, memory, filesystem, devices, and logs.
 */
const OSComponent = () => {
  const [processes, setProcesses] = useState([]);
  const [memory, setMemory] = useState(Array(16).fill(null)); // Now 16 slots
  const [lastAccess, setLastAccess] = useState({}); // Track last access timestamps per memory slot
  const [fileSystem, setFileSystem] = useState({ name: '/', type: 'folder', children: [] });
  const [selectedPath, setSelectedPath] = useState('/');
  const [devices, setDevices] = useState({ keyboard: null, printer: null });
  const schedulerIndex = useRef(0);
  const [modal, setModal] = useState({ type: null, isOpen: false });
  const [log, setLog] = useState('...');
  const logEndRef = useRef(null);

  /**
   * Scheduler effect - cycles processes every 2s.
   */
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

          // Update memory lastAccess when scheduled
          setLastAccess(prev => {
            const updated = { ...prev };
            Object.entries(memory).forEach(([i, val]) => {
              if (val === nextProc.pid) updated[i] = Date.now();
            });
            return updated;
          });
        }
        return newProcs;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [memory]);

  /** Scroll to bottom when log updates */
  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const createProcess = () => {
    const newProc = generateProcess();
    setLog(prev => `${prev}\nCreating process ${newProc?.pid}`);
    setProcesses(prev => [...prev, newProc]);
    allocateMemory(newProc.pid);
  };

  const terminateProcess = (pid) => {
    setLog(prev => `${prev}\nTerminating process ${pid}`);
    setProcesses(prev => prev.filter(p => p.pid !== pid));
    setMemory(mem => mem.map(m => (m === pid ? null : m)));
  };

  const allocateMemory = (pid) => {
    setMemory(prev => {
      const newMemory = [...prev];
      let idx = newMemory.findIndex(m => m === null);
      if (idx === -1) {
        // Memory full - apply LRU replacement
        const oldestIdx = Object.keys(lastAccess).sort((a, b) => lastAccess[a] - lastAccess[b])[0];
        idx = parseInt(oldestIdx);
        newMemory[idx] = pid;
      } else {
        newMemory[idx] = pid;
      }
      setLastAccess(prev => ({ ...prev, [idx]: Date.now() }));
      return newMemory;
    });
  };

  /** Recursively traverse FS tree and apply action */
  const traverseAndAct = (node, segments, action) => {
    if (segments.length === 0) return action(node);
    const next = node.children?.find(c => c.name === segments[0]);
    if (next) traverseAndAct(next, segments.slice(1), action);
  };

  /** Add file or folder into the filesystem */
  const addFileOrFolder = (path, item) => {
    setLog(prev => `${prev}\nAdding ${item.name} at path ${path}`);
    setFileSystem(prev => {
      const newFS = structuredClone(prev);
      traverseAndAct(newFS, path.split('/').filter(Boolean), (node) => {
        if (!node.children) node.children = [];
        node.children.push(item);
      });
      return newFS;
    });
  };

  /** Rename a file or folder */
  const renameItem = (path, newName) => {
    setLog(prev => `${prev}\nRenaming ${path} to ${newName}`);
    setFileSystem(prev => {
      const newFS = structuredClone(prev);
      const segments = path.split('/').filter(Boolean);
      const itemName = segments.pop();
      traverseAndAct(newFS, segments, (node) => {
        const item = node.children?.find(c => c.name === itemName);
        if (item) item.name = newName;
      });
      return newFS;
    });
  };

    /**
   * Handles opening the rename modal.
   */
    const handleRename = () => {
      setModal({ type: "rename", isOpen: true });
    };
  
    /**
     * Handles opening the move modal.
     */
    const handleMove = () => {
      setModal({ type: "move", isOpen: true });
    };

  /** Delete a file or folder */
  const deleteItem = (path) => {
    setLog(prev => `${prev}\nDeleting item at ${path}`);
    setFileSystem(prev => {
      const newFS = structuredClone(prev);
      const segments = path.split('/').filter(Boolean);
      const itemName = segments.pop();
      traverseAndAct(newFS, segments, (node) => {
        node.children = node.children?.filter(c => c.name !== itemName);
      });
      return newFS;
    });
  };

  /** Move a file or folder */
  const moveItem = (sourcePath, targetPath) => {
    setLog(prev => `${prev}\nMoving ${sourcePath} to ${targetPath}`);
    let movingItem = null;
    const updatedFS = structuredClone(fileSystem);
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

  /** Request an I/O device */
  const requestDevice = (pid, device) => {
    setLog(prev => `${prev}\nProcess ${pid} requested ${device}`);
    setDevices(prev => {
      if (prev[device] === null) return { ...prev, [device]: pid };
      return prev;
    });
  };

  /** Release an I/O device */
  const releaseDevice = (device) => {
    setLog(prev => `${prev}\nReleased ${device}`);
    setDevices(prev => ({ ...prev, [device]: null }));
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 min-h-screen overflow-hidden">
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
          <div className="h-[30vh] overflow-auto">
            <ProcessList processes={processes} terminateProcess={terminateProcess} />
          </div>
        </CardContent>
      </Card>

      <Card><CardContent><MemoryDisplay memory={memory} /></CardContent></Card>
      <Card><CardContent><FileSystemTree fileSystem={fileSystem} selectedPath={selectedPath} setSelectedPath={setSelectedPath} /></CardContent></Card>
      <Card><CardContent><DeviceList devices={devices} /></CardContent></Card>

      <Card className="bg-gray-200 border border-black h-[30vh] w-full">
        <CardContent>
          <div className="h-full overflow-auto whitespace-pre-wrap break-words">
            <LogViewer log={log} />
            <div ref={logEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSComponent;