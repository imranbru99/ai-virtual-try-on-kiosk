"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerativeHDStrategy = void 0;
class GenerativeHDStrategy {
    strategyType = 'generative_hd';
    config = null;
    activeJobs = new Map();
    async initialize(config) {
        this.config = config;
    }
    render(context, detection, products, adjustments) {
        // Generative HD runs as an asynchronous offline render pass.
        // Realtime display renders the preview while overlaying the HD progress indicator if an active render job is processing.
    }
    trackJob(job) {
        this.activeJobs.set(job.jobId, job);
    }
    getJob(jobId) {
        return this.activeJobs.get(jobId);
    }
    dispose() {
        this.activeJobs.clear();
    }
}
exports.GenerativeHDStrategy = GenerativeHDStrategy;
//# sourceMappingURL=GenerativeHDStrategy.js.map