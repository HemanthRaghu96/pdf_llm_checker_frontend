export interface RuleCheckResponse {
  rule: string;
  status: 'pass' | 'fail';
  evidence: string;
  reasoning: string;
  confidence: number;
}

export interface CheckResultsResponse {
  results: RuleCheckResponse[];
}