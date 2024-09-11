import * as vscode from 'vscode';
import { Config, ConfigType } from "../models/config";
import * as fs from 'fs';
import * as path from 'path';

const configSchema = getConfigSchema();

function generateConfigElement(config: Config): string {
    const title = `<div class="config-item-title">${config.label}</div>`;
    const description = config.description ? `<div class="config-item-description">${config.description}</div>` : '';
    const id = config.group + '.' + config.label;

    switch (config.type) {
        case 'string':
        case 'number':
        case 'integer':
            const type = config.type === 'string' ? 'text' : 'number';

            return `
            ${title}
            ${description}
            <div class="config-item-value">
                <input id="${id}" type="${type}" value="${config.value}" />
            </div>
            `;
            
        case 'boolean':
            return `
                ${title}
                <div class="config-item-value-description">
                    <input id="${id}" type="checkbox" class="checkbox" ${config.value ? 'checked' : ''} />
                    ${description}
                </div>
            `;
        
        case 'object':
        case 'array':
            return `
                ${title}
                ${description}
                <textarea id="${id}" class="config-item-value">${JSON.stringify(config.value, null, 2)}</textarea>
            `;
        case 'null':
            return `${title}<p>null</p>`;
    }
}

export function generateConfigElements(configs: Config[]): string {
    return configs.map(wrapAndGenerateConfigElement).join('\n');
}

export function getConfigs(configGroup: string): Config[] {
    const configs = vscode.workspace.getConfiguration(configGroup);
    const schemaKeys = Object.keys(configSchema);

    return Object.keys(configs).filter(key => schemaKeys.includes(`${configGroup}.${key}`)).map(key => {
        const configName = `${configGroup}.${key}`;
        const config = configs.inspect(key);
        if (!config) {
            throw new Error(`Config ${key} not found`);
        }

        const value = config.globalValue ?? config.workspaceValue ?? config.defaultValue;

        return {
            label: key,
            type: configSchema[configName].type as ConfigType,
            description: configSchema[configName].description,
            value: value,
            group: configGroup
        };
    });
}

export function updateConfig(configGroup: string, key: string, value: any) {
    const config = vscode.workspace.getConfiguration(configGroup);
    config.update(key, value, vscode.ConfigurationTarget.Global);
}

function wrapAndGenerateConfigElement(config: Config): string {
    const id = config.group + '.' + config.label;
    return `<div class="config-item">
        ${generateConfigElement(config)}
    </div>`;
}

function getConfigSchema() {
    const extensionPath = vscode.extensions.getExtension('balsabulatovic.tt-demo')?.extensionPath || '';
    const packageJsonPath = path.join(extensionPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.contributes?.configuration?.properties || {};
}