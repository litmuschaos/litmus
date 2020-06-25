export default function requestActions(name: string) {
	return {
		REQUEST: name,
		SUCCESS: `${name}_SUCCESS`,
		FAIL: `${name}_FAIL`,
	};
}
