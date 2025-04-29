import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

/**
 * Displays a list of processes with basic info and terminate buttons.
 * 
 * @param {Array} processes List of process objects
 * @param {function} terminateProcess Callback to terminate a process
 */
export default function ProcessList({ processes, terminateProcess }) {
  return (
    <div>
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
    </div>
  );
}
