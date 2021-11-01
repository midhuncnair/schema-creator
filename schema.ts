import { AnyOfType } from "./anyOf";
import { ArrayType } from "./array";
import { Base } from "./base";
import { BaseType } from "./base-type";
import { BooleanType } from "./boolean";
import { DateType } from "./date";
import { FunctionType } from "./function";
import { NumberType } from "./number";
import { ObjectType } from "./object";
import { StringType } from "./string";
import { TSchemaConfig, TValidationTypeProperty } from "./types";


type TType = BaseType | BooleanType | NumberType | StringType | DateType | ArrayType | AnyOfType | FunctionType | ObjectType;
type TTypes = TType | any;
export const AnyOf = Symbol('AnyOf');

export class Schema extends Base {
    constructor(
        public config: TSchemaConfig,
    ) {
        super();
        this.setup();
    }

    typeMapping: {[id: string]: TTypes[]} = {}
    configObject: TTypes
    rootType: any;

    setup() {
        this.register(BooleanType, Boolean, 'boolean');

        this.register(NumberType, Number, 'number');

        this.register(StringType, String, 'string');

        this.register(DateType, Date, 'date');

        this.register(ArrayType, Array, 'array');

        this.register(AnyOfType, AnyOf, 'anyOf', 'anyof');

        this.register(FunctionType, Function, 'function');

        this.register(ObjectType, Object, 'object');

        this.init();
    }

    init() {
        this.rootType = this.config.type;
        if (this.typeMapping[this.rootType]) {
            this.configObject = new (this.typeMapping[this.rootType] as any)(this.config, Schema);
        } else {
            console.warn("The type is not recognized and so falling back to object type");
            this.configObject = new (this.typeMapping['object'] as any)(this.config, Schema);
        }
    }

    register(type_handler: TTypes, ...types: any[]) {
        let error_msg: string = '';
        let status = true;
        for (let type of types) {
            if (!this.typeMapping[type]) {
                this.typeMapping[type] = type_handler;
                // type_handler.registerTypeAliases(type);
            } else {
                error_msg += "A handler for type '" + type.toString() + "', already exist;";
                status = false;
            }
        }

        return [status, error_msg]
    }

    update(type_handler: TTypes, type: any) {
        this.typeMapping[type] = type_handler;
    }

    validate(data: any) {
        return this.configObject.validate(data);
    }

    serialize(data: any) {
        return this.configObject.serialize(data);
    }

    transform(data: any) {
        return this.configObject.transform(data);
    }

    _transform(data: any) {
        return this.configObject._transform(data);
    }

    // registerTypeAliases(type: any, ...aliases: any[]) {
    //     let handler = this.typeMapping[type];
    //     this.register(handler, ...aliases);
    // }

    // removeTypeAliases(type: any, ...aliases: any[]) {
    //     let handler = this.typeMapping[type];
    //     ((handler as unknown) as TType).removeTypeAliases(...aliases);
    //     for(let alias of aliases) {
    //         delete this.typeMapping[alias];
    //     }
    // }

    // registerValidationProperties(type: any, ...properties: TValidationTypeProperty[]) {
    //     let handler = this.typeMapping[type];
    //     ((handler as unknown) as TType).registerValidationProperties(...properties);
    // }

    // removeValidationProperties(type: any, ...properties: TValidationTypeProperty[]) {
    //     let handler = this.typeMapping[type];
    //     ((handler as unknown) as TType).removeValidationProperties(...properties);
    // }
}
