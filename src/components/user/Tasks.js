import React from 'react';
import firebase from 'firebase';
import { fb } from '../../utils/constants/firebase';
import { useDispatch } from 'react-redux';

const Tasks = ({ data, mail, tasks, setUpdate }) => {
	const dispatch = useDispatch()
	const tasksDB = fb.firestore().collection('tasks');
	const usersDB = fb.firestore().collection('users')

	const addCounts = ({ id }) => {
		const taskId = id.split('/')[0]; // идентификатор
		const taskDoc = id.split('/')[1]; // категория
		usersDB.doc(`${mail}`).get().then((doc) => {
			if (doc.exists && doc.data().clicks >= 10 * taskDoc) {
				usersDB.doc(`${mail}`).set({
					clicks: doc.data().clicks - 10 * taskDoc
				}, { merge: true })
					tasksDB
						.doc(`${taskDoc}`)
						.get()
						.then((doc) => {
							if (doc.exists) {
								for (let key in doc.data()) {
									if (doc.data()[key].id === taskId) {
										tasksDB.doc(`${taskDoc}`).update({
											[key]: firebase.firestore.FieldValue.delete()
										})
										const id = isNaN(
											Object.keys(doc.data())[Object.keys(doc.data()).length - 1]
										)
											? Object.keys(doc.data()).length
											: Number(
													Object.keys(doc.data())[Object.keys(doc.data()).length - 1]
												) + 1;
										tasksDB.doc(`${taskDoc}`).set(
											{
												[id]: {
													total_clicks: doc.data()[key].total_clicks + 10 * taskDoc,
													author: doc.data()[key].author,
													reports: doc.data()[key].reports,
													spent_clicks: doc.data()[key].spent_clicks,
													urls: doc.data()[key].urls,
													id: doc.data()[key].id,
													name: doc.data()[key].name,
													reportActive: doc.data()[key].reportActive,
													users: doc.data()[key].users
												}
											},
											{ merge: true }
										);
									}
								}
							}
						})
						.then(() => {
							dispatch({
								// обновить клики
								type: 'UPDATE_USER_DATA',
								name: 'clicks',
								param: doc.data().clicks - 10 * taskDoc
							})
						})
						.then(() => setUpdate((prev) => !prev))
				}
		})
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
	return (
		<div className="wrapper">
			<h2>Мои задания</h2>
			<h4>Клики: {data.clicks}</h4>
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
						Выполненено всего: {data.total_clicks / data.urls.length}/
						{(data.spent_clicks) / data.urls.length}{' '}
						<button
							id={`${data.id}/${data.urls.length}/add`}
							type="button"
							className="btn btn-success btn-sm"
							onClick={(e) => addCounts(e.target)}
						>
							Добавить 10 выполнений
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
		</div>
	);
};

export default Tasks;
