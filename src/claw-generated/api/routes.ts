import express from 'express';
import { GovernanceController } from './governance.controller';

const router = express.Router();
const governanceController = new GovernanceController();

router.post('/proposals', governanceController.submitProposal.bind(governanceController));
router.get('/proposals', governanceController.getProposals.bind(governanceController));
router.post('/proposals/:proposalId/vote', governanceController.vote.bind(governanceController));

export default router;