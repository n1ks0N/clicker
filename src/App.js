import React, { useState, useEffect, useMemo } from 'react';
import { urlAd, keyAd } from './utils/constants/api.json';
import { Route, Switch, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Clicks from './components/clicks/Clicks';
import Admin from './components/Admin/Admin'
import User from './components/User';
import { AuthProvider } from './components/Auth';
import Login from './components/Login';
import Sign from './components/Sign';
import PrivateRoute from './components/PrivateRoute';
import './App.css';
import { fb } from './utils/constants/firebase';

const App = () => {
	const { user: { alert } } = useSelector((store) => store)
	const alertStyle = useMemo(
		() => ({
			display: alert ? 'block' : 'none'
		}),
		[alert]
	);
	useEffect(() => {
		if (alert) {
			setTimeout(() => {
				dispatch({
					type: 'UPDATE_ALERT',
					alert: false
				});
			}, 3000);
		}
	}, [alert]);
	const dispatch = useDispatch();
	const activeReferrer = useLocation().search.split('=')[1];

	const [users, setUsers] = useState(0)
	useEffect(() => {
		fb.firestore().collection('users').get().then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				setUsers(prev => prev + 1)
			});
		})
	}, [])
	const [data, setData] = useState(null); // jsonbin: рекламный контент, админ-панель

	useEffect(() => {
		// начилие реферала
		if (activeReferrer) {
			dispatch({
				type: 'GET_REFERRER',
				activeReferrer: activeReferrer
			});
		} let script = document.createElement('script');
		script.src = 'https://yastatic.net/share2/share.js';
		script.async = true;
		document.body.appendChild(script);

		// получение данных из jsonbin; преобладает рекламный контент
		let req = new XMLHttpRequest();
		req.onreadystatechange = () => {
			// eslint-disable-next-line
			if (req.readyState == XMLHttpRequest.DONE) {
				const result = JSON.parse(req.responseText).record;
				setData(() => result);
				dispatch({
					type: 'GET_INFO',
					info: result
				})
				for (let i = 0; i < result.header.banners.length; i++) {
					let script = document.createElement('script');
					script.src = result.header.banners[i].div.split(`'`)[3];
					script.async = true;
					document.body.appendChild(script);
				}
				for (let i = 0; i < result.header.linkslot.length; i++) {
					let script = document.createElement('script');
					script.src = result.header.linkslot[i].div.split(`'`)[13];
					script.async = true;
					document.body.appendChild(script);
				}
				for (let i = 0; i < result.footer.linkslot.length; i++) {
					let script = document.createElement('script');
					script.src = result.footer.linkslot[i].div.split(`'`)[13];
					script.async = true;
					document.body.appendChild(script);
				}
			}
		};
		req.open('GET', urlAd, true);
		req.setRequestHeader('X-Master-Key', keyAd);
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
						<li style={{ fontSize: '26px', fontWeight: 'bold' }}>Кликер</li>
					</Link>
					<Link to="/clicks?1">
						<li>1 клик</li>
					</Link>
					<Link to="/clicks?2">
						<li>2 клика</li>
					</Link>
					<Link to="/clicks?3">
						<li>3 клика</li>
					</Link>
					<Link to="/clicks?4">
						<li>4 клика</li>
					</Link>
					<Link to="/clicks?5">
						<li>5 кликов</li>
					</Link>
					<Link to="/user?profile">
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
				<AuthProvider>
					<Switch>
						<Route exact path="/">
							<div className="app">
								<h4>Сайт работает: {Math.ceil((Date.now() - 1622201139119) / 86400000)} дней</h4>
								<h4>Зарегистрировано: {users}</h4>
								{!!data &&
									data.info.texts.map((data, i) =>
										!!(data.place === '/') && <div key={i} dangerouslySetInnerHTML={{ __html: data.result }} />
									)
								}
								<Link to="/sign"><button type="button" className="btn btn-success">Регистрация</button></Link>
								<Link to="/user?profile"><button type="button" className="btn btn-primary">Войти</button></Link>
							</div>
						</Route>
						<Route exact path="/admin" component={Admin} />
						<Route path="/clicks" component={Clicks} />
						<PrivateRoute path="/user" component={User} />
						<Route path="/login" component={Login} />
						<Route path="/sign" component={Sign} />
					</Switch>
				</AuthProvider>
				<div className="ad__list ad__list__column">
					{!!data &&
						data.footer.banners.map((data, i) => (
							<div key={i} dangerouslySetInnerHTML={{ __html: data.div }} />
						))}
				</div>
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
				className="ya-share2 ya-share"
				data-curtain
				data-size="l"
				data-shape="round"
				data-services="vkontakte,facebook,odnoklassniki,telegram,twitter,viber,whatsapp,moimir"
			/>
			<div
				className="alert alert-secondary main__alert"
				style={alertStyle}
				role="alert"
			>
				{alert}	
			</div>
		</>
	);
};

export default App;
