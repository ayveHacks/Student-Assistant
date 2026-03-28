/**
 * Simple NLP mock to extract intent and entities.
 * In a real application, you would pass the query to an LLM here.
 */

function detectIntent(query) {
  const lowerQuery = query.toLowerCase();

  // 1. Timetable Clash Resolution
  if (lowerQuery.includes('clash') || lowerQuery.includes('overlap')) {
    let course = "";
    if (lowerQuery.includes('daa')) course = 'DAA';
    else if (lowerQuery.includes('physics')) course = 'Physics';
    else if (lowerQuery.includes('chemistry')) course = 'Chemistry';

    return {
      intent: 'timetable_clash',
      entities: {
        course: course,
      }
    };
  }

  // 2. Event -> Calendar Sync
  if (lowerQuery.includes('event') || lowerQuery.includes('where is')) {
    let event = "";
    if (lowerQuery.includes('tech') || lowerQuery.includes('techfest')) event = 'TechFest 2026';
    else if (lowerQuery.includes('job') || lowerQuery.includes('fair')) event = 'Job Fair';
    
    return {
      intent: 'event_query',
      entities: {
        event: event,
      }
    };
  }

  // 3. Approval Request
  if (lowerQuery.includes('extension') || lowerQuery.includes('deadline')) {
    let course = "";
    if (lowerQuery.includes('daa')) course = 'DAA';
    else if (lowerQuery.includes('physics')) course = 'Physics';
    else if (lowerQuery.includes('chemistry')) course = 'Chemistry';

    return {
      intent: 'approval_request',
      entities: {
        course: course,
        reason: query
      }
    };
  }

  return {
    intent: 'unknown',
    entities: {}
  };
}

module.exports = { detectIntent };
