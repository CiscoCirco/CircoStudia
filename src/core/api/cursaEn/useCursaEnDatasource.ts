import { useMemo } from 'react';
import useDatasource, { DatasourceHook } from '../useDatasource';
import CursaEnDatasource from './CursaEnDatasource';
import CursaEn from '../../entities/CursaEn';

export default function useCursaEnDatasource(): DatasourceHook<CursaEn> & { datasource: CursaEnDatasource } {
  const datasource = useMemo(() => new CursaEnDatasource(), []);
  const hook = useDatasource<CursaEn>(datasource as any);
  return Object.assign(hook, { datasource }) as any;
}
