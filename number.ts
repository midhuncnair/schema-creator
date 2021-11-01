import { BaseType } from "./base-type";
import { TSchemaConfig } from "./types";
import type { Schema } from "./schema";
import { setMaxLength, setMaxValue, setMinLength, setMinValue, setRequired, validateCustomFunc, validateMaxValue, validateMinValue, validateRequired, validateType } from "./utils";

export const validateMinLengthNumber = (context: any, data: any): [boolean, string] => {
    let dataLength = data? data.toString().length : 0;
    if (context.minLength && !(dataLength >= context.minLength)) {
        return [false, 'minLength condition failed; expected ' + context.minLength + ' got ' + dataLength ];
    }
    return [true, 'NA'];
}

export const validateMaxLengthNumber = (context: any, data: any): [boolean, string] => {
    let dataLength = data? data.toString().length : 0;
    if (context.maxLength && !(data.toString().length <= context.maxLength)) {
        return [false, 'maxLength condition failed; expected ' + context.maxLength + ' got ' + dataLength];
    }
    return [true, 'NA'];
}

export class NumberType extends BaseType {
    constructor(
        public config: TSchemaConfig,
        public SchemaCreator: Schema,
    ) {
        super(config, SchemaCreator);
        if (this.properties) {
            throw new Error("Number type cannot have properties defined");
        }
        if (this.schema) {
            throw new Error("Number type cannot have schema defined");
        }

        if (this.anyOf ) { //|| this.allOf) {
            throw new Error("Number type doesn't support anyOf or allOf property");
        }
    }

    setValidationTypeProperties() {
        // needs to be implemented in types
        this.registerTypeAliases(Number, 'number');
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
                name: 'minValue',
                validationFunc: validateMinValue,
                setterFunc: setMinValue,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            },
            {
                name: 'maxValue',
                validationFunc: validateMaxValue,
                setterFunc: setMaxValue,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            },
            {
                name: 'minLength',
                validationFunc: validateMinLengthNumber,
                setterFunc: setMinLength,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            },
            {
                name: 'maxLength',
                validationFunc: validateMaxLengthNumber,
                setterFunc: setMaxLength,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            }
        );
    }
}
