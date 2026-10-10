export type CounterProps = {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
};

export function Counter({
  label,
  value,
  onDecrease,
  onIncrease,
  decreaseDisabled = false,
  increaseDisabled = false,
}: CounterProps) {
  return (
    <div className="bang-counter">
      <span className="bang-counter__label">{label}</span>
      <div className="bang-counter__controls">
        <button
          className="bang-touch-button"
          style={{ minWidth: 44, minHeight: 44 }}
          type="button"
          aria-label={`Giảm ${label}`}
          disabled={decreaseDisabled}
          onClick={onDecrease}
        >
          −
        </button>
        <output aria-label={`${label}: ${value}`}>{value}</output>
        <button
          className="bang-touch-button"
          style={{ minWidth: 44, minHeight: 44 }}
          type="button"
          aria-label={`Tăng ${label}`}
          disabled={increaseDisabled}
          onClick={onIncrease}
        >
          +
        </button>
      </div>
    </div>
  );
}
