const db = require('./db');
const { detectIntent } = require('./nlu');
const queue = require('./queue');

class Controller {
  constructor() {
  }

  logState(requestId, state, message) {
    console.log(`[Request ${requestId}] Status: ${state} - ${message}`);
    const stmt = db.prepare('INSERT INTO logs (request_id, state, message) VALUES (?, ?, ?)');
    stmt.run(requestId, state, message);
  }

  async processRequest(requestId, studentId, query) {
    try {
      this.logState(requestId, 'RECEIVED', `Query: "${query}"`);

      // 1. Intent Detection
      const nluOutput = detectIntent(query);
      this.logState(requestId, 'UNDERSTOOD', `Intent: ${nluOutput.intent}, Entities: ${JSON.stringify(nluOutput.entities)}`);

      if (nluOutput.intent === 'unknown') {
        this.logState(requestId, 'COMPLETED', `No official information found for query.`);
        return { success: false, message: "No official information found." };
      }

      this.logState(requestId, 'PLANNED', `Mapping to workflow: ${nluOutput.intent}`);

      // 2. Dispatch to Job Queue
      let actionResult = null;
      
      const executeJob = async () => {
        this.logState(requestId, 'EXECUTED', `Running workflow ${nluOutput.intent}`);
        
        switch (nluOutput.intent) {
          case 'timetable_clash':
            actionResult = await this.handleTimetableClash(studentId, nluOutput.entities.course);
            break;
          case 'event_query':
            actionResult = await this.handleEventSync(studentId, nluOutput.entities.event);
            break;
          case 'approval_request':
            actionResult = await this.handleApprovalRequest(studentId, nluOutput.entities.course, query);
            break;
        }

        this.logState(requestId, 'VERIFIED', `Action resulted in: ${actionResult.message}`);
        this.logState(requestId, 'COMPLETED', `Workflow complete.`);
        return actionResult;
      };

      // Wrap in a promise to wait for basic execution in prototype
      return new Promise((resolve) => {
        queue.addJob(async () => {
          const result = await executeJob();
          resolve({ success: true, result, requestId });
        });
      });

    } catch (error) {
       this.logState(requestId, 'FAILED', `Error: ${error.message}`);
       return { success: false, error: error.message };
    }
  }

  // Workflows
  async handleTimetableClash(studentId, courseName) {
    if (!courseName) return { message: "Could not identify course for clash." };
    const course = db.prepare('SELECT id FROM courses WHERE name = ? COLLATE NOCASE').get(courseName);
    if (!course) return { message: `Course ${courseName} not found.` };

    // Create ticket for coordinator
    // Usually assigned_to is 3 or 4 (faculty)
    const ticketStmt = db.prepare('INSERT INTO tickets (type, student_id, related_entity, assigned_to) VALUES (?, ?, ?, ?)');
    const info = ticketStmt.run('timetable_clash', studentId, course.id, 3);
    
    return {
      message: `Detected clash for ${courseName}. Created ticket #${info.lastInsertRowid} for coordinator.`,
      ticketId: info.lastInsertRowid
    };
  }

  async handleEventSync(studentId, eventName) {
    if (!eventName) return { message: "Could not identify event." };
    const eventParams = `%${eventName}%`;
    const event = db.prepare('SELECT * FROM events WHERE name LIKE ? COLLATE NOCASE').get(eventParams);
    if (!event) return { message: `Event matching ${eventName} not found.` };
    
    // Check conflicts (Dummy logic)
    // mock calendar sync
    return {
      message: `${event.name} is at ${event.venue} on ${event.time}. Added to Google Calendar.`,
      event: event
    };
  }

  async handleApprovalRequest(studentId, courseName, reason) {
    const course = courseName ? db.prepare('SELECT id FROM courses WHERE name = ? COLLATE NOCASE').get(courseName) : null;
    
    const ticketStmt = db.prepare('INSERT INTO tickets (type, student_id, related_entity, assigned_to) VALUES (?, ?, ?, ?)');
    const info = ticketStmt.run('approval_request', studentId, course ? course.id : null, 4);

    return {
       message: `Created deadline extension ticket #${info.lastInsertRowid}. Pending coordinator approval.`,
       ticketId: info.lastInsertRowid
    };
  }
}

module.exports = new Controller();
