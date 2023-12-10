export interface SchemaInitOptions {
	apiKey: string;
	updateTime?: number;
}

interface NumEnum {
	[key: string]: number;
}
export interface StringEnum {
	[key: string]: string;
}

export interface TF2Schema {
	raw: RawSchema;
	time: number; //timestamp
	version: string;
	getAttributeByDefindex: (def_index: number) => SchemaAttribute;
	getEffectById: (id: number) => string;
	getEffectidByName: (name: string) => number;
	getItemByDefindex: (def_index: number) => SchemaItem;
	getItemByItemName: (name: string) => SchemaItem;
	getQualityById: (id: number) => string;
	getQualityIdByName: (name: string) => number;
	getSkinById: (id: number) => string;
	getSkinIdByName: (name: string) => number;
}
export interface RawSchema {
	items_game: any;
	schema: {
		attribute_controlled_attached_particles: {
			id: number;
			name: string;
		}[];
		attributes: SchemaAttribute[];
		items: SchemaItem[];
		items_game_url: string;
		kill_eater_score_types: {
			type: number; //id
			type_name: string;
			level_data: string;
		}[];
		paintkits: {
			[key: number]: string; //textures
		};
		qualities: NumEnum;
		qualityNames: StringEnum;
	};
}
export interface SchemaAttribute {
	name: string;
	defindex: number;
	attribute_class: string;
	description_string: string;
	description_format: string;
	effect_type: string;
	hidden: boolean;
	stored_as_integer: boolean;
}
export interface SchemaItem {
	capabilities: {
		[key: string]: true;
	};
	name: string; // e.g. "TF_WEAPON_BAT"
	defindex: number;
	item_class: string; // e.g. "tf_weapon_bat"
	item_type_name: string; // e.g. "Bat"
	item_name: string; // e.g. "Bat", actual base name
	proper_name: boolean;
	item_slot: string; // e.g. "melee",
	model_player: string;
	item_quality: number;
	image_inventory: string;
	min_ilevel: number;
	max_ilevel: number;
	image_url: string;
	image_url_large: string;
	craft_class: string; // e.g. "weapon"
	craft_material_type: string; // e.g. "weapon"
	used_by_classes: string[];
}

export interface TextureEffectAttribute {
	id: string;
	name: string;
}

export interface GetNameAttributes {
	defindex: number;
	quality: number;
	craftable?: boolean;
	tradable?: boolean;
	killstreak?: number;
	australium?: boolean;
	effect?: number;
	festive?: boolean;
	paintkit?: number;
	wear?: number;
	quality2?: number;
	target?: number;
	output?: number;
	outputQuality?: number;
	crateseries?: number;
}
