import { BaseType } from "./base-type";
import { TSchemaConfig } from "./types";
import { validateCustomFunc, validateType } from "./utils";
import type { Schema } from "./schema";

export class BooleanType extends BaseType {
    constructor(
        public config: TSchemaConfig,
        public SchemaCreator: Schema,
    ) {
        super(config, SchemaCreator);
        if (this.properties) {
            throw new Error("Boolean type cannot have properties defined");
        }
        if (this.schema) {
            throw new Error("Boolean type cannot have schema defined");
        }
        if (this.acceptNull) {
            throw new Error("Boolean type cannot accept null");
        }

        if (this.anyOf ) { //|| this.allOf) {
            throw new Error("array type doesn't support anyOf or allOf property");
        }
    }

    setValidationTypeProperties() {
        // needs to be implemented in types
        this.registerTypeAliases(Boolean, 'boolean');
        this.registerValidationProperties(
            // {
            //     name: 'required',
            //     validationFunc: validateRequired,
            //     setterFunc: setRequired,
            //     dependencies: {},
            // },
            {
                name: 'type',
                validationFunc: validateType,
                // dependencies: {'required': {onIsValid: true}}
                dependencies: {},
            },
            {
                name: 'customValidation',
                validationFunc: validateCustomFunc,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            },
        );
    }
}