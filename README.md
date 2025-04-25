# Pathfinding Visualizer

An interactive visualization tool for various pathfinding algorithms implemented in React and TypeScript.

## Features

- Interactive grid-based visualization
- Multiple pathfinding algorithms:
  - Breadth-First Search (BFS) - Finds the shortest path
  - Depth-First Search (DFS) - Memory efficient exploration
  - Dijkstra's Algorithm - Optimal path with weighted nodes
  - A* Search - Fastest path using heuristics
- Weighted terrain with different movement costs
- Real-time visualization of algorithm execution
- Clear visual representation of:
  - Start node (green)
  - End node (red)
  - Visited nodes (gray)
  - Path nodes (blue)
  - Difficult terrain (brown)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Nishant-design99/Pathfinding-visulaizer.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Pathfinding-visulaizer
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## How to Use

1. Click any cell to set the start point (green)
2. Click another cell to set the end point (red)
3. Select an algorithm from the dropdown menu
4. Click "Find Path" to visualize the pathfinding process
5. Use "Reset" to clear the grid and select new points
6. Use "New Grid" to generate a new random grid with different terrain

## Technologies Used

- React
- TypeScript
- Vite
- CSS3 with modern features

## Contributing

Feel free to open issues and pull requests for any improvements you want to add.

## License

This project is open source and available under the MIT License.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
