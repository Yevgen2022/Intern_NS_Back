// src/adServer/lineItem/formHtmlResponse.schema.ts
const formHtmlResponse = {
    $id: "LineItemFormHtmlResponse",
    type: "string",
    description: "SSR HTML form for creating an adserver line item",
    // JSON Schema 2020-12; Ajv/Fastify perceived as metadata (validation — by type:string)
    contentMediaType: "text/html",
} as const;

export default formHtmlResponse;
