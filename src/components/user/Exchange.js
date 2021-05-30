import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firebase from 'firebase';
import { fb } from '../../utils/constants/firebase';
import { createName } from '../../utils/functions/func';
import Input from '../../elements/Input';

const Exchange = ({ data, mail, setUpdate }) => {
	const dispatch = useDispatch();
	const {
		bids: { bids }
	} = useSelector((store) => store);
	const [costStatus, setCostStatus] = useState(false);
	const [costPerClickStatus, setCostPerClickStatus] = useState(false);
	const [countValue, setCountValue] = useState('');
	const [costValue, setCostValue] = useState('');
	const usersDB = fb.firestore().collection('users');
	const bidsDoc = fb.firestore().collection('tasks').doc('bids');
	const userDoc = mail
		? fb.firestore().collection('users').doc(`${mail}`)
		: false;
	useEffect(() => {
		// dispatch({
		// 	type: 'CLEAR_BIDS'
		// });
		bidsDoc.get().then((doc) => {
			if (doc.exists) {
				dispatch({
					type: 'GET_BIDS',
					bids: Object.values(doc.data()).reverse()
				});
			}
		});
	}, []);
	const createBid = () => {
		if (data.clicks >= Number(countValue)) {
			bidsDoc
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
						bidsDoc.set(
							{
								[id]: {
									author: mail,
									cost: Number(costValue),
									count: Number(countValue),
									id: createName(4),
									date: new Date(),
									complete: false
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
									clicks: doc.data().clicks - countValue
								},
								{ merge: true }
							);
						}
					});
				})
				.then(() => setUpdate((prev) => !prev));
		}
	};
	const sort = ({ id }) => {
		switch (id) {
			case 'cost':
				setCostStatus(costStatus ? false : true);
				dispatch({
					type: 'GET_BIDS',
					bids: bids.sort((a, b) =>
						costStatus ? a.cost - b.cost : b.cost - a.cost
					)
				});
				break;
			case 'cost-per-click':
				setCostPerClickStatus(costPerClickStatus ? false : true);
				dispatch({
					type: 'GET_BIDS',
					bids: bids.sort((a, b) =>
						costPerClickStatus
							? a.cost / a.count - b.cost / b.count
							: b.cost / b.count - a.cost / a.count
					)
				});
		}
	};
	const buyBid = ({ id }) => {
		bidsDoc
			.get()
			.then((doc) => {
				if (doc.exists) {
					for (let key in doc.data()) {
						if (
							doc.data()[key].id === id &&
							data.allow_money >= doc.data()[key].cost
						) {
							let clicks = doc.data()[key].count,
								money = doc.data()[key].cost,
								author = doc.data()[key].author;
							bidsDoc.update({
								// деактивация задания
								[key]: firebase.firestore.FieldValue.delete()
							});
							userDoc
								.get()
								.then((doc) => {
									// взаимодействтия с покупателем
									if (doc.exists) {
										console.log(doc.data().allow_money);
										userDoc.set(
											{
												clicks: doc.data().clicks + clicks,
												allow_money: doc.data().allow_money - money
											},
											{ merge: true }
										);
									}
								})
								.then(() => {
									usersDB // взаимодействия с продавцом
										.doc(`${author}`)
										.get()
										.then((doc) => {
											if (doc.exists) {
												console.log(doc.data().allow_money);
												usersDB.doc(`${author}`).set(
													{
														allow_money: doc.data().allow_money + money
													},
													{ merge: true }
												);
											}
										});
								});
						}
					}
				}
			})
			.then(() => setUpdate((prev) => !prev));
	};
	return (
		<>
			<h2>Биржа кликов</h2>
			<h4>Клики: {data.clicks}</h4>
			<h4>Баланс: {data.allow_money} ₽</h4>
			<h5>Мои клики</h5>
			<div className="container">
				{bids.map(
					(data, i) =>
						!!(data.author === mail) && (
							<div key={i} className="row">
								<div className="col">
									{data.author.split('@')[0].split('').splice(0, 3).join('')}
									...
									{data.author
										.split('@')[0]
										.split('')
										.reverse()
										.splice(0, 3)
										.reverse()
										.join('')}
								</div>
								<div className="col">{data.count}</div>
								<div className="col">{data.cost}</div>
								<div className="col">
									{Number((data.cost / data.count).toFixed(2))}
								</div>
								<div className="col">{`${new Date(
									data.date.seconds * 1000
								)}`}</div>
							</div>
						)
				)}
			</div>
			<h5>Продать клики</h5>
			<Input
				text="Количество"
				type="number"
				value={countValue}
				setValue={setCountValue}
				name="count"
				placeholder="100"
				i="0"
				min={1}
			/>
			<div className="input-group">
				<Input
					text="Сумма"
					type="number"
					value={costValue}
					setValue={setCostValue}
					name="cost"
					i="0"
					placeholder="10"
				/>
				<div className="input-group-append">
					<span className="input-group-text" id="rub">
						₽
					</span>
				</div>
			</div>
			<button type="button" className="btn btn-primary" onClick={createBid}>
				Продать
			</button>
			<h5>Все предложения</h5>
			<div className="container">
				<div className="row">
					<div className="col">Продавец</div>
					<div className="col">Количество</div>
					<div className="col" id="cost" onClick={(e) => sort(e.currentTarget)}>
						Цена (₽)
						{costStatus ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								className="bi bi-sort-down"
								viewBox="0 0 16 16"
							>
								<path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z" />
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								className="bi bi-sort-up"
								viewBox="0 0 16 16"
							>
								<path d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707V12.5zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z" />
							</svg>
						)}
					</div>
					<div
						className="col"
						id="cost-per-click"
						onClick={(e) => sort(e.currentTarget)}
					>
						Цена за клик (₽)
						{costPerClickStatus ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								className="bi bi-sort-down"
								viewBox="0 0 16 16"
							>
								<path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z" />
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								className="bi bi-sort-up"
								viewBox="0 0 16 16"
							>
								<path d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707V12.5zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z" />
							</svg>
						)}
					</div>
					<div className="col">Дата</div>
					<div className="col"></div>
				</div>
				{bids.map((data, i) => (
					<div className="row" key={i}>
						<div className="col">
							{data.author.split('@')[0].split('').splice(0, 3).join('')}
							...
							{data.author
								.split('@')[0]
								.split('')
								.reverse()
								.splice(0, 3)
								.reverse()
								.join('')}
						</div>
						<div className="col">{data.count}</div>
						<div className="col">{data.cost}</div>
						<div className="col">
							{Number((data.cost / data.count).toFixed(2))}
						</div>
						<div className="col">{`${new Date(data.date.seconds * 1000)}`}</div>
						<div className="col">
							<button
								type="button"
								className="btn btn-success"
								id={data.id}
								onClick={(e) => buyBid(e.target)}
							>
								Купить
							</button>
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default Exchange;
