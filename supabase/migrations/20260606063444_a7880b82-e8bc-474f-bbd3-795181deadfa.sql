ALTER TABLE public.payments
  ADD CONSTRAINT payments_doctor_id_fkey
  FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE SET NULL;