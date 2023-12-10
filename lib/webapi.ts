import request from "request";

export async function webAPI(url: string, options: any): Promise<any> {
	return new Promise((res, rej) => {
		request(
			url,
			{
				...options,
				gzip: true,
				json: true,
			},
			(err, response, body) => {
				if (err) {
					rej(err);
				}

				const result = body.result || body;
				delete result.status;

				res(result);
			}
		);
	});
}
