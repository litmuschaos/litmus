/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
