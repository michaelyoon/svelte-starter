import { customType } from 'drizzle-orm/pg-core';

/**
 * @see https://github.com/drizzle-team/drizzle-orm/discussions/123#discussioncomment-4738266
 */
export const citext = customType<{ data: string }>({
	dataType() {
		return 'citext';
	}
});
