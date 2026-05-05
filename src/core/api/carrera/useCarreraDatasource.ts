import { useMemo } from 'react';
import useDatasource, { DatasourceHook } from '../useDatasource';
import CarreraDatasource from './CarreraDatasource';
import Carrera from '../../entities/Carrera';

export default function useCarreraDatasource(): DatasourceHook<Carrera> & { datasource: CarreraDatasource } {
  const datasource = useMemo(() => new CarreraDatasource(), []);
  const hook = useDatasource<Carrera>(datasource as any);
  return Object.assign(hook, { datasource }) as any;
}
