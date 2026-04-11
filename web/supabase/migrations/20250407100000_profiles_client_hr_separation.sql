-- Strict separation: a client profile cannot be linked as an internal employee.

CREATE OR REPLACE FUNCTION public.enforce_client_not_hr_employee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.app_role;
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT p.role INTO r FROM public.profiles p WHERE p.id = NEW.user_id;
  IF r = 'client' THEN
    RAISE EXCEPTION 'Un profil client ne peut pas être lié à une fiche employé (role=client)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hr_employees_enforce_not_client_profile ON public.hr_employees;
CREATE TRIGGER hr_employees_enforce_not_client_profile
  BEFORE INSERT OR UPDATE OF user_id ON public.hr_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_client_not_hr_employee();

CREATE OR REPLACE FUNCTION public.enforce_hr_employee_not_client_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'client' AND EXISTS (SELECT 1 FROM public.hr_employees e WHERE e.user_id = NEW.id) THEN
    RAISE EXCEPTION 'Retirer la fiche employé avant de passer le rôle en client';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_enforce_not_client_if_employee ON public.profiles;
CREATE TRIGGER profiles_enforce_not_client_if_employee
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role IS DISTINCT FROM OLD.role)
  EXECUTE FUNCTION public.enforce_hr_employee_not_client_role();
