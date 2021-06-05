import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fb } from '../utils/constants/firebase';

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
	const { info: { info } } = useSelector(store => store)
	const dispatch = useDispatch();
	const [currentUser, setCurrentUser] = useState(null);
	const [pending, setPending] = useState(true);
	useEffect(() => {
		const ac = new AbortController();
		fb.auth().onAuthStateChanged((user) => {
			setCurrentUser(user);
			setPending(false);
			if (user) {
				let allow = info.mails.some(mail => mail === user.email)
				if (!allow) {
				const docRef = fb.firestore().collection('users').doc(`${user.email}`);
				docRef
					.get()
					.then((doc) => {
						if (doc.exists) {
							dispatch({
								type: 'GET_USER_DATA',
								data: doc.data(),
								mail: user.email
							});
							if (Date.now() - doc.data().bonus.seconds * 1000 > 86400000) {
								docRef.set(
									{
										bonus: new Date(),
										clicks: doc.data().clicks + 5
									},
									{ merge: true }
								);
								dispatch({
									type: 'UPDATE_ALERT',
									alert: 'Получен бонус 5 кликов'
								})
							}
						} else {
							// Пользователь незарегистрирован
						}
					})
					.catch((error) => {
						// Ошибка
					});
				} else {
					dispatch({
						type: 'GET_USER_DATA',
						data: {},
						mail: ''
					});
					fb.auth().signOut()
				}
			} else {
				dispatch({
					type: 'GET_USER_DATA',
					data: {},
					mail: ''
				});
			}
		});
		return () => ac.abort();
	}, []);
	if (pending) {
		return (
			<div className="loader">
				<div className="spinner-border text-primary" role="status">
					<span className="sr-only">Загрузка...</span>
				</div>
			</div>
		);
	}
	return (
		<AuthContext.Provider value={{ currentUser }}>
			{children}
		</AuthContext.Provider>
	);
};
