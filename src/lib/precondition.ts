export class Precondition {
	static checkExists<T>(value: T, message?: string): NonNullable<T> {
		assertExists(value, message);
		return value;
	}
}

function assertExists<T>(value: T, message?: string): asserts value is NonNullable<T> {
	if (value == null) {
		throw new Error(message ?? `Argument is missing`);
	}
}
