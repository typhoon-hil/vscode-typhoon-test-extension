export type ConfigType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'integer';

export interface Config {
    label: string;
    type: ConfigType;
    value: any;
    description?: string;
    group: string;
    enum?: any[];
}

export interface ConfigResponse {
    configName: string;
    value: any;
}

export interface ConfigError {
    error: string;
}

export interface ConfigCommand {
    command: string;
}