import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  isScanning: boolean;
}

const BarcodeScanner = ({ onScan, isScanning }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>("");
  const scannerContainerId = "html5qr-code-full-region";

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(scannerContainerId);
    }

    const handleScanningState = async () => {
      try {
        if (isScanning) {
          await stopScanner();
          await startScanner;
        } else if (scannerRef.current) {
          await stopScanner();
        }
      } catch (err) {
        console.error("Error handling scanning state:", err);
        setError("Failed to initialize scanner. Please refresh the page.");
      }
    };

    handleScanningState();

    return () => {
      const cleanup = async () => {
        try {
          if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop();
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (err) {
          console.error("Error during cleanup:", err);
        }
      };
      cleanup();
    };
  }, [isScanning]);

  const startScanner = async () => {
    if (!scannerRef.current) return;
    if (scannerRef.current.isScanning) return;

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      setError("");
      const qrCodeSuccessCallback = (decodedText: string) => {
        if (decodedText.length === 14) {
          onScan(decodedText);
        }
      };

      const config = {
        fps: 10,
        qrbox: { width: 400, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        undefined
      );
    } catch (err) {
      setError("Camera access denied or not available");
      console.error("Error starting scanner:", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      <div
        id={scannerContainerId}
        style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}
      />
    </>
  );
};

export default BarcodeScanner;
