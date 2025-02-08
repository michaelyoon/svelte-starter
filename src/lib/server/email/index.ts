import { Resend, type CreateEmailOptions } from 'resend';
import { env } from '$env/dynamic/private';

export async function sendEmail({
	from,
	to,
	cc,
	bcc,
	replyTo,
	subject,
	html,
	text,
	headers
}: {
	from: string;
	to: string | string[];
	cc?: string | string[];
	bcc?: string | string[];
	replyTo?: string | string[];
	subject: string;
	html: string;
	text?: string;
	headers?: Record<string, string>;
	// attachments?: Attachment[]
}) {
	const resend = new Resend(env.RESEND_API_KEY);

	const payload: CreateEmailOptions = { from, to, cc, bcc, replyTo, subject, html, text, headers };
	const response = await resend.emails.send(payload);
	// const response = await resend.emails.send({ from, to, cc, bcc, replyTo, subject, html, text });

	console.log(response);
}
