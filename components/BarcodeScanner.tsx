'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (code: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    const initScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode('barcode-reader')
        scannerRef.current = html5QrCode

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // Código detectado
            onScan(decodedText)
            stopScanner()
          },
          (errorMessage) => {
            // Error de escaneo (normal si no detecta código)
            console.log(errorMessage)
          }
        )

        setScanning(true)
      } catch (err) {
        console.error('Error iniciando escáner:', err)
        setError('No se pudo acceder a la cámara. Verifica los permisos.')
      }
    }

    initScanner()

    return () => {
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopScanner = () => {
    if (scannerRef.current && scanning) {
      try {
        scannerRef.current.stop()
        setScanning(false)
      } catch (err) {
        console.error('Error deteniendo escáner:', err)
      }
    }
  }

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Escanear Código de Barras</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner */}
        <div className="p-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : (
            <>
              <div 
                id="barcode-reader" 
                className="rounded-lg overflow-hidden border-2 border-blue-300"
              ></div>
              <p className="text-sm text-slate-500 text-center mt-4">
                Apunta la cámara al código de barras del producto
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
