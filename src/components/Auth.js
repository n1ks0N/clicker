import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fb } from '../utils/constants/firebase';

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
	const dispatch = useDispatch();
	const [currentUser, setCurrentUser] = useState(null);
	const [pending, setPending] = useState(true);
	useEffect(() => {
		const ac = new AbortController();
		fb.auth().onAuthStateChanged((user) => {
			setCurrentUser(user);
			setPending(false);
			if (user) {
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
        })
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
