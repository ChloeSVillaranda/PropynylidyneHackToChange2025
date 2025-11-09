declare module "swagger-jsdoc" {
  import { OpenAPIV3 } from "openapi-types";

  export interface OAS3Options {
    definition: OpenAPIV3.Document;
    apis: string[];
  }

  export default function swaggerJSDoc(options: OAS3Options): OpenAPIV3.Document;
}