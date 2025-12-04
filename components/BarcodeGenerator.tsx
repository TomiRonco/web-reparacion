'use client'

import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import { X, Printer, Download } from 'lucide-react'

interface BarcodeGeneratorProps {
  codigo: string
  nombre: string
  onClose: () => void
}

export default function BarcodeGenerator({ codigo, nombre, onClose }: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && codigo) {
      try {
        JsBarcode(canvasRef.current, codigo, {
          format: 'CODE128',
          width: 1,
          height: 50,
          displayValue: true,
          fontSize: 12,
          margin: 2,
          background: '#ffffff',
          lineColor: '#000000'
        })
      } catch (err) {
        console.error('Error generando código de barras:', err)
      }
    }
  }, [codigo])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `barcode-${codigo}.png`
      link.href = url
      link.click()
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b print:hidden">
          <h3 className="text-lg font-semibold">Código de Barras</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barcode Display */}
        <div className="p-6">
          <div className="bg-white border-2 border-slate-200 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-slate-700 mb-3">{nombre}</p>
            <div className="max-w-[300px] mx-auto overflow-hidden">
              <canvas ref={canvasRef} className="max-w-full h-auto"></canvas>
            </div>
            <p className="text-xs text-slate-500 mt-3">Código: {codigo}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
          >
            Cerrar
          </button>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-white.rounded-lg.shadow-xl,
          .bg-white.rounded-lg.shadow-xl * {
            visibility: visible;
          }
          .bg-white.rounded-lg.shadow-xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
