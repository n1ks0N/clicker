import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { fb } from "../utils/constants/firebase";
import './User.css'

const User = () => {
  const { user } = useSelector((store) => store);
  useEffect(() => {
    if (user.mail) {
      const docRef = fb.firestore().collection("users").doc(`${user.mail}`);
      docRef
        .get()
        .then((doc) => {
          // рефералы
          const td = document.querySelectorAll('.table-refs__td')
          const levels = 5 // количество уровней и заполняемых ячеек в таблице
          // const needRefs = [3, 5, 6, 12, 14] // необходимое кол-во рефералов для получения уровня
          // needRefs.forEach((val, i) => {
          //   if (doc.data().refs > val) {
          //     td[i].className = 'table-refs__td table-refs__td_active'
          //     td[levels + i].className = 'table-refs__td table-refs__td_active' 
          //   }
          // })
          for (let i = 0; i < doc.data().lvl; i++) {
            td[i].className = 'table-refs__td table-refs__td_active'
            td[levels + i].className = 'table-refs__td table-refs__td_active' 
          }
        })
    }
  }, [user.mail])
  return (
    <div>
      <h1>Личный кабинет</h1>
      <h3>{user.mail}</h3>
      <table>
        <tbody>
          <tr>
            <td>Уровень</td>
            <td className="table-refs__td">1</td>
            <td className="table-refs__td">2</td>
            <td className="table-refs__td">3</td>
            <td className="table-refs__td">4</td>
            <td className="table-refs__td">5</td>
          </tr>
          <tr>
            <td>Кол-во рефералов</td>
            <td className="table-refs__td">3</td>
            <td className="table-refs__td">5</td>
            <td className="table-refs__td">6</td>
            <td className="table-refs__td">12</td>
            <td className="table-refs__td">14</td>
          </tr>
        </tbody>
      </table>
      <p>Уровень активен до: {Date(user.date)}</p>
      <p>Общая сумма пополней: {user.purchases}</p>
      <p>Всего выведено: {user.all_money}</p>
      <p>Доступно к выводу: {user.allow_money}</p>
      <div className="form-group">
        <label>Номер кошелька ЮMoney</label>
        <input className="form-control" type="number" />
        <button type="button" className="btn btn-success">Заказать вывод</button>
      </div>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => fb.auth().signOut()}
      >
        Выйти
      </button>
    </div>
  );
};

export default User;
