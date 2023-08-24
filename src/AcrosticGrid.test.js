import { render, screen } from '@testing-library/react';
import { AcrosticGrid } from './AcrosticGrid';

test('render basic grid', () => {
    render(<AcrosticGrid letters="RESTARTING"/>);
});

test('render empty grid', () => {
    render(<AcrosticGrid letters=""/>);
});