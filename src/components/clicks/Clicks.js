import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fb } from '../../utils/constants/firebase';

const Clicks = () => {
	const {
		user: { mail }
	} = useSelector((store) => store);
	let { category } = useParams();
	const [tasks, setTasks] = useState({});
	const [completeUrls, setCompleteUrls] = useState([]);
	const [update, setUpdate] = useState(false);
	const [observer, setObserver] = useState(false); // отслеживает выполнение заданий
	const [sumTime, setSumTime] = useState(15); // считает время, проводимое на ссылках из заданий
	const tasksDB = fb.firestore().collection('tasks');
	const docRef = mail ? fb.firestore().collection('users').doc(`${mail}`) : '';
	window.onfocus = () => {
		if (observer) {
			setObserver(false);
		}
	};
	useEffect(() => {
		tasksDB
			.doc(`${category}`)
			.get()
			.then((doc) => {
				if (doc.exists) {
					setTasks(doc.data());
				}
			});
	}, [category, update]);
	useEffect(() => {
		if (observer && sumTime > 0) {
			let timerId = setTimeout(() => {
				setSumTime((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(timerId);
		}
	}, [observer, sumTime]);

	const clickDone = ({ id, href }) => {
		setObserver(true);
		const taskId = id.split('/')[0];
		if (completeUrls[0] === taskId) {
			if (!completeUrls.some((val) => val.id === id))
				setCompleteUrls((prev) => [...prev, { id: id, href: href }]);
		} else {
			setCompleteUrls([taskId, { id: id, href: href }]);
		}
	};
	const report = ({ id }) => {
		const taskId = id.split('/')[0];
		tasksDB
			.doc(`${category}`)
			.get()
			.then((doc) => {
				if (doc.exists) {
					for (let key in doc.data()) {
						if (doc.data()[key].id === taskId) {
							tasksDB.doc(`${category}`).set(
								{
									[key]: {
										reports: doc.data()[key].reports + 1
									}
								},
								{ merge: true }
							);
						}
					}
				}
			});
	};
	useEffect(() => {
		if (completeUrls.length - 1 === Number(category) && sumTime <= 0) {
			setSumTime(15);
			tasksDB
				.doc(`${category}`)
				.get()
				.then((doc) => {
					if (doc.exists) {
						for (let key in doc.data()) {
							if (doc.data()[key].id === completeUrls[0]) {
								tasksDB.doc(`${category}`).set(
									{
										[key]: {
											spent_clicks:
												doc.data()[key].spent_clicks + Number(category)
										}
									},
									{ merge: true }
								);
							}
						}
					}
				})
				.then(() => {
					fb.firestore()
						.collection('users')
						.doc(`${mail}`)
						.get()
						.then((doc) => {
							if (doc.exists) {
								docRef.set(
									{
										clicks: doc.data().clicks + Number(category)
									},
									{ merge: true }
								);
							}
						});
				})
				.then(() => setUpdate((prev) => !prev));
		} else if (completeUrls.length - 1 === Number(category)) {
			setCompleteUrls([]);
		}
	}, [completeUrls]);
	return (
		<div>
			<h1>Категория: {category} клика</h1>
			<div>
				{Object.values(tasks)
					.reverse()
					.map(
						(data, i) =>
							!!(
								data.total_clicks > data.spent_clicks &&
								data.total_clicks - data.spent_clicks >= category
							) && (
								<div key={i}>
									<h3>{data.name}</h3>
									<p>Автор: {data.author}</p>
									{data.urls.map((link, i) => (
										<a
											href={link}
											key={i}
											target="_blank"
											id={`${data.id}/${i}`}
											onClick={(e) => clickDone(e.currentTarget)}
										>
											<button type="button" className="btn btn-primary">
												Кликнуть
											</button>
										</a>
									))}
									<button
										type="button"
										id={`${data.id}/rep`}
										className="btn btn-danger btn-sm"
										onClick={(e) => report(e.target)}
									>
										Пожаловаться
									</button>
								</div>
							)
					)}
			</div>
		</div>
	);
};

export default Clicks;
