import { BaseType } from "./base-type";
import { TSchemaConfig } from "./types";
import type { Schema } from "./schema";
import { setMaxLength, setMinLength, setRequired, validateCustomFunc, validateMaxLength, validateMinLength, validateRequired, validateType } from "./utils";


export class FunctionType extends BaseType {
    constructor(
        public config: TSchemaConfig,
        public SchemaCreator: Schema,
    ) {
        super(config, SchemaCreator);
        if (this.properties) {
            throw new Error("Function type cannot have properties defined");
        }
        if (this.schema) {
            throw new Error("Function type cannot have schema defined");
        }

        if (this.anyOf ) { //|| this.allOf) {
            throw new Error("Function type doesn't support anyOf or allOf property");
        }
    }

    setValidationTypeProperties() {
        // needs to be implemented in types
        this.registerTypeAliases(Function, 'function');
        this.registerValidationProperties(
            {
                name: 'required',
                validationFunc: validateRequired,
                setterFunc: setRequired,
                dependencies: {},
            },
            {
                name: 'type',
                validationFunc: validateType,
                dependencies: {'required': {onIsValid: true}}
            },
            {
                name: 'customValidation',
                validationFunc: validateCustomFunc,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            },
            {
                name: 'minLength',
                validationFunc: validateMinLength,
                setterFunc: setMinLength,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            },
            {
                name: 'maxLength',
                validationFunc: validateMaxLength,
                setterFunc: setMaxLength,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            }
        );
    }
}
