import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WorkbookApp } from '@system-design/workbook';
import { workbook } from './data/curriculum';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WorkbookApp content={workbook} />
  </StrictMode>,
);

