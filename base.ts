import { TSchemaConfig, TSchemaProperty, TValidationTypeProperties, TValidationTypeProperty } from "./types";
import type { Schema } from "./schema";

export class Base {
    constructor(
        public config?: TSchemaConfig,
        public SchemaCreator?: Schema,
    ) {
        if (config && config.properties && config.schema) {
            throw new Error("Both Properties and schema cannot exist together");
        }
    }

    private _type: any = null;
    private _typeAliases: Set<any> = new Set();
    private _validationProperties: TValidationTypeProperties = {};

    get type() {
        return this._type;
    }

    set type(val) {
        if (val instanceof String) {
            this._typeAliases.add(val);
            this._typeAliases.add(val.toString())
            this._typeAliases.add(val.toString().toLowerCase());
        } else if (val instanceof Function) {
            this._typeAliases.add(val);
            this._typeAliases.add(val.name)
            this._typeAliases.add(val.name.toLowerCase());
        } else {
            this._typeAliases.add(undefined);
            this._typeAliases.add('undefined');
        }
        this._type = val;
    }

    get typeAliases() {
        return this._typeAliases;
    }

    get validationProperties() {
        return this._validationProperties;
    }


    registerTypeAliases(...aliases: any[]) {
        for (let alias of aliases) {
            this._typeAliases.add(alias);
        }
    }

    removeTypeAliases(...aliases: any[]) {
        for (let alias of aliases) {
            this._typeAliases.delete(alias);
        }
    }

    registerValidationProperties(...properties: TValidationTypeProperty[]) {
        for (let prpt of properties) {
            this._validationProperties[prpt.name] = prpt;
        }
    }

    removeValidationProperties(...properties: TValidationTypeProperty[]) {
        for (let prpt of properties) {
            delete this._validationProperties[prpt.name];
        }
    }

    getTypeConstructor(val: any) {
        if (val instanceof Function) {
            return val;
        } else {
            switch(val.toString().toLowerCase()) {
                case 'boolean':
                    return Boolean;
                case 'number':
                    return Number;
                case 'string':
                    return String;
                case 'array':
                    return Array;
                case 'date':
                    return Date;
                case 'function':
                    return null;
                case 'object':
                    return null;
                default:
                    return null;
            }
        }
    }

    toValue(val: any): any {
        let constr = this.getTypeConstructor(this.type);
        if (val instanceof constr || val === null || val === undefined) {
            return val;
        } else {
            try {
                return new constr(val);
            } catch(e) {
                console.error("Error converting value to type and is = ", e);
                return null;
            }
        }
    }

    toSchema(schema: TSchemaConfig | any) {
        if (schema  && this.SchemaCreator) {
            if (schema instanceof (this.SchemaCreator as any)) {
                return schema;
            } else {
                return new (this.SchemaCreator as any)(schema);
            }
        }
        return undefined;
    }

    toProperties(properties: TSchemaProperty | undefined): TSchemaProperty | undefined {
        if (properties) {
            let retP: TSchemaProperty = {};
            for (let [key, val] of Object.entries(properties)) {
                let nVal = this.toSchema(val);
                if (nVal) retP[key] = nVal;
            }
            return retP;
        }
        return undefined;
    }

    toOf(data: TSchemaConfig[] | undefined) {
        if (data) {
            let retD = [];
            for (let d of data) {
                let ret = this.toSchema(d);
                if (ret) {
                    retD.push(ret);
                }
            }
            return retD;
        }
        return undefined;
    }

    validate(data: any | any[]): any {
        /// change return type
        // do validation logic
    }

    serialize(data: any | any[]): any | any[] {
        // let validationData: TValidationMap = this.validate(data);
        // if (!validationData.isValid) {
        //     let errorMsg = this.getErrorMessageFromValidationMap(validationData);
        //     throw new Error("Validation Failed: " + errorMsg);
        // }
        return this.transform(data);
    }

    _transform(data: any) {
        // if (this.transformFunc && this.transformFunc instanceof Function) {
        //     data = this.transformFunc(data);
        // }
        return data;
    }

    transform(data: any | any[]): any | any[] {
        // let keys: string[] = [];
        // if (this.isCompoundArray) {
        //     for(let i = 0; i < data.length; i++) {
        //         keys.push(i.toString());
        //     }
        // } else if (this.isCompoundObject) {
        //     keys = Object.keys(data);
        // } else {
        //     keys = ['0'];
        //     data = [data];
        // }
        // let ret_data: {[id: string]: any} = {}
        // for (let k of keys) {
        //     ret_data[k] = this._transform(data[k]);
        // }

        // if (this.isCompoundArray || this.isCompoundObject) {
        //     return ret_data;
        // } else {
        //     return ret_data[0];
        // }
        return data;
    }


}