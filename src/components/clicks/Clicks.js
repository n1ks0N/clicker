import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fb } from "../../utils/constants/firebase";

const Clicks = () => {
  const { user: { mail } } = useSelector((store) => store)
  let { category } = useParams();
  const [tasks, setTasks] = useState({})
  const [completeUrls, setCompleteUrls] = useState([])
  const [update, setUpdate] = useState(false);
  useEffect(() => {
    fb.firestore().collection('tasks').doc(`${category}`).get().then((doc) => {
      if (doc.exists) {
        setTasks(doc.data())
      }
    })
  }, [category, update])

  const clickDone = ({ id, href }) => {
    const taskId = id.split('/')[0]
    setTimeout(() => {
      if (completeUrls[0] === taskId) {
        if (!completeUrls.some((val) => val.id === id)) setCompleteUrls((prev) => [...prev, { id: id, href: href }])
      } else {
        setCompleteUrls([taskId, { id: id, href: href }])
      }
    }, 10000)
  }
  const report = ({ id }) => {
    const taskId = id.split('/')[0]
    fb.firestore().collection('tasks').doc(`${category}`).get().then((doc) => {
      if (doc.exists) {
        for (let key in doc.data()) {
          if (doc.data()[key].id === taskId) {
            fb.firestore().collection('tasks').doc(`${category}`).set({
              reports: doc.data()[key].reports + 1
            }, { merge: true })
          }
        }
      }
    })
  }

  useEffect(() => {
    if (completeUrls.length - 1 === Number(category)) {
      let author = null;
      fb.firestore().collection('tasks').doc(`${category}`).get().then((doc) => {
        if (doc.exists) {
          for (let key in doc.data()) {
            if (doc.data()[key].id === completeUrls[0]) {
              author = doc.data()[key].author
              fb.firestore().collection('tasks').doc(`${category}`).set({
                [key]: {
                  spent_clicks: doc.data()[key].spent_clicks + Number(category)
                }
              }, { merge: true })
            }
          }
        }
      }).then(() => {
        fb.firestore().collection('users').doc(`${author}`).get().then((doc) => {
          if (doc.exists) {
            fb.firestore().collection('users').doc(`${author}`).set({
              clicks: doc.data().clicks + Number(category),
            }, { merge: true })
          }
        })
      }).then(() => setUpdate(prev => !prev))
    }
  }, [completeUrls])
  return (
    <div>
      <h1>Категория: {category} клика</h1>
      <div>
        {Object.values(tasks).reverse().map((data, i) =>
          !!(data.total_clicks > data.spent_clicks) && <div key={i}>
            <h3>{data.name}</h3>
            <p>Автор: {data.author}</p>
            {data.urls.map((link, i) => <a href={link} key={i} target="_blank" id={`${data.id}/${i}`} onClick={(e) => clickDone(e.currentTarget)}><button type="button" className="btn btn-primary">Кликнуть</button></a>)
            }
            <button type="button" id={`${data.id}/rep`} className="btn btn-danger btn-sm" onClick={(e) => report(e.target)}>Пожаловаться</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clicks;
