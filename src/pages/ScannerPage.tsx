import { useState, useEffect } from "react";
import BarcodeScanner from "../components/BarcodeScanner";
import { parseCSV, findMatchingRow } from "../services/csvService";
import type { CsvRow } from "../services/csvService";

const ScannerPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [lastScanned, setLastScanned] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadCsvData();
  }, []);

  const loadCsvData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await parseCSV("/data.csv");
      setCsvData(data);
    } catch (err) {
      setError("Failed to load product data");
      console.error("Error loading CSV:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = (code: string) => {
    setIsScanning(false);
    setLastScanned(code);

    const zuban = code.substring(0, 8);

    const matchingRow = findMatchingRow(csvData, zuban);

    if (matchingRow && matchingRow.URL) {
      window.open(matchingRow.URL, "_blank");
    } else {
      setError(`No matching product found for code: ${zuban}`);
    }
  };

  const toggleScanner = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      setError("");
    }
  };

  const reloadData = () => {
    loadCsvData();
  };

  return (
    <div className="scanner-page">
      <h1>Factory Scanner</h1>

      {isLoading ? (
        <div className="loading">Loading product data...</div>
      ) : (
        <>
          <div className="scanner-controls">
            <button onClick={reloadData} className="reload-button">
              Reload Data
            </button>
          </div>

          {isScanning && (
            <BarcodeScanner onScan={handleScan} isScanning={isScanning} />
          )}

          {error && <div className="error-message">{error}</div>}

          {lastScanned && !error && (
            <div className="last-scanned">
              <p>Last scanned: {lastScanned}</p>
              <p>Zuban: {lastScanned.substring(0, 8)}</p>
            </div>
          )}

          <div className="data-info">
            <p>Loaded {csvData.length} products</p>
          </div>

          {!isScanning && (
            <button className="fab-button" onClick={toggleScanner}>
              <img src="/camera-icon.svg" alt="Scan" />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ScannerPage;
