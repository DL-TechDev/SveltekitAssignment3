export function validatePassword(password) {
	// Regular expression to check the password
	const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;
	//^(?=.*[a-zA-Z]): Ensures at least one alphabetic character.
	//(?=.*\d): Ensures at least one numeric character.
	//(?=.*[@$!%*?&]): Ensures at least one special character from the specified set.
	//[A-Za-z\d@$!%*?&]{8,10}$: Ensures the password length is between 8 and 10 characters and consists of only allowed characters.
	return regex.test(password);
}

export function validateEmail(email) {
	// Regular expression to check the email format
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	// ^[^\s@]+: Ensures the local part of the email (before the @ symbol) contains no spaces or @ symbols.
	// @[^\s@]+: Ensures there is an @ symbol followed by a domain part that contains no spaces or @ symbols.
	// \.[^\s@]+$: Ensures there is a dot followed by a top-level domain (e.g., .com, .org) that contains no spaces or @ symbols.

	return regex.test(email);
}

export function validateEmpty(field) {
	// Check if field is null, undefined, or an empty string
	if (field === null || field === undefined || field.trim() === '') {
		return false; // Field is considered empty
	}
	return true; // Field has content
}

export function validateGroupName(groupName) {
	const regex = /^[a-zA-Z0-9_]+$/;
	return regex.test(groupName);
}

export function validateName(name) {
	const regex = /^[a-zA-Z]+$/;
	return regex.test(name);
}