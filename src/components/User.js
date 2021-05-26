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
		tasks: { tasks }
	} = useSelector((store) => store);

	const [date, setDate] = useState(null);
	const [update, setUpdate] = useState(false);
	const [step, setStep] = useState(-1);
	const [referrer, setReferrer] = useState(false);

	const tasksDB = fb.firestore().collection('tasks');
	const usersDB = fb.firestore().collection('users');
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
			// setDate(new Date(data.date.seconds * 1000));
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
	// useEffect(() => {
	// 	fb.firestore()
	// 		.collection('users')
	// 		.doc(`example@mail.ru`)
	// 		.set(
	// 			{
	// 				refs: [
	// 					{ count: 0, sum: 0 },
	// 					{ count: 0, sum: 0 },
	// 					{ count: 0, sum: 0 },
	// 					{ count: 0, sum: 0 },
	// 					{ count: 0, sum: 0 }
	// 				]
	// 			},
	// 			{ merge: true }
	// 		);
	// }, []);
	// useEffect(() => {
	// 	if (step >= 0 && step < 5 && referrer) {
	// 		console.log(step, referrer)
	// 		usersDB.doc(`${referrer}`).get().then((doc) => {
	// 			if (doc.exists) {
	// 				// console.log(referrer)
	// 				if (doc.data().referrer) {
	// 					setReferrer(doc.data().referrer)
	// 				} else {
	// 					setStep(5)
	// 				}
	// 				usersDB.doc(`${doc.data().referrer}`).get().then((doc) => {
	// 					if (doc.exists) {
	// 						const money = doc.data().allow_money + data.vip * 10;
	// 						console.log(money)
	// 						const referals = doc.data().refs;
	// 						referals[step].sum += data.vip * 100
	// 						usersDB.doc(`${referrer}`).set({
	// 							allow_money: money,
	// 							refs: referals
	// 						}, { merge: true })
	// 					}
	// 				})
	// 			}
	// 		}).then(() => {
	// 			setStep(prev => prev+1)
	// 		})
	// 	}
	// }, [step], [referrer])
	useEffect(() => {
		if (data.vip !== data.lvl && mail) {
			const day = 86400000;
			// присвоить новый lvl
			// пройтись по рефералам и выдать 10%
			// userDoc.set({
			//   lvl: data.vip,
			//   date: data.vip > 3 ? new Date(Date.now() + day * 90) : new Date(Date.now() + day * 30),
			// }, {
			//   merge: true
			// })
			// let referrer = mail;
			setReferrer(mail);
			setStep(0);
			// for (let i = 0; i < 5; i++) {
			// 	setStep(i);
			// }
		}
	}, [data.vip, data.lvl]);
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
			// dispatch({
			// 	type: 'CLEAR_BIDS',
			// })
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
			<h1>Личный кабинет</h1>
			{param === '?profile' ? (
				<Profile data={data} mail={mail} setUpdate={setUpdate} />
			) : param === '?more_clicks' ? (
				<MoreClicks data={data} mail={mail} setUpdate={setUpdate} />
			) : param === '?refs' ? (
				<Refs data={data} mail={mail} />
			) : param === '?add' ? (
				<Add data={data} mail={mail} setUpdate={setUpdate} />
			) : param === '?tasks' ? (
				<Tasks tasks={tasks} setUpdate={setUpdate} />
			) : param === '?exchange' ? (
				<Exchange data={data} mail={mail} setUpdate={setUpdate} />
			) : (
				<></>
			)}
			<h4>Ваш уровень: {data.lvl}</h4>
			{!!date && (
				<p>
					Уровень активен до:{' '}
					{`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}
				</p>
			)}
			<p>Общая сумма пополней: {data.purchases} ₽</p>
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
