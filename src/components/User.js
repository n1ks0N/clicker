import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firebase from 'firebase';
import { fb } from '../utils/constants/firebase';
import Input from '../elements/Input';
import Select from '../elements/Select';
import { categories } from '../utils/constants/const.json';
import { createName } from '../utils/functions/func';
import './User.css';

const User = () => {
	const dispatch = useDispatch();
	const {
		user: { data, mail },
		tasks: { tasks }
	} = useSelector((store) => store);
	const [date, setDate] = useState(null);
	const [walletValue, setWalletValue] = useState('');
	const [outputValue, setOutputValue] = useState('');
	const [nameValue, setNameValue] = useState('');
	const [categoryValue, setCategoryValue] = useState([1]);
	const [totalClicksValue, setTotalClicksValue] = useState(10);
	const [update, setUpdate] = useState(false);
	const [step, setStep] = useState(-1)
	const [referrer, setReferrer] = useState(false)
	const tasksDB = fb.firestore().collection('tasks');
	const usersDB = fb.firestore().collection('users');
	const docRef = mail ? fb.firestore().collection('users').doc(`${mail}`) : false;
	useEffect(() => {
		if (data.refs) {
			docRef.get().then((doc) => {
				// рефералы
				const countElements = document.querySelectorAll('.table-refs__count');
				const sumElements = document.querySelectorAll('.table-refs__sum');
				if (doc.exists) {
					doc.data().refs.forEach(({ count, sum }, i) => {
						countElements[i].textContent = count;
						sumElements[i].textContent = sum;
					});
				}
			});
		}
	}, [data.refs]);
	useEffect(() => {
		if (data.date) {
			setDate(new Date(data.date.seconds * 1000));
			if (Date.now() > Date.parse(date)) {
				// обнуление VIP
				docRef.set(
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
	useEffect(() => {
		if (step >= 0 && step < 5 && referrer) {
			console.log(referrer)
			usersDB.doc(`${referrer}`).get().then((doc) => {
				if (doc.exists) {
					// console.log(referrer)
					setReferrer(doc.data().referrer)
					// console.log(doc.data().referrer, referrer)
					usersDB.doc(`${doc.data().referrer}`).get().then((doc) => {
						if (doc.exists) {
							const referals = doc.data().refs;
							referals[step].sum += data.vip * 100
							usersDB.doc(`${referrer}`).set({
								allow_money: doc.data().allow_money + data.vip * 10,
								refs: referals
							}, { merge: true })
						}
					})
				}
			}).then(() => setStep(prev => prev+1))
		}
	}, [step], [referrer])
	useEffect(() => {
		if (data.vip !== data.lvl && mail) {
			const day = 86400000;
			// присвоить новый lvl
			// пройтись по рефералам и выдать 10%
			// docRef.set({
			//   lvl: data.vip,
			//   date: data.vip > 3 ? new Date(Date.now() + day * 90) : new Date(Date.now() + day * 30),
			//   purchases: data.purchases + data.vip * 100
			// }, {
			//   merge: true
			// })
			// let referrer = mail;
			console.log('yes')
			setReferrer(mail)
			setStep(0)
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
		}
	}, [mail, update]);

	const withdrawal = () => {
		if (
			walletValue &&
			Number(outputValue) > 0 &&
			Number(outputValue) <= data.allow_money
		) {
			docRef.get().then((doc) => {
				if (doc.exists) {
					docRef.set(
						{
							output_money: doc.data().output_money + Number(outputValue), // всего выведено
							allow_money: doc.data().allow_money - outputValue // доступно к выводу
						},
						{ merge: true }
					);
				}
			});
			dispatch({
				type: 'UPDATE_USER_DATA',
				name: 'allow_money',
				param: data.allow_money - outputValue
			});
			dispatch({
				type: 'UPDATE_USER_DATA',
				name: 'output_money',
				param: data.output_money + Number(outputValue)
			});
		}
	};
	const createTask = () => {
		if (data.clicks >= Number(totalClicksValue) * categoryValue.length) {
			const values = document.querySelectorAll('.category-input__url');
			let urls = []; // ссылки в задании
			values.forEach(({ value }) => {
				value.length > 0
					? value.includes('://')
						? urls.push(value)
						: urls.push(`//${value}`)
					: urls.push('/'); // пустые ссылки заменяются на "/"; перед ссылками без "://" добавляется "//" для корректной работы ссылок
			});
			/* 
				Пример хранения данных в БД
				Firestore:
				tasks: { ...tasks, task1: { ...params }, task2 }
				users: { ...users, task_1: { id: 1, ref: tasks/task1 } }
			*/
			let id = null; // id задания в коллекции tasks для хранения у user
			tasksDB
				.doc(`${categoryValue.length}`)
				.get()
				.then((doc) => {
					if (doc.exists) {
						id = isNaN(Object.keys(doc.data())[0])
							? 0
							: Number(
								Object.keys(doc.data())[Object.keys(doc.data()).length - 1]
							) + 1; // если индекс отсутствует, присвоить 0, иначе добавить 1 к предыдущему индексу
						tasksDB.doc(`${categoryValue.length}`).set(
							{
								[id]: {
									author: mail,
									reports: 0,
									total_clicks: Number(totalClicksValue),
									spent_clicks: 0,
									urls,
									id: createName(4),
									name:
										nameValue.length > 70 ? nameValue.substr(0, 69) : nameValue
								}
							},
							{ merge: true }
						);
					}
				})
				.then(() => {
					docRef.set(
						{
							clicks:
								data.clicks - Number(totalClicksValue) * categoryValue.length
						},
						{ merge: true }
					);
				})
				.then(() => setUpdate((prev) => !prev)).then(() =>
					dispatch({
						// обновить клики
						type: 'UPDATE_USER_DATA',
						name: 'clicks',
						param: data.clicks - Number(totalClicksValue) * categoryValue.length
					}))
		}
	};
	const addCounts = ({ id }) => {
		const taskId = id.split('/')[0]; // идентификатор
		const taskDoc = id.split('/')[1]; // категория
		tasksDB
			.doc(`${taskDoc}`)
			.get()
			.then((doc) => {
				if (doc.exists) {
					for (let key in doc.data()) {
						if (doc.data()[key].id === taskId) {
							tasksDB.doc(`${taskDoc}`).set(
								{
									[key]: {
										total_clicks: doc.data()[key].total_clicks + 10
									}
								},
								{ merge: true }
							);
						}
					}
				}
			})
			.then(() => setUpdate((prev) => !prev));
	};
	const deleteTask = ({ id }) => {
		const taskId = id.split('/')[0];
		const taskDoc = id.split('/')[1];
		tasksDB
			.doc(`${taskDoc}`)
			.get()
			.then((doc) => {
				if (doc.exists) {
					for (let key in doc.data()) {
						if (doc.data()[key].id === taskId) {
							tasksDB.doc(`${taskDoc}`).update({
								[key]: firebase.firestore.FieldValue.delete()
							});
						}
					}
				}
			})
			.then(() => setUpdate((prev) => !prev));
	};
	const copy = (e) => {
		e.persist();
		e.target.select();
		navigator.clipboard.writeText(e.target.value);
	};
	return (
		<div>
			<h1>Личный кабинет</h1>
			<h3>
				{mail}{' '}
				<span className="badge badge-primary" title="Уровень">
					{data.lvl}
				</span>
			</h3>
			<h4>Кликов: {data.clicks}</h4>
			<label>Реферальная ссылка</label>
			<input
				type="url"
				value={`${window.location.origin}?ref=${mail}`}
				className="form-control"
				onClick={(e) => copy(e)}
				readOnly
			/>
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
						<td className="table-refs__td table-refs__count">0</td>
						<td className="table-refs__td table-refs__count">0</td>
						<td className="table-refs__td table-refs__count">0</td>
						<td className="table-refs__td table-refs__count">0</td>
						<td className="table-refs__td table-refs__count">0</td>
					</tr>
					<tr>
						<td>Траты рефералов</td>
						<td className="table-refs__td table-refs__sum">0</td>
						<td className="table-refs__td table-refs__sum">0</td>
						<td className="table-refs__td table-refs__sum">0</td>
						<td className="table-refs__td table-refs__sum">0</td>
						<td className="table-refs__td table-refs__sum">0</td>
					</tr>
				</tbody>
			</table>
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
							min="1"
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
			<p>Всего выведено: {data.output_money} ₽</p>
			<h4>Ваш уровень: {data.lvl}</h4>
			{!!date && (
				<p>
					Уровень активен до:{' '}
					{`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}
				</p>
			)}
			<p>Общая сумма пополней: {data.purchases} ₽</p>
			<h4>Задания</h4>
			<h5>Ваши задания</h5>
			{tasks.map((data, i) => (
				<div
					key={i}
					className={
						data.total_clicks > data.spent_clicks
							? 'task_active'
							: 'task_disabled'
					}
				>
					<h5>{data.name}</h5>
					<p>Категория: {data.urls.length}</p>
					<p>
						Доступно выполнений: {data.total_clicks - data.spent_clicks}/
						{data.total_clicks}{' '}
						<button
							id={`${data.id}/${data.urls.length}/add`}
							type="button"
							className="btn btn-success btn-sm"
							onClick={(e) => addCounts(e.target)}
						>
							+
						</button>
					</p>
					<p>Ссылки: </p>
					<ul>
						{data.urls.map((link, i) => (
							<li key={i}>{link}</li>
						))}
					</ul>
					<p>Жалоб: {data.reports}</p>
					<button
						type="button"
						className="btn btn-danger"
						id={`${data.id}/${data.urls.length}/del`}
						onClick={(e) => deleteTask(e.target)}
					>
						Удалить
					</button>
				</div>
			))}
			<h5>Создать задание</h5>
			<div>
				<Input
					text="Название задания"
					name="name"
					value={nameValue}
					setValue={setNameValue}
					placeholder="Какой-то текст..."
					i="0"
				/>
				<Select
					text="Выберите категорию (количество кликов на сайте)"
					name="category"
					value={categories}
					setValue={setCategoryValue}
				/>
				<label>Количество выполнений</label>
				<input
					type="number"
					className="form-control"
					value={totalClicksValue}
					readOnly
				/>
				<button
					type="button"
					className="btn btn-success btn-sm"
					onClick={() => setTotalClicksValue((prev) => prev + 10)}
				>
					Добавить 10 выполнений
				</button>
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
