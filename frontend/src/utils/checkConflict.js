export const checkConflict = (slot, schedule) => {
  const slotStart = new Date(slot.startTime);
  const slotEnd = new Date(slot.endTime);

  for (const event of schedule) {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);

    // This is the logic for a time range overlap
    // (A_start < B_end) && (A_end > B_start)
    if (slotStart < eventEnd && slotEnd > eventStart) {
      return true; // There is a conflict
    }
  }
  return false; // No conflicts
};