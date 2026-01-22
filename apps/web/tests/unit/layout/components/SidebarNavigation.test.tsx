import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { SidebarNavigation } from '@/features/layout/components/SidebarNavigation';

import { withRouter } from '../../../utils/test-utils';

describe('SidebarNavigation', () => {
  it('matches snapshot', () => {
    const { container } = render(withRouter(<SidebarNavigation />));
    expect(container).toMatchSnapshot();
  });
});
