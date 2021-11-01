import { TValidationCheck, TValidationCheckObject } from "./types";
import { deepCopy } from "../../app.utils";

export const getEmptyValidationCheck = (): TValidationCheck => {
    return deepCopy(
        {
            compoundArrayCheck: {isValid: true, reason: 'NA', hasRun: true},
            typeCheck: {isValid: true, reason: 'NA', hasRun: false},
            minLengthCheck: {isValid: true, reason: 'NA', hasRun: false},
            maxLengthCheck: {isValid: true, reason: 'NA', hasRun: false},
            minValueCheck: {isValid: true, reason: 'NA', hasRun: false},
            maxValueCheck: {isValid: true, reason: 'NA', hasRun: false},
            requiredCheck: {isValid: true, reason: 'NA', hasRun: false},
            customValidationCheck: {isValid: true, reason: 'NA', hasRun: false},
            isValid: true,
            inValidKeys: [],
            innerValidation: ({} as TValidationCheckObject),
            innerInValidKeys: [],
        }
    ) as TValidationCheck;
}

export const validateType = (context: any, data: any): [boolean, string] => {
    // console.warn("the data = ", data, typeof data);
    let included = context.typeAliases.has(typeof data)
    if (
        !(
            included
            || (
                !included
                && context.acceptNull
                && data === null
            ) || (
                !included
                && !context.required
                && data === undefined
            )
        )
    ) {
        // console.warn("context.typeAliases = ", context.typeAliases);
        let join_val: string[] = [];
        context.typeAliases.forEach(
            (element: any) => {
                join_val.push(element.toString());
            }
        );
        return [
            false,
            (
                "Expected a value of type in '["
                + join_val.join(',')
                + "]'. But got '"
                + typeof data
                + "'."
            )
        ];
    }
    return [true, 'NA'];
}

export const setRequired = (context:any) => {
    context.required = context.config.required? context.config.required: false;
}

export const validateRequired = (context:any, data: any): [boolean, string] => {
    if (context.required) {
        if (!(data || (data === null && context.acceptNull))) {
            return [false, 'This data is marked as required'];
        }
    }
    return [true, 'NA'];
}

export const setMinLength = (context: any) => {
    let min = context.config.hasOwnProperty('minLength')? +context.config['minLength']: undefined;
    if (context.config.hasOwnProperty('minLength') && (min === null || min === undefined)) {
        throw new Error(
            "Property 'minLength' was not converted to valid min compare value. Input Value: " + context.config.minLength
        );
    }

    context.minLength = min;
}

export const validateMinLength = (context: any, data: any): [boolean, string] => {
    if (data && data.hasOwnProperty('length')) {
        if (context.minLength && !(data.length >= context.minLength)) {
            return [false, 'minLength condition failed; expected ' + context.minLength + ' got ' + data.length];
        }
    }
    return [true, 'NA'];
}

export const setMaxLength = (context: any) => {
    let max = context.config.hasOwnProperty('maxLength')? +context.config['maxLength']: undefined;
    if (context.config.hasOwnProperty('maxLength') && (max === null || max === undefined)) {
        throw new Error(
            "Property 'maxLength' was not converted to valid max compare value. Input Value: " + context.config.maxLength
        );
    }

    context.maxLength = max;
}

export const validateMaxLength = (context: any, data: any): [boolean, string] => {
    if (data && data.hasOwnProperty('length')) {
        if (context.maxLength && !(data.length <= context.maxLength)) {
            return [false, 'maxLength condition failed; expected ' + context.maxLength + ' got ' + data.length];
        }
    }
    return [true, 'NA'];
}

export const setMinValue = (context: any) => {
    let min = context.toValue(context.config['minValue']);
    if (context.config.hasOwnProperty('minValue') && (min === null || min === undefined)) {
        throw new Error(
            "Property 'minValue' was not converted to valid min compare value. Input Value: " + context.config.minValue
        );
    }

    context.minValue = min;
}

export const validateMinValue = (context: any, data: any): [boolean, string] => {
    if (context.minValue && !(data &&(data >= context.minValue))) {
        return [false, 'minValue condition failed; expected >= '+ context.minValue + ' got ' + data];
    }
    return [true, 'NA'];
}

export const setMaxValue = (context: any) => {
    let max = context.toValue(context.config['maxValue']);
    if (context.config.hasOwnProperty('maxValue') && (max === null || max === undefined)) {
        throw new Error(
            "Property 'maxValue' was not converted to valid max compare value. Input Value: " + context.config.maxValue
        );
    }

    context.maxValue = max;
}

export const validateMaxValue = (context: any, data: any): [boolean, string] => {
    if (context.maxValue && !(data <= context.maxValue)) {
        return [false, 'maxValue condition failed; expected <= '+ context.maxValue + ' got ' + data];
    }
    return [true, 'NA'];
}

export const validateCustomFunc = (context: any, data: any): [boolean, string] => {
    if (context.validateFunc && context.validateFunc instanceof Function) {
        let [status, reason]: [boolean, string] = context.validateFunc(data);
        if (status) {
            reason = 'NA';
        }
        return [status, reason];
    }
    return [true, 'NA'];
}
