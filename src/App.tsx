import { useState, useEffect } from 'react'
import './App.css'

// Assuming a fixed grid width based on CSS
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const TOTAL_CELLS = GRID_WIDTH * GRID_HEIGHT;

type SearchAlgorithm = 'bfs' | 'dfs' | 'dijkstra' | 'astar';

interface Node {
  index: number;
  g: number; // Cost from start to current node
  h: number; // Estimated cost from current node to end
  f: number; // Total cost (g + h)
  parent?: number;
}

type CellType = {
  value: number;
  weight: number;
};

function App() {
  const [array, setArray] = useState<CellType[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1); // Represents the node being currently processed by BFS
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isFound, setIsFound] = useState<boolean>(false); // Indicates if a path was found
  const [searchComplete, setSearchComplete] = useState<boolean>(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null); // To clear timeouts on reset
  const [visitedIndices, setVisitedIndices] = useState<Set<number>>(new Set());
  const [startNodeIndex, setStartNodeIndex] = useState<number | null>(null);
  const [endNodeIndex, setEndNodeIndex] = useState<number | null>(null);
  const [pathIndices, setPathIndices] = useState<Set<number>>(new Set()); // To store the final path
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SearchAlgorithm>('bfs');

  // Initialize array on mount
  useEffect(() => {
    // Directly generate the initial array without resetting state
    createAndSetArray();
  }, []); // Run only once on mount

  // Creates and sets a new array, sorting if necessary
  const createAndSetArray = () => {
    let newArray = Array.from({ length: TOTAL_CELLS }, () => ({
      value: Math.floor(Math.random() * 100),
      weight: Math.random() < 0.2 ? 5 : 1  // 20% chance of being difficult terrain
    }));
    setArray(newArray);
  };

  const handleGenerateNewArray = () => {
    resetSearch();
    createAndSetArray();
  };

  const resetSearch = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setCurrentIndex(-1);
    setIsSearching(false);
    setIsFound(false);
    setSearchComplete(false);
    setVisitedIndices(new Set());
    setPathIndices(new Set()); // Clear path
    setStartNodeIndex(null);
    setEndNodeIndex(null);
  };

  // --- Pathfinding Logic (BFS) ---

  const getNeighbors = (index: number, numRows: number, numCols: number): number[] => {
    const neighbors: number[] = [];
    const row = Math.floor(index / numCols);
    const col = index % numCols;

    // Up
    if (row > 0) neighbors.push(index - numCols);
    // Down
    if (row < numRows - 1) neighbors.push(index + numCols);
    // Left
    if (col > 0) neighbors.push(index - 1);
    // Right
    if (col < numCols - 1) neighbors.push(index + 1);

    return neighbors;
  };

  const calculateHeuristic = (current: number, end: number): number => {
    const currentRow = Math.floor(current / GRID_WIDTH);
    const currentCol = current % GRID_WIDTH;
    const endRow = Math.floor(end / GRID_WIDTH);
    const endCol = end % GRID_WIDTH;
    return Math.abs(currentRow - endRow) + Math.abs(currentCol - endCol);
  };

  const dfs = async (
    startNode: number,
    endNode: number,
    numRows: number,
    visited: Set<number>,
    predecessors: Map<number, number>
  ): Promise<boolean> => {
    visited.add(startNode);
    setVisitedIndices(new Set(visited));
    setCurrentIndex(startNode);

    await new Promise(resolve => setTimeout(resolve, 50));

    if (startNode === endNode) {
      return true;
    }

    const neighbors = getNeighbors(startNode, numRows, GRID_WIDTH);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        predecessors.set(neighbor, startNode);
        if (await dfs(neighbor, endNode, numRows, visited, predecessors)) {
          return true;
        }
      }
    }

    return false;
  };

  const dijkstra = async (
    start: number,
    end: number,
    numRows: number
  ): Promise<Map<number, number>> => {
    const distances = new Map<number, number>();
    const predecessors = new Map<number, number>();
    const unvisited = new Set<number>();
    
    // Initialize all nodes with infinity distance except start node
    for (let i = 0; i < TOTAL_CELLS; i++) {
      distances.set(i, i === start ? 0 : Infinity);
      unvisited.add(i);
    }

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current = -1;
      let minDistance = Infinity;
      
      for (const node of unvisited) {
        const distance = distances.get(node) ?? Infinity;
        if (distance < minDistance) {
          minDistance = distance;
          current = node;
        }
      }

      // If we can't find a node or we reached the end, stop
      if (current === -1 || current === end || minDistance === Infinity) {
        break;
      }

      // Remove current node from unvisited set
      unvisited.delete(current);
      
      // Visualize current node
      setVisitedIndices(prev => new Set([...prev, current]));
      setCurrentIndex(current);
      await new Promise(resolve => setTimeout(resolve, 50));

      // Get valid neighbors
      const neighbors = getNeighbors(current, numRows, GRID_WIDTH);
      
      // Update distances to neighbors
      for (const neighbor of neighbors) {
        if (!unvisited.has(neighbor)) continue;

        const currentDist = distances.get(current) ?? Infinity;
        const newDist = currentDist + 1; // Cost of 1 to move to adjacent cell
        const neighborDist = distances.get(neighbor) ?? Infinity;

        if (newDist < neighborDist) {
          distances.set(neighbor, newDist);
          predecessors.set(neighbor, current);
        }
      }
    }

    return predecessors;
  };

  const astar = async (
    start: number,
    end: number,
    numRows: number
  ): Promise<Map<number, number>> => {
    const openSet = new Set<number>([start]);
    const closedSet = new Set<number>();
    const predecessors = new Map<number, number>();
    
    const nodes = new Map<number, Node>();
    nodes.set(start, {
      index: start,
      g: 0,
      h: calculateHeuristic(start, end),
      f: calculateHeuristic(start, end)
    });

    while (openSet.size > 0) {
      // Find node with lowest f score
      let current = -1;
      let minF = Infinity;
      for (const index of openSet) {
        const node = nodes.get(index)!;
        if (node.f < minF) {
          minF = node.f;
          current = index;
        }
      }

      if (current === end) break;

      openSet.delete(current);
      closedSet.add(current);
      setVisitedIndices(new Set(closedSet));
      setCurrentIndex(current);

      await new Promise(resolve => setTimeout(resolve, 50));

      const neighbors = getNeighbors(current, numRows, GRID_WIDTH);
      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor)) continue;

        const tentativeG = (nodes.get(current)?.g || 0) + 1;
        const neighborNode = nodes.get(neighbor);

        if (!neighborNode) {
          nodes.set(neighbor, {
            index: neighbor,
            g: tentativeG,
            h: calculateHeuristic(neighbor, end),
            f: tentativeG + calculateHeuristic(neighbor, end)
          });
          openSet.add(neighbor);
          predecessors.set(neighbor, current);
        } else if (tentativeG < neighborNode.g) {
          neighborNode.g = tentativeG;
          neighborNode.f = tentativeG + neighborNode.h;
          predecessors.set(neighbor, current);
        }
      }
    }

    return predecessors;
  };

  const startPathfinding = async () => {
    if (startNodeIndex === null || endNodeIndex === null || isSearching) return;

    setVisitedIndices(new Set());
    setPathIndices(new Set());
    setCurrentIndex(-1);
    setIsFound(false);
    setSearchComplete(false);
    setIsSearching(true);

    let predecessors = new Map<number, number>();
    let pathFound = false;

    try {
      switch (selectedAlgorithm) {
        case 'bfs':
          // Existing BFS implementation
          const queue: number[] = [startNodeIndex];
          const visited = new Set<number>([startNodeIndex]);
          const bfsPredecessors = new Map<number, number>(); // To reconstruct path

          setVisitedIndices(new Set([startNodeIndex])); // Mark start as visited visually

          let bfsPathFound = false;

          const searchStep = () => {
            if (queue.length === 0) {
              setIsSearching(false);
              setSearchComplete(true);
              setIsFound(bfsPathFound); // Will be false if queue emptied
              setCurrentIndex(-1);
              setTimeoutId(null);
              console.log("Path not found");
              return;
            }

            const current = queue.shift()!;
            setCurrentIndex(current); // Highlight current node being processed
            setVisitedIndices(prev => new Set(prev).add(current)); // Update visual visited

            if (current === endNodeIndex) {
              bfsPathFound = true;
              setIsSearching(false);
              setSearchComplete(true);
              setIsFound(true);
              setTimeoutId(null);
              console.log("Path found!");
              // Reconstruct and set path
              reconstructPath(bfsPredecessors, startNodeIndex, endNodeIndex);
              return;
            }

            const neighbors = getNeighbors(current, GRID_HEIGHT, GRID_WIDTH);
            for (const neighbor of neighbors) {
              if (!visited.has(neighbor)) {
                visited.add(neighbor);
                bfsPredecessors.set(neighbor, current);
                queue.push(neighbor);
              }
            }

            // Schedule next step
            const nextTimeout = setTimeout(searchStep, 50); // Adjust speed as needed
            setTimeoutId(nextTimeout as unknown as number);
          };

          // Start the search loop
          const initialTimeout = setTimeout(searchStep, 50);
          setTimeoutId(initialTimeout as unknown as number);
          break;

        case 'dfs':
          pathFound = await dfs(startNodeIndex, endNodeIndex, GRID_HEIGHT, new Set(), predecessors);
          break;

        case 'dijkstra':
          predecessors = await dijkstra(startNodeIndex, endNodeIndex, GRID_HEIGHT);
          pathFound = predecessors.has(endNodeIndex);
          break;

        case 'astar':
          predecessors = await astar(startNodeIndex, endNodeIndex, GRID_HEIGHT);
          pathFound = predecessors.has(endNodeIndex);
          break;
      }

      setIsSearching(false);
      setSearchComplete(true);
      setIsFound(pathFound);
      
      if (pathFound) {
        reconstructPath(predecessors, startNodeIndex, endNodeIndex);
      }
    } catch (error) {
      console.error('Error during pathfinding:', error);
      setIsSearching(false);
      setSearchComplete(true);
      setIsFound(false);
    }
  };

  const reconstructPath = (predecessors: Map<number, number>, start: number, end: number) => {
    const path = new Set<number>();
    let current = end;
    while (current !== start) {
      path.add(current);
      const predecessor = predecessors.get(current);
      if (predecessor === undefined) break; // Should not happen if path exists
      current = predecessor;
    }
    path.add(start);
    setPathIndices(path);
  };

  // --- End Pathfinding Logic ---

  const handleGridClick = (index: number) => {
    // Don't allow selection during search
    if (isSearching) return;

    // Reset if both are already selected and user clicks again
    if (startNodeIndex !== null && endNodeIndex !== null) {
        setStartNodeIndex(index);
        setEndNodeIndex(null);
        return;
    }

    // Select start node
    if (startNodeIndex === null) {
      setStartNodeIndex(index);
    } 
    // Select end node (cannot be same as start)
    else if (endNodeIndex === null && index !== startNodeIndex) { 
      setEndNodeIndex(index);
    }
    // If user clicks the start node again, deselect it
    else if (index === startNodeIndex) {
        setStartNodeIndex(null);
    }
  };

  const getElementClassName = (index: number): string => {
    let className = 'array-element';

    if (index === startNodeIndex) className += ' start-node';
    else if (index === endNodeIndex) className += ' end-node';
    else if (pathIndices.has(index)) className += ' path-node';
    else if (visitedIndices.has(index)) className += ' visited';
    
    // Add difficult terrain class for weighted cells
    if (array[index]?.weight > 1) className += ' difficult-terrain';

    if (isSearching && index === currentIndex) {
      className += ' checking';
    }

    return className;
  }

  return (
    <div className="App">
      <h1>Pathfinding Visualizer</h1>
      <div className="controls">
        <button 
          onClick={handleGenerateNewArray} 
          disabled={isSearching}
          title="Create a new random grid"
        >
          New Grid
        </button>
        <select 
          value={selectedAlgorithm} 
          onChange={(e) => setSelectedAlgorithm(e.target.value as SearchAlgorithm)}
          disabled={isSearching}
          title="Select the pathfinding algorithm to use"
        >
          <option value="bfs">Breadth-First Search (Shortest Path)</option>
          <option value="dfs">Depth-First Search (Memory Efficient)</option>
          <option value="dijkstra">Dijkstra's Algorithm (Weighted Path)</option>
          <option value="astar">A* Search (Fastest Path)</option>
        </select>
        <button 
          onClick={startPathfinding} 
          disabled={startNodeIndex === null || endNodeIndex === null || isSearching || searchComplete}
          title="Start finding the path using selected algorithm"
        >
          Find Path
        </button>
        <button 
          onClick={resetSearch}
          title="Clear the current path and selections"
        >
          Reset
        </button>
        {searchComplete && !isFound && (
          <span className="status-message error">
            Path not found between start and end nodes
          </span>
        )}
        {searchComplete && isFound && (
          <span className="status-message success">
            Path found! 🎉
          </span>
        )}
      </div>
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color start-node"></div>
          <span>Start Node</span>
        </div>
        <div className="legend-item">
          <div className="legend-color end-node"></div>
          <span>End Node</span>
        </div>
        <div className="legend-item">
          <div className="legend-color visited"></div>
          <span>Visited Node</span>
        </div>
        <div className="legend-item">
          <div className="legend-color path-node"></div>
          <span>Path Node</span>
        </div>
        <div className="legend-item">
          <div className="legend-color difficult-terrain"></div>
          <span>Difficult Terrain (Cost: 5)</span>
        </div>
      </div>
      <div className="array-container grid-view">
        {array.map((cell, index) => (
          <div
            key={index}
            className={getElementClassName(index)}
            title={`Value: ${cell.value} (Weight: ${cell.weight})`}
            onClick={() => handleGridClick(index)}
          >
            {cell.value}
          </div>
        ))}
      </div>
      <div className="instructions">
        <p>Click any cell to set the start point (green)</p>
        <p>Click another cell to set the end point (red)</p>
        <p>Brown cells represent difficult terrain with higher movement cost</p>
      </div>
    </div>
  )
}

export default App
