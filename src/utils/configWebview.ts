import * as vscode from 'vscode';
import { Config, ConfigType } from "../models/config";
import * as fs from 'fs';
import * as path from 'path';

const configSchema = getConfigurationSchema();

export function generateConfigElement(config: Config): string {
    const title = `<div class="setting-item-title">${config.label}</div>`;
    const description = config.description ? `<div class="setting-item-description">${config.description}</div>` : '';

    switch (config.type) {
        case 'string':
        case 'number':
        case 'integer':
            const type = config.type === 'string' ? 'text' : 'number';

            return `
            ${title}
            ${description}
            <div class="setting-item-value">
                <input type="${type}" value="${config.value}" />
            </div>
            `;
            
        case 'boolean':
            return `
                ${title}
                <div class="setting-item-value-description">
                    <input type="checkbox" class="checkbox" ${config.value ? 'checked' : ''} />
                    ${description}
                </div>
            `;
        
        case 'object':
        case 'array':
            return `
                ${title}
                ${description}
                <textarea class="setting-item-value">${JSON.stringify(config.value, null, 2)}</textarea>
            `;
        case 'null':
            return `${title}<p>null</p>`;
    }
}

export function generateConfigHtml(configs: Config[]): string {
    return configs.map(generateConfigElement)
    .map(element => wrap(element, 'div class="setting-item"', 'div')).join('\n');
}

export function getConfigs(configGroup: string): Config[] {
    const configs = vscode.workspace.getConfiguration(configGroup);
    const schemaKeys = Object.keys(configSchema);

    return Object.keys(configs).filter(key => schemaKeys.includes(`${configGroup}.${key}`)).map(key => {
        const settingName = `${configGroup}.${key}`;
        const config = configs.inspect(key);
        if (!config) {
            throw new Error(`Config ${key} not found`);
        }

        const value = config.globalValue ?? config.workspaceValue ?? config.defaultValue;

        return {
            label: config.key,
            type: configSchema[settingName].type as ConfigType,
            description: configSchema[settingName].description,
            value: value
        };
    });
}

export function updateConfig(configGroup: string, key: string, value: any) {
    const config = vscode.workspace.getConfiguration(configGroup);
    config.update(key, value, vscode.ConfigurationTarget.Global);
}

function wrap(content: string, startWrapper: string, endWrapper: string): string {
    return `<${startWrapper}>${content}</${endWrapper}>`;
}

function getConfigurationSchema() {
    const extensionPath = vscode.extensions.getExtension('balsabulatovic.tt-demo')?.extensionPath || '';
    const packageJsonPath = path.join(extensionPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.contributes?.configuration?.properties || {};
}