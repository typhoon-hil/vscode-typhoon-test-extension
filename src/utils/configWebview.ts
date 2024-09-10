import * as vscode from 'vscode';
import { Config, ConfigType } from "../models/config";
import * as fs from 'fs';
import * as path from 'path';

const configSchema = getConfigurationSchema();

export function generateConfigElement(config: Config): string {
    const label = `<label>${config.label}</label>`;
    switch (config.type) {
        case 'string':
            return `${label}<input type="text" value="${config.value}" />`;
        case 'number':
        case 'integer':
            return `${label}<input type="number" value="${config.value}" />`;
        case 'boolean':
            return `${label}<input type="checkbox" ${config.value ? 'checked' : ''} />`;
        case 'object':
        case 'array':
            return `${label}<textarea>${JSON.stringify(config.value, null, 2)}</textarea>`;
        case 'null':
            return `${label}<p>null</p>`;
    }
}

export function generateConfigHtml(configs: Config[]): string {
    return configs.map(generateConfigElement).map(element => wrap(element, 'div')).join('\n');
}

export function getConfigs(configGroup: string): Config[] {
    const configs = vscode.workspace.getConfiguration(configGroup);
    const schemaKeys = Object.keys(configSchema);

    return Object.keys(configs).filter(key => schemaKeys.includes(`${configGroup}.${key}`)).map(key => {
        const config = configs.inspect(key);
        if (!config) {
            throw new Error(`Config ${key} not found`);
        }

        const value = config.globalValue ?? config.workspaceValue ?? config.defaultValue;

        return {
            label: config.key,
            type: determineType(value),
            value: value
        };
    });
}

function determineType(value: any): ConfigType {
    switch (typeof value) {
        case 'string':
            return 'string';
        case 'number':
            return Number.isInteger(value) ? 'integer' : 'number';
        case 'boolean':
            return 'boolean';
        case 'object':
            return Array.isArray(value) ? 'array' : 'object';
        case 'undefined':
            return 'null';
        default:
            throw new Error(`Unsupported config type: ${typeof value}`);
    }
}

export function updateConfig(configGroup: string, key: string, value: any) {
    const config = vscode.workspace.getConfiguration(configGroup);
    config.update(key, value, vscode.ConfigurationTarget.Global);
}

function wrap(content: string, wrapper: string): string {
    return `<${wrapper}>${content}</${wrapper}>`;
}

function getConfigurationSchema() {
    const extensionPath = vscode.extensions.getExtension('balsabulatovic.tt-demo')?.extensionPath || '';
    const packageJsonPath = path.join(extensionPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.contributes?.configuration?.properties || {};
}