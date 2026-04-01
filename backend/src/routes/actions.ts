import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { VisaRequest } from '../types.js';
import { validateTransition } from '../workflowEngine.js';
import { sendEmail } from '../emailService.js';
import * as tpl from '../emailTemplates.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..', '..');
const INPUT_DIR = path.join(ROOT_DIR, 'input');

function readJsonFile<T>(filePath: string): T {
  try { const c = fs.readFileSync(filePath, 'utf-8').trim(); return c ? JSON.parse(c) : []; }
  catch { return [] as unknown as T; }
}
function writeJsonFile(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/action/:token — Handle approve/reject from email links
router.get('/:token', async (req, res) => {
  const token = req.params.token;
  const decision = req.query.decision as string;

  if (!decision || !['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision. Must be "approve" or "reject".' });
  }

  const reqs = readJsonFile<VisaRequest[]>(path.join(INPUT_DIR, 'visa_requests.txt'));

  // Find request by token (cost centre or EVP)
  let reqIdx = reqs.findIndex(r => r.costCentreApprovalToken === token);
  let tokenType: 'cost_centre' | 'evp' = 'cost_centre';

  if (reqIdx === -1) {
    reqIdx = reqs.findIndex(r => r.evpApprovalToken === token);
    tokenType = 'evp';
  }

  if (reqIdx === -1) {
    return res.status(404).json({ error: 'Invalid or expired token.' });
  }

  const r = reqs[reqIdx];

  if (tokenType === 'cost_centre') {
    if (r.status !== 'PENDING_COST_CENTRE_APPROVAL') {
      return res.json({ message: 'This request has already been processed.', status: r.status, requestId: r.id });
    }

    if (decision === 'approve') {
      r.costCentreApprovedAt = new Date().toISOString();
      r.status = 'COST_CENTRE_APPROVED';
      r.workflowHistory.push({ id: uuidv4(), step: 3, action: 'Cost centre approved via email', fromStatus: 'PENDING_COST_CENTRE_APPROVAL', toStatus: 'COST_CENTRE_APPROVED', performedBy: r.costCentreOwnerName || 'Cost Centre Owner', performedByRole: 'COST_CENTRE_OWNER', timestamp: new Date().toISOString() });
      const email = tpl.costCentreApprovedNotif(r);
      if (r.managerEmail) await sendEmail({ to: r.managerEmail, ...email, requestId: r.id, templateName: 'cost-centre-approved' });
    } else {
      r.costCentreRejectedAt = new Date().toISOString();
      r.costCentreRejectionReason = 'Rejected via email link';
      r.status = 'COST_CENTRE_REJECTED';
      r.workflowHistory.push({ id: uuidv4(), step: 3, action: 'Cost centre rejected via email', fromStatus: 'PENDING_COST_CENTRE_APPROVAL', toStatus: 'COST_CENTRE_REJECTED', performedBy: r.costCentreOwnerName || 'Cost Centre Owner', performedByRole: 'COST_CENTRE_OWNER', timestamp: new Date().toISOString() });
      const email = tpl.costCentreRejectedNotif(r);
      if (r.managerEmail) await sendEmail({ to: r.managerEmail, ...email, requestId: r.id, templateName: 'cost-centre-rejected' });
    }
  } else {
    if (r.status !== 'PENDING_EVP_APPROVAL') {
      return res.json({ message: 'This request has already been processed.', status: r.status, requestId: r.id });
    }

    if (decision === 'approve') {
      r.evpApprovedAt = new Date().toISOString();
      r.status = 'EVP_APPROVED';
      r.workflowHistory.push({ id: uuidv4(), step: 8, action: 'EVP approved via email', fromStatus: 'PENDING_EVP_APPROVAL', toStatus: 'EVP_APPROVED', performedBy: r.evpName || 'EVP', performedByRole: 'EVP', timestamp: new Date().toISOString() });
      const email = tpl.evpApprovedNotif(r);
      if (r.managerEmail) await sendEmail({ to: r.managerEmail, ...email, requestId: r.id, templateName: 'evp-approved' });
    } else {
      r.evpRejectedAt = new Date().toISOString();
      r.evpRejectionReason = 'Rejected via email link';
      r.status = 'EVP_REJECTED';
      r.workflowHistory.push({ id: uuidv4(), step: 8, action: 'EVP rejected via email', fromStatus: 'PENDING_EVP_APPROVAL', toStatus: 'EVP_REJECTED', performedBy: r.evpName || 'EVP', performedByRole: 'EVP', timestamp: new Date().toISOString() });
      const email = tpl.evpRejectedNotif(r);
      if (r.managerEmail) await sendEmail({ to: r.managerEmail, ...email, requestId: r.id, templateName: 'evp-rejected' });
    }
  }

  r.updatedAt = new Date().toISOString();
  writeJsonFile(path.join(INPUT_DIR, 'visa_requests.txt'), reqs);

  res.json({ message: `Request ${r.id} has been ${decision}d.`, status: r.status, requestId: r.id });
});

export default router;
