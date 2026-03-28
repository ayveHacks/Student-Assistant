const crypto = require('crypto');

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

class JobQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.processedJobs = new Set(); // For idempotency
  }

  addJob(processorFunction, payload, jobId = generateId(), retries = 3) {
    if (this.processedJobs.has(jobId)) {
      console.log(`[Queue] Job ${jobId} already processed. Skipping.`);
      return jobId;
    }

    this.queue.push({
      id: jobId,
      processor: processorFunction,
      payload,
      retries,
      attempt: 0
    });

    console.log(`[Queue] Job ${jobId} added.`);
    
    if (!this.processing) {
      this.processNext();
    }
    return jobId;
  }

  async processNext() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const job = this.queue.shift();

    try {
      console.log(`[Queue] Processing job ${job.id} (Attempt ${job.attempt + 1})`);
      await job.processor(job.payload);
      this.processedJobs.add(job.id);
      console.log(`[Queue] Job ${job.id} completed successfully.`);
    } catch (error) {
      console.error(`[Queue] Job ${job.id} failed:`, error.message);
      
      if (job.attempt < job.retries) {
        job.attempt++;
        const backoff = Math.pow(2, job.attempt) * 1000; // Exponential backoff
        console.log(`[Queue] Retrying job ${job.id} in ${backoff}ms...`);
        
        setTimeout(() => {
          this.queue.push(job);
          if (!this.processing) this.processNext();
        }, backoff);
      } else {
        console.error(`[Queue] Job ${job.id} permanently failed after ${job.retries} retries.`);
      }
    }

    // Process next item immediately
    setTimeout(() => this.processNext(), 0);
  }
}

const queue = new JobQueue();
module.exports = queue;
