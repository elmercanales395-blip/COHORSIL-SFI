import { useEffect, useMemo, useRef, useState } from 'react';

// options: [{ value, label, sublabel }]
export default function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = 'Buscar...',
  disabled = false,
  required = false,
  emptyText = 'Sin resultados',
}) {
  const seleccionado = options.find((o) => String(o.value) === String(value));
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState(seleccionado?.label || '');
  const wrapRef = useRef(null);

  // sincroniza el texto cuando "value" cambia desde afuera (ej. al editar un faltante)
  useEffect(() => {
    setTexto(seleccionado?.label || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    function handleClickFuera(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setAbierto(false);
        setTexto(seleccionado?.label || '');
      }
    }
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [seleccionado]);

  // con el campo vacío no se muestra el listado, aunque esté enfocado
  const filtradas = useMemo(() => {
    const q = texto.trim().toLowerCase();
    if (!q) return [];
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q),
    );
  }, [options, texto]);

  function elegir(opcion) {
    onChange(opcion.value);
    setTexto(opcion.label);
    setAbierto(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtradas.length > 0) elegir(filtradas[0]);
    } else if (e.key === 'Escape') {
      setAbierto(false);
      setTexto(seleccionado?.label || '');
    }
  }

  return (
    <div className="searchable-select" ref={wrapRef}>
      <input
        id={id}
        type="text"
        value={texto}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
        onFocus={() => setAbierto(true)}
        onChange={(e) => {
          setTexto(e.target.value);
          setAbierto(true);
        }}
        onKeyDown={handleKeyDown}
      />
      {abierto && !disabled && texto.trim() !== '' && (
        <div className="searchable-select-menu">
          {filtradas.length === 0 ? (
            <div className="searchable-select-empty">{emptyText}</div>
          ) : (
            filtradas.map((o) => (
              <button
                type="button"
                key={o.value}
                className="searchable-select-option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(o)}
              >
                <span>{o.label}</span>
                {o.sublabel && <span className="searchable-select-sublabel">{o.sublabel}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
