import { EventEmitter } from "events";

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
	 * Sets the schema using known data.
	 * @param data The data to set the schema with
	 * @param fromUpdate Whether this is from an update or not. If true emits "schema" event.
	 */
	setSchema(data: SchemaInput, fromUpdate: boolean) {
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

		this.setSchema({ raw }, true);
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

		this._updateTimeout = setTimeout(async () => {
			// Update the schema
			try {
				await this.getSchema();
			} catch (err) {
				this.emit("failed", err);
			}

			// Set update interval
			this._updateInterval = setInterval(async () => {
				try {
					await this.getSchema();
				} catch (err) {
					this.emit("failed", err);
				}
			}, this.updateTime);
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

export { Schema, SchemaInput };
export { SchemaInitOptions, RawSchema, SchemaItem, SchemaAttribute, GetNameAttributes } from "./types/index.js";
