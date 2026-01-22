import { Inventory } from '@mui/icons-material';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { StatisticDetail } from '@/features/common/components/StatisticDetail';

describe('StatisticDetail', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <StatisticDetail icon={<Inventory />} label="Total Products" value="100" />,
    );
    expect(container).toMatchSnapshot();
  });
});
