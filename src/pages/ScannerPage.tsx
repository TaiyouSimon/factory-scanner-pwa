import { useState, useEffect, useRef } from "react";
import BarcodeScanner from "../components/BarcodeScanner";
import { parseCSV, findMatchingRow } from "../services/csvService";
import type { CsvRow } from "../services/csvService";

const ScannerPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [lastScanned, setLastScanned] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [cameraError, setCameraError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadCsvData();

    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
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

  const stopScanner = () => {
    setIsScanning(false);
    setCameraError("");
    setScannerKey((prev) => prev + 1);
  };

  const handleScan = async (code: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setLastScanned(code);
    setError("");
    setCameraError("");

    try {
      let zuban = code.substring(0, 8);
      zuban = zuban.slice(0, 4) + "-" + zuban.slice(4);

      const matchingRow = findMatchingRow(csvData, zuban);

      if (matchingRow && matchingRow.URL) {
        stopScanner();

        await new Promise((resolve) => setTimeout(resolve, 100));

        window.open(matchingRow.URL, "_blank");
      } else {
        setError(`No matching product found for code: ${zuban}`);
        stopScanner();
      }
    } catch (err) {
      console.error("Error processing scan:", err);
      setError("Error processing barcode");
      stopScanner();
    } finally {
      processingTimeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  const startScanner = async () => {
    try {
      setError("");
      setCameraError("");
      setIsProcessing(false);

      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }

      if (isScanning) {
        setIsScanning(false);
        setScannerKey((prev) => prev + 1);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setCameraError("Failed to start camera");
    }
  };

  const toggleScanner = () => {
    if (isScanning || isProcessing) {
      stopScanner();
      setIsProcessing(false);
    } else {
      startScanner();
    }
  };

  const reloadData = () => {
    loadCsvData();
  };

  useEffect(() => {
    if (isScanning) {
      setError("");
      setCameraError("");
    }
  }, [isScanning]);

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
            <BarcodeScanner
              key={scannerKey}
              onScan={handleScan}
              isScanning={isScanning}
            />
          )}

          {error && <div className="error-message">{error}</div>}
          {cameraError && (
            <div className="error-message camera-error">{cameraError}</div>
          )}

          {isProcessing && (
            <div className="processing-message">Processing barcode...</div>
          )}

          {lastScanned && !error && !isProcessing && (
            <div className="last-scanned">
              <p>Last scanned: {lastScanned}</p>
              <p>
                Zuban:{" "}
                {lastScanned.substring(0, 8).slice(0, 4) +
                  "-" +
                  lastScanned.substring(0, 8).slice(4)}
              </p>
            </div>
          )}

          <div className="data-info">
            <p>Loaded {csvData.length} products</p>
          </div>

          {!isScanning && !isProcessing && (
            <button
              className="fab-button"
              onClick={toggleScanner}
              disabled={isLoading}
            >
              <img src="/camera-icon.svg" alt="Scan" />
            </button>
          )}

          {isScanning && (
            <button
              className="stop-button"
              onClick={toggleScanner}
              disabled={isProcessing}
            >
              Stop Scanning
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ScannerPage;
