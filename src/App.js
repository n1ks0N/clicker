import React, { useState, useLayoutEffect, useContext } from "react";
import { urlAd, keyAd } from "./utils/constants/api.json";
import { Route, Switch, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fb } from "./utils/constants/firebase";
import { AuthProvider, AuthContext } from "./components/Auth";
import Login from "./components/Login";
import Sign from "./components/Sign";
import User from "./components/User";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";

const App = () => {
  const dispatch = useDispatch();
  const referrer = useLocation().search.split("=")[1];

  const [data, setData] = useState(null); // jsonbin: рекламный контент, админ-панель
  useLayoutEffect(() => {
    // начилие реферала
    if (referrer) {
      dispatch({
        type: "GET_USER_DATA",
        referrer: referrer,
      });
    }
    // сохранение данных зарегистрированного пользователя
    fb.auth().onAuthStateChanged(function (user) {
      if (user) {
        const docRef = fb.firestore().collection("users").doc(`${user.email}`);
        docRef
          .get()
          .then((doc) => {
            if (doc.exists) {
              dispatch({
                type: "GET_USER_DATA",
                mail: user.email,
                all_money: doc.data().all_money,
                allow_money: doc.data().allow_money,
                clicks: doc.data().clicks,
                date: doc.data().date,
                lvl: doc.data().lvl,
                purchases: doc.data().purchases,
                refs: doc.data().refs,
              });
            } else {
              // Пользователь незарегистрирован
            }
          })
          .catch((error) => {
            // Ошибка
          });
      } else {
        // Пользователь не залогнинен
      }
    });

    // получение данных из jsonbin; преобладает рекламный контент
    let req = new XMLHttpRequest();
    req.onreadystatechange = () => {
      // eslint-disable-next-line
      if (req.readyState == XMLHttpRequest.DONE) {
        const result = JSON.parse(req.responseText).record;
        setData(() => result);
        for (let i = 0; i < result.header.banners.length; i++) {
          let script = document.createElement("script");
          script.src = result.header.banners[i].div.split(`'`)[3];
          script.async = true;
          document.body.appendChild(script);
        }
        for (let i = 0; i < result.header.linkslot.length; i++) {
          let script = document.createElement("script");
          script.src = result.header.linkslot[i].div.split(`'`)[13];
          script.async = true;
          document.body.appendChild(script);
        }
        for (let i = 0; i < result.footer.linkslot.length; i++) {
          let script = document.createElement("script");
          script.src = result.footer.linkslot[i].div.split(`'`)[13];
          script.async = true;
          document.body.appendChild(script);
        }
        let script = document.createElement("script");
        script.src = "https://yastatic.net/share2/share.js";
        script.async = true;
        document.body.appendChild(script);
      }
    };
    req.open("GET", "urlAd", true);
    req.setRequestHeader("X-Master-Key", keyAd);
    req.send();

    // автор
    console.log(`
	   _ _                    
 _ __ (_) | _____  ___  _ __  
| '_ \\| | |/ / __|/ _ \\| '_ \\ 
| | | | |   <\\__ \\ (_) | | | |
|_| |_|_|_|\\_\\___/\\___/|_| |_|

Powered on ReactJS 
by https://github.com/n1ks0N
			`);
  }, []);
  return (
    <>
      <div className="bg"></div>
      <header>
        <menu>
          <Link to="/">
            <li>Главная</li>
          </Link>
          <Link to="/user">
            <li>Личный кабинет</li>
          </Link>
        </menu>
      </header>
      <main>
        {/* рекламная секция */}
        <div className="header">
          <div className="ad__list ad__list__links">
            {!!data &&
              data.header.textButtons.map((data, i) => (
                <a
                  className="ad__list__links"
                  key={i}
                  target="_blank"
                  rel="noreferrer"
                  href={`${data.link}`}
                >
                  {data.text}
                </a>
              ))}
          </div>
          <div className="ad__list">
            {!!data &&
              data.header.linkslot.map((data, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: data.div }} />
              ))}
          </div>
          <div className="ad__list">
            {!!data &&
              data.header.banners.map((data, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: data.div }} />
              ))}
          </div>
        </div>
        <Switch>
          <AuthProvider>
            <PrivateRoute path="/user" component={User} />
            <Route path="/login" component={Login} />
            <Route path="/sign" component={Sign} />
          </AuthProvider>
        </Switch>
        <div className="ad__list">
          {/* рекламная секция */}
          {!!data &&
            data.footer.linkslot.map((data, i) => (
              <div key={i} dangerouslySetInnerHTML={{ __html: data.div }} />
            ))}
        </div>
      </main>
      <footer>
        <div className="footer__socials">
          <h2 className="footer__title">
            {!!data && data.footer.name[0].text}
          </h2>
          <div className="footer__links">
            {!!data &&
              data.footer.socials.map((data, i) => (
                <a
                  key={i}
                  href={data.link}
                  className="footer__link"
                  target="_blank"
                >
                  {data.text}
                </a>
              ))}
          </div>
        </div>
        <div className="hider">
          © 2021 <br />
          Создание сайтов — Nikson
        </div>
      </footer>
      <div
        className="ya-share2"
        data-curtain
        data-size="l"
        data-shape="round"
        data-services="vkontakte,facebook,odnoklassniki,telegram,twitter,viber,whatsapp,moimir"
      />
    </>
  );
};

export default App;
