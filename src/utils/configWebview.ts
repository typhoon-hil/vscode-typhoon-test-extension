import * as vscode from 'vscode';
import { Config, ConfigType } from "../models/config";

export function generateConfigElement(config: Config): string {
    switch (config.type) {
        case 'string':
            return `<input type="text" value="${config.value}" />`;
        case 'number':
        case 'integer':
            return `<input type="number" value="${config.value}" />`;
        case 'boolean':
            return `<input type="checkbox" ${config.value ? 'checked' : ''} />`;
        case 'object':
        case 'array':
            return `<textarea>${JSON.stringify(config.value, null, 2)}</textarea>`;
        case 'null':
            return `<p>null</p>`;
    }
}

export function generateConfigHtml(configs: Config[]): string {
    return `
        <div>
            ${configs.map(generateConfigElement).join('\n')}
        </div>
    `;
}

export function getConfigs(configGroup: string): Config[] {
    const configs = vscode.workspace.getConfiguration(configGroup);
    return Object.keys(configs).map(key => {
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