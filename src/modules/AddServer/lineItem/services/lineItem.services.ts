import crypto from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { MultipartFile } from "@fastify/multipart";
import type { AdType, Creative, LineItem, Status } from "@prisma/client";
import type { FastifyRequest } from "fastify";

export type CreateCreativeData = {
	url: string;
	type: AdType;
	width: number;
	height: number;
	mime: string;
	bytes: number;
	originalName: string;
};

export type CreateLineItemData = {
	size: string;
	cpmMin: number;
	cpmMax: number;
	geo: string[];
	adType: AdType;
	frequency: number;
	status: Status;
	creativeId: string;
};

export type LineItemDeps = {
	creativeRepo: { create: (data: CreateCreativeData) => Promise<Creative> };
	lineItemRepo: { create: (data: CreateLineItemData) => Promise<LineItem> };
};

export type BodyWithFile = {
	size: { value: string };
	cpmMin: { value: string };
	cpmMax: { value: string };
	geo: { value: string };
	adType: { value: string };
	frequency: { value: string };
	creative: MultipartFile;
};

type SavedFileInfo = {
	url: string;
	mime: string;
	bytes: number;
	originalName: string | null;
};

function parseSize(size: string): { width: number; height: number } {
	const m = /^(\d+)x(\d+)$/i.exec((size || "").trim());
	if (!m) throw new Error('Invalid "size". Use "300x250".');
	return { width: Number(m[1]), height: Number(m[2]) };
}

async function saveFileToPublic(file: MultipartFile): Promise<SavedFileInfo> {
	const id = crypto.randomUUID();
	const ext = path.extname(file.filename || "");
	const dir = path.join(process.cwd(), "public", "creatives");
	await mkdir(dir, { recursive: true });
	const filename = `${id}${ext}`;
	const abs = path.join(dir, filename);
	const url = `/creatives/${filename}`;
	await pipeline(file.file, createWriteStream(abs));
	const statInfo = await stat(abs);
	return {
		url,
		mime: file.mimetype || "application/octet-stream",
		bytes: statInfo.size,
		originalName: file.filename || null,
	};
}

export async function createLineItemWithCreative(
	req: FastifyRequest,
	deps: LineItemDeps,
) {
	const { creativeRepo, lineItemRepo } = deps;

	const body = req.body as BodyWithFile;

	if (!body) {
		throw new Error("No data received");
	}

	const size = body.size?.value;
	const cpmMin = Number(body.cpmMin?.value);
	const cpmMax = Number(body.cpmMax?.value);
	const geoValue = body.geo?.value;
	const adTypeValue = String(body.adType?.value || "banner");
	const frequency = Number(body.frequency?.value || 1);

	const creative = body.creative;
	if (!creative) {
		throw new Error("Field 'creative' is required");
	}

	// Validation
	if (!size) throw new Error("Field 'size' is required");
	if (Number.isNaN(cpmMin) || cpmMin <= 0) throw new Error("Invalid cpmMin");
	if (Number.isNaN(cpmMax) || cpmMax <= 0) throw new Error("Invalid cpmMax");
	if (!geoValue) throw new Error("Field 'geo' is required");

	if (cpmMin >= cpmMax) {
		throw new Error("cpmMin must be less than cpmMax");
	}

	const { width, height } = parseSize(size);
	const geo = [geoValue];

	const stored = await saveFileToPublic(creative);

	const creativeRecord = await creativeRepo.create({
		url: stored.url,
		type: adTypeValue as AdType,
		width,
		height,
		mime: stored.mime,
		bytes: stored.bytes,
		originalName: stored.originalName || "",
	});

	const lineItem = await lineItemRepo.create({
		size: `${width}x${height}`,
		cpmMin,
		cpmMax,
		geo,
		adType: adTypeValue as AdType,
		frequency,
		status: "active" as Status,
		creativeId: creativeRecord.id,
	});

	return {
		message: "Line item created",
		creativeId: creativeRecord.id,
		lineItemId: lineItem.id,
		fileUrl: stored.url,
	};
}
