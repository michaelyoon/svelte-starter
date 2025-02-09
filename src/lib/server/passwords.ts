import { hash, verify } from '@node-rs/argon2';
import { generateRandomString, type RandomReader } from '@oslojs/crypto/random';
import {
	HASH_MEMORY_COST,
	HASH_OUTPUT_LENGTH,
	HASH_PARALLELISM,
	PASSWORD_SALT_ALPHABET,
	PASSWORD_SALT_LENGTH,
	HASH_TIME_COST
} from './constants';

const random: RandomReader = {
	read(bytes) {
		crypto.getRandomValues(bytes);
	}
};

export function generatePasswordSalt() {
	return generateRandomString(random, PASSWORD_SALT_ALPHABET, PASSWORD_SALT_LENGTH);
}

export async function hashPassword(password: string) {
	const passwordSalt = generatePasswordSalt();

	const passwordHash = await hash(`${password}${passwordSalt}`, {
		memoryCost: HASH_MEMORY_COST,
		timeCost: HASH_TIME_COST,
		outputLen: HASH_OUTPUT_LENGTH,
		parallelism: HASH_PARALLELISM
	});

	return { passwordHash, passwordSalt };
}

export async function verifyPassword(password: string, passwordHash: string, passwordSalt: string) {
	return await verify(passwordHash, `${password}${passwordSalt}`, {
		memoryCost: HASH_MEMORY_COST,
		timeCost: HASH_TIME_COST,
		outputLen: HASH_OUTPUT_LENGTH,
		parallelism: HASH_PARALLELISM
	});
}
