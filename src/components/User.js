import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import firebase from 'firebase';
import { fb } from '../utils/constants/firebase';

import Profile from './user/Profile';
import MoreClicks from './user/MoreClicks';
import Refs from './user/Refs';
import Tasks from './user/Tasks';
import Exchange from './user/Exchange';
import Add from './user/Add';

import './User.css';

const User = () => {
	const dispatch = useDispatch();
	const {
		user: { data, mail },
		tasks: { tasks },
		info: { info }
	} = useSelector((store) => store);
	const [update, setUpdate] = useState(false);

	const tasksDB = fb.firestore().collection('tasks');
	const bidsDoc = fb.firestore().collection('tasks').doc('bids');
	const userDoc = mail
		? fb.firestore().collection('users').doc(`${mail}`)
		: false;

	const [param, setParam] = useState(window.location.search);
	useEffect(() => {
		setParam(window.location.search);
	}, [window.location.search]);
	useEffect(() => {
		if (data.date) {
			if (Date.now() > data.date.seconds * 1000) {
				// обнуление VIP
				userDoc.set(
					{
						lvl: 0,
						vip: 0,
						date: false
					},
					{ merge: true }
				);
			}
		}
	}, [data.date]);
	useEffect(() => {
		if (mail) {
			dispatch({
				type: 'CLEAR_TASKS'
			});
			for (let i = 1; i <= 5; i++) {
				// перенести в tasks
				tasksDB
					.doc(`${i}`)
					.get()
					.then((doc) => {
						if (doc.exists) {
							for (let key in doc.data()) {
								if (doc.data()[key].author === mail) {
									dispatch({
										type: 'GET_USER_TASK',
										task: doc.data()[key]
									});
								}
							}
						}
					});
			}
			bidsDoc.get().then((doc) => {
				// перенести в exchange
				if (doc.exists) {
					dispatch({
						type: 'GET_BIDS',
						bids: Object.values(doc.data()).reverse()
					});
				}
			});
			userDoc.get().then((doc) => {
				if (doc.exists) {
					dispatch({
						type: 'GET_USER_DATA',
						data: doc.data(),
						mail: mail
					});
				}
			});
		}
	}, [mail, update]);

	return (
		<div>
			<header>
				<menu>
					<Link to="/user?profile">
						<li>Профиль</li>
					</Link>
					<Link to="/user?more_clicks">
						<li>Больше кликов</li>
					</Link>
					<Link to="/user?refs">
						<li>Партнёрская программа</li>
					</Link>
					<Link to="/user?add">
						<li>Добавить задание</li>
					</Link>
					<Link to="/user?tasks">
						<li>Мои задания</li>
					</Link>
					<Link to="/user?exchange">
						<li>Купить/Продать клики</li>
					</Link>
				</menu>
			</header>
			<div className="wrapper">
			<h1 align="center">Личный кабинет</h1>
			{param === '?profile' ? (
				<Profile data={data} mail={mail} setUpdate={setUpdate} />
			) : param === '?more_clicks' ? (
				<MoreClicks data={data} mail={mail} setUpdate={setUpdate} />
			) : param === '?refs' ? (
				<Refs data={data} mail={mail} />
			) : param === '?add' ? (
				<Add data={data} mail={mail} setUpdate={setUpdate} />
			) : param === '?tasks' ? (
				<Tasks data={data} mail={mail} tasks={tasks} setUpdate={setUpdate} />
			) : param === '?exchange' ? (
				<Exchange data={data} mail={mail} setUpdate={setUpdate} />
			) : (
				<></>
			)}
			{!!info.texts && info.texts.map((data, i) => 
				!!(data.place === param) && 
				<p key={i} className="user__text" dangerouslySetInnerHTML={{__html: data.result}} />
			)}
			<button
				type="button"
				className="btn btn-secondary btn-sm"
				onClick={() => fb.auth().signOut()}
			>
				Выйти
			</button>
		</div>
		</div>
	);
};

export default User;
