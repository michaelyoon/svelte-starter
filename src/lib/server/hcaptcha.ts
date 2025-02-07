import got from 'got';
import { HCAPTCHA_SECRET, HCAPTCHA_VERIFY_URL } from '$env/static/private';

export async function verifyHCaptcha(token: string): Promise<boolean> {
	const params = new URLSearchParams({
		response: token,
		secret: HCAPTCHA_SECRET
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const response: any = await got
		.post(HCAPTCHA_VERIFY_URL, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: params.toString()
		})
		.json();

	return response.success;
}
