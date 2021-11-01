import { BaseType } from "./base-type";
import { TSchemaConfig } from "./types";
import type { Schema } from "./schema";
import { setMaxValue, setMinValue, setRequired, validateCustomFunc, validateMaxValue, validateMinValue, validateRequired, validateType } from "./utils";


export const validateTypeDate = (context: any, data: any): [boolean, string] => {
    if (data) {
        let n_data = context.toValue(data);
        if (!n_data) {
            return [
                false,
                (
                    "Expected a value of type in '[Date(), Date, date]'. But got '"
                    + typeof data
                    + "'."
                )
            ];
        }
    }
    return [true, 'NA'];
}
export const validateMinValueDate = (context: any, data: any): [boolean, string] => {
    if (data) {
        data = context.toValue(data);
        return validateMinValue(context, data);
    }
    return [true, 'NA'];
}


export const validateMaxValueDate = (context: any, data: any): [boolean, string] => {
    if (data) {
        data = context.toValue(data);
        return validateMaxValue(context, data);
    }
    return [true, 'NA'];
}


export class DateType extends BaseType {
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
                validationFunc: validateTypeDate,
                dependencies: {'required': {onIsValid: true}}
            },
            {
                name: 'customValidation',
                validationFunc: validateCustomFunc,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            },
            {
                name: 'minValue',
                validationFunc: validateMinValueDate,
                setterFunc: setMinValue,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            },
            {
                name: 'maxValue',
                validationFunc: validateMaxValueDate,
                setterFunc: setMaxValue,
                dependencies: {'required': {onIsValid: true}, 'type': {onIsValid: true}},
            },
        );
    }
}
