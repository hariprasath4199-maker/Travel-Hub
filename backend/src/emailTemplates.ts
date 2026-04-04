import { VisaRequest } from './types.js';

const APP_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

function layout(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#2a3439;">
    <div style="background:#255dad;color:white;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="margin:0;font-size:20px;">Zalaris Travel</h1>
      <p style="margin:4px 0 0;font-size:12px;opacity:0.8;">Visa Appointment Workflow</p>
    </div>
    <div style="background:#f7f9fb;padding:24px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px;">
      <h2 style="color:#255dad;margin-top:0;">${title}</h2>
      ${body}
      <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0;">
      <p style="font-size:11px;color:#999;">This is an automated notification from Zalaris Travel Portal.</p>
    </div>
  </body></html>`;
}

function btn(url: string, label: string, color = '#255dad'): string {
  return `<a href="${url}" style="display:inline-block;background:${color};color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;margin:4px;">${label}</a>`;
}

function costTable(r: VisaRequest): string {
  const cp = r.costProposal!;
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px;border-bottom:1px solid #eee;">Visa Fees</td><td style="text-align:right;padding:8px;border-bottom:1px solid #eee;">€${cp.visaFees.toFixed(2)}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;">Service Fees</td><td style="text-align:right;padding:8px;border-bottom:1px solid #eee;">€${cp.serviceFees.toFixed(2)}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;">Travel Cost</td><td style="text-align:right;padding:8px;border-bottom:1px solid #eee;">€${cp.travelCost.toFixed(2)}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;">Accommodation</td><td style="text-align:right;padding:8px;border-bottom:1px solid #eee;">€${cp.accommodationCost.toFixed(2)}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;">Other Costs</td><td style="text-align:right;padding:8px;border-bottom:1px solid #eee;">€${cp.otherCosts.toFixed(2)}</td></tr>
    <tr style="font-weight:bold;background:#f0f4f8;"><td style="padding:8px;">Total</td><td style="text-align:right;padding:8px;">€${cp.totalCost.toFixed(2)}</td></tr>
  </table>`;
}

// Step 1: Notify HR Admin
export function visaSubmittedHR(r: VisaRequest): { subject: string; html: string } {
  return {
    subject: `[${r.id}] New Visa Request - ${r.employeeName} → ${r.destination}`,
    html: layout('New Visa Appointment Request', `
      <p>A new visa appointment request has been submitted and requires your review.</p>
      <p><strong>Employee:</strong> ${r.employeeName} (${r.employeeRole})</p>
      <p><strong>Destination:</strong> ${r.destination}</p>
      <p><strong>Travel Days:</strong> ${r.numberOfDays}</p>
      <p><strong>Cost Centre:</strong> ${r.costCentre}</p>
      <p><strong>Comments:</strong> ${r.managerComments || 'None'}</p>
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'Review in Portal')}</p>
    `),
  };
}

// Step 1: Acknowledge Manager
export function visaSubmittedAck(r: VisaRequest): { subject: string; html: string } {
  return {
    subject: `[${r.id}] Visa Request Submitted - ${r.employeeName}`,
    html: layout('Request Submitted Successfully', `
      <p>Your visa appointment request for <strong>${r.employeeName}</strong> has been submitted to HR Admin.</p>
      <p><strong>Request ID:</strong> ${r.id}</p>
      <p><strong>Destination:</strong> ${r.destination}</p>
      <p>You will be notified when the cost proposal is ready.</p>
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'Track Request')}</p>
    `),
  };
}

// Step 2: Cost proposal to Manager
export function costProposalToManager(r: VisaRequest): { subject: string; html: string } {
  return {
    subject: `[${r.id}] Cost Proposal Ready - ${r.employeeName} Visa`,
    html: layout('Cost Proposal for Review', `
      <p>The cost proposal for ${r.employeeName}'s visa appointment is ready for your review.</p>
      ${costTable(r)}
      ${r.costProposal?.notes ? `<p><strong>Notes:</strong> ${r.costProposal.notes}</p>` : ''}
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'Review & Forward for Approval')}</p>
    `),
  };
}

// Step 3: Cost centre approval request
export function costCentreApprovalRequest(r: VisaRequest): { subject: string; html: string } {
  return {
    subject: `[${r.id}] Budget Approval Required - €${r.costProposal?.totalCost.toFixed(2)}`,
    html: layout('Cost Centre Approval Required', `
      <p>A visa appointment cost requires your budget approval.</p>
      <p><strong>Employee:</strong> ${r.employeeName}</p>
      <p><strong>Destination:</strong> ${r.destination}</p>
      <p><strong>Cost Centre:</strong> ${r.costCentre}</p>
      ${costTable(r)}
      <div style="margin:20px 0;">
        ${btn(`${APP_URL}/action/${r.costCentreApprovalToken}?decision=approve`, 'Approve', '#006d4a')}
        ${btn(`${APP_URL}/action/${r.costCentreApprovalToken}?decision=reject`, 'Reject', '#9f403d')}
      </div>
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'View Full Details')}</p>
    `),
  };
}

// Step 3: Approved notification
export function costCentreApprovedNotif(r: VisaRequest): { subject: string; html: string } {
  return {
    subject: `[${r.id}] Cost Centre Approved - ${r.employeeName} Visa`,
    html: layout('Budget Approved', `
      <p>The cost centre owner has <strong style="color:#006d4a;">approved</strong> the budget for ${r.employeeName}'s visa appointment.</p>
      <p><strong>Total:</strong> €${r.costProposal?.totalCost.toFixed(2)}</p>
      <p>HR Admin can now proceed to request vendor availability.</p>
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'Continue Workflow')}</p>
    `),
  };
}

// Step 3: Rejected notification
export function costCentreRejectedNotif(r: VisaRequest): { subject: string; html: string } {
  return {
    subject: `[${r.id}] Cost Centre Rejected - ${r.employeeName} Visa`,
    html: layout('Budget Rejected', `
      <p>The cost centre owner has <strong style="color:#9f403d;">rejected</strong> the budget for ${r.employeeName}'s visa appointment.</p>
      <p><strong>Reason:</strong> ${r.costCentreRejectionReason || 'No reason provided'}</p>
      <p>HR Admin should revise the cost proposal.</p>
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'Revise Proposal')}</p>
    `),
  };
}

// Step 4: Vendor request
export function vendorAvailabilityRequest(r: VisaRequest): { subject: string; html: string } {
  return {
    subject: `[${r.id}] Visa Appointment Availability Request - ${r.employeeName}`,
    html: layout('Appointment Availability Request', `
      <p>Please provide available appointment dates for the following visa applicant.</p>
      <p><strong>Applicant:</strong> ${r.employeeName}</p>
      <p><strong>Destination:</strong> ${r.destination}</p>
      <p><strong>Travel Days:</strong> ${r.numberOfDays}</p>
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'Submit Available Dates')}</p>
    `),
  };
}

// Step 5: Vendor dates received confirmation
export function vendorDatesReceived(r: VisaRequest): { subject: string; html: string } {
  const dateList = (r.vendorAvailableDates || []).map(d => `<li>${d.date} at ${d.time} - ${d.location}</li>`).join('');
  return {
    subject: `[${r.id}] Vendor Dates Received - ${r.employeeName} Visa`,
    html: layout('Appointment Dates Available', `
      <p>The vendor has submitted available appointment dates.</p>
      <ul>${dateList}</ul>
      <p>Please share these dates with the applicant.</p>
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'Share with Applicant')}</p>
    `),
  };
}

// Step 6: Dates to applicant
export function datesToApplicant(r: VisaRequest): { subject: string; html: string } {
  const dateList = (r.vendorAvailableDates || []).map(d => `<li><strong>${d.date}</strong> at ${d.time} — ${d.location}</li>`).join('');
  return {
    subject: `[${r.id}] Select Your Visa Appointment Date`,
    html: layout('Choose Your Appointment Date', `
      <p>Available appointment dates for your visa to <strong>${r.destination}</strong>:</p>
      <ul>${dateList}</ul>
      <p>Please select your preferred date(s) and submit your response.</p>
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'Select Dates')}</p>
    `),
  };
}

// Step 7: Applicant dates submitted
export function applicantDatesSubmitted(r: VisaRequest): { subject: string; html: string } {
  const selected = (r.applicantSelectedDates || []).map(d => `<li>${d.date} at ${d.time} - ${d.location}</li>`).join('');
  return {
    subject: `[${r.id}] Applicant Date Selection Received - ${r.employeeName}`,
    html: layout('Applicant Dates Selected', `
      <p>${r.employeeName} has selected the following preferred dates:</p>
      <ul>${selected}</ul>
      ${r.applicantRemarks ? `<p><strong>Remarks:</strong> ${r.applicantRemarks}</p>` : ''}
      <p>Please proceed to request EVP approval.</p>
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'Request EVP Approval')}</p>
    `),
  };
}

// Step 8: EVP approval request
export function evpApprovalRequest(r: VisaRequest): { subject: string; html: string } {
  const selected = (r.applicantSelectedDates || []).map(d => `<li>${d.date} at ${d.time} - ${d.location}</li>`).join('');
  return {
    subject: `[${r.id}] EVP Approval Required - €${r.costProposal?.totalCost.toFixed(2)}`,
    html: layout('Executive Approval Required', `
      <p>A visa appointment requires your executive approval.</p>
      <p><strong>Employee:</strong> ${r.employeeName} (${r.employeeRole})</p>
      <p><strong>Destination:</strong> ${r.destination}</p>
      <p><strong>Cost Centre:</strong> ${r.costCentre}</p>
      ${costTable(r)}
      <p><strong>Selected Dates:</strong></p><ul>${selected}</ul>
      <div style="margin:20px 0;">
        ${btn(`${APP_URL}/action/${r.evpApprovalToken}?decision=approve`, 'Approve', '#006d4a')}
        ${btn(`${APP_URL}/action/${r.evpApprovalToken}?decision=reject`, 'Reject', '#9f403d')}
      </div>
    `),
  };
}

// Step 8: EVP approved
export function evpApprovedNotif(r: VisaRequest): { subject: string; html: string } {
  return {
    subject: `[${r.id}] EVP Approved - ${r.employeeName} Visa`,
    html: layout('Executive Approval Granted', `
      <p>The EVP has <strong style="color:#006d4a;">approved</strong> the visa appointment for ${r.employeeName}.</p>
      <p>HR Admin can now confirm the booking with the vendor.</p>
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'Confirm Booking')}</p>
    `),
  };
}

// Step 8: EVP rejected
export function evpRejectedNotif(r: VisaRequest): { subject: string; html: string } {
  return {
    subject: `[${r.id}] EVP Rejected - ${r.employeeName} Visa`,
    html: layout('Executive Approval Denied', `
      <p>The EVP has <strong style="color:#9f403d;">rejected</strong> the visa appointment for ${r.employeeName}.</p>
      <p><strong>Reason:</strong> ${r.evpRejectionReason || 'No reason provided'}</p>
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'Review Request')}</p>
    `),
  };
}

// Step 9: Final confirmation to all
export function bookingConfirmedAll(r: VisaRequest): { subject: string; html: string } {
  return {
    subject: `[${r.id}] Appointment Confirmed - ${r.employeeName} Visa`,
    html: layout('Visa Appointment Confirmed!', `
      <p>The visa appointment for <strong>${r.employeeName}</strong> has been confirmed.</p>
      <p><strong>Date:</strong> ${r.confirmedDate?.date} at ${r.confirmedDate?.time}</p>
      <p><strong>Location:</strong> ${r.confirmedDate?.location}</p>
      <p><strong>Vendor Reference:</strong> ${r.vendorConfirmationReference}</p>
      <p><strong>Total Cost:</strong> €${r.costProposal?.totalCost.toFixed(2)}</p>
      <p>${btn(`${APP_URL}/visa-requests/${r.id}`, 'View Full Details')}</p>
    `),
  };
}
