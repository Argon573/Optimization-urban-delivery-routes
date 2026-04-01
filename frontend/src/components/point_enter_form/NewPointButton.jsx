const NewPointButton = ({pointCounter, onIncrement}) => {
  return (
      <div>
        <button onClick={onIncrement}>
          Добавить точку ({pointCounter})
        </button>
      </div>
  );
}

export default NewPointButton;