-- Backfill status from isApproved for existing testimonials
UPDATE "Testimonial" SET "status" = 'APPROVED' WHERE "isApproved" = true;
