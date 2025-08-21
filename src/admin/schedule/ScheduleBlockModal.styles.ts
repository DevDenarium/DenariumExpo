import { StyleSheet } from 'react-native';

export const scheduleBlockModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1c1c1c',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '95%',
    minHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalFooter: {
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  
  // Type selection
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  typeButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: '#1c1c1c',
    fontWeight: 'bold',
  },

  // Date selection
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  dateRangeContainer: {
    gap: 12,
  },
  dateRangeItem: {
    gap: 8,
  },
  dateRangeLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },

  // Time slots
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  gap: 6,
  },
  timeSlot: {
  height: 48,
  width: '22%',
  minWidth: 72,
  marginBottom: 6,
  borderRadius: 8,
  backgroundColor: '#2a2a2a',
  borderWidth: 1,
  borderColor: '#333',
  alignItems: 'center',
  justifyContent: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  timeSlotOccupied: {
    backgroundColor: '#444',
    borderColor: '#666',
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#1c1c1c',
    fontWeight: 'bold',
  },
  timeSlotTextOccupied: {
    color: '#888',
  },

  // Days of week
  daysContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  dayButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: '#1c1c1c',
    fontWeight: 'bold',
  },

  // Time range
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInputContainer: {
    flex: 1,
    gap: 8,
  },
  timeInputLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  timeInput: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333',
  },

  // Reason input
  reasonInput: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 80,
  },

  // Save button
  saveButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1c1c',
  },

  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },

  // Error states
  inputError: {
    borderColor: '#f44336',
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
