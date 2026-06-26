// Shared helpers for the intake API and admin page.

// Human-readable labels for every field, in display order.
export const LABELS = {
  business_name: 'Business name', contact_name: 'Contact name', phone: 'Phone', email: 'Email',
  website: 'Website', gbp_link: 'Google Business Profile', main_trade: 'Main trade',
  business_description: 'Description', services_offered: 'Services offered',
  services_other: 'Other services (custom)',
  services_want_more: 'Wants more of / steer away from',
  ideal_job: 'Ideal job', min_job_size: 'Minimum job size', area_current: 'Areas currently served',
  area_target: 'Target areas', travel_distance: 'Travel distance', business_stage: 'Business stage',
  licensed: 'Licensed', insured: 'Insured', crew_size: 'Crew size', capacity_per_month: 'Monthly capacity',
  lead_response_time: 'Lead response time', lead_sources: 'Lead sources', leads_per_month: 'Leads / month',
  close_rate: 'Close rate', lead_issues: 'Lead issues', has_website: 'Has website', has_gbp: 'Has GBP',
  review_count: 'Review count', has_photos: 'Has work photos', has_before_after: 'Before/after photos',
  proof: 'Trust proof', design_north_star: 'Look / sites admired',
  lead_tracking: 'Lead tracking', estimate_method: 'Estimate method',
  estimate_followup: 'Estimate follow-up', slowdowns: 'Operational slowdowns', main_goal: 'Main goal',
  target_revenue: 'Target revenue', success_definition: 'Success looks like', worries: 'Worries',
  help_interest: 'Help interested in', involvement_level: 'Involvement level',
  contact_pref: 'Preferred contact', share_pref: 'File sharing', anything_else: 'Anything else'
};

export const REQUIRED = ['contact_name', 'phone', 'email', 'main_trade', 'business_stage', 'area_current', 'main_goal'];

export const norm = (v) => (Array.isArray(v) ? v.join(', ') : (v == null ? '' : String(v)));

// Plain-text summary of a submission (used for the email alert).
export function summarize(data) {
  const lines = [];
  lines.push('CONTRACTOR GROWTH INTAKE — arabuilds');
  if (data.classification) lines.push('Internal classification: ' + data.classification);
  if (data.classification_reasons) lines.push('Signals: ' + data.classification_reasons);
  lines.push('');
  for (const key in LABELS) {
    if (data[key] == null || data[key] === '') continue;
    lines.push(LABELS[key] + ': ' + norm(data[key]));
  }
  return lines.join('\n');
}

export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
