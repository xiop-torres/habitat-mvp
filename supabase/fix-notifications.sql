-- =============================================================================
-- fix-notifications.sql
-- Tarea 9B — Seguridad + correcciones de notificaciones
-- EJECUTAR MANUALMENTE en Supabase SQL Editor.
-- Idempotente: puede ejecutarse varias veces sin efectos secundarios.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. ELIMINAR la política INSERT para usuarios autenticados.
--    Las notificaciones solo deben crearse mediante triggers SECURITY DEFINER.
--    Ningún cliente debe poder insertar directamente.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert notifications for themselves" ON public.notifications;


-- -----------------------------------------------------------------------------
-- 2. TRIGGER DE INMUTABILIDAD para notificaciones.
--    Solo permite cambiar read_at.
--    Bloquea cualquier intento de modificar id, user_id, type, title,
--    body, href o created_at después de la inserción.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_notification_immutable_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id         IS DISTINCT FROM OLD.id         OR
     NEW.user_id    IS DISTINCT FROM OLD.user_id    OR
     NEW.type       IS DISTINCT FROM OLD.type       OR
     NEW.title      IS DISTINCT FROM OLD.title      OR
     NEW.body       IS DISTINCT FROM OLD.body       OR
     NEW.href       IS DISTINCT FROM OLD.href       OR
     NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION
      'Cannot modify id, user_id, type, title, body, href or created_at of a notification';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_notification_immutable ON public.notifications;
CREATE TRIGGER tr_notification_immutable
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.check_notification_immutable_fields();

-- La política UPDATE existente ya restringe por user_id = auth.uid().
-- El trigger refuerza que SOLO read_at puede cambiar.
-- No hay que modificar la política UPDATE.


-- -----------------------------------------------------------------------------
-- 3. CORREGIR href en notificaciones de mensaje.
--    La función anterior usaba '/mensajes' (genérico).
--    Ahora incluye el UUID real: /mensajes?conversation=<id>
--    Solo afecta nuevas notificaciones; las existentes no se migran.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id uuid;
  conv         record;
BEGIN
  SELECT student_id, owner_id
    INTO conv
    FROM public.conversations
   WHERE id = NEW.conversation_id;

  IF FOUND THEN
    -- Determinar destinatario: quien NO envió el mensaje
    IF NEW.sender_id = conv.student_id THEN
      recipient_id := conv.owner_id;
    ELSE
      recipient_id := conv.student_id;
    END IF;

    INSERT INTO public.notifications (user_id, type, title, body, href)
    VALUES (
      recipient_id,
      'message',
      'Nuevo mensaje recibido',
      substring(NEW.body FROM 1 FOR 80),
      '/mensajes?conversation=' || NEW.conversation_id::text
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- El trigger tr_notify_new_message ya apunta a esta función; al usar
-- CREATE OR REPLACE se actualiza sin necesidad de recrear el trigger.


-- -----------------------------------------------------------------------------
-- 4. VERIFICAR que los demás triggers de visitas siguen intactos.
--    No se modifican; solo los redeclaramos como NOOP para confirmar
--    que el script no los toca.
--    (tr_notify_new_visit_request y tr_notify_visit_request_status
--     permanecen sin cambios desde schema.sql)
-- -----------------------------------------------------------------------------

COMMIT;
