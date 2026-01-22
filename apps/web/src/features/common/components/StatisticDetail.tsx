import { Box, Stack, Typography } from '@mui/material';

export function StatisticDetail({
  icon,
  label,
  value,
  labelTestId,
  valueTestId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  labelTestId?: string;
  valueTestId?: string;
}) {
  return (
    <Stack direction="row" alignItems="center" gap={2}>
      <Box
        sx={{
          width: 40,
          height: 40,
          backgroundColor: 'primary.main',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" color="text.secondary" data-testid={labelTestId}>
        {label}
      </Typography>
      <Typography variant="h6" color="text.primary" data-testid={valueTestId}>
        {value}
      </Typography>
    </Stack>
  );
}
