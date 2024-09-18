import { writable } from 'svelte/store';

let nextId = 1;

export const toasts = writable([]); // Define the toasts store

export function addToast(
	{ message, type = 'success', dismissible = true, timeout = 5000 }
)
{
	const id = nextId++;
	toasts.update((allToasts) => [...allToasts, { id, message, type, dismissible, timeout }]);

	if (timeout) {
		setTimeout(() => removeToast(id), timeout);
	}
}

export function removeToast(id) {
	toasts.update((allToasts) => allToasts.filter((toast) => toast.id !== id));
}
