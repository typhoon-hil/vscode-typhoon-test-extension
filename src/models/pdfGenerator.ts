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

export class PdfArgumentBuilder {
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

    private addTitle(): PdfArgumentBuilder {
        this.command += `--pdf-title="${this.pdfConfig.pdfCoverageTitle}" `;
        return this;
    }

    private addColor(): PdfArgumentBuilder {
        this.command += `--pdf-title-color=${this.pdfConfig.headerColor} `;
        return this;
    }

    private addMotto(): PdfArgumentBuilder {
        this.command += `--pdf-slogan="${this.generateFormattedMotto()}" `;
        return this;
    }

    private addLogo(): PdfArgumentBuilder {
        if (this.pdfConfig.typhoonHilLogo) { return this; }
        this.command += `--pdf-logo=${this.pdfConfig.organizationalLogoFilepath} `;
        return this;
    }

    private addTrace(): PdfArgumentBuilder {
        if (this.pdfConfig.trace) { return this; }
        this.command += `--pdf-skip-trace `;
        return this;
    }

    private addSteps(): PdfArgumentBuilder {
        if (this.pdfConfig.steps) { return this; }
        this.command += `--pdf-skip-steps `;
        return this;
    }

    private addPlots(): PdfArgumentBuilder {
        if (this.pdfConfig.plots) { return this; }
        this.command += `--pdf-skip-plots `;
        return this;
    }

    private generateFormattedMotto(): string {
        let motto = this.pdfConfig.organizationalMotto;
        if (!motto) { return ""; }
        return this.applyHtmlTags(motto.join("\n"));
    }

    private applyHtmlTags(text: string): string {
        const boldPattern = /\*\*[^\*\*]+\*\*/g;
        const italicPattern = /_[^_]+_/g;
        const newLinePattern = /\n/g;

        let tmpText = text;

        // Replace new lines with <br>
        tmpText = tmpText.replace(newLinePattern, '</br>');

        // Replace bold patterns
        const boldMatches = tmpText.match(boldPattern);
        if (boldMatches) {
            boldMatches.forEach(match => {
                const replacement = `<span style="font-weight: 700;">${match.replace(/\*\*/g, '')}</span>`;
                tmpText = tmpText.replace(match, replacement);
            });
        }

        // Replace italic patterns
        const italicMatches = tmpText.match(italicPattern);
        if (italicMatches) {
            italicMatches.forEach(match => {
                const replacement = `<i>${match.replace(/_/g, '')}</i>`;
                tmpText = tmpText.replace(match, replacement);
            });
        }

        return tmpText.replaceAll('"', '\\"');
    }

    getCommand(): string {
        return this.command.trim();
    }

    getDisplayCommand(): string {
        let pureMotto = this.pdfConfig.organizationalMotto?.join("") || "";
        pureMotto = pureMotto.replaceAll("*", "").replaceAll("_", "");
        return this.getCommand().replace(this.generateFormattedMotto(), pureMotto);
    }
}