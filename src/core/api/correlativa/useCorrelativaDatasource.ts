import { useMemo } from 'react';
import useDatasource, { DatasourceHook } from '../useDatasource';
import CorrelativaDatasource from './CorrelativaDatasource';
import Correlativa from '../../entities/Correlativa';

export default function useCorrelativaDatasource(): DatasourceHook<Correlativa> & { datasource: CorrelativaDatasource } {
  const datasource = useMemo(() => new CorrelativaDatasource(), []);
  const hook = useDatasource<Correlativa>(datasource as any);
  return Object.assign(hook, { datasource }) as any;
}
