import { major } from "semver";
import { EventEmitter } from "events";

import { version } from "./package.json";

import Schema, { SchemaInput } from "./lib/schema.js";
import { SchemaInitOptions } from "./types/index.js";

export default class SchemaManager extends EventEmitter {
	apiKey: string;
	updateTime: number;
	ready: boolean;
	schema: Schema | null;
	private _updateTimeout?: NodeJS.Timeout;
	private _updateInterval?: NodeJS.Timeout;

	constructor(options: SchemaInitOptions) {
		super();

		this.apiKey = options.apiKey;
		this.updateTime = options.updateTime || 24 * 60 * 60 * 1000;

		this.ready = false;
		this.schema = null;
	}

	/**
	 * Initializes the class
	 */
	async init() {
		if (this.ready) return;

		if (this.schema !== null && this._updateWait() !== 0) {
			this._startUpdater();

			this.ready = true;
			this.emit("ready");
			return;
		}

		await this.getSchema();
		this._startUpdater();

		this.ready = true;
		this.emit("ready");
	}

	/**
	 * Sets the schema using known data. If the schema data does not contain a version, or the version does not satify our version, then the schema will be ignored
	 * @param data Schema data
	 * @param fromUpdate If the schema is new or not
	 */
	setSchema(data: SchemaInput, fromUpdate: boolean) {
		// Ignore the schema if it does not contain a version, or if the schema has a higher version (major)
		if ((!data.version && !fromUpdate) || major(data.version) !== major(version)) {
			return;
		}

		if (this.schema !== null) {
			this.schema.raw = data.raw;
			this.schema.time = data.time || new Date().getTime();
		} else {
			this.schema = new Schema(data);
		}

		if (fromUpdate) {
			this.emit("schema", this.schema);
		}
	}

	/**
	 * Gets the schema from the TF2 API
	 */
	async getSchema() {
		if (this.apiKey === undefined) {
			throw new Error("Missing API key");
		}

		const [overview, items, paintkits, items_game] = await Promise.all([
			Schema.getOverview(this.apiKey),
			Schema.getItems(this.apiKey),
			Schema.getPaintKits(),
			Schema.getItemsGame(),
		]);

		const raw = {
			schema: Object.assign(overview, { items: items, paintkits: paintkits }),
			items_game: items_game,
		};

		this.setSchema({ version: version, raw: raw }, true);
	}

	/**
	 * Starts schema updater
	 */
	private _startUpdater() {
		if (this.updateTime === -1) {
			return;
		}

		if (this._updateTimeout) clearTimeout(this._updateTimeout);
		if (this._updateInterval) clearInterval(this._updateInterval);

		this._updateTimeout = setTimeout(() => {
			// Update the schema
			try {
				this.getSchema();
			} catch (err) {
				this.emit("failed", err);
			}

			// Set update interval
			this._updateInterval = setInterval(() => this.getSchema(), this.updateTime);
		}, this._updateWait());
	}

	private _updateWait() {
		if (this.updateTime === -1) {
			return -1;
		}

		let wait = this.schema!.time - new Date().getTime() + this.updateTime;
		if (wait < 0) {
			wait = 0;
		}

		return wait;
	}
}

const _Schema = Schema;
export { _Schema as Schema };
