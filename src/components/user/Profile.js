import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../../elements/Input';
import { fb } from '../../utils/constants/firebase';
import { urlAd, keyAd } from '../../utils/constants/api.json';

const Profile = ({ data, mail, setUpdate }) => {
	const {
		info: { allData }
	} = useSelector((store) => store);
	console.log(allData)
	const dispatch = useDispatch();
	const [walletValue, setWalletValue] = useState('');
	const [outputValue, setOutputValue] = useState('');
	const docRef = mail
		? fb.firestore().collection('users').doc(`${mail}`)
		: false;
	const withdrawal = () => {
		if (
			walletValue &&
			Number(outputValue) > 0 &&
			Number(outputValue) <= data.allow_money
		) {
			docRef
				.get()
				.then((doc) => {
					if (doc.exists) {
						docRef.set(
							{
								output_money: doc.data().output_money + Number(outputValue), // всего выведено
								allow_money: doc.data().allow_money - outputValue // доступно к выводу
							},
							{ merge: true }
						);
					}
				}).then(() => {
					let newAllData = allData
					newAllData.info.bids.push({
						mail: mail,
						value: outputValue,
						wallet: walletValue
					})
					dispatch({
						type: 'GET_INFO',
						info: newAllData
					})
					let req = new XMLHttpRequest();
					req.open('PUT', urlAd, true);
					req.setRequestHeader('Content-Type', 'application/json');
					req.setRequestHeader('X-Master-Key', keyAd);
					req.send(JSON.stringify(newAllData));
				})
				.then(() => setUpdate((prev) => !prev));
			dispatch({
				type: 'UPDATE_USER_DATA',
				name: 'allow_money',
				param: data.allow_money - outputValue
			});
			// dispatch({
			// 	type: 'UPDATE_USER_DATA',
			// 	name: 'output_money',
			// 	param: data.output_money + Number(outputValue)
			// });
		}
	};
	return (
		<>
			<h2>Профиль</h2>
			<h3>{mail}</h3>
			<h4>
				Уровень:{' '}
				<span className="badge badge-primary" title="Уровень">
					{data.lvl}
				</span>
			</h4>
			{!!data.date && (
				<p>Уровень активен до: {`${new Date(data.date.seconds * 1000)}`}</p>
			)}
			<h4>Клики: {data.clicks}</h4>
			<h4>Баланс: {data.allow_money} ₽</h4>
			<h4>Вывод средств</h4>
			<p>Получено: {data.recd} ₽</p>
			<div className="row">
				<div className="form-group">
					<div className="input-group">
						<Input
							text="Номер кошелька ЮMoney"
							type="number"
							value={walletValue}
							setValue={setWalletValue}
							name="wallet"
							placeholder="410011112222333"
							i="0"
						/>
					</div>
					<div className="input-group">
						<Input
							text="Сумма вывода"
							type="number"
							value={outputValue}
							setValue={setOutputValue}
							name="output"
							placeholder="1000"
							i="0"
							min="1"
						/>
						<div className="input-group-append">
							<span className="input-group-text" id="rub">
								₽
							</span>
						</div>
					</div>
				</div>
			</div>
			<button type="button" className="btn btn-primary" onClick={withdrawal}>
				Заказать вывод
			</button>
			<p>Всего выведено: {data.output_money} ₽</p>
		</>
	);
};

export default Profile;
