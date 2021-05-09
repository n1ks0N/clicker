import React from "react";
import { useParams } from "react-router-dom";

const Clicks = () => {
  let { id } = useParams();
  return (
    <div>
      <h1>Категория: {id} клика</h1>
    </div>
  );
};

export default Clicks;
