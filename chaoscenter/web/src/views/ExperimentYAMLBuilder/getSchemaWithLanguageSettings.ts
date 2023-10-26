export default function getSchemaWithLanguageSettings(schema: Record<string, any>): Record<string, any> {
  return {
    validate: true,
    enableSchemaRequest: true,
    hover: true,
    completion: true,
    spaces: 4,
    schemas: [
      {
        fileMatch: ['*'],
        schema
      }
    ]
  };
}
