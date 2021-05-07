import React, { useCallback, useContext, useState } from "react";
import { withRouter, Redirect, Link } from "react-router-dom";
import { fb } from "../utils/constants/firebase";
import { AuthContext } from "./Auth.js";

const Login = ({ history }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      const { email, password } = e.target.elements;
      try {
        await fb.auth().signInWithEmailAndPassword(email.value, password.value);
        history.push("/user");
      } catch (error) {
        switch (error.code) {
          case "auth/user-not-found":
            setErrorMessage("Пользователь с такой почтой и паролем не найден");
            break;
          case "auth/wrong-password":
            setErrorMessage("Неверный пароль");
            break;
          default:
            setErrorMessage("Произошла ошибка. Пожалуйста, попробуйте позже");
        }
      }
    },
    [history]
  );

  const { currentUser } = useContext(AuthContext);

  if (currentUser) return <Redirect to="/" />;

  return (
    <div className="log__wrapper">
      <h1>Войдите в аккаунт</h1>
      <form onSubmit={handleLogin}>
        <label>Почта</label>
        <input
          name="email"
          type="email"
          placeholder="example@mail.ru"
          className="form-control"
          autoComplete="on"
          required
        />
        <div className="invalid-feedback">{errorMessage}</div>
        <label>Пароль</label>
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="form-control"
          autoComplete="on"
          required
        />
        <button type="submit" className="btn btn-success">
          Войти
        </button>
        <button type="button" className="btn btn-secondary btn-sm">
          Забыл пароль
        </button>
        <Link to="/sign">
          <button type="button" className="btn btn-link">
            Ещё нет аккаунта? Зарегистрируйтесь!
          </button>
        </Link>
      </form>
    </div>
  );
};

export default withRouter(Login);
