export type ConfigType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'integer';

export interface Config {
    label: string;
    type: ConfigType;
    value: any;
}