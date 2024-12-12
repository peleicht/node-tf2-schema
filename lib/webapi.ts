import fetch from "node-fetch";

type QueryString = string[][] | Record<string, string> | URLSearchParams;
export async function webAPI(url: string, query?: QueryString, parse_json = false): Promise<any> {
	const resp = await fetch(url + "?" + new URLSearchParams(query), {
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
		},
	});

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
