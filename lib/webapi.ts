import fetch from "node-fetch";

export async function webAPI(url: string, options: any): Promise<any> {
	const resp = await fetch(url, options);

	const body = (await resp.json()) as any;

	const result = body.result || body;
	delete result.status;

	return result;
}
