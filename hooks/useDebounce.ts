import { useEffect, useState } from 'react'

/**
 * Hook personalizado para debounce de valores
 * Útil para optimizar búsquedas y reducir queries innecesarias
 * 
 * @param value - Valor a hacer debounce
 * @param delay - Delay en milisegundos (default: 500ms)
 * @returns Valor con debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Configurar timeout para actualizar el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpiar timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
