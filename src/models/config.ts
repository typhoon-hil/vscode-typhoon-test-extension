export type ConfigType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'integer';

export interface Config {
    label: string;
    type: ConfigType;
    value: any;
    description?: string;
    group: string;
}

export interface ConfigResponse {
    configName: string;
    value: any;
}