-- KPI: new contracts (this month vs last), pending legal review, approved, approval rate
create or replace view public.procurement_kpi as
with this_month as (
  select count(*) as new_this_month
  from public.contracts
  where created_at >= date_trunc('month', now())
),
last_month as (
  select count(*) as new_last_month
  from public.contracts
  where created_at >= date_trunc('month', now()) - interval '1 month'
    and created_at <  date_trunc('month', now())
),
pending_legal as (
  select count(*) as pending_legal_review
  from public.contracts
  where status = 'Pending Review'
),
approved as (
  select count(*) as approved_cnt
  from public.contracts
  where status = 'Approved'
),
reviewed as (
  select
    (select count(*) from public.contracts where status = 'Approved')
    +
    (select count(*) from public.contracts where status = 'Rejected')
    as reviewed_total
)
select
  this_month.new_this_month,
  last_month.new_last_month,
  pending_legal.pending_legal_review,
  approved.approved_cnt,
  case when reviewed.reviewed_total = 0 then 0
       else round((approved.approved_cnt::numeric / reviewed.reviewed_total::numeric)*100, 2)
  end as approval_rate_pct
from this_month, last_month, pending_legal, approved, reviewed;

-- Reload cache
NOTIFY pgrst, 'reload schema';
