import { useEffect, useId, useRef, useState } from "react";

export default function PrettySelect({
  value,
  onChange,
  options = [],
  placeholder = "Selecione",
  emptyMessage = "Nenhuma opção disponível",
  disabled = false,
  ariaLabel,
  className = "",
  buttonClassName = "",
}) {
  const listboxId = useId();
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedIndex = options.findIndex((option) => String(option.value) === String(value));
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
  const hasOptions = options.length > 0;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, selectedIndex]);

  const selectOption = (option) => {
    if (!option || option.disabled) return;

    onChange?.(option.value);
    setIsOpen(false);
  };

  const moveActiveOption = (direction) => {
    if (!hasOptions) return;

    setActiveIndex((currentIndex) => {
      const nextIndex = currentIndex + direction;

      if (nextIndex < 0) return options.length - 1;
      if (nextIndex >= options.length) return 0;
      return nextIndex;
    });
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        moveActiveOption(1);
      }
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        moveActiveOption(-1);
      }
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        selectOption(options[activeIndex]);
      }
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`pretty-select ${className}`}>
      <button
        type="button"
        className={`input pretty-select__button ${buttonClassName}`}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => !disabled && setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
      >
        <span className="pretty-select__value">
          <span className={selectedOption ? "pretty-select__label" : "pretty-select__placeholder"}>
            {selectedOption?.label || placeholder}
          </span>
          {selectedOption?.description && (
            <span className="pretty-select__description">{selectedOption.description}</span>
          )}
        </span>
        <span className="pretty-select__chevron" aria-hidden="true" />
      </button>

      {isOpen && (
        <div id={listboxId} className="pretty-select__menu" role="listbox" aria-label={ariaLabel}>
          {hasOptions ? (
            options.map((option, index) => {
              const isSelected = String(option.value) === String(value);
              const isActive = index === activeIndex;

              return (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  className={`pretty-select__option ${isSelected ? "is-selected" : ""} ${isActive ? "is-active" : ""}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(option)}
                >
                  <span className="pretty-select__option-copy">
                    <span className="pretty-select__option-label">{option.label}</span>
                    {option.description && (
                      <span className="pretty-select__option-description">{option.description}</span>
                    )}
                  </span>
                  {isSelected && <span className="pretty-select__check" aria-hidden="true">✓</span>}
                </button>
              );
            })
          ) : (
            <div className="pretty-select__empty">{emptyMessage}</div>
          )}
        </div>
      )}
    </div>
  );
}
