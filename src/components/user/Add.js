import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fb } from '../../utils/constants/firebase';
import Input from '../../elements/Input';
import Select from '../../elements/Select';

import { categories } from '../../utils/constants/const.json';
import { createName } from '../../utils/functions/func';

const Add = ({ data, mail, setUpdate }) => {
	const dispatch = useDispatch();
	const { info: { info } } = useSelector(store => store)
	const [nameValue, setNameValue] = useState('');
	const [categoryValue, setCategoryValue] = useState([1]);
	const [totalClicksValue, setTotalClicksValue] = useState(0);
	const tasksDB = fb.firestore().collection('tasks');
	const userDoc = mail
		? fb.firestore().collection('users').doc(`${mail}`)
		: false;
	const createTask = () => {
		let allow = true;
		const values = document.querySelectorAll('.category-input__url');
		info.urls.forEach(url => values.forEach(({ value }) => {
			if (url === value) allow = false
		}))
		if (data.clicks >= Number(totalClicksValue) * categoryValue.length && totalClicksValue && allow) {
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
			tasksDB
				.doc(`${categoryValue.length}`)
				.get()
				.then((doc) => {
					if (doc.exists) {
						const id = isNaN(
							Object.keys(doc.data())[Object.keys(doc.data()).length - 1]
						)
							? Object.keys(doc.data()).length
							: Number(
									Object.keys(doc.data())[Object.keys(doc.data()).length - 1]
							  ) + 1; // если индекс отсутствует, присвоить 0, иначе добавить 1 к предыдущему индексу
						tasksDB.doc(`${categoryValue.length}`).set(
							{
								[id]: {
									author: mail,
									reports: 0,
									total_clicks: Number(totalClicksValue) * categoryValue.length,
									spent_clicks: 0,
									urls,
									id: createName(4),
									name: nameValue.substr(0, 69)
								}
							},
							{ merge: true }
						);
					}
				})
				.then(() => {
					userDoc.get().then((doc) => {
						if (doc.exists) {
							userDoc.set(
								{
									clicks:
										doc.data().clicks -
										10 -
										totalClicksValue * categoryValue.length
								},
								{ merge: true }
							);
						}
					});
				})
				.then(() =>
					dispatch({
						// обновить клики
						type: 'UPDATE_USER_DATA',
						name: 'clicks',
						param: data.clicks - 10 - Number(totalClicksValue) * categoryValue.length
					})
				)
				.then(() => setUpdate((prev) => !prev))
		}
	};
	return (
		<div className="wrapper">
			<h2>Добавить задание</h2>
			<h4>Клики: {data.clicks}</h4>
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
		</div>
	);
};

export default Add;
