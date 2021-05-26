import React, { useCallback, useState, useContext } from 'react';
import { withRouter, Link, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fb } from '../utils/constants/firebase';
import { AuthContext } from './Auth.js';

const Sign = ({ history }) => {
	const { user } = useSelector((store) => store);
	const [errorMessage, setErrorMessage] = useState('');
	const usersDB = fb.firestore().collection('users');
	const handleSign = useCallback(
		async (e) => {
			e.preventDefault();
			const { email, password } = e.target.elements;
			const usersRef = fb.firestore().collection('users');
			try {
				await fb
					.auth()
					.createUserWithEmailAndPassword(email.value, password.value)
					.then(() => {
						usersRef.doc(`${email.value}`).set({
							output_money: 0,
							allow_money: 0,
							clicks: 0,
							date: false,
							lvl: 0,
							recd: 0,
							refs: [
								{ count: 0, sum: 0 },
								{ count: 0, sum: 0 },
								{ count: 0, sum: 0 },
								{ count: 0, sum: 0 },
								{ count: 0, sum: 0 }
							],
							vip: 0,
							referrer: user.activeReferrer ? user.activeReferrer : false
						});
					})
					.then(() => {
						if (user.activeReferrer) {
							let referrer = user.activeReferrer;
							usersDB
								.doc(`${referrer}`)
								.get()
								.then((doc) => {
									if (doc.exists) {
										let refs = doc.data().refs;
										refs[0].count += 1;
										usersDB.doc(`${referrer}`).set(
											{
												refs: refs
											},
											{ merge: true }
										);
										if (referrer) {
											referrer = doc.data().referrer;
											usersDB
												.doc(`${referrer}`)
												.get()
												.then((doc) => {
													if (doc.exists) {
														refs = doc.data().refs;
														refs[1].count += 1;
														usersDB.doc(`${referrer}`).set(
															{
																refs: refs
															},
															{ merge: true }
														);
														if (doc.data().referrer) {
															referrer = doc.data().referrer;
															usersDB
																.doc(`${referrer}`)
																.get()
																.then((doc) => {
																	if (doc.exists) {
																		refs = doc.data().refs;
																		refs[2].count += 1;
																		usersDB.doc(`${referrer}`).set(
																			{
																				refs: refs
																			},
																			{ merge: true }
																		);
																		if (doc.data().referrer) {
																			referrer = doc.data().referrer;
																			usersDB
																				.doc(`${referrer}`)
																				.get()
																				.then((doc) => {
																					if (doc.exists) {
																						refs = doc.data().refs;
																						refs[3].count += 1;
																						usersDB.doc(`${referrer}`).set(
																							{
																								refs: refs
																							},
																							{ merge: true }
																						);
																						if (doc.data().referrer) {
																							referrer = doc.data().referrer;
																							usersDB
																								.doc(`${referrer}`)
																								.get()
																								.then((doc) => {
																									if (doc.exists) {
																										refs = doc.data().refs;
																										refs[4].count += 1;
																										usersDB
																											.doc(`${referrer}`)
																											.set(
																												{
																													refs: refs
																												},
																												{ merge: true }
																											);
																									}
																								});
																						}
																					}
																				});
																		}
																	}
																});
														}
													}
												});
										}
									}
								});
						}
					});
				history.push('/user?profile');
			} catch (error) {
				switch (error.code) {
					case 'auth/email-already-in-use':
						setErrorMessage('Пользователь с такой почтой уже зарегистрирован');
						break;
					default:
						setErrorMessage('Произошла ошибка. Пожалуйста, попробуйте позже');
				}
			}
		},
		[history]
	);

	const { currentUser } = useContext(AuthContext);

	if (currentUser) return <Redirect to="/" />;

	return (
		<div className="log__wrapper">
			<h1>Зарегистрируйте аккаунт</h1>
			<form onSubmit={handleSign}>
				<label>Почта</label>
				<input
					name="email"
					type="email"
					placeholder="example@mail.ru"
					className="form-control"
					autoComplete="on"
					required
				/>
				<div className="invalid-feedback">{errorMessage}</div>
				<label>Пароль</label>
				<input
					name="password"
					type="password"
					placeholder="Password"
					className="form-control"
					autoComplete="on"
					minLength="6"
					required
				/>
				<button type="submit" className="btn btn-success">
					Зарегистрироваться
				</button>
				<Link to="/login">
					<button type="button" className="btn btn-link">
						Уже есть аккаунт? Войдите
					</button>
				</Link>
			</form>
		</div>
	);
};

export default withRouter(Sign);
