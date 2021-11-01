import { Base } from "./base";
import { TSchemaConfig, TSchemaProperty, TValidationCheck, TValidationCheckObject, TValidationTypeProperty } from "./types";
import type { Schema } from "./schema";
import { getEmptyValidationCheck } from "./utils";

export class BaseType extends Base {
    constructor(
        public config: TSchemaConfig,
        public SchemaCreator: Schema,
    ) {
        super(config, SchemaCreator);
        this.type = config.type;

        if (
            !(
                this.type === Object
                || this.type.toString().toLowerCase() === 'object'
            ) && (
                this.schema
                || this.properties
            )
        ) {
            throw new Error("The schema/properties field is valid only for Object type.")
        }

        this.properties = this.toProperties(config.properties);
        this.schema = this.toSchema(config.schema);

        this.acceptNull = config.acceptNull? config.acceptNull: false;
        this.default = config.default;
        this.transformFunc = config.transform;
        this.validateFunc = config.validate;

        this.clean = config.clean? config.clean: false;
        this.isCompoundArray = config.isCompoundArray? config.isCompoundArray: false;
        this.isCompoundObject = config.isCompoundObject? config.isCompoundObject: false;
        this.anyOf = this.toOf(config.anyOf);
        // this.allOf = this.toOf(config.allOf);

        this.setValidationTypeProperties();
        this.setValidataionTypePropertyConfigValues();
    }

    public properties: TSchemaProperty | undefined;
    public schema: TSchemaConfig | any;
    public acceptNull: boolean = false;
    public default: any;
    public transformFunc: Function | undefined;
    public validateFunc: Function | undefined;
    public clean: boolean = false;
    public isCompoundArray: boolean = false;
    public isCompoundObject: boolean = false;
    public anyOf: TSchemaConfig[] | undefined;
    // public allOf: TSchemaConfig[] | undefined;

    setValidationTypeProperties() {
        // needs to be implemented in types
    }

    setValidataionTypePropertyConfigValues() {
        let v_properties = Object.values(this.validationProperties);
        for (let check of v_properties) {
            if (check.setterFunc && typeof check.setterFunc === 'function') {
                check.setterFunc(this);
            }
        }
    }

    _validate(data: any): TValidationCheck {
        let validationCheck: TValidationCheck = getEmptyValidationCheck();
        let v_properties = Object.values(this.validationProperties);
        let v_length = v_properties.length;

        let no_dep_checks = v_properties.filter(
            (value: TValidationTypeProperty) => {
                if (
                    !value.dependencies
                    || Object.keys(value.dependencies).length == 0
                ) {
                    return true;
                }

                return false;
            }
        );

        for (let ndc of no_dep_checks) {
            let [status, reason]: [boolean, string] = ndc.validationFunc(this, data);
            let v_key = ndc.name + 'Check';
            (validationCheck as any)[v_key] = {
                isValid: status,
                reason: status === true? 'NA': reason,
                hasRun: true,
            }
            if (!status) {
                validationCheck.isValid = false;
                validationCheck.inValidKeys.push(v_key)
            }
        }

        let iteration = 0;

        let flag = true;
        while (flag) {
            iteration += 1;
            let has_run_count = 0;
            for (let check of v_properties) {
                let v_key = check.name + 'Check';
                if ((validationCheck as any)[v_key] && (validationCheck as any)[v_key].hasRun) {
                    has_run_count += 1;
                    continue;
                }

                if (!(validationCheck as any)[v_key]) {
                    (validationCheck as any)[v_key] = {
                        isValid: true,
                        reason: 'NA',
                        hasRun: false,
                        iterCount: 0
                    }
                }

                let has_run_cond_met: boolean = true;
                let can_ex_cond_met: boolean = true;
                for (let [check_dep_name, check_dep_cond] of Object.entries(check.dependencies)) {
                    let c_v_key = check_dep_name + 'Check';
                    if (!(validationCheck as any)[c_v_key] || (validationCheck as any)[c_v_key].hasRun === false) {
                        has_run_cond_met = false;
                        break;  //dependancy is supposed to be run before so breaking
                    } else if(
                        (validationCheck as any)[c_v_key]
                        && (validationCheck as any)[c_v_key].hasRun
                    ) {
                        if ((validationCheck as any)[c_v_key].isValid === check_dep_cond.onIsValid) {
                            can_ex_cond_met = true;
                        } else {
                            can_ex_cond_met = false;
                            break;  // the dependancy check suggests not to execute this validation.
                        }
                    }
                }

                if (!has_run_cond_met) {
                    (validationCheck as any)[v_key].iterCount += 1;
                    if ((validationCheck as any)[v_key].iterCount > 5) {
                        let msg = (
                            "The validation check for '"
                            + check.name
                            + "' is going in loop so terminating"
                        );
                        console.warn(msg);
                        (validationCheck as any)[v_key].hasRun = true;
                        (validationCheck as any)[v_key].isValid = false;
                        (validationCheck as any)[v_key].reason = msg
                        validationCheck.isValid = false;
                        validationCheck.inValidKeys.push(v_key);
                    }
                }

                if (!can_ex_cond_met) {
                    (validationCheck as any)[v_key].hasRun = true;
                    (validationCheck as any)[v_key].iterCount += 1;
                    (validationCheck as any)[v_key].reason = 'Can Execute dependancy condition not met so auto valid'
                } else {
                    let [status, reason]: [boolean, string] = check.validationFunc(this, data);
                    (validationCheck as any)[v_key].isValid = status;
                    (validationCheck as any)[v_key].reason = status === true? 'NA': reason;
                    (validationCheck as any)[v_key].hasRun = true;

                    if (!status) {
                        validationCheck.isValid = false;
                        validationCheck.inValidKeys.push(v_key)
                    }
                }
            }
            // console.warn("The has_run_count now = ", has_run_count, " iteration = ", iteration);
            if (
                has_run_count === v_length
                || iteration > 5
            ) {
                flag = false;
            }
        }

        if (this.schema && (data !== undefined && data !== null)) {
            validationCheck = this.schema.validate(data)["__0"];
        } else if (this.properties && (data !== undefined && data !== null)) {
            if (data) {
                for (let k of Object.keys(this.properties)) {
                    validationCheck.innerValidation[k] = this.properties[k].validate(data[k]);
                    if (!validationCheck.innerValidation[k].isValid) {
                        validationCheck.isValid = false;
                        validationCheck.innerInValidKeys.push(k);
                    }
                }
            }
        }

        return validationCheck;
    }

    validate(data: any): TValidationCheckObject {
        let valiation_obj: TValidationCheckObject = {};

        let keys: string[] = [];
        if (this.isCompoundArray && !(data instanceof Array)) {
            valiation_obj['0'] = getEmptyValidationCheck();
            valiation_obj['0'].compoundArrayCheck.isValid = false;
            valiation_obj['0'].compoundArrayCheck.reason = (
                "Data provided is not an array."
            );
            return valiation_obj;
        }
        if (this.isCompoundArray) {
            if(data) {
                for(let i = 0; i < data.length; i++) {
                    keys.push(i.toString());
                }
            }
        } else if (this.isCompoundObject) {
            keys = Object.keys(data);
        } else {
            keys = ['__0'];
            data = {'__0': data};
        }
        for (let k of keys) {
            let objValidateMap = this._validate(data[k]);
            (valiation_obj as any)[k as keyof TValidationCheckObject ] = (objValidateMap as TValidationCheck);
            if (!objValidateMap.isValid) {
                break;  // don't continue;
            }
        }

        return valiation_obj;
    }

    _transform(data: any) {
        if (this.schema) {
            data = this.schema.transform(data);
        } else if (this.properties && data) {
            for(let k of Object.keys(this.properties)) {
                data[k] = this.properties[k].transform(data[k]);
            };
        }

        if (this.transformFunc && this.transformFunc instanceof Function) {
            data = this.transformFunc(data);
        }
        return data;
    }

    transform(data: any | any[]): any | any[] {
        let keys: string[] = [];
        if (this.isCompoundArray) {
            let length = data? data.length: 0
            for(let i = 0; i < length; i++) {
                keys.push(i.toString());
            }
        } else if (this.isCompoundObject) {
            keys = Object.keys(data);
        } else {
            keys = ['__0'];
            data = {'__0': data};
        }
        let ret_data: {[id: string]: any} = {}
        for (let k of keys) {
            ret_data[k] = this._transform(data[k]);
        }

        if (this.isCompoundArray || this.isCompoundObject) {
            return ret_data;
        } else {
            return ret_data['__0'];
        }
    }

    getErrorMessageFromValidationMap(validationData: TValidationCheckObject, as_json: boolean = false): string | {[id: string]: any} {
        // console.warn("the validation data = ", validationData);
        let error_dict: {[id: string]: any} = {};
        let outer_keys = [];
        for(let k of Object.keys(validationData)) {
            outer_keys.push(k);
            if (!validationData[k].isValid) {
                let inner_dict: {[id: string]: any} = {};
                if (validationData[k].inValidKeys?.length > 0) {
                    for (let k2 of validationData[k].inValidKeys) {
                        inner_dict[k2.toString()] = (validationData[k][k2 as keyof TValidationCheck] as any).reason;
                    }
                } else if (validationData[k].innerInValidKeys?.length > 0) {
                    for (let k2 of validationData[k].innerInValidKeys) {
                        inner_dict[k2.toString()] = this.getErrorMessageFromValidationMap(
                            validationData[k].innerValidation[k2],
                            true,
                        ) as {[id: string]: any};
                        if (JSON.stringify(inner_dict[k2.toString()]) === '{}') {
                            delete inner_dict[k2.toString()];
                        }
                    }
                }
                error_dict[k.toString()] = inner_dict;
            }
        }
        // console.warn("ret_data dict = ", error_dict);
        if (outer_keys.length === 1 && outer_keys[0] === '__0' && error_dict.hasOwnProperty('__0')) {
            error_dict = error_dict['__0'];
        }
        for (let k of Object.keys(error_dict)) {
            if (JSON.stringify(error_dict[k]) === '{}') {
                delete error_dict[k];
            }
        }
        let ret_data = as_json === true? error_dict : JSON.stringify(error_dict)
        // console.warn("ret_data dict = ", error_dict, ret_data, as_json);
        return ret_data;
    }

    serialize(data: any | any[]): any | any[] {
        let validationData: TValidationCheckObject = this.validate(data);
        let errorMsg = this.getErrorMessageFromValidationMap(validationData);
        if (errorMsg !== '{}') {
            console.warn("the errorMSg = ", errorMsg);
            throw new Error("Validation Failed: " + errorMsg);
        }
        return this.transform(data);
    }
}