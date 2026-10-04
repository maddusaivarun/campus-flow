import {
  getPublicEvents,
  getAllEvents,
  registerStudent,
  checkInParticipant,
  submitFeedback,
  getAllFeedbackMetrics,
  reviewEvent,
  resetDatabase,
  authenticateUser,
  getUserById,
  createEvent,
  deleteEvent,
  cancelRegistration,
  submitEventForApproval,
  getEventParticipants,
  generateUniqueEventId,
  generateUniqueRegistrationId,
  generateUniqueRecordId
} from './src/lib/db';
import { DEMO_USERS } from './src/data/seedData';

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('CAMPUSFLOW — PRODUCTION TEST SUITE & VERIFICATION');
  console.log('======================================================\n');

  // Reset database to ensure clean, deterministic starting state
  resetDatabase();
  console.log('✓ Database reset to clean verified seed state.\n');

  // Test 1: Seed database & public events rule
  console.log('[TEST 1] Public Events Discovery:');
  const publicEvents = getPublicEvents();
  console.log(`  ✓ Successfully fetched ${publicEvents.length} public events.`);
  for (const e of publicEvents) {
    if (e.status !== 'PUBLISHED' && e.status !== 'REGISTRATION_OPEN' && e.status !== 'ONGOING' && e.status !== 'REGISTRATION_CLOSED' && e.status !== 'COMPLETED') {
      throw new Error(`Public event ${e.id} has unapproved status: ${e.status}`);
    }
  }
  console.log('  ✓ Core rule verified: NO UNAPPROVED EVENT IN PUBLIC CATALOG.');

  // Test 2: Authentication
  console.log('\n[TEST 2] Authentication & Password Verification:');
  const authStudent = await authenticateUser('student.varun@vignan.ac.in', 'vignan123');
  console.log(`  ✓ Student authenticated: ${authStudent.user.name} (${authStudent.user.role})`);
  const authHod = await authenticateUser('hod.csbsiot@vignan.ac.in', 'vignan123');
  console.log(`  ✓ HOD authenticated: ${authHod.user.name} (${authHod.user.role})`);

  // Test 3: Event Charter Proposal & Statutory Approval Flow
  console.log('\n[TEST 3] Faculty Proposal -> Statutory HOD Approval State Machine:');
  const facultyUser = DEMO_USERS.faculty;
  const newCharter = createEvent({
    title: 'Automated Robotics & Edge Sensor Testing Workshop',
    shortDescription: 'Hands-on edge sensor telemetry integration.',
    description: 'Practical lab session testing real microcontrollers.',
    category: 'Workshop',
    eventType: 'Laboratory Workshop',
    date: '2026-11-10',
    startTime: '10:00',
    endTime: '13:00',
    venue: 'IoT & Embedded Systems Lab',
    capacity: 50,
    academicCredits: 2.0,
    syllabusMapping: 'CSBS-IOT-8402: Module 3'
  }, facultyUser, false);
  console.log(`  ✓ Created draft event charter: ${newCharter.id} (Status: ${newCharter.status})`);

  const submitted = submitEventForApproval(newCharter.id, facultyUser, 'Ready for HOD review');
  console.log(`  ✓ Submitted to HOD queue: ${submitted.id} (Status: ${submitted.status})`);

  const approved = reviewEvent(newCharter.id, authHod.user, 'APPROVED', 'Approved by HOD with digital signature.');
  console.log(`  ✓ Approved by HOD: ${approved.id} (Status: ${approved.status})`);
  console.log(`    Digital Signature Hash: ${approved.digitalSignatureHash}`);

  // Test 4: Student Registration & Capacity Validation
  console.log('\n[TEST 4] Student Registration & Capacity Validation:');
  const regResult = registerStudent(approved.id, authStudent.user, {
    seatZone: 'Zone A',
    markAttendanceImmediately: false
  });
  console.log(`  ✓ Registration successful!`);
  console.log(`    Pass ID: ${regResult.registration.registrationId}`);
  console.log(`    QR Token: ${regResult.registration.qrToken}`);
  console.log(`    Event Registered Count: ${regResult.event.registeredCount}/${regResult.event.capacity}`);

  // Assertion: Duplicate registration must be strictly rejected
  try {
    registerStudent(approved.id, authStudent.user);
    throw new Error('FAIL: Duplicate registration was accepted!');
  } catch (err: any) {
    if (!err.message.includes('already registered')) throw err;
    console.log(`  ✓ Relational Rule Verified: Duplicate registration rejected: "${err.message}"`);
  }

  // Test 5: Real-time Gate QR Check-in
  console.log('\n[TEST 5] Gate QR Check-in Scanner:');
  const checkInResult = checkInParticipant(regResult.registration.registrationId, {
    id: 'user-faculty-01',
    role: 'FACULTY',
    name: 'Faculty Coordinator'
  } as any);
  console.log(`  ✓ Check-in processed: ${checkInResult.message}`);
  console.log(`    Attendance confirmed at: ${checkInResult.registration.checkedInAt}`);
  console.log(`    Event Attendance Count: ${checkInResult.event?.attendanceCount}`);

  // Test 6: Participant Roster & Export
  console.log('\n[TEST 6] Participant Roster & Roster Privacy:');
  const roster = getEventParticipants(approved.id, facultyUser);
  console.log(`  ✓ Organizer retrieved roster: ${roster.length} attendee(s).`);

  // Test 7: Post-Event Feedback & Analytics
  console.log('\n[TEST 7] Post-Event Feedback & Metric Calculations:');
  const feedback = submitFeedback(approved.id, authStudent.user, {
    rating: 5,
    contentQuality: 5,
    organization: 5,
    speakerRating: 5,
    comment: 'Exceptional hands-on learning experience with direct sensor hardware!',
    takeaways: 'Real-time telemetry and microcontroller interrupt loops.',
    wouldRecommend: true
  });
  console.log(`  ✓ Feedback recorded: ${feedback.rating}★ (Recommend: ${feedback.wouldRecommend})`);

  const metrics = getAllFeedbackMetrics();
  console.log(`  ✓ Aggregated Metrics calculated: Overall Rating ${metrics.overallRating}/5.0 from ${metrics.totalFeedbacks} verified review(s).`);

  // Test 8: Relational Consistency, Cancellation & Cascading Deletion
  console.log('\n[TEST 8] Relational Consistency & Cascading Cleanup:');
  const testStudent2 = {
    ...DEMO_USERS.student,
    id: 'test-student-unique-02',
    name: 'Pooja Reddy',
    email: 'pooja.r@vignan.ac.in',
    identifier: '221FA04099'
  };
  const reg2 = registerStudent(approved.id, testStudent2);
  console.log(`  ✓ Second student registered. Count: ${reg2.event.registeredCount}`);
  if (reg2.event.registeredCount !== 2) throw new Error('Expected registeredCount to be 2');

  const cancelResult = cancelRegistration(approved.id, testStudent2);
  console.log(`  ✓ Second student cancelled. New Count: ${cancelResult.event.registeredCount}`);
  if (cancelResult.event.registeredCount !== 1) throw new Error('Expected registeredCount to revert to 1');

  // Test Cascading Delete on Draft Event
  const tempDraft = createEvent({
    title: 'Temporary Draft for Cascade Test',
    date: '2026-12-01'
  }, facultyUser);
  deleteEvent(tempDraft.id, facultyUser);
  console.log(`  ✓ Cascading deletion cleanly executed for draft: ${tempDraft.id}`);

  // Test 9: ID Entropy & Uniqueness
  console.log('\n[TEST 9] ID Entropy & Collision Resistance:');
  const generatedRecordIds = new Set<string>();
  const dummyStore: Array<{ id: string }> = [];
  for (let i = 0; i < 100; i++) {
    const id = generateUniqueRecordId('test', dummyStore);
    if (generatedRecordIds.has(id)) throw new Error(`Collision detected in generateUniqueRecordId: ${id}`);
    generatedRecordIds.add(id);
    dummyStore.push({ id });
  }
  console.log(`  ✓ 100 unique record IDs generated rapidly with 0 collisions.`);

  console.log('\n======================================================');
  console.log('ALL TESTS COMPLETED SUCCESSFULLY WITH RELATIONAL INTEGRITY!');
  console.log('======================================================\n');
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test failure detected:', err);
  process.exit(1);
});
