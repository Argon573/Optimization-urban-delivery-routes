import {useState} from "react";
import NewPointButton from "./NewPointButton";
import InputPoint from "./InputPoint";

const Form = () => {
  const [points, setPoints] = useState([]);
  const [firstPoint, setFirstPoint] = useState("");

  const addPoint = () => {
    setPoints([...points, ""]); // Добавляем пустой инпут
  };

  const updatePoint = (index, value) => {
    const newPoints = [...points];
    newPoints[index] = value;
    setPoints(newPoints);
  };

  const handleSubmit = () => {
    // Собираем все данные в массив
    const allPoints = [firstPoint, ...points];
    console.log("Все точки:", allPoints);

    // Здесь можно отправить данные на сервер или использовать дальше
    // Например: saveToServer(allPoints);
  };

  return (
      <div>
        <input
            type="text"
            placeholder="Input first point"
            value={firstPoint}
            onChange={(e) => setFirstPoint(e.target.value)}
        />

        {points.map((point, index) => (
            <InputPoint
                key={index}
                index={index}
                value={point}
                onChange={(value) => updatePoint(index, value)}
            />
        ))}

        <NewPointButton
            onIncrement={addPoint}
            pointCounter={points.length}
        />

        <button onClick={handleSubmit}>Сохранить все точки</button>

        <p>Количество точек: {points.length + 1}</p>
        <pre>Данные: {JSON.stringify([firstPoint, ...points], null, 2)}</pre>
      </div>
  );
}

export default Form;