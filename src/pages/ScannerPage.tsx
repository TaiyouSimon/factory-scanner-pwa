import { useEffect, useState } from "react";
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
    // Stop scanning after successful scan
    setIsScanning(false);
    setLastScanned(code);

    // Extract first 8 characters (zuban)
    const zuban = code.substring(0, 8);

    // Find matching row in CSV
    const matchingRow = findMatchingRow(csvData, zuban);

    if (matchingRow && matchingRow.URL) {
      // Redirect to the URL from the matching row
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
            <button onClick={toggleScanner} className="scan-button">
              {isScanning ? "Stop Scanning" : "Start Scanning"}
            </button>
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
        </>
      )}
    </div>
  );
};

export default ScannerPage;
