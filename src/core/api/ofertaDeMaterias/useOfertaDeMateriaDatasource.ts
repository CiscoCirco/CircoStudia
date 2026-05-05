import { useMemo } from 'react';
import useDatasource, { DatasourceHook } from '../useDatasource';
import OfertaDeMateriaDatasource from './OfertaDeMateriaDatasource';
import OfertaDeMaterias from '../../entities/OfertaDeMaterias';

export default function useOfertaDeMateriaDatasource(): DatasourceHook<OfertaDeMaterias> & { datasource: OfertaDeMateriaDatasource } {
  const datasource = useMemo(() => new OfertaDeMateriaDatasource(), []);
  const hook = useDatasource<OfertaDeMaterias>(datasource as any);
  return Object.assign(hook, { datasource }) as any;
}
