import { useMemo } from 'react';
import useDatasource, { DatasourceHook } from '../useDatasource';
import InscriptoDatasource from './InscriptoDatasource';
import Inscripto from '../../entities/Inscripto';

export default function useInscriptoDatasource(): DatasourceHook<Inscripto> & { datasource: InscriptoDatasource } {
  const datasource = useMemo(() => new InscriptoDatasource(), []);
  const hook = useDatasource<Inscripto>(datasource as any);
  return Object.assign(hook, { datasource }) as any;
}
