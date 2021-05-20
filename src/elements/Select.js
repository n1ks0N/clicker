import React, { useRef } from 'react';

const Select = ({ text, name, value, setValue }) => {
	const selectRef = useRef(value);
	const record = () => {
		let val = [];
		for (let i = 0; i < selectRef.current.value; i++) val.push(i);
		setValue(val);
	};
	return (
		<div>
			<label htmlFor={name}>{text}</label>
			<select
				className="custom-select"
				id={name}
				ref={selectRef}
				onChange={record}
			>
				{value.map((data) => (
					<option value={data} key={data}>
						{data}
					</option>
				))}
			</select>
		</div>
	);
};

export default Select;
