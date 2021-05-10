import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fb } from "../utils/constants/firebase";
import Input from "../elements/Input";
import Select from "../elements/Select";
import { categories } from "../utils/constants/const.json";
import { createName } from '../utils/functions/func'
import "./User.css";

const User = () => {
  const dispatch = useDispatch()
  const { user: { data, mail }, task: { tasks } } = useSelector((store) => store);
  console.log(tasks)
  const [date, setDate] = useState(null);
  const [walletValue, setWalletValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [categoryValue, setCategoryValue] = useState([1]);
  const [totalClicksValue, setTotalClicksValue] = useState(10);
  const db = fb.firestore();
  const docRef = mail ? db.collection("users").doc(`${mail}`) : [];
  // useEffect(() => {docRef.onSnapshot((doc) => {
  //       console.log("Current data: ", doc.data());
  //   });
  // }, [docRef]);
  useEffect(() => {
    if (mail) {
      // docRef.get().then((doc) => {
      //   // рефералы
      //   const td = document.querySelectorAll(".table-refs__td");
      //   const levels = 5; // количество уровней и заполняемых ячеек в таблице
      //   for (let i = 0; i < doc.data().lvl; i++) {
      //     td[i].className = "table-refs__td table-refs__td_active";
      //     td[levels + i].className = "table-refs__td table-refs__td_active";
      //   }
      // });
    }
  }, [mail]);
  useEffect(() => {
    if (data.date) {
      setDate(new Date(data.date.seconds * 1000));
      if (Date.now() > Date.parse(date)) { // обнуление VIP
        docRef.set({
          lvl: 0,
          vip: 0,
          date: false
        }, { merge: true })
      }
    }
  }, [data.date]);
  useEffect(() => {
    if (data.vip !== data.lvl) {
      const day = 86400000
      // присвоить новый lvl
      // пройтись по рефералам и выдать 10%
      docRef.set({
        lvl: data.vip,
        date: data.vip > 3 ? new Date(Date.now() + day * 90) : new Date(Date.now() + day * 30),
        purchases: data.purchases + data.vip*100
      }, {
        merge: true
      })
      const cost = 10;
      let referrerMail = mail
      let referrerRef = db.collection('users')
      for (let i = 0; i < 5; i++) {
        console.log(referrerMail)
        db.collection('users').doc(`${referrerMail}`).get().then((doc) => {
          if (doc.exists) {
            console.log(doc.data())
            referrerMail = doc.data().referrer
            if (doc.data().referrer) {
              // referrerRef.doc(`${doc.data().referrer}`).get().then((doc) => {
              //   referrerRef.doc(`${doc.data().referrer}`).set({
              //     allow_money: doc.data().allow_money + cost*doc.data().vip,
              //     all_money: doc.data().all_money + cost*doc.data().vip
              //   }, { merge: true })
              // })
            } else {
              console.log(1)
            }
          }
        })
      }
    }
  }, [data.vip, data.lvl]);
  useEffect(() => {
    if (data) {
      dispatch({
        type: 'CLEAR_TASKS'
      })
      for (let i = 1; i <= 5; i++) {
        db.collection('tasks').doc(`${i}`).get().then((doc) => {
          if (doc.exists) {
            for (let key in doc.data()) {
              if (doc.data()[key].author === mail) {
                dispatch({
                  type: 'GET_USER_TASKS',
                  tasks: doc.data()[key]
                })
              }
            }
          }
        })
      }
    }
  }, [data])

  const withdrawal = () => {
    console.log(walletValue, outputValue);
  };
  const createTask = () => {
    if (data.clicks >= Number(totalClicksValue) * categoryValue.length) {
      const values = document.querySelectorAll(".category-input__url");
      let urls = [] // ссылки в задании
      values.forEach(({ value }) => {
        value.length > 0 ? urls.push(value) : urls.push('/') // пустые ссылки заменяются на "/"
      });
      /* 
        Reference example
        Firestore:
        tasks: { ...tasks, task1: { ...params }, task2 }
        users: { ...users, task_1: { id: 1, ref: tasks/task1 } }
      */
      let id = null; // id задания в коллекции tasks для хранения у user
      db.collection('tasks').doc(`${categoryValue.length}`).get().then((doc) => {
        if (doc.exists) {
          id = isNaN(Object.keys(doc.data())[0]) ? 0 : Number(Object.keys(doc.data())[Object.keys(doc.data()).length - 1]) + 1 // если индекс отсутствует, присвоить 0, иначе добавить 1 к предыдущему индексу
          db.collection('tasks').doc(`${categoryValue.length}`).set({
            [id]: {
              author: mail,
              reports: 0,
              total_clicks: Number(totalClicksValue),
              spent_clicks: 0,
              urls,
              id: createName(4)
            }
          }, { merge: true })
        }
      }).then(() => {
        docRef.set({
          clicks: data.clicks - Number(totalClicksValue) * categoryValue.length
        }, { merge: true })
      })
      dispatch({ // обновить клики
        type: 'UPDATE_USER_DATA',
        name: 'clicks',
        param: data.clicks - Number(totalClicksValue) * categoryValue.length
      })
    }
  }
  const copy = (e) => {
    e.persist();
    e.target.select();
    navigator.clipboard.writeText(e.target.value);
  }
  return (
    <div>
      <h1>Личный кабинет</h1>
      <h3>{mail} <span className="badge badge-primary" title="Уровень">{data.lvl}</span></h3>
      <h4>Кликов: {data.clicks}</h4>
      <label>Реферальная ссылка</label>
      <input type="url" value={`${window.location.origin}?ref=${mail}`} className="form-control" onClick={(e) => copy(e)} readOnly />
      <h4>Вывод средств</h4>
      <p>Доступно к выводу: {data.allow_money} ₽</p>
      <div className="row">
        <div className="form-group">
          <div className="input-group">
            <Input
              text="Номер кошелька ЮMoney"
              type="number"
              value={walletValue}
              setValue={setWalletValue}
              name="wallet"
              placeholder="410011112222333"
              i="0"
            />
          </div>
          <div className="input-group">
            <Input
              text="Сумма вывода"
              type="number"
              value={outputValue}
              setValue={setOutputValue}
              name="output"
              placeholder="1000"
              i="0"
            />
            <div className="input-group-append">
              <span className="input-group-text" id="rub">
                ₽
              </span>
            </div>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={withdrawal}>
          Заказать вывод
        </button>
      </div>
      <p>Всего выведено: {data.all_money} ₽</p>
      {/* <table>
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
      </table> */}
      <h4>Ваш уровень: {data.lvl}</h4>
      {!!date && (
        <p>Уровень активен до: {`${date.getDate()}/${date.getMonth() + 1}`}</p>
      )}
      <p>Общая сумма пополней: {data.purchases} ₽</p>
      <h4>Задания</h4>
      <h5>Ваши задания</h5>
      {tasks.map(data =>
        <div key={data.id}>
          <p>Категория: {data.urls.length}</p>
          <p>Доступно выполнений: {data.total_clicks - data.spent_clicks}/{data.total_clicks} <button type="button" className="btn btn-success btn-sm">+</button></p>
          <p>Ссылки: </p>
            <ul>
              {data.urls.map((link, i) => <li key={i}>{link}</li>)}
            </ul>
          <button type="button" className="btn btn-danger">Удалить</button>
        </div>)
      }
      <h5>Создать задание</h5>
      <div>
        <Select
          text="Выберите категорию (количество кликов на сайте)"
          name="category"
          value={categories}
          setValue={setCategoryValue}
        />
        <label>Количество выполнений</label>
        <input type="number" className="form-control" value={totalClicksValue} readOnly />
        <button type="button" className="btn btn-success btn-sm" onClick={() => setTotalClicksValue((prev) => prev + 10)}>+</button>
        {/* <Input
          text="Количество выполнений заданий"
          type="number"
          value={totalClicksValue}
          setValue={setTotalClicksValue}
          name="total_clicks"
          placeholder="10"
          i="0"
        /> */}
        {categoryValue.map((v, i) => (
          <div key={i}>
            <label>Ссылка</label>
            <input
              type="url"
              placeholder="https://google.com/"
              className="form-control category-input__url"
              id={i}
            />
          </div>
        ))}
        <button type="button" className="btn btn-success" onClick={createTask}>
          Создать задание
        </button>
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
