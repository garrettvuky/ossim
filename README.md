# Operating System Simulation

A simulated operating system environment built using **React** and **TailwindCSS**, modeling core OS functionalities such as process management, memory paging with LRU replacement, file system operations, device management, and real-time system logging.

---

## Features

- **Process Management:** Create, run, and terminate processes.
- **Memory Management:** Implemented with 16 memory slots using Least Recently Used (LRU) paging strategy.
- **File System:** Recursive tree structure supporting add, rename, move, and delete operations for files and folders.
- **I/O Device Management:** Processes can request and release simple devices like Keyboard and Printer.
- **Log Viewer:** Scrollable terminal-like interface logging all system events in real-time.
- **Isolated Scrolling:** Process List and Log Viewer scroll independently without affecting the main page.

---

## Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/operating-system-simulation.git
   cd operating-system-simulation
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

> Ensure you have **Node.js** and **npm** installed.

---

## Technologies Used

- React
- TailwindCSS (v3.4.3)
- Craco (for PostCSS configuration)
- PostCSS + Autoprefixer

---

## System Design Overview

The system includes:

- A basic Round-Robin-like scheduler rotating processes between Ready and Running states.
- Memory paging management using LRU replacement when memory fills.
- Recursive tree traversal for hierarchical file operations.
- Simple device request and release system.
- Real-time logging for user and system actions with a contained scrollable viewer.

---

## Testing Summary

| Feature                    | Status    |
| -------------------------- | --------- |
| Create/Terminate Processes | ✅ Working |
| LRU Memory Paging          | ✅ Working |
| File System Operations     | ✅ Working |
| Device Request/Release     | ✅ Working |
| Real-Time Logging          | ✅ Working |
| Independent Scroll Areas   | ✅ Working |

Manual testing confirmed strong functionality and consistency across all modules.

---

## Conclusion

This project successfully models fundamental operating system behaviors in an interactive and intuitive web application. It offers valuable insights into resource management, process lifecycle handling, memory paging, and user interaction patterns, bridging the gap between academic concepts and practical implementation.

