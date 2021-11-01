export type TSchemaConfig = {
    type: any;  // Type constructor
    properties?: TSchemaProperty; // if type is an object the object properties can be defined here.
    schema?: any;  // if type is an object it can defined through other schema.
    required?: boolean; // whether this is arequired field or not.
    acceptNull?: boolean; // whether to consider the null as a valid value.
    default?: any;  // if not a required field give the default value to assume.
    transform?: Function;  // a function to run to translate any value from one to another.
    validate?: Function;  // a validator function to call to validate.
    minValue?: number | Date | string;  // minValue of type Number/Date (or min value of item present in an array)
    maxValue?: number | Date | string;  // maxValue of type Number/Date (or max value of item present in an array)
    minLength?: number;  // minlength of an Array/String of type Array/String (or min arguments of a Function)
    maxLength?: number;  // maxlength of an Array/String of type Array/String (or max arguments of a Function)
    clean?: boolean;  // if value is null |  undefined remove this field from the normalized out?
    isCompoundArray?: boolean;  // if true it will check of compound type config.type[]
    isCompoundObject?: boolean;  // if true it will check of compound type {[id: objectArrayKeyType]: config.type}
    // objectArrayKeyType?: any; // by default a the object array key type is set to string.
    anyOf?: TSchemaConfig[];  // if type is AnyOf then it compares against the config provided in here with or condition.
    allOf?: TSchemaConfig[];  // if type is AllOf then it compares against the config provided in here with and condition.
}

export type TSchemaProperty = {
    [id: string]: TSchemaConfig | any;
}

export type TDependancyCheck = {
    [name: string]: {onIsValid: Boolean}
}

export type TValidationTypeProperty = {
    name: string;
    validationFunc: Function;
    setterFunc?: Function;
    dependencies: TDependancyCheck;
}

export type TValidationTypeProperties = {
    [name: string]: TValidationTypeProperty
}

export type TValidationCheck = {
    compoundArrayCheck: {isValid: boolean, reason: string};
    typeCheck: {isValid: boolean, reason: string, hasRun: boolean};
    minLengthCheck: {isValid: boolean, reason: string, hasRun: boolean};
    maxLengthCheck: {isValid: boolean, reason: string, hasRun: boolean};
    minValueCheck: {isValid: boolean, reason: string, hasRun: boolean};
    maxValueCheck: {isValid: boolean, reason: string, hasRun: boolean};
    requiredCheck: {isValid: boolean, reason: string, hasRun: boolean};
    customValidationCheck: {isValid: boolean, reason: string, hasRun: boolean};
    isValid: boolean;
    inValidKeys: string[];
    innerValidation: {[id: string]: TValidationCheckObject};  // this is added when the type is object and has properties/scheme
    innerInValidKeys: string[],
}

export type TValidationCheckObject = {
    [id: string]: TValidationCheck;
}

