import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack, Text, DefaultButton, PrimaryButton, Spinner, SpinnerSize,
  MessageBar, MessageBarType, SearchBox, Dialog, DialogType, DialogFooter, Icon
} from '@fluentui/react';
import { CUATRIMESTRE_ACTUAL } from '../../../../../core/utils/Constants';
import OfertaDeMaterias from '../../../../../core/entities/OfertaDeMaterias';
import Materia from '../../../../../core/entities/Materia';
import Comision from '../../../../../core/entities/Comision';
import OfertaDeMateriaDatasource from '../../../../../core/api/ofertaDeMaterias/OfertaDeMateriaDatasource';
import MateriaDatasource from '../../../../../core/api/materia/MateriaDatasource';
import ComisionDatasource from '../../../../../core/api/comision/ComisionDatasource';
import CursaEnDatasource from '../../../../../core/api/cursaEn/CursaEnDatasource';
import FormOfertaMateria from './FormOfertaMateria';

const GestionOferta: React.FC = () => {
  const navigate = useNavigate();

  const [ofertas, setOfertas] = useState<OfertaDeMaterias[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [inscriptosCount, setInscriptosCount] = useState<Record<number, number>>({});
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OfertaDeMaterias | null>(null);
  const [deleting, setDeleting] = useState(false);

  const ofertaDS = React.useMemo(() => new OfertaDeMateriaDatasource(), []);
  const materiaDS = React.useMemo(() => new MateriaDatasource(), []);
  const comisionDS = React.useMemo(() => new ComisionDatasource(), []);
  const cursaEnDS = React.useMemo(() => new CursaEnDatasource(), []);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const [ofs, mats, coms, todasCursas] = await Promise.all([
        ofertaDS.getByCuatrimestre(CUATRIMESTRE_ACTUAL),
        materiaDS.getItems(),
        comisionDS.getItems(),
        cursaEnDS.getAllFlat()
      ]);

      const counts: Record<number, number> = {};
      const ofertaIds = new Set(ofs.map(o => o.Id));
      todasCursas.forEach(c => {
        if (ofertaIds.has(c.ofertaId)) {
          counts[c.ofertaId] = (counts[c.ofertaId] || 0) + 1;
        }
      });

      setOfertas(ofs);
      setMaterias(mats as Materia[]);
      setComisiones(coms as Comision[]);
      setInscriptosCount(counts);
    } catch (err) {
      console.error('[GestionOferta]', err);
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData().catch(console.error);
  }, [loadData]);

  const handleCreated = (nueva: OfertaDeMaterias): void => {
    setOfertas(prev => [...prev, nueva]);
    setPanelOpen(false);
  };

  const handleSave = async (materiaId: number, comisionId: number, modalidad: string): Promise<OfertaDeMaterias> => {
    const nueva = new OfertaDeMaterias({
      codMateriaId: materiaId,
      codComisionId: comisionId,
      modalidad,
      Cuatrimestre: CUATRIMESTRE_ACTUAL
    });
    return await ofertaDS.add(nueva) as OfertaDeMaterias;
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await ofertaDS.delete(deleteTarget.Id);
      setOfertas(prev => prev.filter(o => o.Id !== deleteTarget.Id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('[GestionOferta] delete error', err);
      setError('Error al eliminar. Intentá de nuevo.');
    } finally {
      setDeleting(false);
    }
  };

  const ofertasFiltradas = React.useMemo((): OfertaDeMaterias[] => {
    const q = busqueda.toLowerCase().trim();
    const filtered = q
      ? ofertas.filter(o =>
          o.materia.nombre.toLowerCase().includes(q) ||
          o.materia.codMateria.toLowerCase().includes(q) ||
          o.comision.codComision.toLowerCase().includes(q)
        )
      : ofertas;
    return filtered.sort((a, b) => {
      if ((a.materia.anio || 99) !== (b.materia.anio || 99)) return (a.materia.anio || 99) - (b.materia.anio || 99);
      return a.materia.nombre.localeCompare(b.materia.nombre);
    });
  }, [ofertas, busqueda]);

  if (loading) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { height: 200 } }}>
        <Spinner size={SpinnerSize.large} label="Cargando oferta..." />
      </Stack>
    );
  }

  return (
    <Stack tokens={{ padding: 24, childrenGap: 16 }}>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <DefaultButton iconProps={{ iconName: 'Back' }} text="Admin" onClick={() => navigate('/admin')} />
        <Text variant="xLarge">Gestión de Oferta — {CUATRIMESTRE_ACTUAL}° Cuatrimestre</Text>
      </Stack>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError(null)}>{error}</MessageBar>
      )}

      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <SearchBox
          placeholder="Buscar por materia o comisión..."
          value={busqueda}
          onChange={(_, v) => setBusqueda(v || '')}
          styles={{ root: { maxWidth: 360 } }}
        />
        <PrimaryButton
          iconProps={{ iconName: 'Add' }}
          text="Agregar oferta"
          onClick={() => setPanelOpen(true)}
          styles={{ root: { marginLeft: 'auto' } }}
        />
      </Stack>

      <Text variant="small" styles={{ root: { color: '#666' } }}>
        {ofertasFiltradas.length} entrada{ofertasFiltradas.length !== 1 ? 's' : ''} encontrada{ofertasFiltradas.length !== 1 ? 's' : ''}
      </Text>

      <Stack>
        {ofertasFiltradas.map(oferta => {
          const count = inscriptosCount[oferta.Id] || 0;
          const tieneInscriptos = count > 0;
          return (
            <Stack
              key={oferta.Id}
              horizontal verticalAlign="center"
              tokens={{ childrenGap: 12, padding: '8px 12px' }}
              styles={{
                root: {
                  border: '1px solid #e0e0e0',
                  borderRadius: 4,
                  marginBottom: 4,
                  background: 'white',
                  selectors: { ':hover': { background: '#f9f9f9' } }
                }
              }}
            >
              <Stack tokens={{ childrenGap: 2 }} grow>
                <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="center">
                  <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>{oferta.materia.nombre}</Text>
                  {oferta.materia.anio > 0 && (
                    <Text variant="small" styles={{ root: { color: '#666', background: '#f0f0f0', padding: '1px 6px', borderRadius: 10 } }}>
                      {oferta.materia.anio}° año
                    </Text>
                  )}
                </Stack>
                <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
                  <Text variant="small" styles={{ root: { color: '#555' } }}>{oferta.materia.codMateria}</Text>
                  <Text variant="small" styles={{ root: { color: '#0078d4' } }}>{oferta.comision.codComision}</Text>
                  {oferta.comision.diaSemana && (
                    <Stack horizontal tokens={{ childrenGap: 4 }} verticalAlign="center">
                      <Icon iconName="Calendar" styles={{ root: { fontSize: 11, color: '#888' } }} />
                      <Text variant="small" styles={{ root: { color: '#666' } }}>{oferta.comision.diaSemana}</Text>
                    </Stack>
                  )}
                  <Text variant="small" styles={{ root: { color: '#888' } }}>{oferta.modalidad}</Text>
                  <Text variant="small" styles={{ root: { color: tieneInscriptos ? '#28a745' : '#aaa' } }}>
                    {count} inscripto{count !== 1 ? 's' : ''}
                  </Text>
                </Stack>
              </Stack>
              <DefaultButton
                iconProps={{ iconName: 'Delete' }}
                text="Eliminar"
                disabled={tieneInscriptos}
                title={tieneInscriptos ? 'No se puede eliminar: tiene inscriptos' : 'Eliminar esta oferta'}
                styles={{ root: { color: '#d32f2f', borderColor: tieneInscriptos ? '#ccc' : '#d32f2f' } }}
                onClick={() => setDeleteTarget(oferta)}
              />
            </Stack>
          );
        })}
        {ofertasFiltradas.length === 0 && (
          <Text styles={{ root: { color: '#888', textAlign: 'center', paddingTop: 32 } }}>
            No hay entradas que coincidan con el filtro.
          </Text>
        )}
      </Stack>

      <FormOfertaMateria
        isOpen={panelOpen}
        materias={materias}
        comisiones={comisiones}
        existentes={ofertas}
        onDismiss={() => setPanelOpen(false)}
        onCreated={handleCreated}
        onSave={handleSave}
      />

      <Dialog
        hidden={!deleteTarget}
        onDismiss={() => setDeleteTarget(null)}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Eliminar oferta',
          subText: deleteTarget
            ? `¿Confirmás que querés eliminar la oferta de ${deleteTarget.materia.nombre} — Comisión ${deleteTarget.comision.codComision}?`
            : ''
        }}
      >
        <DialogFooter>
          {deleting ? (
            <Spinner size={SpinnerSize.small} />
          ) : (
            <>
              <PrimaryButton
                text="Sí, eliminar"
                styles={{ root: { background: '#d32f2f', border: 'none' } }}
                onClick={handleDelete}
              />
              <DefaultButton text="Cancelar" onClick={() => setDeleteTarget(null)} />
            </>
          )}
        </DialogFooter>
      </Dialog>
    </Stack>
  );
};

export default GestionOferta;
