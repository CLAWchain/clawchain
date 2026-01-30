"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseValidator = void 0;
class BaseValidator {
    async initialize() {
        console.log(`Initializing ${this.name}...`);
    }
    async validateBlock(block) {
        if (!block.isValid()) {
            return false;
        }
        return await this.aiValidation(block);
    }
    async aiValidation(block) {
        return true;
    }
}
exports.BaseValidator = BaseValidator;
//# sourceMappingURL=BaseValidator.js.map