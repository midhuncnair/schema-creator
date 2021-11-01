import { BaseType } from "./base-type";
import { TSchemaConfig } from "./types";
import type { Schema } from "./schema";
import { setMaxLength, setMaxValue, setMinLength, setMinValue, setRequired, validateCustomFunc, validateMaxLength, validateMinLength, validateRequired, validateType } from "./utils";

export const validateTypeArray = (context: any, data: any): [boolean, string] => {
    if (!Array.isArray(data)) {
        return validateType(context, data);
    }
    return [true, 'NA'];
}

export const validateMinValueArray = (context: any, data: any): [boolean, string] => {
    if (data) {
        data.sort(
            (a: any, b: any) => {
                if (a && b && a.hasOwnProperty('toString') && b.hasOwnProperty('toString')) {
                    return a.toString().localeCompare(
                        b.toString(),
                        undefined,
                        {
                            numeric: true,
                            sensitivity: 'base',
                            ignorePunctuation: true
                        }
                    );
                } else {
                    return 0
                }
            }
        );
        if (context.minValue && !(data[0] >= context.minValue)) {
            console.warn("context = ", context);
            return [false, 'minValue condition failed; expected a min(data) >= ' + context.minValue + ' got ' + data[0]];
        }
    }
    return [true, 'NA'];
}

export const validateMaxValueArray = (context: any, data: any): [boolean, string] => {
    if (data) {
        data.sort(
            (a: any, b: any) => {
                if (a && b && a.hasOwnProperty('toString') && b.hasOwnProperty('toString')) {
                    return a.toString().localeCompare(
                        b.toString(),
                        undefined,
                        {
                            numeric: true,
                            sensitivity: 'base',
                            ignorePunctuation: true
                        }
                    );
                } else {
                    return 0
                }
            }
        );
        if (context.maxValue && !(data[data.length - 1] <= context.maxValue)) {
            return [false, 'maxValue condition failed; expected a max(data) <= ' + context.maxValue + ' got ' + data[data.length - 1]];
        }
    }
    return [true, 'NA'];
}

export class ArrayType extends BaseType {
    constructor(
        public config: TSchemaConfig,
        public SchemaCreator: Schema,
    ) {
        super(config, SchemaCreator);
        if (this.properties) {
            throw new Error("anyOf type cannot have properties defined");
        }
        if (this.schema) {
            throw new Error("anyOf type cannot have schema defined");
        }
        if (this.acceptNull) {
            throw new Error("array type cannot accept null");
        }

        if (this.anyOf ) { //|| this.allOf) {
            throw new Error("array type doesn't support anyOf or allOf property");
        }
    }

    setValidationTypeProperties() {
        // needs to be implemented in types
        this.registerTypeAliases(Array, 'array');
        this.registerValidationProperties(
            {
                name: 'required',
                validationFunc: validateRequired,
                setterFunc: setRequired,
                dependencies: {},
            },
            {
                name: 'type',
                validationFunc: validateTypeArray,
                dependencies: {'required': {onIsValid: true}}
            },
            {
                name: 'customValidation',
                validationFunc: validateCustomFunc,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            },
            {
                name: 'minValue',
                validationFunc: validateMinValueArray,
                setterFunc: setMinValue,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            },
            {
                name: 'maxValue',
                validationFunc: validateMaxValueArray,
                setterFunc: setMaxValue,
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

    toValue(val: any): any {
        return val;
    }
}
