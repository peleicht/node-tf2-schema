import vdf from "vdf";
import { RawSchema, SchemaAttribute, SchemaItem, GetNameAttributes, TextureEffectAttribute, StringEnum } from "../types/index.js";
import { webAPI } from "./webapi.js";

const language = "English";

export interface SchemaInput {
	raw: RawSchema;
	time?: number;
}
interface SchemaItemsResponse {
	status: number;
	items: SchemaItem[];
	next: number;
}

export default class Schema {
	raw: RawSchema;
	time: number;

	/**
	 * Initializes the Schema class
	 */
	constructor(data: SchemaInput) {
		this.raw = data.raw;
		this.time = data.time || Date.now();
	}

	/**
	 * Gets schema item by defindex
	 */
	getItemByDefindex(defindex: number): SchemaItem | null {
		let start = 0;
		let end = this.raw.schema.items.length - 1;
		let iterLim = Math.ceil(Math.log2(this.raw.schema.items.length)) + 2;
		while (start <= end) {
			if (iterLim <= 0) {
				break; //use fallback search
			}
			iterLim--;
			const mid = Math.floor((start + end) / 2);
			if (this.raw.schema.items[mid].defindex < defindex) {
				start = mid + 1;
			} else if (this.raw.schema.items[mid].defindex > defindex) {
				end = mid - 1;
			} else {
				return this.raw.schema.items[mid];
			}
		}
		for (let i = 0; i < this.raw.schema.items.length; i++) {
			const item = this.raw.schema.items[i];
			if (item.defindex === defindex) {
				return item;
			}
		}

		return null;
	}

	/**
	 * Gets schema item by item name
	 */
	getItemByItemName(name: string): SchemaItem | null {
		for (let i = 0; i < this.raw.schema.items.length; i++) {
			const item = this.raw.schema.items[i];
			if (item.item_name === name) {
				return item;
			}
		}

		return null;
	}

	/**
	 * Gets schema attribute by defindex
	 */
	getAttributeByDefindex(defindex: number): SchemaAttribute | null {
		let start = 0;
		let end = this.raw.schema.attributes.length - 1;
		let iterLim = Math.ceil(Math.log2(this.raw.schema.attributes.length)) + 2;
		while (start <= end) {
			if (iterLim <= 0) {
				break; //use fallback search
			}
			iterLim--;
			const mid = Math.floor((start + end) / 2);
			if (this.raw.schema.attributes[mid].defindex < defindex) {
				start = mid + 1;
			} else if (this.raw.schema.attributes[mid].defindex > defindex) {
				end = mid - 1;
			} else {
				return this.raw.schema.attributes[mid];
			}
		}
		for (let i = 0; i < this.raw.schema.attributes.length; i++) {
			const attribute = this.raw.schema.attributes[i];
			if (attribute.defindex === defindex) {
				return attribute;
			}
		}

		return null;
	}

	/**
	 * Gets quality name by id
	 */
	getQualityById(id: number): string | null {
		for (const type in this.raw.schema.qualities) {
			if (!Object.prototype.hasOwnProperty.call(this.raw.schema.qualities, type)) {
				continue;
			}

			if (this.raw.schema.qualities[type] === id) {
				return this.raw.schema.qualityNames[type];
			}
		}

		return null;
	}

	/**
	 * Gets quality id by name
	 */
	getQualityIdByName(name: string): number | null {
		for (const type in this.raw.schema.qualityNames) {
			if (!Object.prototype.hasOwnProperty.call(this.raw.schema.qualityNames, type)) {
				continue;
			}

			if (this.raw.schema.qualityNames[type] === name) {
				return this.raw.schema.qualities[type];
			}
		}

		return null;
	}

	/**
	 * Gets effect name by id
	 */
	getEffectById(id: number): string | null {
		let start = 0;
		let end = this.raw.schema.attribute_controlled_attached_particles.length - 1;
		let iterLim = Math.ceil(Math.log2(this.raw.schema.attribute_controlled_attached_particles.length)) + 2;
		while (start <= end) {
			if (iterLim <= 0) {
				break; //use fallback search
			}
			iterLim--;
			const mid = Math.floor((start + end) / 2);
			if (this.raw.schema.attribute_controlled_attached_particles[mid].id < id) {
				start = mid + 1;
			} else if (this.raw.schema.attribute_controlled_attached_particles[mid].id > id) {
				end = mid - 1;
			} else {
				return this.raw.schema.attribute_controlled_attached_particles[mid].name;
			}
		}

		for (let i = 0; i < this.raw.schema.attribute_controlled_attached_particles.length; i++) {
			const effect = this.raw.schema.attribute_controlled_attached_particles[i];

			if (effect.id === id) {
				return effect.name;
			}
		}

		return null;
	}

	/**
	 * Gets effect id by name
	 */
	getEffectIdByName(name: string): number | null {
		for (let i = 0; i < this.raw.schema.attribute_controlled_attached_particles.length; i++) {
			const effect = this.raw.schema.attribute_controlled_attached_particles[i];

			if (effect.name === name) {
				return effect.id;
			}
		}

		return null;
	}

	/**
	 * Gets skin name by id
	 */
	getSkinById(id: number): string | null {
		if (!Object.prototype.hasOwnProperty.call(this.raw.schema.paintkits, id)) {
			return null;
		}

		return this.raw.schema.paintkits[id];
	}

	/**
	 * Gets skin id by name
	 */
	getSkinIdByName(name: string): number | null {
		for (const id in this.raw.schema.paintkits) {
			if (!Object.prototype.hasOwnProperty.call(this.raw.schema.paintkits, id)) {
				continue;
			}

			if (this.raw.schema.paintkits[id] === name) {
				return parseInt(id);
			}
		}

		return null;
	}

	/**
	 * Gets the name of an item with specific attributes
	 * @param item
	 * @param [proper = true] Use proper name when true (adds "The" if proper_name in schema is true)
	 */
	getName(item: GetNameAttributes, proper = true): string | null {
		const schemaItem = this.getItemByDefindex(item.defindex);
		if (schemaItem === null) {
			return null;
		}

		let name = "";

		if (item.tradable === false) {
			name = "Non-Tradable ";
		}

		if (item.craftable === false) {
			name += "Non-Craftable ";
		}

		if (item.quality2) {
			// Elevated quality
			name += this.getQualityById(item.quality2) + " ";
		}

		if ((item.quality !== 6 && item.quality !== 15 && item.quality !== 5) || (item.quality === 5 && !item.effect) || schemaItem.item_quality == 5) {
			// If the quality is not Unique, Decorated, or Unusual, or if the quality is Unusual but it does not have an effect, or if the item can only be unusual, then add the quality
			name += this.getQualityById(item.quality) + " ";
		}

		if (item.festive === true) {
			name += "Festivized ";
		}

		if (item.effect) {
			name += this.getEffectById(item.effect) + " ";
		}

		if (item.killstreak && item.killstreak > 0) {
			name += ["Killstreak", "Specialized Killstreak", "Professional Killstreak"][item.killstreak - 1] + " ";
		}

		if (item.target) {
			name += this.getItemByDefindex(item.target)!.item_name + " ";
		}

		if (item.outputQuality && item.outputQuality !== 6) {
			name = this.getQualityById(item.outputQuality) + " " + name;
		}

		if (item.output) {
			name += this.getItemByDefindex(item.output)!.item_name + " ";
		}

		if (item.australium === true) {
			name += "Australium ";
		}

		if (item.paintkit) {
			name += this.getSkinById(item.paintkit) + " ";
		}

		if (proper === true && name === "" && schemaItem.proper_name == true) {
			name = "The ";
		}

		name += schemaItem.item_name;

		if (item.wear) {
			name += " (" + ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle Scarred"][item.wear - 1] + ")";
		}

		if (item.crateseries) {
			name += " #" + item.crateseries;
		}

		return name;
	}

	/**
	 * Gets schema overview
	 */
	static getOverview(apiKey: string) {
		const url = "https://api.steampowered.com/IEconItems_440/GetSchemaOverview/v0001/";
		const qs = {
			key: apiKey,
			language,
		};

		return webAPI(url, { qs });
	}

	/**
	 * Gets schema items
	 */
	static async getItems(apiKey: string) {
		const url = "https://api.steampowered.com/IEconItems_440/GetSchemaItems/v0001/";
		const qs = {
			key: apiKey,
			language,
			start: 0,
		};

		let items: SchemaItem[] = [];
		let next: number = 0;

		while (true) {
			const res: SchemaItemsResponse = await webAPI(url, { qs });

			items = items.concat(res.items);
			if (res.next == undefined) return items;

			next = res.next;
			qs.start = next;
		}
	}

	/**
	 * Gets skins / paintkits from TF2 protodefs
	 */
	static async getPaintKits(): Promise<StringEnum> {
		const url = "https://raw.githubusercontent.com/SteamDatabase/GameTracking-TF2/master/tf/resource/tf_proto_obj_defs_english.txt";
		const res = await webAPI(url, {});

		const parsed = vdf.parse(res);

		const protodefs = parsed["lang"].Tokens;

		const paintkits: TextureEffectAttribute[] = [];

		for (const protodef in protodefs) {
			if (!Object.prototype.hasOwnProperty.call(protodefs, protodef)) {
				continue;
			}

			const parts = protodef.slice(0, protodef.indexOf(" ")).split("_");
			if (parts.length !== 3) {
				continue;
			}

			const type = parts[0];
			if (type !== "9") {
				continue;
			}

			const def = parts[1];
			const name = protodefs[protodef];

			if (name.startsWith(def + ":")) {
				continue;
			}

			paintkits.push({
				id: def,
				name: name,
			});
		}

		paintkits.sort(function (a, b) {
			return Number(a.id) - Number(b.id);
		});

		const paintkitObj: StringEnum = {};

		for (let i = 0; i < paintkits.length; i++) {
			const paintkit = paintkits[i];
			paintkitObj[paintkit.id] = paintkit.name;
		}

		return paintkitObj;
	}

	static async getItemsGame(): Promise<any> {
		const url = "https://raw.githubusercontent.com/SteamDatabase/GameTracking-TF2/master/tf/scripts/items/items_game.txt";
		const resp = await webAPI(url, {});
		return vdf.parse(resp).items_game;
	}

	/**
	 * Creates data object used for initializing class
	 */
	toJSON(): object {
		return {
			time: this.time,
			raw: this.raw,
		};
	}
}
