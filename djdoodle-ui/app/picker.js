import React from "react";

const ColorPicker = ({ color, onColorChange }) => {
  const handleColorChange = (event) => {
    onColorChange(event.target.value);
  };

  return (
    <div>
      <input
        type="color"
        id="color-picker"
        name="color"
        value={color}
        onChange={handleColorChange}
      />
    </div>
  );
};

export default ColorPicker;
