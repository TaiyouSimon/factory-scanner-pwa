import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScannerPage from "./pages/ScannerPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<ScannerPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
