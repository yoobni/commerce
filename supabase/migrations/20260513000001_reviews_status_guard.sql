-- Prevent users from changing the moderation status of their own reviews via
-- RLS. RLS cannot reference OLD, so enforce with a BEFORE UPDATE trigger that
-- only allows status changes when the current role is the service role
-- (admin/moderator).

create or replace function reviews_block_status_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.status is distinct from old.status then
    -- service_role bypasses; only admin/back-office may change status
    if current_setting('request.jwt.claim.role', true) <> 'service_role' then
      raise exception 'review status is not user-editable' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_block_status_change on reviews;
create trigger reviews_block_status_change
  before update on reviews
  for each row
  execute function reviews_block_status_change();
