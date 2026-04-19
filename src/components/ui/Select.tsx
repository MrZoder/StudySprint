import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type OptionHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

interface OptionItem {
  key: string;
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface MenuPosition {
  style: CSSProperties;
  placement: "top" | "bottom";
  maxHeight: number;
}

function toOptionItems(children: ReactNode): OptionItem[] {
  return Children.toArray(children).flatMap((child, index) => {
    if (!isValidElement(child) || child.type !== "option") return [];

    const option = child as ReactElement<OptionHTMLAttributes<HTMLOptionElement>>;

    const value = option.props.value ?? "";
    return [
      {
        key: String(child.key ?? `${index}-${value}`),
        value: String(value),
        label: option.props.children,
        disabled: Boolean(option.props.disabled),
      },
    ];
  });
}

export default function Select({
  hasError = false,
  className,
  children,
  value,
  defaultValue,
  onChange,
  disabled,
  id,
  name,
  "aria-invalid": ariaInvalid,
}: SelectProps) {
  const options = useMemo(() => toOptionItems(children), [children]);
  const selectedValue =
    value !== undefined
      ? String(value)
      : defaultValue !== undefined
        ? String(defaultValue)
        : options[0]?.value ?? "";

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === selectedValue),
  );
  const selectedOption = options[selectedIndex] ?? options[0];

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    style: {},
    placement: "bottom",
    maxHeight: 256,
  });

  useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const viewportPadding = 12;
      const offset = 8;
      const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
      const availableAbove = rect.top - viewportPadding;
      const placement =
        availableBelow < 220 && availableAbove > availableBelow ? "top" : "bottom";
      const maxHeight = Math.max(
        140,
        Math.min(280, placement === "top" ? availableAbove - offset : availableBelow - offset),
      );

      setMenuPosition({
        placement,
        maxHeight,
        style:
          placement === "top"
            ? {
                left: rect.left,
                width: rect.width,
                bottom: window.innerHeight - rect.top + offset,
              }
            : {
                left: rect.left,
                width: rect.width,
                top: rect.bottom + offset,
              },
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  function getNextEnabledIndex(startIndex: number, direction: 1 | -1) {
    if (options.length === 0) return -1;

    let index = startIndex;
    for (let step = 0; step < options.length; step += 1) {
      index = (index + direction + options.length) % options.length;
      if (!options[index]?.disabled) return index;
    }

    return -1;
  }

  function emitChange(nextValue: string) {
    if (disabled) return;

    onChange?.({
      target: { value: nextValue, name },
      currentTarget: { value: nextValue, name },
    } as React.ChangeEvent<HTMLSelectElement>);

    setIsOpen(false);
    window.requestAnimationFrame(() => buttonRef.current?.focus());
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "Tab") {
      setIsOpen(false);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(selectedIndex);
        return;
      }

      const nextIndex = getNextEnabledIndex(activeIndex, 1);
      if (nextIndex >= 0) setActiveIndex(nextIndex);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(selectedIndex);
        return;
      }

      const nextIndex = getNextEnabledIndex(activeIndex, -1);
      if (nextIndex >= 0) setActiveIndex(nextIndex);
      return;
    }

    if (event.key === "Home" && isOpen) {
      event.preventDefault();
      const firstIndex = options.findIndex((option) => !option.disabled);
      if (firstIndex >= 0) setActiveIndex(firstIndex);
      return;
    }

    if (event.key === "End" && isOpen) {
      event.preventDefault();
      const reversedIndex = [...options].reverse().findIndex((option) => !option.disabled);
      if (reversedIndex >= 0) setActiveIndex(options.length - 1 - reversedIndex);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(selectedIndex);
        return;
      }

      const activeOption = options[activeIndex];
      if (activeOption && !activeOption.disabled) {
        emitChange(activeOption.value);
      }
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        id={id}
        name={name}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={ariaInvalid}
        onClick={() => !disabled && setIsOpen((open) => !open)}
        onKeyDown={handleKeyDown}
        className={cn(
          "min-h-11 flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-left text-base outline-none transition-all duration-200 sm:text-sm dark:bg-[#070f1f] dark:text-white disabled:cursor-not-allowed disabled:opacity-60",
          hasError
            ? "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-4 focus-visible:ring-rose-100 dark:border-rose-600 dark:focus-visible:ring-rose-950/40"
            : "border-gray-200 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-100 dark:border-slate-800 dark:focus-visible:ring-blue-950/50",
          isOpen && !hasError && "border-blue-400 ring-4 ring-blue-100 dark:border-blue-500/80 dark:ring-blue-950/50",
          className,
        )}
      >
        <span className="min-w-0 flex-1 truncate">{selectedOption?.label}</span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-gray-400 transition-all duration-200",
            isOpen && "rotate-180 text-blue-500 dark:text-blue-300",
          )}
        />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={menuPosition.style}
            className={cn(
              "fixed z-[120] transition-all duration-200 ease-out",
              menuPosition.placement === "top" ? "origin-bottom" : "origin-top",
              isOpen
                ? "visible translate-y-0 scale-100 opacity-100"
                : menuPosition.placement === "top"
                  ? "pointer-events-none invisible translate-y-1 scale-[0.98] opacity-0"
                  : "pointer-events-none invisible -translate-y-1 scale-[0.98] opacity-0",
            )}
          >
            <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white/96 p-1.5 shadow-[0_28px_48px_-20px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-[#040b18]/96">
              <div
                role="listbox"
                aria-labelledby={id}
                className="overflow-auto"
                style={{ maxHeight: menuPosition.maxHeight }}
              >
                {options.map((option, index) => {
                  const isSelected = option.value === selectedValue;
                  const isActive = activeIndex === index;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => emitChange(option.value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150",
                        option.disabled && "cursor-not-allowed opacity-50",
                        isSelected
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/55 dark:text-blue-200"
                          : isActive
                            ? "bg-gray-100 text-gray-900 dark:bg-slate-900/90 dark:text-white"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-900/80 dark:hover:text-white",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate text-left">{option.label}</span>
                      <Check
                        size={14}
                        className={cn(
                          "shrink-0 transition-opacity duration-150",
                          isSelected
                            ? "opacity-100 text-blue-500 dark:text-blue-300"
                            : "opacity-0",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          ,
          document.body,
        )}
    </div>
  );
}
