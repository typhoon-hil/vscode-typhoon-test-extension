import { getPdfConfig } from "../utils/pdfConfig";

export interface PdfConfig {
    pdfCoverageTitle?: string;
    organizationalMotto?: string[];
    typhoonHilLogo?: boolean;
    organizationalLogoFilepath?: string;
    headerColor?: string;
    trace?: boolean;
    steps?: boolean;
    plots?: boolean;
}

export class PdfComposer {
    private pdfConfig: PdfConfig = getPdfConfig();
    private command: string = "";

    constructor() {
        this.addTitle()
            .addColor()
            .addLogo()
            .addMotto()
            .addTrace()
            .addSteps()
            .addPlots();
    }

    private addTitle(): PdfComposer {
        this.command += `--pdf-title=${this.pdfConfig.pdfCoverageTitle} `;
        return this;
    }

    private addColor(): PdfComposer {
        this.command += `--pdf-title-color=${this.pdfConfig.headerColor} `;
        return this;
    }

    private addMotto(): PdfComposer {
        this.command += `--pdf-slogan=${this.pdfConfig.organizationalMotto?.join('')} `;
        return this;
    }

    private addLogo(): PdfComposer {
        if (this.pdfConfig.typhoonHilLogo) { return this; }
        this.command += `--pdf-logo=${this.pdfConfig.organizationalLogoFilepath} `;
        return this;
    }

    private addTrace(): PdfComposer {
        if (this.pdfConfig.trace) { return this; }
        this.command += `--pdf-skip-trace `;
        return this;
    }

    private addSteps(): PdfComposer {
        if (this.pdfConfig.steps) { return this; }
        this.command += `--pdf-skip-steps `;
        return this;
    }

    private addPlots(): PdfComposer {
        if (this.pdfConfig.plots) { return this; }
        this.command += `--pdf-skip-plots `;
        return this;
    }

    getCommand(): string {
        return this.command.trim();
    }
}