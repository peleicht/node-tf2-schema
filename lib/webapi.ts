import fetch from "node-fetch";

type QueryString = string[][] | Record<string, string> | URLSearchParams;
export async function webAPI(url: string, query?: QueryString, parse_json = false): Promise<any> {
	const resp = await fetch(url + "?" + new URLSearchParams(query));

	if (!resp.ok) {
		throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
	}

	if (parse_json) {
		const body = (await resp.json()) as any;

		const result = body.result || body;
		delete result.status;

		return result;
	} else {
		return await resp.text();
	}
}
