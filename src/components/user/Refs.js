import React, { useEffect, useState } from 'react';
import { fb } from '../../utils/constants/firebase';

const Refs = ({ data, mail }) => {
	const [sumRefs, setSumRefs] = useState(0);
	const docRef = mail
		? fb.firestore().collection('users').doc(`${mail}`)
		: false;
	useEffect(() => {
		if (data.refs) {
			docRef.get().then((doc) => {
				// рефералы
				setSumRefs(0);
				const countElements = document.querySelectorAll('.table-refs__count');
				const sumElements = document.querySelectorAll('.table-refs__sum');
				if (doc.exists) {
					doc.data().refs.forEach(({ count, sum }, i) => {
						countElements[i].textContent = count;
						sumElements[i].textContent = sum;
						setSumRefs((prev) => prev + sum);
					});
				}
			});
		}
	}, [data.refs]);
	const copy = (e) => {
		e.persist();
		e.target.select();
		navigator.clipboard.writeText(e.target.value);
	};
	return (
		<>
			<h2>Партнёрская программа</h2>
			<label>Реферальная ссылка</label>
			<input
				type="url"
				value={`${window.location.origin}?ref=${mail}`}
				className="form-control"
				onClick={(e) => copy(e)}
				readOnly
			/>
			<table>
				<tbody>
					<tr>
						<td>Уровень</td>
						<td className="table-refs__td">1</td>
						<td className="table-refs__td">2</td>
						<td className="table-refs__td">3</td>
						<td className="table-refs__td">4</td>
						<td className="table-refs__td">5</td>
					</tr>
					<tr>
						<td>Кол-во рефералов</td>
						<td className="table-refs__td table-refs__count">0</td>
						<td className="table-refs__td table-refs__count">0</td>
						<td className="table-refs__td table-refs__count">0</td>
						<td className="table-refs__td table-refs__count">0</td>
						<td className="table-refs__td table-refs__count">0</td>
					</tr>
					<tr>
						<td>Траты рефералов</td>
						<td className="table-refs__td table-refs__sum">0</td>
						<td className="table-refs__td table-refs__sum">0</td>
						<td className="table-refs__td table-refs__sum">0</td>
						<td className="table-refs__td table-refs__sum">0</td>
						<td className="table-refs__td table-refs__sum">0</td>
						<td className="table-refs__td">{sumRefs}</td>
					</tr>
				</tbody>
			</table>
			<p>Получено с рефералов: {data.recd} ₽</p>
		</>
	);
};

export default Refs;
