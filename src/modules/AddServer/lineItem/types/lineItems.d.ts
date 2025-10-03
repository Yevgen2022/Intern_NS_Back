import type { MultipartFile } from "@fastify/multipart";
import type { AdType, Status } from "@prisma/client";

// Structure of a field from a multipart form
export interface MultipartField {
	type: "field";
	fieldname: string;
	mimetype: string;
	encoding: string;
	value: string;
	fieldnameTruncated: boolean;
	valueTruncated: boolean;
	fields: Record<string, MultipartField | MultipartFileField>;
}

// Structure of a file from a multipart form
export interface MultipartFileField extends MultipartFile {
	type: "file";
	fields: Record<string, MultipartField | MultipartFileField>;
}

// Body received from the form with attachFieldsToBody: true
export interface LineItemMultipartBody {
	size: MultipartField;
	cpmMin: MultipartField;
	cpmMax: MultipartField;
	geo: MultipartField;
	adType: MultipartField;
	frequency: MultipartField;
	creative: MultipartFileField;
}

// Data for creating a creative in the DB
export interface CreateCreativeData {
	url: string;
	type: AdType;
	width: number;
	height: number;
	mime: string;
	bytes: number;
	originalName: string | null;
}

// Data for creating a line item in the DB
export interface CreateLineItemData {
	size: string;
	cpmMin: number;
	cpmMax: number;
	geo: string[];
	adType: AdType;
	frequency: number;
	status: Status;
	creativeId: string;
}

// Result of saving a file
export interface SavedFileInfo {
	url: string;
	mime: string;
	bytes: number;
	originalName: string | null;
}
