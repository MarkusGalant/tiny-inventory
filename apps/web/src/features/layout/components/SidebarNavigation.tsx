import { Storefront, Inventory } from '@mui/icons-material';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import { useTranslation } from '@/hooks/useTranslation';

export function SidebarNavigation() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/stores', label: t('navigation.stores'), icon: Storefront },
    { path: '/products', label: t('navigation.products'), icon: Inventory },
  ];

  return (
    <div>
      <Toolbar>
        <ListItemText
          primary={t('app.title')}
          primaryTypographyProps={{ variant: 'h6', noWrap: true }}
        />
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                data-testid={`sidebar-nav-${item.path.slice(1)}`}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <Icon color={isActive ? 'inherit' : 'action'} />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
