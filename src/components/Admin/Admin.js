import React, { useEffect, useRef, useState } from 'react';
import { urlAd, keyAd } from '../../utils/constants/api.json';
import firebase from 'firebase'
import { fb } from '../../utils/constants/firebase'
import InputText from './InputText';
import Input from '../../elements/Input'
import './Admin.css';

const Admin = () => {
	const [data, setData] = useState('');
	const [user, setUser] = useState('')
	const [value, setValue] = useState(0)
	const [tasks, setTasks] = useState([{ author: 'mail', urls: ['.com'] }])
	const typeRef = useRef('');
	const logRef = useRef('');
	const passRef = useRef('');

	const tasksDB = fb.firestore().collection('tasks')

	const login = () => {
		const a = true
		if (
			a ||
			logRef.current.value === 'Aprel16' &&
			passRef.current.value === 'qwerty16'
		) {
			let req = new XMLHttpRequest();
			req.onreadystatechange = () => {
				// eslint-disable-next-line
				if (req.readyState == XMLHttpRequest.DONE) {
					const result = JSON.parse(req.responseText);
					setData(() => result.record);
				}
			};
			req.open('GET', urlAd, true);
			req.setRequestHeader('X-Master-Key', keyAd);
			req.send();
			for (let i = 1; i <= 5; i++) {
				fb.firestore().collection('tasks').doc(`${i}`).get().then((doc) => {
					if (doc.exists) {
						for (let key in doc.data()) {
							if (doc.data()[key].reports > 0) {
								setTasks((prev) => [...prev, doc.data()[key]])
							}
						}
					}
				})
			}
		}
	};

	const change = ({ param, name, index }) => {
		let value = param.replaceAll(`"`, `'`); // все кавычки заменяются на одиночные
		value = value.replaceAll('`', "'"); // чтобы избежать бага при конвертировании в JSON
		const section = name.split('.')[0];
		const category = name.split('.')[1];
		const type = name.split('.')[2];
		setData((prev) => {
			let arr = prev[section][category];
			// запись нового value
			arr[index] = {
				...arr[index],
				[type]: value
			};
			return {
				...prev,
				[section]: {
					...prev[section],
					[category]: arr
				}
			};
		});
	};
	const del = ({ target: { id } }) => {
		const section = id.split('.')[0];
		const category = id.split('.')[1];
		const index = id.split('.')[2];
		let allow = true; // для исправления бага повторного выполнения
		setData((prev) => {
			if (allow && prev[section][category].length > 1) {
				allow = false; // исправление бага повторного выполнения
				let arr = prev[section][category];
				arr.splice(index, 1);
				return {
					...prev,
					[section]: {
						...prev[section],
						[category]: arr
					}
				};
			} else {
				return prev;
			}
		});
	};
	const add = ({ target: { id } }) => {
		const section = id.split('.')[0];
		const category = id.split('.')[1];
		let allow = true; // для исправления бага повторного выполнения
		setData((prev) => {
			if (allow) {
				allow = false; // исправление бага повторного выполнения
				let arr = prev[section][category];
				// создание нового пустого объекта и добавление в конец массива
				let push = {};
				for (let key in arr[arr.length - 1]) {
					push = {
						...push,
						[key]: ''
					};
				}
				arr.push(push);
				return {
					...prev,
					[section]: {
						...prev[section],
						[category]: arr
					}
				};
			} else {
				return prev;
			}
		});
	};

	const changeUser = () => {
		fb.firestore().collection('users').doc(`${user}`).set({
			[typeRef.current.value]: Number(value)
		}, { merge: true })
	}
	const delUser = () => {
		const user = firebase.auth().currentUser
	}
	const delTask = ({ id }) => {
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
	}

	const send = () => {
		const infoTexts = data.info.texts.map((data) => { // замена 
			let result = ''; 
			data.text.replace(
				/((?:https?:\/\/|ftps?:\/\/|\bwww\.)(?:(?![.,?!;:()]*(?:\s|$))[^\s]){2,})|(\n+|(?:(?!(?:https?:\/\/|ftp:\/\/|\bwww\.)(?:(?![.,?!;:()]*(?:\s|$))[^\s]){2,}).)+)/gim,
				(m, link, text) => {
					result +=
						link
							? `<a href=${(link[0] === 'w' ? '//' : '') + link} key=${result.length
							} target='_blank'>${link}</a>`
							: text
					
				}
			);
			return {
				text: result,
				place: data.place
			}
		})
		setData(prev => ({
			...prev,
			info: {
				...prev.info,
				texts: infoTexts
			}
		}))
		console.log(data)
		// let req = new XMLHttpRequest();
		// req.open('PUT', urlAd, true);
		// req.setRequestHeader('Content-Type', 'application/json');
		// req.setRequestHeader('X-Master-Key', keyAd);
		// req.send(JSON.stringify(data));
	};
	return (
		<div className="">
			<div className="login">
				<h1>Админ-панель</h1>
				<input placeholder="login" ref={logRef} />
				<br />
				<input placeholder="password" ref={passRef} />
				<br />
				<button onClick={login}>Войти</button>
			</div>
			{!!data && (
				<div className="content">
					<h2 align="center">Header</h2>
					<h3 align="center">TextButtons</h3>
					{Object.values(data.header.textButtons).map((data, i) => (
						<div id={`headerTextButtons${i}`} className="section" key={i}>
							<InputText
								text="Текст"
								type="text"
								value={data.text}
								name={`header.textButtons.text`}
								change={change}
								i={i}
							/>
							<InputText
								text="Ссылка"
								type="text"
								value={data.link}
								name={`header.textButtons.link`}
								change={change}
								i={i}
							/>
							<button
								type="button"
								className="btn btn-danger btn-sm"
								onClick={(e) => del(e)}
								id={`header.textButtons.${i}`}
							>
								Удалить
							</button>
						</div>
					))}
					<center>
						<button
							type="button"
							className="btn btn-success"
							onClick={(e) => add(e)}
							id={`header.textButtons`}
						>
							Добавить
						</button>
					</center>
					<h3 align="center">LinkSlot</h3>
					{Object.values(data.header.linkslot).map((data, i) => (
						<div className="section" key={i}>
							<InputText
								text="Код"
								type="text"
								value={data.div}
								name={`header.linkslot.div`}
								change={change}
								i={i}
							/>
							<button
								type="button"
								className="btn btn-danger btn-sm"
								onClick={(e) => del(e)}
								id={`header.linkslot.${i}`}
							>
								Удалить
							</button>
						</div>
					))}
					<center>
						<button
							type="button"
							className="btn btn-success"
							onClick={(e) => add(e)}
							id={`header.linkslot`}
						>
							Добавить
						</button>
					</center>
					<h3 align="center">Banners</h3>
					{Object.values(data.header.banners).map((data, i) => (
						<div className="section" key={i}>
							<InputText
								text="Код"
								type="text"
								value={data.div}
								name={`header.banners.div`}
								change={change}
								i={i}
							/>
							<button
								type="button"
								className="btn btn-danger btn-sm"
								onClick={(e) => del(e)}
								id={`header.banners.${i}`}
							>
								Удалить
							</button>
						</div>
					))}
					<center>
						<button
							type="button"
							className="btn btn-success"
							onClick={(e) => add(e)}
							id={`header.banners`}
						>
							Добавить
						</button>
					</center>
					<h2 align="center">Footer</h2>
					<h3 align="center">Banners</h3>
					{Object.values(data.footer.banners).map((data, i) => (
						<div className="section" key={i}>
							<InputText
								text="Код"
								type="text"
								value={data.div}
								name={`footer.banners.div`}
								change={change}
								i={i}
							/>
							<button
								type="button"
								className="btn btn-danger btn-sm"
								onClick={(e) => del(e)}
								id={`footer.banners.${i}`}
							>
								Удалить
							</button>
						</div>
					))}
					<center>
						<button
							type="button"
							className="btn btn-success"
							onClick={(e) => add(e)}
							id={`footer.banners`}
						>
							Добавить
						</button>
					</center>
					<h3 align="center">Linkslot</h3>
					{Object.values(data.footer.linkslot).map((data, i) => (
						<div className="section" key={i}>
							<InputText
								text="Код"
								type="text"
								value={data.div}
								name={`footer.linkslot.div`}
								change={change}
								i={i}
							/>
							<button
								type="button"
								className="btn btn-danger btn-sm"
								onClick={(e) => del(e)}
								id={`footer.linkslot.${i}`}
							>
								Удалить
							</button>
						</div>
					))}
					<center>
						<button
							type="button"
							className="btn btn-success"
							onClick={(e) => add(e)}
							id={`footer.linkslot`}
						>
							Добавить
						</button>
					</center>
					<h3 align="center">Name</h3>
					{Object.values(data.footer.name).map((data, i) => (
						<div id={`name${i}`} className="section" key={i}>
							<InputText
								text="Текст"
								type="text"
								value={data.text}
								name={`footer.name.text`}
								change={change}
								i={i}
							/>
						</div>
					))}
					<h3 align="center">Socials</h3>
					{Object.values(data.footer.socials).map((data, i) => (
						<div id={`socials${i}`} className="section" key={i}>
							<InputText
								text="Текст"
								type="text"
								value={data.text}
								name={`footer.socials.text`}
								change={change}
								i={i}
							/>
							<InputText
								text="Ссылка"
								type="text"
								value={data.link}
								name={`footer.socials.link`}
								change={change}
								i={i}
							/>
							<button
								type="button"
								className="btn btn-danger btn-sm"
								onClick={(e) => del(e)}
								id={`footer.socials.${i}`}
							>
								Удалить
							</button>
						</div>
					))}
					<center>
						<button
							type="button"
							className="btn btn-success"
							onClick={(e) => add(e)}
							id={`footer.socials`}
						>
							Добавить
						</button>
					</center>
					<center>
						<button
							type="button"
							className="btn btn-primary btn-lg"
							onClick={send}
						>
							Изменить
						</button>
					</center>
					<h3>Управление пользователями</h3>
					<Input
						text="Логин пользователя"
						type="mail"
						value={user}
						setValue={setUser}
						name="login"
						placeholder="user@mail.ru"
						i="0"
					/>
					<div>
						<div>
							<select className="custom-select" ref={typeRef}>
								<option value="allow_money">Деньги</option>
								<option value="clicks">Клики</option>
							</select>
							<Input
								text="Значение"
								type="number"
								value={value}
								setValue={setValue}
								name="val"
								placeholder="100"
								i="0"
							/>
							<button type="button" className="btn btn-success" onClick={changeUser}>Начислить</button>
						</div>
						<div><button type="button" className="btn btn-danger" onClick={delUser}>Удалить пользователя</button></div>
					</div>
					<h3>Задания с жалобами</h3>
					<div>{Object.values(tasks).map((data, i) => {
						<div key={i}>
							<p>Автор: {data.author}</p>
							<p>Ссылки:</p>
							<ul>
								{data.urls.map((url, i) => {
									<li key={i}>{url}</li>
								})}
							</ul>
							<button type="button" className="btn btn-danger" id={data.id} onClick={(e) => delTask(e.target)}>Удалить задание</button>
						</div>
					})}</div>
					<h3>Тексты и ссылки</h3>
					{Object.values(data.info.texts).map((data, i) => <>
						<InputText
							text={data.place.split('?')[1]}
							type="text"
							value={data.text}
							name='info.texts.text'
							change={change}
							i={i}
							key={i}
							textarea={true}
						/>
					</>)}
				</div>
			)}
		</div>
	);
};

export default Admin;
