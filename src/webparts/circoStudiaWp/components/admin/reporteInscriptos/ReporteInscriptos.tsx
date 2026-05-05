import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack, Text, Spinner, SpinnerSize, MessageBar, MessageBarType,
  DefaultButton, SearchBox, Persona, PersonaSize, Icon
} from '@fluentui/react';
import { CUATRIMESTRE_ACTUAL } from '../../../../../core/utils/Constants';
import OfertaDeMaterias from '../../../../../core/entities/OfertaDeMaterias';
import CursaEn from '../../../../../core/entities/CursaEn';
import Estudiante from '../../../../../core/entities/Estudiante';
import OfertaDeMateriaDatasource from '../../../../../core/api/ofertaDeMaterias/OfertaDeMateriaDatasource';
import CursaEnDatasource from '../../../../../core/api/cursaEn/CursaEnDatasource';
import EstudianteDatasource from '../../../../../core/api/estudiante/EstudianteDatasource';

interface IMateriaGroup {
  materiaId: number;
  nombre: string;
  codMateria: string;
  anio: number;
  comisiones: IComisionGroup[];
}

interface IComisionGroup {
  ofertaId: number;
  codComision: string;
  descripcion: string;
  diaSemana: string;
  turno: string;
  modalidad: string;
  estudiantes: Estudiante[];
}

const ReporteInscriptos: React.FC = () => {
  const navigate = useNavigate();

  const [grupos, setGrupos] = useState<IMateriaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [expandedMaterias, setExpandedMaterias] = useState<Set<number>>(new Set());

  const ofertaDS = React.useMemo(() => new OfertaDeMateriaDatasource(), []);
  const cursaEnDS = React.useMemo(() => new CursaEnDatasource(), []);
  const estudianteDS = React.useMemo(() => new EstudianteDatasource(), []);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [ofertas, todasCursas, ests] = await Promise.all([
        ofertaDS.getByCuatrimestre(CUATRIMESTRE_ACTUAL),
        cursaEnDS.getAllFlat(),
        estudianteDS.getItems()
      ]);

      const estMap: Record<number, Estudiante> = {};
      (ests as Estudiante[]).forEach(e => { estMap[e.Id] = e; });

      const ofertaIds = new Set(ofertas.map(o => o.Id));
      const cursasDeEsteC = (todasCursas as CursaEn[]).filter(c => ofertaIds.has(c.ofertaId));

      // Group by materiaId
      const materiaMap: Record<number, IMateriaGroup> = {};

      ofertas.forEach((oferta: OfertaDeMaterias) => {
        const mid = oferta.materia.Id || oferta.codMateriaId;
        if (!materiaMap[mid]) {
          materiaMap[mid] = {
            materiaId: mid,
            nombre: oferta.materia.nombre,
            codMateria: oferta.materia.codMateria,
            anio: oferta.materia.anio,
            comisiones: []
          };
        }

        const inscriptos = cursasDeEsteC
          .filter(c => c.ofertaId === oferta.Id)
          .map(c => estMap[c.estudianteId])
          .filter((e): e is Estudiante => e !== undefined);

        materiaMap[mid].comisiones.push({
          ofertaId: oferta.Id,
          codComision: oferta.comision.codComision,
          descripcion: oferta.comision.descripcion,
          diaSemana: oferta.comision.diaSemana,
          turno: oferta.comision.turno,
          modalidad: oferta.modalidad,
          estudiantes: inscriptos
        });
      });

      const gruposOrdenados = Object.values(materiaMap).sort((a, b) => {
        if ((a.anio || 99) !== (b.anio || 99)) return (a.anio || 99) - (b.anio || 99);
        return a.nombre.localeCompare(b.nombre);
      });

      setGrupos(gruposOrdenados);
    } catch (err) {
      console.error('[ReporteInscriptos]', err);
      setError('Error al cargar el reporte.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData().catch(console.error);
  }, [loadData]);

  const toggleMateria = (mid: number): void => {
    setExpandedMaterias(prev => {
      const next = new Set(prev);
      if (next.has(mid)) next.delete(mid);
      else next.add(mid);
      return next;
    });
  };

  const gruposFiltrados = React.useMemo((): IMateriaGroup[] => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return grupos;
    return grupos.filter(g =>
      g.nombre.toLowerCase().includes(q) ||
      g.codMateria.toLowerCase().includes(q) ||
      g.comisiones.some(c => c.codComision.toLowerCase().includes(q))
    );
  }, [grupos, busqueda]);

  const totalInscriptos = React.useMemo((): number =>
    grupos.reduce((sum, g) => sum + g.comisiones.reduce((s, c) => s + c.estudiantes.length, 0), 0),
    [grupos]
  );

  const turnoMap: Record<string, string> = { M: 'Mañana', T: 'Tarde', N: 'Noche' };

  if (loading) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { height: 200 } }}>
        <Spinner size={SpinnerSize.large} label="Cargando reporte..." />
      </Stack>
    );
  }

  return (
    <Stack tokens={{ padding: 24, childrenGap: 16 }}>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <DefaultButton iconProps={{ iconName: 'Back' }} text="Admin" onClick={() => navigate('/admin')} />
        <Text variant="xLarge">Reporte de Inscriptos — {CUATRIMESTRE_ACTUAL}° Cuatrimestre</Text>
      </Stack>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError(null)}>{error}</MessageBar>
      )}

      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 16 }}>
        <SearchBox
          placeholder="Buscar por materia o comisión..."
          value={busqueda}
          onChange={(_, v) => setBusqueda(v || '')}
          styles={{ root: { maxWidth: 360 } }}
        />
        <Text variant="small" styles={{ root: { color: '#666' } }}>
          {gruposFiltrados.length} materia{gruposFiltrados.length !== 1 ? 's' : ''} · {totalInscriptos} inscripción{totalInscriptos !== 1 ? 'es' : ''} totales
        </Text>
      </Stack>

      <Stack>
        {gruposFiltrados.map(grupo => {
          const expanded = expandedMaterias.has(grupo.materiaId);
          const totalGrupo = grupo.comisiones.reduce((s, c) => s + c.estudiantes.length, 0);
          return (
            <Stack
              key={grupo.materiaId}
              styles={{
                root: {
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  marginBottom: 8,
                  overflow: 'hidden',
                  background: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                }
              }}
            >
              {/* Materia header */}
              <Stack
                horizontal verticalAlign="center"
                tokens={{ childrenGap: 12, padding: '10px 16px' }}
                styles={{ root: { cursor: 'pointer', background: expanded ? '#f3f9ff' : 'white' } }}
                onClick={() => toggleMateria(grupo.materiaId)}
              >
                <Icon
                  iconName={expanded ? 'ChevronDown' : 'ChevronRight'}
                  styles={{ root: { color: '#0078d4', fontSize: 12 } }}
                />
                <Stack grow tokens={{ childrenGap: 2 }}>
                  <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="center">
                    <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>{grupo.nombre}</Text>
                    {grupo.anio > 0 && (
                      <Text variant="small" styles={{ root: { color: '#666', background: '#f0f0f0', padding: '1px 6px', borderRadius: 10 } }}>
                        {grupo.anio}° año
                      </Text>
                    )}
                    <Text variant="small" styles={{ root: { color: totalGrupo > 0 ? '#28a745' : '#aaa', marginLeft: 8 } }}>
                      {totalGrupo} inscripto{totalGrupo !== 1 ? 's' : ''}
                    </Text>
                  </Stack>
                  <Text variant="small" styles={{ root: { color: '#888' } }}>
                    {grupo.codMateria} · {grupo.comisiones.length} comisión{grupo.comisiones.length !== 1 ? 'es' : ''}
                  </Text>
                </Stack>
              </Stack>

              {expanded && (
                <Stack styles={{ root: { padding: '8px 16px 12px 36px', borderTop: '1px solid #eee' } }} tokens={{ childrenGap: 12 }}>
                  {grupo.comisiones.map(com => (
                    <Stack key={com.ofertaId} tokens={{ childrenGap: 8 }}>
                      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
                        <Text variant="small" styles={{ root: { fontWeight: 600, color: '#0078d4', minWidth: 80 } }}>{com.codComision}</Text>
                        {com.diaSemana && (
                          <Stack horizontal tokens={{ childrenGap: 4 }} verticalAlign="center">
                            <Icon iconName="Calendar" styles={{ root: { fontSize: 11, color: '#888' } }} />
                            <Text variant="small" styles={{ root: { color: '#666' } }}>{com.diaSemana}</Text>
                          </Stack>
                        )}
                        {com.turno && (
                          <Text variant="small" styles={{ root: { color: '#666' } }}>{turnoMap[com.turno] || com.turno}</Text>
                        )}
                        <Text variant="small" styles={{ root: { color: '#888' } }}>{com.modalidad}</Text>
                        <Text variant="small" styles={{ root: { color: com.estudiantes.length > 0 ? '#28a745' : '#aaa' } }}>
                          {com.estudiantes.length} inscripto{com.estudiantes.length !== 1 ? 's' : ''}
                        </Text>
                      </Stack>
                      {com.estudiantes.length > 0 && (
                        <Stack horizontal wrap tokens={{ childrenGap: 8 }} styles={{ root: { paddingLeft: 12 } }}>
                          {com.estudiantes.map(e => (
                            <Persona
                              key={e.Id}
                              text={e.usuarioNombre || e.emailPersonal}
                              secondaryText={e.emailPersonal}
                              size={PersonaSize.size24}
                              styles={{ root: { maxWidth: 200 } }}
                            />
                          ))}
                        </Stack>
                      )}
                      {com.estudiantes.length === 0 && (
                        <Text variant="small" styles={{ root: { color: '#aaa', paddingLeft: 12 } }}>Sin inscriptos</Text>
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>
          );
        })}
        {gruposFiltrados.length === 0 && (
          <Text styles={{ root: { color: '#888', textAlign: 'center', paddingTop: 32 } }}>
            No hay materias que coincidan con el filtro.
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

export default ReporteInscriptos;
