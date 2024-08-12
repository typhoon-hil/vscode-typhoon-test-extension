export enum interpreterType {
    System = 'system',
    Embedded = 'embedded',
    Custom = 'custom'
}

export interface TestRunConfig {
    interpreterType: interpreterType;
    customInterpreterPath?: string;
    realTimeLogs: boolean;
    openReport: boolean;
    cleanOldResults: boolean;
    pdfReport: boolean;
    selectTestByName?: string;
    selectTestByMark?: string;
    additionalOptions?: string;
}