import React, { useEffect, useState } from 'react';
import { fb } from '../../utils/constants/firebase';
import { vip } from '../../utils/constants/const.json';

const MoreClicks = ({ data, mail, setUpdate }) => {
	const usersDB = fb.firestore().collection('users');
	const docRef = mail
		? fb.firestore().collection('users').doc(`${mail}`)
		: false;
	const buy = ({ id }) => {
		const lvl = id.split('/')[0];
		// let refs;
		if (data.allow_money > Number(vip[lvl].price) && data.lvl === 0) {
			docRef
				.get()
				.then((doc) => {
					if (doc.exists) {
						docRef.set(
							{
								allow_money: doc.data().allow_money - vip[lvl].price,
								vip: Number(lvl) + 1,
								// lvl: Number(lvl) + 1,
								date: new Date(Date.now() + 86400000 * vip[lvl].days)
							},
							{ merge: true }
						); // дальше говнокод; необходимо написать цикл вложенных асинхронных запросов, зависящих от предыдущего результата
						if (doc.data().referrer) {
							let referrer = doc.data().referrer
							usersDB.doc(`${referrer}`).get().then((doc) => {
								if (doc.exists) {
									let refs = doc.data().refs
									refs[0].sum += vip[lvl].price * .1
									usersDB.doc(`${referrer}`).set({
										allow_money: doc.data().allow_money + vip[lvl].price * .1,
										refs: refs,
										recd: doc.data().recd + vip[lvl].price * .1
									}, { merge: true })
									if (doc.data().referrer) {
										referrer = doc.data().referrer
										usersDB.doc(`${referrer}`).get().then((doc) => {
											if (doc.exists) {
												refs = doc.data().refs
												refs[1].sum += vip[lvl].price * .1
												usersDB.doc(`${referrer}`).set({
													allow_money: doc.data().allow_money + vip[lvl].price * .1,
													refs: refs,
													recd: doc.data().recd + vip[lvl].price * .1
												}, { merge: true })
												if (doc.data().referrer) {
													referrer = doc.data().referrer
													usersDB.doc(`${referrer}`).get().then((doc) => {
														if (doc.exists) {
															refs = doc.data().refs
															refs[2].sum += vip[lvl].price * .1
															usersDB.doc(`${referrer}`).set({
																allow_money: doc.data().allow_money + vip[lvl].price * .1,
																refs: refs,
																recd: doc.data().recd + vip[lvl].price * .1
															}, { merge: true })
															if (doc.data().referrer) {
																referrer = doc.data().referrer
																usersDB.doc(`${referrer}`).get().then((doc) => {
																	if (doc.exists) {
																		refs = doc.data().refs
																		refs[3].sum += vip[lvl].price * .1
																		usersDB.doc(`${referrer}`).set({
																			allow_money: doc.data().allow_money + vip[lvl].price * .1,
																			refs: refs,
																			recd: doc.data().recd + vip[lvl].price * .1
																		}, { merge: true })
																		if (doc.data().referrer) {
																			referrer = doc.data().referrer
																			usersDB.doc(`${referrer}`).get().then((doc) => {
																				if (doc.exists) {
																					refs = doc.data().refs
																					refs[4].sum += vip[lvl].price * .1
																					usersDB.doc(`${referrer}`).set({
																						allow_money: doc.data().allow_money + vip[lvl].price * .1,
																						refs: refs,
																						recd: doc.data().recd + vip[lvl].price * .1
																					}, { merge: true })
																				}
																			})
																		}
																	}
																})
															}
														}
													})
												}
											}
										})
									}
								}
							})
						}
					}
				})
				.then(() => {
					setUpdate((prev) => !prev);
				});
		}
	};
	return (
		<>
			<h2>Больше кликов</h2>
			<h4>Кликов: {data.clicks}</h4>
			<h4>Баланс: {data.allow_money} ₽</h4>
			<p>1 вип ур 100 р + 50 % к кликам на 30 дней + 1000 кликов</p>
			<button
				type="button"
				className="btn btn-success"
				id="0/lvl"
				onClick={(e) => buy(e.target)}
			>
				Купить
			</button>
			<p>2 вип ур 200 р + 100 % к кликам на 30 дней + 2000 кликов</p>
			<button
				type="button"
				className="btn btn-success"
				id="1/lvl"
				onClick={(e) => buy(e.target)}
			>
				Купить
			</button>
			<p>3 вип ур 300 р + 150 % к кликам на 30 дней + 3000 кликов</p>
			<button
				type="button"
				className="btn btn-success"
				id="2/lvl"
				onClick={(e) => buy(e.target)}
			>
				Купить
			</button>
			<p>4 вип ур 500 р + 100 % к кликам на 90 дней + 6000 кликов</p>
			<button
				type="button"
				className="btn btn-success"
				id="3/lvl"
				onClick={(e) => buy(e.target)}
			>
				Купить
			</button>
			<p>5 вип ур 700 р + 150 % к кликам на 90 дней + 9000 кликов</p>
			<button
				type="button"
				className="btn btn-success"
				id="4/lvl"
				onClick={(e) => buy(e.target)}
			>
				Купить
			</button>
			<p>6 вип ур 1000 р + 200 % к кликам на 90 дней + 12000 кликов</p>
			<button
				type="button"
				className="btn btn-success"
				id="5/lvl"
				onClick={(e) => buy(e.target)}
			>
				Купить
			</button>
		</>
	);
};

export default MoreClicks;
