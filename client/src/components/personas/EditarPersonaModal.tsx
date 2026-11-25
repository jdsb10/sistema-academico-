import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface ValoresPersona {
  nombres: string;
  apellidos: string;
  celular: string;
}

/**
 * Formulario de edicion compartido por los 4 roles de persona
 * (administrador, coordinador, docente, estudiante). Edita el subconjunto de
 * datos de contacto que realmente cambia con frecuencia; el documento de
 * identidad y la fecha de nacimiento se dejan fijos desde esta pantalla para
 * evitar ediciones accidentales (la API SI los admite via PUT si se
 * necesitan corregir).
 */
export function EditarPersonaModal({
  titulo, endpoint, valoresIniciales, onClose, onSuccess,
}: {
  titulo: string;
  endpoint: string;
  valoresIniciales: ValoresPersona;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<ValoresPersona>(valoresIniciales);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.put(endpoint, form),
    onSuccess,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'No se pudieron guardar los cambios'),
  });

  return (
    <Modal titulo={titulo} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombres" required value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
          <Input label="Apellidos" required value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
        </div>
        <Input label="Celular" value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} />

        {error && <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variante="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" cargando={mutation.isPending}>Guardar cambios</Button>
        </div>
      </form>
    </Modal>
  );
}
