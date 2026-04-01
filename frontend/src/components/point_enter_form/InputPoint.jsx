const InputPoint = ({ index, value, onChange }) => {
  return (
      <div>
        <input
            type="text"
            placeholder={`Input point ${index + 1}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
      </div>
  );
}

export default InputPoint;