-- ==============================================================================
-- FIX: MÁQUINA DE ESTADOS ESTRICTA Y PROTECCIÓN DE SOLICITUDES DE VISITA
-- ==============================================================================

-- 1. BLOQUEAR DUPLICADOS IDÉNTICOS
-- Previene solicitudes de la misma persona para el mismo lugar en la misma fecha y hora.
ALTER TABLE public.visit_requests 
ADD CONSTRAINT visit_requests_unique_visit 
UNIQUE (student_id, listing_id, requested_date, requested_time);

-- 2. LIMPIEZA DE TRIGGERS ANTERIORES
-- Eliminamos el trigger anterior inmutable simple para centralizar toda la lógica
-- transaccional y de inmutabilidad en una sola máquina de estados sólida.
DROP TRIGGER IF EXISTS visit_requests_prevent_immutable_mutation ON public.visit_requests;
DROP FUNCTION IF EXISTS public.prevent_visit_requests_immutable_fields();
DROP TRIGGER IF EXISTS visit_requests_enforce_transitions ON public.visit_requests;

-- 3. MÁQUINA DE ESTADOS Y CAMPOS INMUTABLES MEDIANTE TRIGGER (WHITELIST)
CREATE OR REPLACE FUNCTION public.enforce_visit_request_transitions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_role text;
BEGIN
  v_user_id := auth.uid();
  
  -- Si es el sistema (ej. service_role), permitimos la mutación libre
  IF v_user_id IS NULL THEN 
    RETURN NEW; 
  END IF;

  -- Extraer el rol del usuario autenticado
  SELECT role INTO v_role FROM public.profiles WHERE id = v_user_id;
  
  -- Si es admin, permitimos bypass de la máquina de estados
  IF v_role = 'admin' THEN 
    RETURN NEW; 
  END IF;

  -- ----------------------------------------------------------------------
  -- REGLA A: CAMPOS ABSOLUTAMENTE INMUTABLES PARA TODOS
  -- Ningún usuario regular (ni student ni owner) puede transferir 
  -- identidades o alterar la creación de la solicitud.
  -- ----------------------------------------------------------------------
  IF NEW.id IS DISTINCT FROM OLD.id OR
     NEW.created_at IS DISTINCT FROM OLD.created_at OR
     NEW.student_id IS DISTINCT FROM OLD.student_id OR
     NEW.owner_id IS DISTINCT FROM OLD.owner_id OR
     NEW.listing_id IS DISTINCT FROM OLD.listing_id THEN
    RAISE EXCEPTION 'Mutación de campos inmutables (id, created_at, identificadores) totalmente prohibida.';
  END IF;

  -- ----------------------------------------------------------------------
  -- REGLA B: ESTUDIANTE (STUDENT)
  -- ----------------------------------------------------------------------
  IF v_user_id = OLD.student_id THEN
    
    -- B.1) Mutación de Datos (Whitelist)
    -- El estudiante no puede modificar nunca detalles una vez creada la solicitud.
    IF NEW.requested_date IS DISTINCT FROM OLD.requested_date OR
       NEW.requested_time IS DISTINCT FROM OLD.requested_time OR
       NEW.mode IS DISTINCT FROM OLD.mode OR
       NEW.message IS DISTINCT FROM OLD.message THEN
      RAISE EXCEPTION 'El estudiante no puede modificar detalles (fecha, hora, modo, mensaje) de la solicitud.';
    END IF;

    -- B.2) Transiciones de Estado (Whitelist)
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF (OLD.status = 'pending' AND NEW.status = 'cancelled') OR
         (OLD.status = 'accepted' AND NEW.status = 'cancelled') THEN
         -- Transición válida
         NULL;
      ELSE
         RAISE EXCEPTION 'Transición no permitida para estudiante: % -> %', OLD.status, NEW.status;
      END IF;
    END IF;

  -- ----------------------------------------------------------------------
  -- REGLA C: PROPIETARIO (OWNER)
  -- ----------------------------------------------------------------------
  ELSIF v_user_id = OLD.owner_id THEN
    
    -- C.1) Mutación de Datos (Whitelist)
    -- El propietario NUNCA modifica la modalidad ni el mensaje.
    IF NEW.mode IS DISTINCT FROM OLD.mode OR
       NEW.message IS DISTINCT FROM OLD.message THEN
      RAISE EXCEPTION 'El propietario no puede modificar modalidad ni mensaje original de la solicitud.';
    END IF;

    -- C.2) Transiciones de Estado (Whitelist)
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF (OLD.status = 'pending' AND NEW.status = 'accepted') OR
         (OLD.status = 'pending' AND NEW.status = 'rejected') OR
         (OLD.status = 'pending' AND NEW.status = 'rescheduled') OR
         (OLD.status = 'rescheduled' AND NEW.status = 'accepted') OR
         (OLD.status = 'rescheduled' AND NEW.status = 'rejected') OR
         (OLD.status = 'accepted' AND NEW.status = 'completed') OR
         (OLD.status = 'accepted' AND NEW.status = 'cancelled') THEN
         
         -- Transición válida
         
         -- C.3) Regla especial de fecha/hora para la reprogramación
         -- Solo durante pending -> rescheduled el propietario puede cambiar la fecha/hora.
         IF (OLD.status = 'pending' AND NEW.status = 'rescheduled') THEN
           -- OK: Se permite la alteración de requested_date y requested_time
           NULL;
         ELSE
           -- Cualquier otra transición, no puede modificar la fecha/hora actual
           IF NEW.requested_date IS DISTINCT FROM OLD.requested_date OR
              NEW.requested_time IS DISTINCT FROM OLD.requested_time THEN
             RAISE EXCEPTION 'El propietario solo puede modificar fecha/hora al pasar de pending a rescheduled.';
           END IF;
         END IF;

      ELSE
         RAISE EXCEPTION 'Transición no permitida para propietario: % -> %', OLD.status, NEW.status;
      END IF;
      
    ELSE
      -- Si el propietario guarda cambios pero sin cambiar el estado, NO puede tocar fecha/hora.
      IF NEW.requested_date IS DISTINCT FROM OLD.requested_date OR
         NEW.requested_time IS DISTINCT FROM OLD.requested_time THEN
        RAISE EXCEPTION 'El propietario solo puede modificar fecha/hora explícitamente durante una reprogramación.';
      END IF;
    END IF;

  -- ----------------------------------------------------------------------
  -- REGLA D: CUALQUIER OTRO (DENEGADO)
  -- ----------------------------------------------------------------------
  ELSE
    RAISE EXCEPTION 'Usuario no autorizado para modificar esta solicitud de visita.';
  END IF;

  RETURN NEW;
END;
$$;

-- Vincular la nueva máquina de estados
CREATE TRIGGER visit_requests_enforce_transitions
BEFORE UPDATE ON public.visit_requests
FOR EACH ROW EXECUTE FUNCTION public.enforce_visit_request_transitions();

-- FIN DEL SCRIPT
