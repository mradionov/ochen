import { Deferred } from '$lib/deferred';
import { Subject } from '$lib/subject';

const NAME = 'mradionov_ochen';
const VERSION = 1;

type CreateStoreIfMissing = (storeName: string) => void;

export class Database {
	upgradeNeeded = new Subject<CreateStoreIfMissing>();

	async open(): Promise<IDBDatabase> {
		const deferred = new Deferred<IDBDatabase>();

		const req = indexedDB.open(NAME, VERSION);

		req.addEventListener('upgradeneeded', () => {
			const createStoreIfMissing = (storeName: string) => {
				if (!req.result.objectStoreNames.contains(storeName)) {
					req.result.createObjectStore(storeName);
				}
			};

			this.upgradeNeeded.emit(createStoreIfMissing);
		});

		req.addEventListener('success', () => deferred.resolve(req.result));
		req.addEventListener('error', (err) => deferred.reject(err));

		return deferred.promise;
	}

	async saveValue<T>(storeName: string, key: string, value: T) {
		const deferred = new Deferred();

		const db = await this.open();

		const tx = db.transaction(storeName, 'readwrite');

		tx.addEventListener('complete', () => deferred.resolve(undefined));
		tx.addEventListener('error', (err) => deferred.reject(err));

		tx.objectStore(storeName).put(value, key);

		return deferred.promise;
	}

	async loadValue<T>(storeName: string, key: string): Promise<T> {
		const deferred = new Deferred<T>();

		const db = await this.open();

		const tx = db.transaction(storeName, 'readonly');

		const req = tx.objectStore(storeName).get(key);
		req.addEventListener('success', () => deferred.resolve(req.result));
		req.addEventListener('error', (err) => deferred.reject(err));

		return deferred.promise;
	}
}
