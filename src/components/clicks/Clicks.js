import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fb } from '../../utils/constants/firebase';
import { vip } from '../../utils/constants/const.json';

import './Clicks.css';

const Clicks = () => {
	const {
		user: { data, mail },
		info: { info }
	} = useSelector((store) => store);
	let { category } = useParams();
	const [tasks, setTasks] = useState({});
	const [completeUrls, setCompleteUrls] = useState([]);
	const [update, setUpdate] = useState(false);
	const [observer, setObserver] = useState(false); // отслеживает выполнение заданий
	const [sumTime, setSumTime] = useState(1); // считает время, проводимое на ссылках из заданий
	const tasksDB = fb.firestore().collection('tasks');
	const userDoc = mail ? fb.firestore().collection('users').doc(`${mail}`) : '';
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
			document.title = `${sumTime} сек осталось | Кликер`;
			let timerId = setTimeout(() => {
				setSumTime((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(timerId);
		}
	}, [observer, sumTime]);

	const clickDone = ({ id, href }) => {
		if (mail) {
			setObserver(true);
			const taskId = id.split('/')[0];
			if (completeUrls[0] === taskId) {
				if (!completeUrls.some((val) => val.id === id))
					setCompleteUrls((prev) => [...prev, { id: id, href: href }]);
			} else {
				setCompleteUrls([taskId, { id: id, href: href }]);
				setSumTime(info.delayComplete || 15);
			}
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
			setObserver(false);
			setCompleteUrls([]);
			document.title = 'Задание выполнено | Кликер';
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
					userDoc.get().then((doc) => {
						if (doc.exists) {
							let clicks = doc.data().clicks + Number(category);
							let clicksRound = doc.data().clicks_round + Number(category);
							if (doc.data().lvl > 0 && clicksRound >= 10) {
								clicksRound -= 10;
								clicks += 10 * (vip[data.lvl - 1].percent / 100);
							}
							userDoc.set(
								{
									clicks: clicks,
									clicks_round: clicksRound
								},
								{ merge: true }
							);
						}
					});
				})
				.then(() => setUpdate((prev) => !prev));
		}
	}, [completeUrls, sumTime]);
	return (
		<div>
			<h1>Категория: {category} клика</h1>
			<div className="clicks__wrapper">
				{Object.values(tasks)
					.reverse()
					.map(
						(data, i) =>
							!!(
								data.total_clicks > data.spent_clicks &&
								data.total_clicks - data.spent_clicks >= category
							) && (
								<div key={i} className="card clicks__task">
									<div className="card-body">
										<h5 className="card-title">{data.name}</h5>
										<h6 className="card-subtitle mb2 text-muted">
											Автор:{' '}
											{data.author
												.split('@')[0]
												.split('')
												.splice(0, 3)
												.join('')}
											...
											{data.author
												.split('@')[0]
												.split('')
												.reverse()
												.splice(0, 3)
												.reverse()
												.join('')}
										</h6>
										<p className="card-text">
											Выполнений: {data.spent_clicks / category}
										</p>
										<p className="card-text">
											Осталось:{' '}
											{Math.floor(
												(data.total_clicks - data.spent_clicks) / category
											)}
										</p>
										{data.urls.map((link, i) => (
											<div className="card__buttons" key ={i}>
												<a
													className="card-link"
													href={link}
													target="_blank"
													id={`${data.id}/${i}`}
													onClick={(e) => clickDone(e.currentTarget)}
												>
													<button type="button" className="btn btn-primary">
														Кликнуть
													</button>
												</a>
											</div>
										))}
										<br />
										<button
											type="button"
											id={`${data.id}/rep`}
											className="btn btn-danger btn-sm"
											onClick={(e) => report(e.target)}
										>
											Пожаловаться
										</button>
									</div>
								</div>
							)
					)}
			</div>
		</div>
	);
};

export default Clicks;
