import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Layout } from '@/features/layout/components/Layout';

import { withRouter } from '../../../utils/test-utils';

describe('Layout', () => {
  it('matches snapshot', () => {
    const { container } = render(
      withRouter(
        <Layout>
          <div>Content</div>
        </Layout>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
