import { useMemo, useRef, useState } from 'react';

// como SearchableSelect pero sin obligar a elegir de la lista: se puede escribir algo nuevo
export default function TextAutocomplete({
  id,
  value,
  onChange,
  sugerencias,
  placeholder = 'Escribe para buscar...',
  required = false,
}) {
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef(null);

  const filtradas = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return sugerencias.filter((s) => s.toLowerCase().includes(q) && s.toLowerCase() !== q);
  }, [sugerencias, value]);

  return (
    <div
      className="searchable-select"
      ref={wrapRef}
      onBlur={(e) => {
        if (!wrapRef.current.contains(e.relatedTarget)) setAbierto(false);
      }}
    >
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        onFocus={() => setAbierto(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setAbierto(true);
        }}
      />
      {abierto && filtradas.length > 0 && (
        <div className="searchable-select-menu">
          {filtradas.map((s) => (
            <button
              type="button"
              key={s}
              className="searchable-select-option"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(s);
                setAbierto(false);
              }}
            >
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
