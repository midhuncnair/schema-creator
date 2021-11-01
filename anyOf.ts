import { BaseType } from "./base-type";
import { TSchemaConfig, TValidationCheckObject } from "./types";
import type { Schema } from "./schema";
import { setMaxLength, setMaxValue, setMinLength, setMinValue, setRequired, validateCustomFunc, validateMaxLength, validateMaxValue, validateMinLength, validateMinValue, validateRequired } from "./utils";

export const validateTypeAnyOf = (context: any, data: any): [boolean, string] => {
    if (
        !(
            context.acceptNull
            && data === null
        )
    ) {
        let hasFound: boolean = false;
        let compareWith: string[] = [];
        for (let anyofScheme of (context.anyOf as any)) {
            anyofScheme.typeAliases.forEach(
                (el: any) => {
                    compareWith.push(el);
                }
            );
            let out: TValidationCheckObject = anyofScheme.validate(data);
            hasFound = hasFound || context.getErrorMessageFromValidationMap(out) === '{}';
            if (hasFound) {
                break
            }
        }
        if (!hasFound) {
            return [
                false,
                (
                    "Expected a value of type in '"
                    + compareWith.join(',')
                    + "'. But got '"
                    + typeof data
                    + "'."
                )
            ];
        }
    }
    return [true, 'NA'];
}


export class AnyOfType extends BaseType {
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
        if (!this.anyOf) {
            throw new Error("Type is anyof but yet the anyOf property is not set");
        }
    }

    setValidationTypeProperties() {
        // needs to be implemented in types
        this.registerTypeAliases(AnyOfType, 'anyOf', 'anyof');
        this.registerValidationProperties(
            {
                name: 'required',
                validationFunc: validateRequired,
                setterFunc: setRequired,
                dependencies: {},
            },
            {
                name: 'type',
                validationFunc: validateTypeAnyOf,
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
