import { hash, verify } from '@node-rs/argon2';
import { generateRandomString, type RandomReader } from '@oslojs/crypto/random';

export const PASSWORD_SALT_ALPHABET =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const PASSWORD_SALT_LENGTH = 10;

// Recommended minimum parameters in the Lucia demo app, generated
// by `sv create`:
export const MEMORY_COST = 19456;
export const TIME_COST = 2;
export const OUTPUT_LEN = 32;
export const PARALLELISM = 1;

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
		memoryCost: MEMORY_COST,
		timeCost: TIME_COST,
		outputLen: OUTPUT_LEN,
		parallelism: PARALLELISM
	});

	return { passwordHash, passwordSalt };
}

export async function verifyPassword(password: string, passwordHash: string, passwordSalt: string) {
	return await verify(passwordHash, `${password}${passwordSalt}`, {
		memoryCost: MEMORY_COST,
		timeCost: TIME_COST,
		outputLen: OUTPUT_LEN,
		parallelism: PARALLELISM
	});
}
