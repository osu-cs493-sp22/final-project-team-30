exports.extractValidFields = function (obj, schema) {
	let validObj = {};
	Object.keys(schema).forEach((field) => {
		if (obj[field]) {
			validObj[field] = obj[field];
		}
	});
	return validObj;
};
