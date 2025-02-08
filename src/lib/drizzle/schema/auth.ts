import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { citext } from './custom-types';
import {
	MAX_PASSWORD_LENGTH,
	MAX_USERNAME_LENGTH,
	MIN_PASSWORD_LENGTH,
	MIN_USERNAME_LENGTH,
	VALID_USERNAME_REGEX,
	VERIFICATION_CODE_LENGTH
} from '../../constants';

/**
 * @see https://orm.drizzle.team/docs/sql-schema-declaration#advanced
 */
export const auditTrail = {
	createdBy: text()
		.notNull()
		.references(() => userTable.id),
	updatedBy: text()
};

export const timestamps = {
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true })
};

export const userTable = pgTable('user', {
	id: text().primaryKey(),
	username: citext().notNull().unique(),
	email: citext().notNull().unique(),
	passwordHash: text().notNull(),
	passwordSalt: text().notNull(),
	verifiedAt: timestamp({ withTimezone: true }),
	...timestamps
});

export const sessionTable = pgTable('session', {
	id: text().primaryKey(),
	userId: text()
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	expiresAt: timestamp({ withTimezone: true, mode: 'date' }).notNull()
});

export const verificationCodeTable = pgTable('verification_code', {
	userId: text()
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' })
		.primaryKey(),
	email: text().notNull().unique(),
	value: text().notNull(),
	expiresAt: timestamp({ withTimezone: true }).notNull()
});

export type SelectSession = typeof sessionTable.$inferSelect;

export type InsertSession = typeof sessionTable.$inferSelect;

export type SelectUser = typeof userTable.$inferSelect;

export type InsertUser = typeof userTable.$inferSelect;

export const registerSchema = createInsertSchema(userTable)
	.omit({
		id: true,
		passwordHash: true,
		passwordSalt: true,
		createdAt: true,
		updatedAt: true
	})
	.extend({
		username: z
			.string()
			.min(MIN_USERNAME_LENGTH)
			.max(MAX_USERNAME_LENGTH)
			.regex(VALID_USERNAME_REGEX),
		email: z.string().email(),
		password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
		hCaptchaToken: z.string().min(1, 'Please verify that you are a human.')
	});

export const loginSchema = registerSchema.omit({
	email: true
});

export const userSettingsSchema = registerSchema
	.omit({
		hCaptchaToken: true
	})
	.extend({
		password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH).optional()
	});

export const verifyUserSchema = z.object({
	verificationCode: z.string().length(VERIFICATION_CODE_LENGTH)
});
