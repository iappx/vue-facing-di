export class VueFacingDiError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'VueFacingDiError'
    }
}
